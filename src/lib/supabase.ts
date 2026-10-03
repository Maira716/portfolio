import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Variável de ambiente obrigatória ausente: NEXT_PUBLIC_SUPABASE_URL. Configure-a no arquivo .env.local ou no painel da Vercel."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Variável de ambiente obrigatória ausente: NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure-a no arquivo .env.local ou no painel da Vercel."
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


