// backend/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "placeholder-key";

export const isSupabaseConfigured =
  Boolean(process.env.SUPABASE_URL) &&
  !process.env.SUPABASE_URL.includes("placeholder") &&
  !process.env.SUPABASE_URL.includes("your-project-id");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
