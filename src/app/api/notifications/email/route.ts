import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, isValidEmail, sanitizeString } from "@/lib/apiSecurity";

export async function POST(req: NextRequest) {
  try {
    // Rate limit email dispatches (15 per minute per IP to prevent spam abuse)
    const rateLimit = checkRateLimit(req, 15, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de disparos de e-mail atingido. Tente novamente mais tarde." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { type, recipientEmail, recipientName, subject, html, payload } = body;

    if (!recipientEmail || !subject || !isValidEmail(recipientEmail)) {
      return NextResponse.json(
        { error: "recipientEmail válido e subject são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanSubject = sanitizeString(subject, 200);
    const cleanRecipientName = sanitizeString(recipientName || "", 100);

    const timestamp = new Date().toISOString();

    // If Resend API Key is configured in env, send real email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    let providerResult: any = { provider: "mock_simulation" };

    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Maira Reis <notificacoes@mairareis.dev>",
            to: [recipientEmail.trim().toLowerCase()],
            subject: cleanSubject,
            html: html || `<p>${cleanSubject}</p>`,
          }),
        });
        providerResult = await res.json();
      } catch (sendErr: any) {
        console.warn("[RESEND SEND ERROR]", sendErr);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: sanitizeString(type || "notification", 50),
      recipientEmail: recipientEmail.trim().toLowerCase(),
      recipientName: cleanRecipientName,
      subject: cleanSubject,
      dispatchedAt: timestamp,
      provider: resendApiKey ? "resend" : "simulated_local",
      providerResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao processar disparo de notificação." },
      { status: 500 }
    );
  }
}
