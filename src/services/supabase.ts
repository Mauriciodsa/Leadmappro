import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const missingSupabaseEnv = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : '',
  !supabaseKey ? 'VITE_SUPABASE_KEY' : '',
].filter(Boolean);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-key',
);
