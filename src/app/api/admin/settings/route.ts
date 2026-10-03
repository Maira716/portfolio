import { NextRequest, NextResponse } from "next/server";
import { getIssuerSettings, saveIssuerSettings, StoredIssuerSettings } from "@/lib/serverStore";

export async function GET() {
  try {
    const issuer = getIssuerSettings();
    return NextResponse.json({ issuer }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveIssuerSettings(body as Partial<StoredIssuerSettings>);
    return NextResponse.json({ success: true, issuer: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
