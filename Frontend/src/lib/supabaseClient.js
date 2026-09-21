import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if credentials are using defaults or empty
export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')

// Create client with fallback dummy values if missing to avoid immediate JS crash
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
