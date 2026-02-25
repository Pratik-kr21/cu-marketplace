import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Debug: log whether env vars were picked up (shows in browser console)
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] Missing environment variables!\n' +
        `  VITE_SUPABASE_URL: "${supabaseUrl}"\n` +
        `  VITE_SUPABASE_ANON_KEY: "${supabaseAnonKey ? '[set]' : '[MISSING]'}"\n` +
        'If on Vercel: add these in Project Settings → Environment Variables, then redeploy.'
    )
}

export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co')
)

// Always create the client — it will use empty strings if misconfigured
// (authStore checks isSupabaseConfigured before making calls)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
