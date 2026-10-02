// src/lib/emailService.ts
// Transactional Email Service for Portfólio

export type TransactionalEmailType = "delivery_completed" | "payment_confirmed" | "update_posted";

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

export interface UpdatePostedPayload {
  type: "update_posted";
  recipientEmail: string;
  recipientName: string;
  projectName: string;
  projectId: string;
  updateTitle: string;
  updateCategory?: string;
  updateSummary?: string;
  actionUrl?: string;
}

export type EmailNotificationPayload =
  | DeliveryCompletedPayload
  | PaymentConfirmedPayload
  | UpdatePostedPayload;

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

  const portalLink = data.portalUrl || "https://www.mairareis.com.br/portal";

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

    <div style="padding: 32px 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
        Olá, <strong>${data.recipientName}</strong>!
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Temos uma ótima notícia: a etapa <strong>"${data.milestoneTitle}"</strong> (${data.stageName}) do seu projeto acaba de ser concluída e validada.
      </p>

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

      <div style="text-align: center; margin: 36px 0 20px 0;">
        <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 800; font-size: 14px; border-radius: 14px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);">
          Acessar Portal do Cliente →
        </a>
      </div>
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
  const formattedAmount = data.amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const subject = `💳 Confirmação de Pagamento: ${data.installmentTitle} (${formattedAmount}) — ${data.projectName}`;
  const portalLink = data.portalUrl || "https://www.mairareis.com.br/portal";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070913; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        💳 Recibo de Pagamento
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
        Pagamento Confirmado!
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
        Projeto: <strong>${data.projectName}</strong>
      </p>
    </div>

    <div style="padding: 32px 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
        Olá, <strong>${data.recipientName}</strong>!
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Confirmamos com sucesso o recebimento da parcela referente ao seu projeto.
      </p>

      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #6ee7b7; border-radius: 14px; padding: 24px; margin: 24px 0; text-align: center;">
        <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          Valor Liquidado
        </span>
        <h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">
          ${formattedAmount}
        </h2>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #047857; font-weight: 600;">
          ${data.installmentTitle} • ${data.paymentMethod}
        </p>
      </div>

      <div style="text-align: center; margin: 36px 0 20px 0;">
        <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 800; font-size: 14px; border-radius: 14px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.4);">
          Ver Financeiro no Portal →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate formatted HTML template for Update Posted / Broadcast email
 */
export function generateUpdatePostedHtml(data: UpdatePostedPayload): {
  subject: string;
  html: string;
} {
  const subject = `📢 ${data.updateTitle} — ${data.projectName}`;
  const portalLink = data.actionUrl || "https://www.mairareis.com.br/portal";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070913; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        📢 Atualização Oficial
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
        ${data.updateTitle}
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
        Projeto: <strong>${data.projectName}</strong>
      </p>
    </div>

    <div style="padding: 32px 30px;">
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
        Olá, <strong>${data.recipientName}</strong>!
      </p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0; color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-line;">
        ${data.updateSummary || "Novidades disponíveis para o seu projeto."}
      </div>

      <div style="text-align: center; margin: 36px 0 20px 0;">
        <a href="${portalLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 800; font-size: 14px; border-radius: 14px; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);">
          Acessar Portal do Projeto →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Dispatch a transactional email notification and record it to local state/API
 */
export function sendTransactionalEmail(payload: EmailNotificationPayload): DispatchedEmailLog {
  const { subject, html } =
    payload.type === "delivery_completed"
      ? generateDeliveryCompletedHtml(payload)
      : payload.type === "payment_confirmed"
      ? generatePaymentConfirmedHtml(payload)
      : generateUpdatePostedHtml(payload);

  const emailLog: DispatchedEmailLog = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: payload.type,
    recipientEmail: payload.recipientEmail,
    recipientName: payload.recipientName,
    subject,
    previewText:
      payload.type === "delivery_completed"
        ? `Entrega "${payload.milestoneTitle}" concluída para ${payload.projectName}`
        : payload.type === "payment_confirmed"
        ? `Pagamento de ${payload.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} confirmado para ${payload.projectName}`
        : `Atualização: ${payload.updateTitle} (${payload.projectName})`,
    projectId: payload.projectId,
    projectName: payload.projectName,
    sentAt: new Date().toISOString(),
    status: "simulated",
    metadata: { ...payload },
  };

  try {
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

      const storageKey = "portfolio_email_notifications_v1";
      const existingRaw = localStorage.getItem(storageKey);
      let logs: DispatchedEmailLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      logs = [emailLog, ...logs].slice(0, 50);
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
