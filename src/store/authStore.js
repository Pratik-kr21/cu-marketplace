import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_USER } from '../lib/mockData'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    isDemo: !isSupabaseConfigured,

    init: async () => {
        if (!isSupabaseConfigured) {
            set({ loading: false })
            return
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            await get().fetchProfile(session.user.id)
            set({ user: session.user, loading: false })
        } else {
            set({ loading: false })
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await get().fetchProfile(session.user.id)
                set({ user: session.user })
            } else {
                set({ user: null, profile: null })
            }
        })
    },

    fetchProfile: async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (data) {
            set({ profile: data })
        } else {
            // No profile row yet (user signed up before the DB trigger was added)
            // Create it now from auth metadata
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: newProfile } = await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name,
                    uid: user.user_metadata?.uid,
                    department: user.user_metadata?.department,
                    hostel: user.user_metadata?.hostel,
                }, { onConflict: 'id' }).select().maybeSingle()
                if (newProfile) set({ profile: newProfile })
            }
        }
    },

    signUp: async ({ email, password, full_name, uid, department, hostel }) => {
        if (!isSupabaseConfigured) {
            throw new Error('Service unavailable — environment not configured. Please contact the admin.')
        }
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name, uid, department, hostel } }
        })
        if (error) {
            // Translate terse Supabase errors into user-friendly messages
            const msg = error.message?.toLowerCase() || ''
            if (msg.includes('cert') || msg.includes('ssl') || msg.includes('authority')) {
                throw new Error('SSL certificate error. If you\'re on a campus/office network, try disabling VPN or proxy, or use mobile data.')
            }
            if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('connection')) {
                throw new Error('Could not connect to server. Please check your internet connection and try again.')
            }
            throw error
        }

        // Supabase silently re-sends a confirmation email for duplicate accounts
        // instead of throwing an error. Detect this via empty identities array.
        if (data?.user && data.user.identities?.length === 0) {
            throw new Error('An account with this email already exists. Please sign in instead.')
        }

        return data
    },

    signIn: async ({ email, password }) => {
        if (!isSupabaseConfigured) {
            throw new Error('Service unavailable — environment not configured. Please contact the admin.')
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            const msg = error.message?.toLowerCase() || ''
            if (msg.includes('cert') || msg.includes('ssl') || msg.includes('authority')) {
                throw new Error('SSL certificate error. If you\'re on a campus/office network, try disabling VPN or proxy, or use mobile data.')
            }
            if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('connection')) {
                throw new Error('Could not connect to server. Please check your internet connection and try again.')
            }
            if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
                throw new Error('Incorrect email or password. Please try again.')
            }
            if (msg.includes('email not confirmed')) {
                throw new Error('Please confirm your email first. Check your @cuchd.in inbox.')
            }
            throw error
        }
        return data
    },

    signOut: async () => {
        if (!isSupabaseConfigured) {
            set({ user: null, profile: null })
            return
        }
        await supabase.auth.signOut()
        set({ user: null, profile: null })
    },

    // Demo mode login
    demoLogin: () => {
        set({ user: { id: MOCK_USER.id, email: MOCK_USER.email }, profile: MOCK_USER })
    },
}))
