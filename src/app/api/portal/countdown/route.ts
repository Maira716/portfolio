import { NextRequest, NextResponse } from "next/server";
import { readPortalData } from "@/lib/serverStore";

/**
 * Lightweight polling endpoint used by the client portal to keep the
 * "Próxima Publicação" countdown in sync with the admin panel across devices.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "";
    const title = (searchParams.get("title") || "").toLowerCase().trim();

    if (!projectId && !title) {
      return NextResponse.json({ error: "projectId é obrigatório." }, { status: 400 });
    }

    const { projects } = readPortalData();
    const project =
      projects.find((p) => p.id === projectId) ||
      (title ? projects.find((p) => (p.title || "").toLowerCase().trim() === title) : undefined);

    return NextResponse.json(
      {
        found: Boolean(project),
        next_update_at: project?.next_update_at ?? null,
        countdown_released: Boolean(project?.countdown_released),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
