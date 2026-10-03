import { NextResponse } from "next/server";
import { getIssuerSettings } from "@/lib/serverStore";

export async function GET() {
  try {
    const issuer = getIssuerSettings();
    return NextResponse.json(
      {
        pixKeyType: issuer.pixKeyType || "cnpj",
        pixKey: issuer.pixKey || "55.843.406/0001-28",
        pixBeneficiary: issuer.pixBeneficiary || "Maira Reis",
        bankName: issuer.bankName || "C6",
        bankAgency: issuer.bankAgency || "",
        bankAccount: issuer.bankAccount || "",
        companyName: issuer.companyName || "Maira Reis - Desenvolvimento & UI/UX Design",
        documentNumber: issuer.documentNumber || "55.843.406/0001-28",
        email: issuer.email || "mairareis2017@gmail.com",
        phone: issuer.phone || "553598030543",
        city: issuer.city || "Pouso Alegre",
        state: issuer.state || "MG",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
