import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, recipientEmail, recipientName, subject, html, payload } = body;

    if (!recipientEmail || !subject) {
      return NextResponse.json(
        { error: "recipientEmail e subject são obrigatórios." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    console.log(
      `[EMAIL NOTIFICATION DISPATCH] Type: ${type} | To: ${recipientName} <${recipientEmail}> | Subject: "${subject}" | Time: ${timestamp}`
    );

    // If Resend API Key is configured in env, we can send real email via Resend
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
            to: [recipientEmail],
            subject: subject,
            html: html,
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
      type,
      recipientEmail,
      recipientName,
      subject,
      dispatchedAt: timestamp,
      provider: resendApiKey ? "resend" : "simulated_local",
      providerResult,
    });
  } catch (err: any) {
    console.error("[EMAIL NOTIFICATION ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao disparar e-mail transacional." },
      { status: 500 }
    );
  }
}
