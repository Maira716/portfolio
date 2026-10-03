import { NextRequest, NextResponse } from "next/server";
import {
  getDocumentsForProject,
  getAllDocuments,
  saveDocumentsForProject,
  saveAllDocuments,
  readPortalData,
} from "@/lib/serverStore";
import { getAuthenticatedUser, checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { user, isAdmin } = await getAuthenticatedUser(req);
    const devBypass = process.env.NODE_ENV === "development";

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const visibility = (searchParams.get("visibility") || "all") as "client" | "all";
    const all = searchParams.get("all");

    // Only admins or dev can fetch all documents across all projects
    if (all === "true" || !projectId) {
      if (!isAdmin && !devBypass) {
        return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
      }
      const allDocs = getAllDocuments();
      return NextResponse.json({ documents: allDocs });
    }

    // Verify ownership if client
    if (!isAdmin && !devBypass && user) {
      const portalData = readPortalData();
      const project = portalData.projects.find((p) => p.id === projectId);
      const userEmail = (user.email || "").toLowerCase().trim();
      const userId = (user.id || "").toLowerCase().trim();
      const isOwner =
        (userId && project?.client_id?.toLowerCase() === userId) ||
        (userEmail && project?.client_id?.toLowerCase() === userEmail) ||
        (userEmail && project?.client_email?.toLowerCase() === userEmail);

      if (project && !isOwner) {
        return NextResponse.json({ error: "Acesso não autorizado aos documentos deste projeto." }, { status: 403 });
      }
    }

    // Regular clients only see 'client' visibility documents
    const effectiveVisibility = isAdmin || devBypass ? visibility : "client";
    const docs = getDocumentsForProject(projectId, effectiveVisibility);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao carregar documentos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { isAdmin } = await getAuthenticatedUser(req);
    const devBypass = process.env.NODE_ENV === "development";

    // Only admins can upload or update project documents
    if (!isAdmin && !devBypass) {
      return NextResponse.json({ error: "Apenas administradores podem gerenciar documentos." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

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
    return NextResponse.json({ error: "Erro ao salvar documentos." }, { status: 500 });
  }
}
