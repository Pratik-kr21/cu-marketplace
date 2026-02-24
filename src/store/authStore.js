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
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (data) set({ profile: data })
    },

    signUp: async ({ email, password, full_name, uid, department, hostel }) => {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name, uid, department, hostel } }
        })
        if (error) throw error

        // Supabase silently re-sends a confirmation email for duplicate accounts
        // instead of throwing an error. Detect this via empty identities array.
        if (data?.user && data.user.identities?.length === 0) {
            throw new Error('An account with this email already exists. Please sign in instead.')
        }

        return data
    },

    signIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
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
