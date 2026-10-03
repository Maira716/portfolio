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

    // Also get from serverStore (authoritative for countdown fields).
    // Admins (incl. "client view" impersonation, which sends the admin's own id) must see every project.
    const portalData = readPortalData();
    const serverProjects = effectiveIsAdmin
      ? portalData.projects
      : getProjectsForClient(effectiveClientId, effectiveClientEmail);

    const normTitle = (t?: string | null) => (t || "").toLowerCase().trim();
    const serverById = new Map<string, any>();
    const serverByTitle = new Map<string, any>();
    for (const sp of portalData.projects) {
      serverById.set(sp.id, sp);
      if (sp.title) serverByTitle.set(normTitle(sp.title), sp);
    }

    const result = new Map<string, any>();
    const consumedServerIds = new Set<string>();

    for (const dp of dbProjects) {
      const existing = serverById.get(dp.id) || serverByTitle.get(normTitle(dp.title));
      if (existing) consumedServerIds.add(existing.id);
      result.set(dp.id, {
        ...existing,
        ...dp,
        // Server store wins for countdown data; Supabase rows may lack these columns.
        next_update_at: existing ? existing.next_update_at ?? null : dp.next_update_at ?? null,
        countdown_released: existing ? Boolean(existing.countdown_released) : Boolean(dp.countdown_released),
      });
    }

    for (const sp of serverProjects) {
      if (!consumedServerIds.has(sp.id) && !result.has(sp.id)) {
        result.set(sp.id, { ...sp, countdown_released: Boolean(sp.countdown_released) });
      }
    }

    return NextResponse.json(
      { projects: Array.from(result.values()) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
