import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvifgruswjhjqidnlalk.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_AhsyHqLUMsBSGZcoQ0vLUg_LDGZsvxo";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


