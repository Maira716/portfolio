import { NextResponse } from "next/server";
import {
  getDocumentsForProject,
  getAllDocuments,
  saveDocumentsForProject,
  saveAllDocuments,
} from "@/lib/serverStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const visibility = (searchParams.get("visibility") || "all") as "client" | "all";
    const all = searchParams.get("all");

    if (all === "true" || !projectId) {
      const allDocs = getAllDocuments();
      return NextResponse.json({ documents: allDocs });
    }

    const docs = getDocumentsForProject(projectId, visibility);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.documentsMap && typeof body.documentsMap === "object") {
      const saved = saveAllDocuments(body.documentsMap);
      return NextResponse.json({ success: true, documents: saved });
    }

    const { projectId, documents } = body;
    if (!projectId || !documents) {
      return NextResponse.json(
        { error: "projectId and documents are required" },
        { status: 400 }
      );
    }

    const saved = saveDocumentsForProject(projectId, documents);
    return NextResponse.json({ success: true, documents: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
