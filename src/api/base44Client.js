// ─────────────────────────────────────────────────────────────
// Supabase client — replaces Base44 SDK
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Legacy alias — components that still import `base44` get a
// thin shim so they don't crash while migration is in progress.
export const base44 = {
  auth: supabase.auth,
};
