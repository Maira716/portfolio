import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveProject, readPortalData } from "@/lib/serverStore";
import { requireAdminAuth } from "@/lib/apiSecurity";

export async function POST(req: Request) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth.authorized && auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();
    const { title, client_id, client_email } = body;

    if (!title) {
      return NextResponse.json({ error: "Título do projeto é obrigatório." }, { status: 400 });
    }

    const saved = saveProject({
      ...body,
      client_id: client_id || body.client_email || "admin",
    });

    // Sync with Supabase DB if possible
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.from("projects").upsert([
        {
          id: saved.id,
          title: saved.title,
          client_id: saved.client_id,
          description: saved.description,
          status: saved.status,
          progress: saved.progress,
          start_date: saved.start_date,
          deadline: saved.deadline,
          preview_url: saved.preview_url,
          figma_url: saved.figma_url,
          repo_url: saved.repo_url,
          category: saved.category,
          next_update_at: saved.next_update_at || null,
        },
      ]);
    } catch (e) {}

    return NextResponse.json({ success: true, project: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
