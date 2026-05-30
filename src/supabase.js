// Supabase browser client — uses the public anon key (safe to ship; access is
// governed by the open RLS policies in supabase/schema.sql).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When env vars are missing we run in a read-only "seed fallback" mode so the
// app still renders (see App.jsx) instead of white-screening.
export const isConfigured = Boolean(url && anon);

export const supabase = isConfigured ? createClient(url, anon) : null;
