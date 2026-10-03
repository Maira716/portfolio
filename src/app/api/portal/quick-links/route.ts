import { NextRequest, NextResponse } from "next/server";
import { getQuickLinksForProject, getAllQuickLinks, saveQuickLinksForProject, saveAllQuickLinks } from "@/lib/serverStore";
import { checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const quickLinks = getQuickLinksForProject(projectId);
      return NextResponse.json({ quickLinks });
    }

    const all = getAllQuickLinks();
    return NextResponse.json({ quickLinksMap: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, quickLinks, quickLinksMap } = body;

    if (quickLinksMap && typeof quickLinksMap === "object") {
      const saved = saveAllQuickLinks(quickLinksMap);
      return NextResponse.json({ success: true, quickLinksMap: saved });
    }

    if (projectId && Array.isArray(quickLinks)) {
      const saved = saveQuickLinksForProject(projectId, quickLinks);
      return NextResponse.json({ success: true, quickLinks: saved });
    }

    return NextResponse.json({ error: "projectId and quickLinks array are required" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
