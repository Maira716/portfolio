import { NextRequest, NextResponse } from "next/server";
import {
  getStoredProposals,
  getStoredProposalById,
  saveStoredProposal,
  saveAllStoredProposals,
  StoredCommercialProposal,
} from "@/lib/serverStore";
import { requireAdminAuth, checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const proposal = getStoredProposalById(id);
      if (!proposal) {
        return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
      }
      return NextResponse.json({ proposal });
    }

    const proposals = getStoredProposals();
    return NextResponse.json({ proposals });
  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth.authorized && auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();

    if (Array.isArray(body)) {
      const saved = saveAllStoredProposals(body as StoredCommercialProposal[]);
      return NextResponse.json({ proposals: saved });
    }

    if (!body.id || !body.title) {
      return NextResponse.json({ error: "Dados incompletos da proposta" }, { status: 400 });
    }

    const saved = saveStoredProposal(body as StoredCommercialProposal);
    return NextResponse.json({ proposal: saved });
  } catch (error: any) {
    console.error("Error saving proposal:", error);
    return NextResponse.json({ error: "Erro ao salvar proposta" }, { status: 500 });
  }
}
