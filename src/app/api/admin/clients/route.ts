import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readPortalData } from "@/lib/serverStore";

export async function GET() {
  try {
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
      clientMap.set(sc.email.toLowerCase(), sc);
    }

    // Merge with DB clients
    for (const dbc of dbClients) {
      if (dbc.email) {
        const existing = clientMap.get(dbc.email.toLowerCase());
        clientMap.set(dbc.email.toLowerCase(), {
          ...dbc,
          ...existing,
          full_name: existing?.full_name || dbc.full_name,
        });
      }
    }

    return NextResponse.json({
      clients: Array.from(clientMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
