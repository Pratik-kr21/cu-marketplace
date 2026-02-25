import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] Missing environment variables!\n' +
        `  VITE_SUPABASE_URL: "${supabaseUrl || 'MISSING'}"\n` +
        `  VITE_SUPABASE_ANON_KEY: "${supabaseAnonKey ? '[set]' : 'MISSING'}"\n` +
        'On Vercel: add these in Project Settings → Environment Variables, then Redeploy.'
    )
}

export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co')
)

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
