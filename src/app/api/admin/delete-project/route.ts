import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteProject } from "@/lib/serverStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do projeto é obrigatório." }, { status: 400 });
    }

    const deleted = deleteProject(id);

    // Also attempt deletion in Supabase if valid UUID
    const isDbUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isDbUuid) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.from("projects").delete().eq("id", id);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
