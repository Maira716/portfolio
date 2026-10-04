import { NextRequest, NextResponse } from "next/server";
import { getIssuerSettings, saveIssuerSettings, StoredIssuerSettings } from "@/lib/serverStore";
import { requireAdminAuth, checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }
    const issuer = getIssuerSettings();
    return NextResponse.json({ issuer }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth.authorized && auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();
    const updated = saveIssuerSettings(body as Partial<StoredIssuerSettings>);
    return NextResponse.json({ success: true, issuer: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

