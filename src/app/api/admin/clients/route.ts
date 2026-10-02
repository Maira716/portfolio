import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readPortalData } from "@/lib/serverStore";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { isAdmin } = await getAuthenticatedUser(req);
    // Allow if authenticated admin or during local development/explicit auth header
    const devBypass = process.env.NODE_ENV === "development";
    if (!isAdmin && !devBypass) {
      return NextResponse.json({ error: "Acesso não autorizado. Requer privilégios de administrador." }, { status: 401 });
    }

    const portalData = readPortalData();
    const serverClients = portalData.clients || [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let dbClients: any[] = [];
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase.from("profiles").select("*");
      if (data) dbClients = data;
    } catch (e) {}

    const clientMap = new Map<string, any>();

    // Put server clients first
    for (const sc of serverClients) {
      const sanitized = { ...sc };
      delete (sanitized as any).password;
      clientMap.set(sc.email.toLowerCase(), sanitized);
    }

    // Merge with DB clients
    for (const dbc of dbClients) {
      if (dbc.email) {
        const existing = clientMap.get(dbc.email.toLowerCase());
        const sanitized = {
          ...dbc,
          ...existing,
          full_name: existing?.full_name || dbc.full_name,
        };
        delete (sanitized as any).password;
        clientMap.set(dbc.email.toLowerCase(), sanitized);
      }
    }

    return NextResponse.json({
      clients: Array.from(clientMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao carregar lista de clientes." }, { status: 500 });
  }
}
