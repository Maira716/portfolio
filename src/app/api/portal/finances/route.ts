import { NextRequest, NextResponse } from "next/server";
import {
  getFinancesForProject,
  getAllFinances,
  saveFinancesForProject,
  saveAllFinances,
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
    const all = searchParams.get("all");

    // Only admins or dev can fetch all finances
    if (all === "true" || !projectId) {
      if (!isAdmin && !devBypass) {
        return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
      }
      const allFinances = getAllFinances();
      return NextResponse.json({ finances: allFinances });
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
        return NextResponse.json({ error: "Acesso não autorizado a este projeto." }, { status: 403 });
      }
    }

    const finances = getFinancesForProject(projectId);
    return NextResponse.json({ finances });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao consultar dados financeiros." }, { status: 500 });
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

    // Only admins can modify financial records
    if (!isAdmin && !devBypass) {
      return NextResponse.json({ error: "Apenas administradores podem atualizar lançamentos financeiros." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    if (body.financesMap && typeof body.financesMap === "object") {
      const saved = saveAllFinances(body.financesMap);
      return NextResponse.json({ success: true, finances: saved });
    }

    const { projectId, finances } = body;
    if (!projectId || !finances) {
      return NextResponse.json(
        { error: "projectId and finances are required" },
        { status: 400 }
      );
    }

    const saved = saveFinancesForProject(projectId, finances);
    return NextResponse.json({ success: true, finances: saved });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao salvar dados financeiros." }, { status: 500 });
  }
}
