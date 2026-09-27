import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveProject, readPortalData } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, client_id, client_email } = body;

    if (!title || !client_id) {
      return NextResponse.json({ error: "Título e Cliente são obrigatórios." }, { status: 400 });
    }

    const saved = saveProject(body);

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
        },
      ]);
    } catch (e) {}

    return NextResponse.json({ success: true, project: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
