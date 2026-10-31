import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server client with service role for secure score verification
export function getServerSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (isSupabaseConfigured && serviceKey && !serviceKey.includes('your-service-role')) {
    return createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}
