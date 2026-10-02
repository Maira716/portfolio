import { NextRequest, NextResponse } from "next/server";
import {
  getStoredProposals,
  getStoredProposalById,
  saveStoredProposal,
  saveAllStoredProposals,
  StoredCommercialProposal,
} from "@/lib/serverStore";

export async function GET(req: NextRequest) {
  try {
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
