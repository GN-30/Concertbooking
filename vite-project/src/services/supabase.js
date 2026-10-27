// src/services/supabase.js
// Supabase client configuration
// Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your actual project values
// from https://supabase.com/dashboard → Project Settings → API

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
