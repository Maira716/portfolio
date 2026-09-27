import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProjectsForClient, readPortalData } from "@/lib/serverStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || "";
    const clientEmail = (searchParams.get("clientEmail") || "").trim().toLowerCase();
    const isAdmin = searchParams.get("isAdmin") === "true";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let dbProjects: any[] = [];
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (!isAdmin && clientId) {
        query = query.eq("client_id", clientId);
      }
      const { data } = await query;
      if (data && Array.isArray(data)) dbProjects = data;
    } catch (e) {}

    // Also get from serverStore
    const portalData = readPortalData();
    let serverProjects = isAdmin ? portalData.projects : getProjectsForClient(clientId, clientEmail);

    const projectMap = new Map<string, any>();
    for (const sp of serverProjects) {
      projectMap.set(sp.id, sp);
    }
    for (const dp of dbProjects) {
      projectMap.set(dp.id, dp);
    }

    return NextResponse.json({
      projects: Array.from(projectMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
