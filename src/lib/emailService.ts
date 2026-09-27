// src/lib/emailService.ts
// Transactional Email Service for Portfólio

export type TransactionalEmailType = "delivery_completed" | "payment_confirmed";

export interface DeliveryCompletedPayload {
  type: "delivery_completed";
  recipientEmail: string;
  recipientName: string;
  projectName: string;
  projectId: string;
  milestoneTitle: string;
  stageName: string;
  completedAt: string;
  deliverables?: string[];
  notes?: string;
  portalUrl?: string;
}

export interface PaymentConfirmedPayload {
  type: "payment_confirmed";
  recipientEmail: string;
  recipientName: string;
  projectName: string;
  projectId: string;
  installmentNumber: number;
  totalInstallments?: number;
  installmentTitle: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  receiptNumber: string;
  authCode?: string;
  remainingBalance?: number;
  portalUrl?: string;
}

export type EmailNotificationPayload = DeliveryCompletedPayload | PaymentConfirmedPayload;

export interface DispatchedEmailLog {
  id: string;
  type: TransactionalEmailType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  projectId: string;
  projectName: string;
  sentAt: string;
  status: "delivered" | "simulated" | "failed";
  metadata?: Record<string, any>;
}

/**
 * Generate formatted HTML template for Delivery Completed email
 */
export function generateDeliveryCompletedHtml(data: DeliveryCompletedPayload): {
  subject: string;
  html: string;
} {
  const subject = `🚀 Entrega Concluída: ${data.milestoneTitle} — ${data.projectName}`;
  const formattedDate = new Date(data.completedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const portalLink = data.portalUrl || "https://mairareis.dev/portal";

  const deliverablesHtml =
    data.deliverables && data.deliverables.length > 0
      ? `<div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin: 0 0 10px 0; letter-spacing: 0.5px;">
            📦 Itens & Entregáveis Liberados:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
            ${data.deliverables.map((item) => `<li style="margin-bottom: 4px;"><strong>${item}</strong></li>`).join("")}
          </ul>
        </div>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070913; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #ec4899 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        🚀 Notificação de Entrega
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
        Entrega Concluída com Sucesso!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
        Projeto: <strong>${data.projectName}</strong>
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
        Olá, <strong>${data.recipientName}</strong>!
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Temos uma ótima notícia: a etapa <strong>"${data.milestoneTitle}"</strong> (${data.stageName}) do seu projeto acaba de ser concluída e validada por nossa equipe de engenharia.
      </p>

      <!-- Milestone Summary Card -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 14px; padding: 20px; margin: 24px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">
            Status do Marco
          </span>
          <span style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800;">
            ✓ Concluído
          </span>
        </div>
        <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #14532d;">
          ${data.milestoneTitle}
        </h3>
        <p style="margin: 0; font-size: 12px; color: #166534;">
          Data da Homologação: <strong>${formattedDate}</strong>
        </p>
      </div>

      ${deliverablesHtml}

      ${
        data.notes
          ? `<div style="margin: 20px 0; padding: 14px 18px; border-left: 4px solid #6366f1; background-color: #f8fafc; border-radius: 0 10px 10px 0;">
              <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">
                "${data.notes}"
              </p>
            </div>`
          : ""
      }

      <!-- Call To Action Button -->
      <div style="text-align: center; margin: 36px 0 24px 0;">
        <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);">
          Acessar Portal do Cliente & Testar →
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
        Você pode aprovar a entrega ou registrar considerações diretamente pelo portal.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #0f172a; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #ffffff;">
        Maira Reis • Engenharia de Software & Soluções Digitais
      </p>
      <p style="margin: 0; color: #64748b;">
        Este é um e-mail transacional automático. Em caso de dúvidas, responda diretamente ou contate via WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate formatted HTML template for Payment Confirmed email
 */
export function generatePaymentConfirmedHtml(data: PaymentConfirmedPayload): {
  subject: string;
  html: string;
} {
  const formattedAmount = (data.amount || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const subject = `✅ Pagamento Confirmado: Parcela #${data.installmentNumber} (${formattedAmount}) — ${data.projectName}`;
  const formattedDate = new Date(data.paidAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const portalLink = data.portalUrl || "https://mairareis.dev/portal";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070913; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0284c7 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        💳 Confirmação Financeira
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
        Pagamento Confirmado & Quitado!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
        Recibo Oficial: <strong>${data.receiptNumber}</strong>
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
        Olá, <strong>${data.recipientName}</strong>!
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Confirmamos com sucesso o recebimento e a baixa manual da <strong>Parcela #${data.installmentNumber}${data.totalInstallments ? ` de ${data.totalInstallments}` : ""}</strong> referente ao contrato do projeto <strong>"${data.projectName}"</strong>.
      </p>

      <!-- Amount Highlight Box -->
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #a7f3d0; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 1px; display: block; margin-bottom: 4px;">
          Valor Liquidado
        </span>
        <div style="font-size: 32px; font-weight: 900; color: #065f46; font-family: monospace;">
          ${formattedAmount}
        </div>
        <div style="font-size: 12px; color: #047857; margin-top: 6px; font-weight: 600;">
          Status: Quitado em ${formattedDate} via ${data.paymentMethod}
        </div>
      </div>

      <!-- Financial Details Table -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Identificação:</strong></td>
            <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">${data.installmentTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Forma de Pagamento:</strong></td>
            <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600; text-transform: uppercase;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Número do Recibo:</strong></td>
            <td style="padding: 6px 0; text-align: right; color: #4338ca; font-weight: 700; font-family: monospace;">${data.receiptNumber}</td>
          </tr>
          ${
            data.authCode
              ? `<tr>
                  <td style="padding: 6px 0; color: #64748b;"><strong>Autenticação SHA-256:</strong></td>
                  <td style="padding: 6px 0; text-align: right; color: #059669; font-weight: 600; font-family: monospace; font-size: 10px;">${data.authCode}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Statement text -->
      <div style="padding: 14px 18px; border-left: 4px solid #10b981; background-color: #f8fafc; border-radius: 0 10px 10px 0; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
          O comprovante e o <strong>Recibo Oficial de Quitação</strong> já se encontram emitidos e disponíveis para download no formato PDF em seu portal.
        </p>
      </div>

      <!-- Call To Action Button -->
      <div style="text-align: center; margin: 32px 0 20px 0;">
        <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; box-shadow: 0 8px 20px rgba(5, 150, 105, 0.35);">
          Acessar Extrato & Baixar Recibo (PDF) →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0f172a; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #1e293b;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #ffffff;">
        Maira Reis • Engenharia de Software & Soluções Digitais
      </p>
      <p style="margin: 0; color: #64748b;">
        CNPJ: 48.291.802/0001-94 • contato@mairareis.dev
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Dispatches an asynchronous transactional email notification
 */
export async function sendTransactionalEmail(
  payload: EmailNotificationPayload
): Promise<DispatchedEmailLog> {
  const { subject, html } =
    payload.type === "delivery_completed"
      ? generateDeliveryCompletedHtml(payload)
      : generatePaymentConfirmedHtml(payload);

  const emailLog: DispatchedEmailLog = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: payload.type,
    recipientEmail: payload.recipientEmail,
    recipientName: payload.recipientName,
    subject,
    previewText:
      payload.type === "delivery_completed"
        ? `Entrega "${payload.milestoneTitle}" concluída para ${payload.projectName}`
        : `Pagamento de ${payload.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} confirmado para ${payload.projectName}`,
    projectId: payload.projectId,
    projectName: payload.projectName,
    sentAt: new Date().toISOString(),
    status: "simulated",
    metadata: { ...payload },
  };

  try {
    // Call server API endpoint asynchronously
    if (typeof window !== "undefined") {
      fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: payload.type,
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          subject,
          html,
          payload,
        }),
      }).catch((err) => {
        console.warn("Async email notification background dispatch notice:", err);
      });

      // Save to local storage notification audit log
      const storageKey = "portfolio_email_notifications_v1";
      const existingRaw = localStorage.getItem(storageKey);
      let logs: DispatchedEmailLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      logs = [emailLog, ...logs].slice(0, 50); // keep last 50
      localStorage.setItem(storageKey, JSON.stringify(logs));
    }
  } catch (err) {
    console.error("Failed to save email notification log:", err);
  }

  return emailLog;
}

/**
 * Retrieve recent dispatched email notifications log
 */
export function getDispatchedEmailLogs(projectId?: string): DispatchedEmailLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("portfolio_email_notifications_v1");
    if (!raw) return [];
    const logs: DispatchedEmailLog[] = JSON.parse(raw);
    if (!Array.isArray(logs)) return [];
    if (projectId) {
      return logs.filter((l) => l.projectId === projectId);
    }
    return logs;
  } catch {
    return [];
  }
}
