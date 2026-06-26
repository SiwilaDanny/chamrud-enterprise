import { createClient } from "@supabase/supabase-js";

// Works under both Vite (import.meta.env) and react-scripts (process.env)
const supabaseUrl = (
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  process.env.REACT_APP_SUPABASE_URL ||
  ""
) as string;

const supabaseAnonKey = (
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  ""
) as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
      "Add them to your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
