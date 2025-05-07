import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Create a singleton Supabase client
let supabase: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabase) return supabase;

  // Initialize the Supabase client
  supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  return supabase;
}
