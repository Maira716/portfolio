// src/lib/documentGenerator.ts
// Executive Document & Contract PDF Generator for Maira Reis Admin

import { DEFAULT_AGENCY_DATA } from "./receiptGenerator";

export type GeneratedDocType = "termo_aceite" | "proposta" | "termo_inicio" | "garantia" | "nda";
export type DocumentType = GeneratedDocType;

export interface GeneratedDocData {
  type: GeneratedDocType;
  docNumber: string;
  title: string;
  projectId: string;
  projectTitle: string;
  client: {
    name: string;
    email?: string;
    company?: string;
    document?: string;
    phone?: string;
  };
  agency: typeof DEFAULT_AGENCY_DATA;
  scopeItems?: string[];
  totalValue?: number;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
}

export function getDocTypeLabel(type: GeneratedDocType): string {
  switch (type) {
    case "termo_aceite":
      return "Termo de Aceite & Homologação de Entrega";
    case "proposta":
      return "Proposta Comercial & Escopo Técnico";
    case "termo_inicio":
      return "Termo de Início de Desenvolvimento & Briefing";
    case "garantia":
      return "Termo de Encerramento & Garantia Técnica";
    case "nda":
      return "Acordo de Confidencialidade (NDA)";
    default:
      return "Documento Oficial de Projeto";
  }
}

export function generateDocumentHtml(data: GeneratedDocData): string {
  const formattedDate = new Date(data.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedDelivery = data.deliveryDate
    ? new Date(data.deliveryDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Conforme Cronograma";

  const formattedValue = data.totalValue
    ? data.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null;

  const typeName = getDocTypeLabel(data.type);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${data.title} - ${data.projectTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      padding: 40px 20px;
    }
    
    .doc-page {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 56px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      position: relative;
    }

    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 28px;
      border-bottom: 2px solid #6366f1;
      margin-bottom: 32px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 12px;
      font-weight: 500;
      color: #6366f1;
      margin-top: 2px;
    }

    .doc-badge {
      text-align: right;
    }

    .doc-badge .badge-code {
      display: inline-block;
      padding: 4px 12px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }

    .doc-badge .badge-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    .doc-title-block {
      margin-bottom: 32px;
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 16px 20px;
      border-radius: 0 10px 10px 0;
    }

    .doc-type-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6366f1;
    }

    .doc-main-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
    }

    .info-card h4 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .info-row span:first-child {
      color: #64748b;
    }

    .info-row span:last-child {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }

    .content-section {
      margin-bottom: 28px;
    }

    .content-section h3 {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .content-section h3::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #6366f1;
      border-radius: 50%;
    }

    .scope-list {
      list-style: none;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .scope-list li {
      padding: 10px 16px;
      font-size: 12px;
      color: #334155;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .scope-list li:last-child {
      border-bottom: none;
    }

    .scope-list li::before {
      content: '✓';
      color: #10b981;
      font-weight: 800;
    }

    .notes-box {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 12px;
      color: #701a75;
      line-height: 1.5;
    }

    .signatures-block {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px dashed #cbd5e1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .sig-box {
      text-align: center;
    }

    .sig-line {
      border-bottom: 1px solid #475569;
      margin-bottom: 8px;
      height: 36px;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .sig-role {
      font-size: 11px;
      color: #64748b;
    }

    .doc-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }

    .actions-bar {
      max-width: 820px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-print {
      background: #6366f1;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transition: all 0.2s;
    }

    .btn-print:hover {
      background: #4f46e5;
    }

    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .actions-bar {
        display: none !important;
      }
      .doc-page {
        border: none;
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
  </div>

  <div class="doc-page">
    <div class="doc-header">
      <div>
        <div class="brand-title">${data.agency.name}</div>
        <div class="brand-subtitle">${data.agency.tradeName}</div>
      </div>
      <div class="doc-badge">
        <div class="badge-code">${data.docNumber}</div>
        <div class="badge-date">Emitido em ${formattedDate}</div>
      </div>
    </div>

    <div class="doc-title-block">
      <div class="doc-type-label">${typeName}</div>
      <div class="doc-main-title">${data.title}</div>
    </div>

    <div class="grid-info">
      <div class="info-card">
        <h4>Identificação do Cliente</h4>
        <div class="info-row">
          <span>Nome / Contratante:</span>
          <span>${data.client.name || "Cliente"}</span>
        </div>
        ${data.client.company ? `<div class="info-row"><span>Empresa:</span><span>${data.client.company}</span></div>` : ""}
        ${data.client.email ? `<div class="info-row"><span>E-mail:</span><span>${data.client.email}</span></div>` : ""}
        ${data.client.phone ? `<div class="info-row"><span>Telefone:</span><span>${data.client.phone}</span></div>` : ""}
      </div>

      <div class="info-card">
        <h4>Dados do Projeto & Contrato</h4>
        <div class="info-row">
          <span>Projeto:</span>
          <span>${data.projectTitle}</span>
        </div>
        ${data.projectId && data.projectId !== "geral" ? `<div class="info-row"><span>ID de Referência:</span><span style="font-family: monospace;">${data.projectId.slice(0, 8)}...</span></div>` : ""}
        ${formattedValue ? `<div class="info-row"><span>Valor do Contrato:</span><span style="color: #059669;">${formattedValue}</span></div>` : ""}
        ${data.deliveryDate ? `<div class="info-row"><span>Previsão / Prazo:</span><span>${data.deliveryDate}</span></div>` : ""}
      </div>
    </div>

    ${
      data.scopeItems && data.scopeItems.length > 0
        ? `
    <div class="content-section">
      <h3>Escopo, Entregáveis & Funcionalidades</h3>
      <ul class="scope-list">
        ${data.scopeItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    `
        : ""
    }

    ${
      data.notes
        ? `
    <div class="content-section">
      <h3>Observações & Termos Gerais</h3>
      <div class="notes-box">
        ${data.notes.replace(/\n/g, "<br>")}
      </div>
    </div>
    `
        : ""
    }

    <div class="signatures-block">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${data.agency.name}</div>
        <div class="sig-role">${data.agency.role}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-name">${data.client.name || "Contratante"}</div>
        <div class="sig-role">${data.client.company || "Cliente Contratante"}</div>
      </div>
    </div>

    <div class="doc-footer">
      Documento gerado eletronicamente por ${data.agency.tradeName} • ${data.agency.document} • ${data.agency.email}
    </div>
  </div>
</body>
</html>`;
}

export function openGeneratedDocument(data: GeneratedDocData): void {
  const html = generateDocumentHtml(data);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
