import { create } from 'zustand'
import { api, isBackendConfigured, setToken } from '../lib/api'
import { MOCK_USER } from '../lib/mockData'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    isDemo: !isBackendConfigured,

    init: async () => {
        if (!isBackendConfigured) {
            set({ loading: false })
            return
        }
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const { user, profile } = await api.get('/api/auth/me')
                set({ user: { ...user, id: user.id }, profile })
            }
        } catch (err) {
            console.error('[Auth] Init failed:', err)
            setToken(null)
            set({ user: null, profile: null })
        } finally {
            set({ loading: false })
        }
    },

    signUp: async ({ email, password, full_name, uid, department, hostel }) => {
        if (!isBackendConfigured) {
            throw new Error('Backend is not configured. Set VITE_API_URL in .env')
        }
        const data = await api.post('/api/auth/signup', {
            email: email.toLowerCase(),
            password,
            full_name,
            uid,
            department,
            hostel,
        })
        return data
    },

    verifyEmail: async (token) => {
        if (!isBackendConfigured) {
            throw new Error('Backend is not configured. Set VITE_API_URL in .env')
        }
        const data = await api.post('/api/auth/verify-email', { token })
        setToken(data.token)
        set({ user: { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata }, profile: data.profile })
        return data
    },

    signIn: async ({ email, password }) => {
        if (!isBackendConfigured) {
            throw new Error('Backend is not configured. Set VITE_API_URL in .env')
        }
        const data = await api.post('/api/auth/login', { email: email.toLowerCase(), password })
        setToken(data.token)
        set({ user: { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata }, profile: data.profile })
        return data
    },

    signOut: async () => {
        if (!isBackendConfigured) {
            set({ user: null, profile: null })
            return
        }
        setToken(null)
        set({ user: null, profile: null })
    },

    deleteAccount: async () => {
        if (isBackendConfigured) {
            await api.delete('/api/auth/me')
        }
        setToken(null)
        set({ user: null, profile: null })
    },

    demoLogin: () => {
        set({ user: { id: MOCK_USER.id, email: MOCK_USER.email }, profile: MOCK_USER })
    },
}))
