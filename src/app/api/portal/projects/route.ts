import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProjectsForClient, readPortalData } from "@/lib/serverStore";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const requestedClientId = searchParams.get("clientId") || "";
    const requestedClientEmail = (searchParams.get("clientEmail") || "").trim().toLowerCase();

    // Securely determine admin status from session
    const { user, isAdmin: sessionIsAdmin } = await getAuthenticatedUser(req);
    const devBypass = process.env.NODE_ENV === "development";
    const effectiveIsAdmin = sessionIsAdmin || (devBypass && searchParams.get("isAdmin") === "true");

    // If not admin, the user can only query their own client ID / email
    const effectiveClientId = effectiveIsAdmin ? requestedClientId : (user?.id || requestedClientId);
    const effectiveClientEmail = effectiveIsAdmin ? requestedClientEmail : (user?.email || requestedClientEmail);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let dbProjects: any[] = [];
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (!effectiveIsAdmin && (effectiveClientId || effectiveClientEmail)) {
        if (effectiveClientId && effectiveClientEmail) {
          query = query.or(`client_id.eq.${effectiveClientId},client_id.eq.${effectiveClientEmail},client_email.eq.${effectiveClientEmail}`);
        } else if (effectiveClientId) {
          query = query.eq("client_id", effectiveClientId);
        } else if (effectiveClientEmail) {
          query = query.or(`client_id.eq.${effectiveClientEmail},client_email.eq.${effectiveClientEmail}`);
        }
      }
      const { data } = await query;
      if (data && Array.isArray(data)) dbProjects = data;
    } catch (e) {}

    // Also get from serverStore
    const portalData = readPortalData();
    let serverProjects = effectiveIsAdmin && !effectiveClientId
      ? portalData.projects
      : getProjectsForClient(effectiveClientId, effectiveClientEmail);

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
