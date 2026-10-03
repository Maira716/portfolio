// src/lib/receiptGenerator.ts
// Dynamic Receipt & PDF Generator for Portfólio

export interface ReceiptData {
  receiptNumber: string;
  projectId: string;
  projectTitle: string;
  installmentNumber: number;
  totalInstallments?: number;
  installmentTitle: string;
  amount: number;
  dueDate: string;
  paidAt: string;
  paymentMethod: string;
  authCode?: string;
  notes?: string;
  client: {
    name: string;
    email?: string;
    document?: string;
    company?: string;
  };
  agency: {
    name: string;
    tradeName: string;
    document: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    role: string;
  };
}

export const DEFAULT_AGENCY_DATA = {
  name: "Maira Reis",
  tradeName: "Maira Reis - Desenvolvimento & UI/UX Design",
  document: "55.843.406/0001-28",
  email: "mairareis2017@gmail.com",
  phone: "+55 (35) 9803-0543",
  city: "Pouso Alegre",
  state: "MG",
  role: "Engenheira de Software & UI/UX Designer",
};

export function getAgencyData(): typeof DEFAULT_AGENCY_DATA {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("portfolio_admin_issuer_settings_v1");
      if (saved) {
        const p = JSON.parse(saved);
        return {
          name: p.pixBeneficiary || p.companyName || DEFAULT_AGENCY_DATA.name,
          tradeName: p.tradingName || p.companyName || DEFAULT_AGENCY_DATA.tradeName,
          document: p.documentNumber || p.pixKey || DEFAULT_AGENCY_DATA.document,
          email: p.email || DEFAULT_AGENCY_DATA.email,
          phone: p.phone || DEFAULT_AGENCY_DATA.phone,
          city: p.city || DEFAULT_AGENCY_DATA.city,
          state: p.state || DEFAULT_AGENCY_DATA.state,
          role: p.roleTitle || DEFAULT_AGENCY_DATA.role,
        };
      }
    } catch {}
  }
  return DEFAULT_AGENCY_DATA;
}

/**
 * Converts a positive number to Portuguese currency words (e.g. 5800 -> "cinco mil e oitocentos reais")
 */
export function numberToBRLWords(val: number): string {
  if (isNaN(val) || val <= 0) return "zero reais";

  const units = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];

  const tens = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];

  const hundreds = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  function convertGroup(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const parts: string[] = [];

    if (h > 0) parts.push(hundreds[h]);

    if (remainder > 0) {
      if (remainder < 20) {
        parts.push(units[remainder]);
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;
        parts.push(tens[t]);
        if (u > 0) parts.push(units[u]);
      }
    }

    return parts.join(" e ");
  }

  const integerPart = Math.floor(val);
  const cents = Math.round((val - integerPart) * 100);

  const thousands = Math.floor(integerPart / 1000);
  const restUnits = integerPart % 1000;

  const resultWords: string[] = [];

  if (thousands > 0) {
    if (thousands === 1) {
      resultWords.push("mil");
    } else {
      resultWords.push(convertGroup(thousands) + " mil");
    }
  }

  if (restUnits > 0) {
    const groupWords = convertGroup(restUnits);
    if (thousands > 0 && (restUnits <= 100 || restUnits % 100 === 0)) {
      resultWords.push("e " + groupWords);
    } else if (thousands > 0) {
      resultWords.push(groupWords);
    } else {
      resultWords.push(groupWords);
    }
  }

  let finalString = resultWords.join(" ").trim();
  if (integerPart === 1) {
    finalString += " real";
  } else if (integerPart > 1) {
    finalString += " reais";
  }

  if (cents > 0) {
    const centsWords = convertGroup(cents);
    const centSuffix = cents === 1 ? " centavo" : " centavos";
    if (integerPart > 0) {
      finalString += " e " + centsWords + centSuffix;
    } else {
      finalString = centsWords + centSuffix + " de real";
    }
  }

  return finalString.charAt(0).toUpperCase() + finalString.slice(1);
}

/**
 * Generate formatted HTML printable receipt template for PDF export / printing
 */
export function generateReceiptHTML(data: ReceiptData): string {
  const formattedAmount = (data.amount || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const amountInWords = numberToBRLWords(data.amount);

  const formattedPaidDate = data.paidAt
    ? new Date(data.paidAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const shortPaidDate = data.paidAt
    ? new Date(data.paidAt).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  const formattedDueDate = data.dueDate
    ? new Date(data.dueDate).toLocaleDateString("pt-BR")
    : "Conforme entrega";

  const authCode =
    data.authCode ||
    `REC-${data.projectId.slice(0, 6).toUpperCase()}-${data.installmentNumber}-${Date.now().toString(36).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Recibo de Pagamento - ${data.receiptNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(16, 185, 129, 0.05);
      pointer-events: none;
      letter-spacing: 12px;
      user-select: none;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .badge-receipt {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-align: right;
    }

    .receipt-num {
      font-size: 14px;
      font-family: monospace;
      color: #3b82f6;
      margin-top: 4px;
      font-weight: 700;
    }

    .amount-highlight-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #86efac;
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .amount-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #166534;
    }

    .amount-value {
      font-size: 28px;
      font-weight: 900;
      color: #15803d;
      font-family: monospace;
      letter-spacing: -0.5px;
    }

    .grid-parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    .party-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }

    .party-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .party-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .party-detail {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .statement-box {
      background: #ffffff;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      margin-bottom: 28px;
      border-radius: 0 10px 10px 0;
      background: #fdfdfd;
      border-top: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }

    .statement-text {
      font-size: 13px;
      color: #1e293b;
      line-height: 1.7;
    }

    .statement-text strong {
      color: #0f172a;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      font-size: 12px;
    }

    .details-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      text-align: left;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }

    .details-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .details-table td.bold {
      font-weight: 700;
      color: #0f172a;
    }

    .signatures-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px dashed #cbd5e1;
    }

    .signature-block {
      text-align: center;
    }

    .signature-line {
      width: 80%;
      margin: 0 auto 8px auto;
      border-top: 1px solid #0f172a;
    }

    .signature-name {
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
    }

    .signature-role {
      font-size: 11px;
      color: #64748b;
    }

    .stamp-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .footer-auth {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
      font-family: monospace;
    }

    .btn-print-wrapper {
      margin-top: 24px;
      text-align: center;
    }

    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: background 0.2s;
    }

    .btn-print:hover {
      background: #1d4ed8;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .btn-print-wrapper {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="watermark">QUITADO</div>

    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="brand-title">${data.agency.tradeName}</h1>
        <p class="brand-sub">${data.agency.name} • CNPJ: ${data.agency.document}</p>
        <p class="brand-sub">${data.agency.email} • ${data.agency.phone} • ${data.agency.city}/${data.agency.state}</p>
      </div>
      <div style="text-align: right;">
        <div class="badge-receipt">Recibo de Quitação</div>
        <div class="receipt-num">Nº ${data.receiptNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Emissão: ${shortPaidDate}</div>
      </div>
    </div>

    <!-- Highlight Box -->
    <div class="amount-highlight-box">
      <div>
        <div class="amount-label">Valor Recebido e Quitado</div>
        <div style="font-size: 12px; color: #166534; margin-top: 2px;">
          (${amountInWords})
        </div>
      </div>
      <div class="amount-value">${formattedAmount}</div>
    </div>

    <!-- Parties -->
    <div class="grid-parties">
      <!-- Emissor -->
      <div class="party-card">
        <div class="party-title">
          <span>🏢</span>
          <span>Prestador de Serviços (Emissor)</span>
        </div>
        <div class="party-name">${data.agency.tradeName}</div>
        <div class="party-detail"><strong>Responsável:</strong> ${data.agency.name}</div>
        <div class="party-detail"><strong>CNPJ/MEI:</strong> ${data.agency.document}</div>
        <div class="party-detail"><strong>E-mail:</strong> ${data.agency.email}</div>
      </div>

      <!-- Tomador -->
      <div class="party-card">
        <div class="party-title">
          <span>👤</span>
          <span>Tomador do Serviço (Cliente)</span>
        </div>
        <div class="party-name">${data.client.name || "Cliente Contratante"}</div>
        ${data.client.company ? `<div class="party-detail"><strong>Empresa:</strong> ${data.client.company}</div>` : ""}
        ${data.client.document ? `<div class="party-detail"><strong>CPF/CNPJ:</strong> ${data.client.document}</div>` : ""}
        <div class="party-detail"><strong>E-mail:</strong> ${data.client.email || "Não informado"}</div>
      </div>
    </div>

    <!-- Statement Box -->
    <div class="statement-box">
      <p class="statement-text">
        Declaramos para os devidos fins de direito que recebemos do Tomador acima qualificado a quantia líquida de 
        <strong>${formattedAmount}</strong> (${amountInWords}), referente ao pagamento da 
        <strong>Parcela ${data.installmentNumber}${data.totalInstallments ? ` de ${data.totalInstallments}` : ""} (${data.installmentTitle})</strong> 
        vinculada ao projeto <strong>"${data.projectTitle}"</strong>, conferindo por meio deste documento a respectiva e irrevogável quitação financeira quanto a esta parcela.
      </p>
    </div>

    <!-- Details Table -->
    <table class="details-table">
      <thead>
        <tr>
          <th>Item / Descrição</th>
          <th>Vencimento</th>
          <th>Forma de Pagamento</th>
          <th>Data Quitação</th>
          <th style="text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">
            Parcela #${data.installmentNumber} - ${data.installmentTitle}
            ${data.notes ? `<div style="font-size: 11px; font-weight: normal; color: #64748b; margin-top: 2px;">${data.notes}</div>` : ""}
          </td>
          <td>${formattedDueDate}</td>
          <td><strong style="color: #4338ca; text-transform: uppercase;">${data.paymentMethod}</strong></td>
          <td><strong style="color: #15803d;">${shortPaidDate}</strong></td>
          <td style="text-align: right;" class="bold">${formattedAmount}</td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures -->
    <div class="signatures-section">
      <div class="signature-block">
        <div class="stamp-badge">
          <span>✓</span>
          <span>PAGAMENTO VERIFICADO & LIQUIDADO</span>
        </div>
        <div class="signature-line"></div>
        <div class="signature-name">${data.agency.name}</div>
        <div class="signature-role">${data.agency.tradeName}</div>
      </div>

      <div class="signature-block">
        <div style="height: 33px;"></div>
        <div class="signature-line"></div>
        <div class="signature-name">${data.client.name || "Tomador do Serviço"}</div>
        <div class="signature-role">${data.client.company || "Cliente Contratante"}</div>
      </div>
    </div>

    <!-- Footer Authentication -->
    <div class="footer-auth">
      <div>Autenticação Digital: ${authCode}</div>
      <div>Emitido em: ${formattedPaidDate}</div>
    </div>

    <div class="btn-print-wrapper">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    </div>
  </div>

  <script>
    // Auto-trigger print if requested via query or context
    if (window.location.search.includes('print=true')) {
      window.addEventListener('load', function() {
        setTimeout(function() { window.print(); }, 400);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Open printable receipt in a new tab or trigger browser print
 */
export function openReceiptInNewWindow(data: ReceiptData, autoPrint = false): void {
  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url + (autoPrint ? "?print=true" : ""), "_blank");
  if (printWindow) {
    printWindow.focus();
  }
}

/**
 * Download standard formatted receipt HTML file or open direct PDF print
 */
export function downloadReceiptDocument(data: ReceiptData): void {
  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Recibo_${data.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
