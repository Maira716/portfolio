"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  ShieldCheck,
  FolderKanban,
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Layers,
  Calendar,
  Palette,
  Globe,
  FolderGit2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  UserCheck,
  BarChart3,
  Sliders,
  X,
  User,
  Copy,
  Check,
  KeyRound,
  Mail,
  Phone,
  LayoutDashboard,
  FileText,
  DollarSign,
  Settings,
  Menu,
  Bell,
  Search,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Lock,
  Unlock,
  MessageCircle,
  Eye,
  Filter,
  CheckSquare,
  Zap,
  SlidersHorizontal,
  ArrowDownUp,
  Rocket,
  Megaphone,
  MessageSquare,
  CalendarDays,
  Tag,
  Code,
  Bold,
  List,
  Link2,
  Quote,
  RotateCcw,
  ListTodo,
  Monitor,
  Tablet,
  Maximize2,
  Minimize2,
  ShieldAlert,
  ArrowLeft,
  CheckCheck,
  Receipt,
  Printer,
  Download,
} from "lucide-react";
import { useAuth, Profile } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  ReceiptData,
  DEFAULT_AGENCY_DATA,
  openReceiptInNewWindow,
  downloadReceiptDocument,
} from "@/lib/receiptGenerator";
import {
  sendTransactionalEmail,
  getDispatchedEmailLogs,
  DispatchedEmailLog,
} from "@/lib/emailService";

export type ProjectStatus =
  | "planejamento"
  | "em_andamento"
  | "homologacao"
  | "concluido"
  | "desenvolvimento"
  | "design"
  | "testes"
  | "pausado";

export interface Project {
  id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  deadline: string | null;
  preview_url: string | null;
  figma_url: string | null;
  repo_url: string | null;
  category: string | null;
  created_at: string;
}

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "planejamento":
      return {
        label: "Planejamento",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dotClass: "bg-amber-400",
        desc: "Briefing & Definição de Escopo",
      };
    case "em_andamento":
    case "desenvolvimento":
    case "design":
      return {
        label: "Em Andamento",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        dotClass: "bg-blue-400",
        desc: "Design & Sprints Ativas",
      };
    case "homologacao":
    case "testes":
      return {
        label: "Homologação",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        dotClass: "bg-cyan-400",
        desc: "Testes & Validação com Cliente",
      };
    case "concluido":
      return {
        label: "Concluído",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dotClass: "bg-emerald-400",
        desc: "Publicado & Entregue",
      };
    case "pausado":
      return {
        label: "Pausado",
        badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        dotClass: "bg-rose-400",
        desc: "Aguardando Alinhamento",
      };
    default:
      return {
        label: status || "Em Andamento",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        dotClass: "bg-purple-400",
        desc: "Status Operacional",
      };
  }
};

export type MilestoneStatus = "pending" | "in_review" | "approved";

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order_index: number;
  completed: boolean;
  completed_at?: string | null;
  due_date: string | null;
}

export interface ParsedMilestone {
  id: string;
  project_id: string;
  title: string;
  rawDescription: string | null;
  description: string;
  stage: string;
  progress: number;
  weight: number;
  status: MilestoneStatus;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  order_index: number;
}

export const PROJECT_STAGES = [
  "Design UI/UX",
  "Front-end Mobile/Web",
  "Back-end & APIs",
  "Homologação & QA",
  "Deploy & Publicação",
] as const;

export const parseMilestone = (m: Milestone): ParsedMilestone => {
  let stage = "Design UI/UX";
  let weight = 1;
  let progress = m.completed ? 100 : 0;
  let status: MilestoneStatus = m.completed ? "approved" : "pending";
  let cleanDesc = m.description || "";

  if (m.description && m.description.startsWith("[ETAPA:")) {
    const headerEnd = m.description.indexOf("]\n");
    if (headerEnd !== -1) {
      const meta = m.description.slice(7, headerEnd);
      cleanDesc = m.description.slice(headerEnd + 2);
      const parts = meta.split("|").map((p) => p.trim());
      for (const part of parts) {
        if (part.startsWith("stage=")) stage = part.replace("stage=", "");
        if (part.startsWith("weight=")) weight = Number(part.replace("weight=", "")) || 1;
        if (part.startsWith("progress=")) progress = Number(part.replace("progress=", "")) || 0;
        if (part.startsWith("status=")) status = part.replace("status=", "") as MilestoneStatus;
      }
    }
  }

  if (m.completed && status !== "approved") {
    status = "approved";
    progress = 100;
  }
  if (status === "approved") progress = 100;

  return {
    id: m.id,
    project_id: m.project_id,
    title: m.title,
    rawDescription: m.description,
    description: cleanDesc,
    stage,
    progress,
    weight,
    status,
    completed: status === "approved" || m.completed,
    completed_at: m.completed_at || null,
    due_date: m.due_date || null,
    order_index: m.order_index,
  };
};

export const serializeMilestoneDescription = (
  cleanDesc: string,
  stage: string,
  weight: number,
  progress: number,
  status: string
) => {
  return `[ETAPA: stage=${stage} | weight=${weight} | progress=${progress} | status=${status}]\n${cleanDesc || ""}`;
};

export const calculateWeightedProgress = (milestoneList: Milestone[]) => {
  if (!milestoneList || milestoneList.length === 0) return 0;
  const parsed = milestoneList.map(parseMilestone);
  let totalWeight = 0;
  let totalWeightedProgress = 0;

  for (const pm of parsed) {
    const w = pm.weight || 1;
    const p = pm.status === "approved" ? 100 : pm.progress || 0;
    totalWeight += w;
    totalWeightedProgress += p * w;
  }

  if (totalWeight === 0) return 0;
  return Math.min(100, Math.max(0, Math.round(totalWeightedProgress / totalWeight)));
};

// Timeline Updates & Notes Types & Helpers
export type UpdateType =
  | "reuniao"
  | "versao"
  | "comunicado"
  | "milestone"
  | "update"
  | "alert"
  | "release";

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  content: string;
  category: UpdateType;
  created_at: string;
  version_tag?: string | null;
  meeting_attendees?: string | null;
}

export type UpdateItem = ProjectUpdate;

export const getUpdateTypeInfo = (category: UpdateType | string) => {
  switch (category) {
    case "reuniao":
      return {
        label: "Reunião de Alinhamento",
        badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        colorText: "text-blue-400",
        dotClass: "bg-blue-400 ring-blue-500/30",
        icon: Users,
      };
    case "versao":
    case "release":
      return {
        label: "Atualização de Versão",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        colorText: "text-emerald-400",
        dotClass: "bg-emerald-400 ring-emerald-500/30",
        icon: Rocket,
      };
    case "comunicado":
    case "alert":
      return {
        label: "Comunicado Oficial",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        colorText: "text-amber-400",
        dotClass: "bg-amber-400 ring-amber-500/30",
        icon: Megaphone,
      };
    case "milestone":
      return {
        label: "Marco de Entrega",
        badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        colorText: "text-purple-400",
        dotClass: "bg-purple-400 ring-purple-500/30",
        icon: CheckCircle2,
      };
    default:
      return {
        label: "Atualização Geral",
        badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        colorText: "text-indigo-400",
        dotClass: "bg-indigo-400 ring-indigo-500/30",
        icon: Send,
      };
  }
};

export const generateDefaultProjectUpdates = (project: Project): ProjectUpdate[] => {
  const now = new Date();
  const d1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: `${project.id}-upd-1`,
      project_id: project.id,
      title: "Sprint Review & Release Beta v1.2.0",
      category: "versao",
      version_tag: "v1.2.0",
      content:
        "**Novidades desta versão:**\n- Finalização do fluxo de autenticação e perfis de acesso (RBAC).\n- Integração da tela de detalhes de pedidos e notificações push.\n- Otimizações de renderização no aplicativo móvel.\n\n*Ambiente de homologação atualizado para testes.*",
      created_at: d1,
    },
    {
      id: `${project.id}-upd-2`,
      project_id: project.id,
      title: "Reunião de Alinhamento de UI/UX e Aprovação do Protótipo",
      category: "reuniao",
      meeting_attendees: "Maira Reis, Equipe de Design e Cliente",
      content:
        "**Pautas alinhadas durante a reunião:**\n1. Apresentação das telas de onboarding e dashboard no Figma.\n2. Validação da paleta de cores primária e tipografia.\n3. Acordado prazo de homologação para a próxima sexta-feira.\n\n*Ata aprovada pelos participantes.*",
      created_at: d2,
    },
    {
      id: `${project.id}-upd-3`,
      project_id: project.id,
      title: "Comunicado: Início da Sprint 2 - Desenvolvimento Front-end",
      category: "comunicado",
      content:
        "Informamos que as definições de arquitetura e design foram concluídas com sucesso. Iniciamos hoje a codificação dos componentes interativos no repositório oficial.\n\n> Previsão de primeira versão navegável em 10 dias úteis.",
      created_at: d3,
    },
  ];
};

export const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((sub, j) => {
      if (sub.startsWith("`") && sub.endsWith("`")) {
        return (
          <code
            key={`${i}-${j}`}
            className="px-1.5 py-0.5 rounded bg-black/60 text-pink-300 font-mono text-[11px] border border-white/10"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  });
};

export const renderRichMarkdown = (content: string) => {
  if (!content) return null;
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-gray-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed.startsWith("> ")) {
          return (
            <div
              key={idx}
              className="p-3 my-1 rounded-xl bg-indigo-950/30 border-l-4 border-indigo-500 text-indigo-200 text-xs italic"
            >
              {trimmed.substring(2)}
            </div>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <span>{renderInlineFormatting(itemText)}</span>
            </div>
          );
        }

        if (trimmed.startsWith("[x] ") || trimmed.startsWith("[X] ")) {
          return (
            <div key={idx} className="flex items-center gap-2 pl-2 text-emerald-300">
              <CheckSquare size={13} className="shrink-0 text-emerald-400" />
              <span className="line-through text-gray-400">{renderInlineFormatting(trimmed.substring(4))}</span>
            </div>
          );
        }
        if (trimmed.startsWith("[ ] ")) {
          return (
            <div key={idx} className="flex items-center gap-2 pl-2 text-gray-300">
              <span className="w-3.5 h-3.5 rounded border border-white/20 bg-black/40 shrink-0 inline-block" />
              <span>{renderInlineFormatting(trimmed.substring(4))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span>{renderInlineFormatting(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
};

// Financial Types & Helpers
export type PaymentMethod =
  | "pix"
  | "cartao"
  | "boleto"
  | "transferencia"
  | "ted"
  | "cripto"
  | "dinheiro"
  | "outro";

export type InstallmentStatus = "pago" | "vencido" | "em_dia" | "pendente";

export interface ProjectInstallment {
  id: string;
  project_id: string;
  installment_number: number;
  title: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method: PaymentMethod;
  receipt_url?: string | null;
  notes?: string | null;
}

export interface ProjectFinancialData {
  project_id: string;
  total_contract_value: number;
  notes?: string;
  installments: ProjectInstallment[];
}

export const formatBRL = (val: number) => {
  return (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case "pix":
      return "Pix";
    case "cartao":
      return "Cartão de Crédito";
    case "boleto":
      return "Boleto Bancário";
    case "transferencia":
    case "ted":
      return "Transferência / TED";
    case "cripto":
      return "Cripto / USDT";
    case "dinheiro":
      return "Dinheiro em Espécie";
    default:
      return "Outro";
  }
};

export const getInstallmentStatus = (inst: ProjectInstallment) => {
  if (inst.paid_at) {
    return {
      status: "pago" as const,
      label: "Pago",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dotClass: "bg-emerald-400",
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (inst.due_date && inst.due_date < todayStr) {
    return {
      status: "vencido" as const,
      label: "Vencido",
      badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      dotClass: "bg-rose-400",
    };
  }

  const dueDate = new Date(inst.due_date);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7 && diffDays >= 0) {
    return {
      status: "em_dia" as const,
      label: "Em dia (Vence logo)",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dotClass: "bg-amber-400",
    };
  }

  return {
    status: "pendente" as const,
    label: "Pendente",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dotClass: "bg-blue-400",
  };
};

export const calculateFinancialSummary = (financialData?: ProjectFinancialData) => {
  const contractValue = financialData?.total_contract_value || 0;
  const installments = financialData?.installments || [];

  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let totalDueSoon = 0;

  for (const inst of installments) {
    const st = getInstallmentStatus(inst);
    if (st.status === "pago") {
      totalPaid += inst.amount;
    } else if (st.status === "vencido") {
      totalOverdue += inst.amount;
    } else if (st.status === "em_dia") {
      totalDueSoon += inst.amount;
      totalPending += inst.amount;
    } else {
      totalPending += inst.amount;
    }
  }

  const remainingBalance = Math.max(0, contractValue - totalPaid);
  const percentPaid = contractValue > 0 ? Math.min(100, Math.round((totalPaid / contractValue) * 100)) : 0;

  return {
    contractValue,
    totalPaid,
    remainingBalance,
    totalOverdue,
    totalDueSoon,
    totalPending,
    percentPaid,
    installmentsCount: installments.length,
    paidCount: installments.filter((i) => !!i.paid_at).length,
  };
};

export const generateDefaultProjectFinances = (project: Project): ProjectFinancialData => {
  const baseValue = 14500;
  return {
    project_id: project.id,
    total_contract_value: baseValue,
    notes: `Contrato de desenvolvimento - ${project.title}`,
    installments: [
      {
        id: `${project.id}-inst-1`,
        project_id: project.id,
        installment_number: 1,
        title: "Entrada / Sinal (40%)",
        amount: 5800,
        due_date: project.start_date || new Date().toISOString().split("T")[0],
        paid_at: project.start_date || new Date().toISOString().split("T")[0],
        payment_method: "pix",
        receipt_url: "PIX-COMPROVANTE-SINAL-AUT-89421",
        notes: "Sinal quitado na assinatura da proposta comercial",
      },
      {
        id: `${project.id}-inst-2`,
        project_id: project.id,
        installment_number: 2,
        title: "Entrega Front-end & Homologação (30%)",
        amount: 4350,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        paid_at: null,
        payment_method: "pix",
        receipt_url: null,
        notes: "Vencimento na liberação do ambiente de testes",
      },
      {
        id: `${project.id}-inst-3`,
        project_id: project.id,
        installment_number: 3,
        title: "Publicação & Deploy Final (30%)",
        amount: 4350,
        due_date: project.deadline || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        paid_at: null,
        payment_method: "pix",
        receipt_url: null,
        notes: "Vencimento na entrega final das chaves e código",
      },
    ],
  };
};

// Document & Contract Types & Helpers
export type DocumentCategory =
  | "contrato"
  | "proposta"
  | "termo_aceite"
  | "briefing"
  | "nda"
  | "recibo"
  | "outro";

export type DocumentVisibility = "client" | "internal";

export interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  filename: string;
  category: DocumentCategory;
  visibility: DocumentVisibility;
  file_url: string;
  file_size_bytes: number;
  file_size_formatted: string;
  mime_type: "application/pdf";
  uploaded_at: string;
  notes?: string | null;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const getDocumentCategoryInfo = (category: DocumentCategory) => {
  switch (category) {
    case "contrato":
      return {
        label: "Contrato Principal",
        badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        colorText: "text-purple-400",
      };
    case "proposta":
      return {
        label: "Proposta Comercial",
        badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        colorText: "text-blue-400",
      };
    case "termo_aceite":
      return {
        label: "Termo de Aceite & Homologação",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        colorText: "text-emerald-400",
      };
    case "briefing":
      return {
        label: "Briefing Técnico & Requisitos",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        colorText: "text-amber-400",
      };
    case "nda":
      return {
        label: "Acordo de Confidencialidade (NDA)",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        colorText: "text-cyan-400",
      };
    case "recibo":
      return {
        label: "Recibo Fiscal",
        badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        colorText: "text-indigo-400",
      };
    default:
      return {
        label: "Outro Documento",
        badgeClass: "bg-gray-500/15 text-gray-300 border-gray-500/30",
        colorText: "text-gray-400",
      };
  }
};

export const generateDefaultProjectDocuments = (project: Project): ProjectDocument[] => {
  return [
    {
      id: `${project.id}-doc-1`,
      project_id: project.id,
      title: `Contrato de Prestação de Serviços - ${project.title}`,
      filename: "Contrato_Prestacao_Servicos_Desenvolvimento.pdf",
      category: "contrato",
      visibility: "client",
      file_url: "#",
      file_size_bytes: 2450000,
      file_size_formatted: "2.4 MB",
      mime_type: "application/pdf",
      uploaded_at: project.start_date || new Date().toISOString().split("T")[0],
      notes: "Contrato assinado digitalmente com escopo, cláusulas de entrega e SLA.",
    },
    {
      id: `${project.id}-doc-2`,
      project_id: project.id,
      title: `Proposta Comercial & Cronograma Detalhado`,
      filename: "Proposta_Comercial_Cronograma_Escopo.pdf",
      category: "proposta",
      visibility: "client",
      file_url: "#",
      file_size_bytes: 1820000,
      file_size_formatted: "1.8 MB",
      mime_type: "application/pdf",
      uploaded_at: project.start_date || new Date().toISOString().split("T")[0],
      notes: "Proposta com detalhamento de sprints, arquitetura e formas de pagamento.",
    },
    {
      id: `${project.id}-doc-3`,
      project_id: project.id,
      title: `Termo de Aceite & Homologação de Etapa`,
      filename: "Termo_Aceite_Homologacao_Design.pdf",
      category: "termo_aceite",
      visibility: "internal",
      file_url: "#",
      file_size_bytes: 950000,
      file_size_formatted: "950 KB",
      mime_type: "application/pdf",
      uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "Validação interna de requisitos técnicos e checklist de QA.",
    },
  ];
};

// Quick Links Types & Helpers
export type QuickLinkCategory =
  | "figma"
  | "staging"
  | "docs"
  | "github"
  | "api"
  | "production"
  | "video"
  | "outro";

export interface ProjectQuickLink {
  id: string;
  project_id: string;
  label: string;
  url: string;
  category: QuickLinkCategory;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
}

export const getQuickLinkCategoryInfo = (category: QuickLinkCategory) => {
  switch (category) {
    case "figma":
      return {
        label: "Protótipo Figma",
        sublabel: "Design UI/UX & Wireframes",
        badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        btnClass: "from-purple-900/40 via-indigo-950/40 to-slate-900 border-purple-500/30 hover:border-purple-400 text-white",
        iconColor: "text-purple-400 bg-purple-500/20 border-purple-500/30",
        icon: Palette,
        actionLabel: "Abrir Protótipo",
        statusTag: "Navegável",
      };
    case "staging":
      return {
        label: "Ambiente de Testes",
        sublabel: "Homologação & Deploy Staging",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        btnClass: "from-cyan-950/40 via-blue-950/40 to-slate-900 border-cyan-500/30 hover:border-cyan-400 text-white",
        iconColor: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
        icon: Globe,
        actionLabel: "Acessar Staging",
        statusTag: "Online",
      };
    case "docs":
      return {
        label: "Documentação Técnica",
        sublabel: "Especificação & Guias",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        btnClass: "from-emerald-950/40 via-teal-950/40 to-slate-900 border-emerald-500/30 hover:border-emerald-400 text-white",
        iconColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
        icon: FileText,
        actionLabel: "Ver Documentação",
        statusTag: "Atualizado",
      };
    case "github":
      return {
        label: "Repositório Git",
        sublabel: "Código-fonte & Branches",
        badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        btnClass: "from-slate-900 via-gray-950 to-slate-900 border-white/10 hover:border-white/30 text-white",
        iconColor: "text-gray-300 bg-white/10 border-white/15",
        icon: FolderGit2,
        actionLabel: "Ver Código",
        statusTag: "Auditável",
      };
    case "api":
      return {
        label: "API & Swagger",
        sublabel: "Endpoints & Contratos",
        badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        btnClass: "from-indigo-950/40 via-purple-950/40 to-slate-900 border-indigo-500/30 hover:border-indigo-400 text-white",
        iconColor: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
        icon: Code,
        actionLabel: "Explorar API",
        statusTag: "v1.2 Rest",
      };
    case "production":
      return {
        label: "Produção Oficial",
        sublabel: "Aplicação Final no Ar",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        btnClass: "from-emerald-900/40 via-teal-900/30 to-slate-900 border-emerald-500/30 hover:border-emerald-400 text-white",
        iconColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
        icon: Rocket,
        actionLabel: "Acessar App",
        statusTag: "Produção",
      };
    default:
      return {
        label: "Link Externo",
        sublabel: "Acesso Rápido Homologado",
        badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        btnClass: "from-indigo-950/30 via-slate-900 to-slate-900 border-white/10 hover:border-white/30 text-white",
        iconColor: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
        icon: Link2,
        actionLabel: "Abrir Link",
        statusTag: "Ativo",
      };
  }
};

export const generateDefaultProjectQuickLinks = (project: Project): ProjectQuickLink[] => {
  return [
    {
      id: `${project.id}-link-figma`,
      project_id: project.id,
      label: "Protótipo Interativo Figma",
      url: project.figma_url || "https://figma.com/@mairareis",
      category: "figma",
      description: "Acesse o design system, telas em alta fidelidade e fluxos de navegação.",
      is_active: true,
    },
    {
      id: `${project.id}-link-staging`,
      project_id: project.id,
      label: "Ambiente de Testes (Staging)",
      url: project.preview_url || "https://staging.mairareis.dev",
      category: "staging",
      description: "Valide as funcionalidades online antes da publicação definitiva.",
      is_active: true,
    },
    {
      id: `${project.id}-link-docs`,
      project_id: project.id,
      label: "Documentação Técnica & Swagger",
      url: "https://docs.mairareis.dev",
      category: "docs",
      description: "Especificações de endpoints, arquitetura e manuais de integração.",
      is_active: true,
    },
  ];
};

// Formal Feedback & Approval Types
export type DeliveryReviewType = "approval" | "change_request";

export interface DeliveryFeedbackItem {
  id: string;
  project_id: string;
  milestone_id: string;
  milestone_title: string;
  stage_name?: string;
  type: DeliveryReviewType;
  author_name: string;
  author_email: string;
  notes: string;
  created_at: string;
  status: "pending_review" | "resolved" | "viewed";
}

export const generateDefaultDeliveryFeedbacks = (project: Project): DeliveryFeedbackItem[] => [
  {
    id: `${project.id}-fb-1`,
    project_id: project.id,
    milestone_id: `${project.id}-m-1`,
    milestone_title: "Briefing Técnico & Arquitetura de Requisitos",
    stage_name: "Planejamento & Escopo",
    type: "approval",
    author_name: "Cliente do Projeto",
    author_email: "cliente@empresa.com.br",
    notes: "Escopo e arquitetura 100% validados. Excelente detalhamento dos requisitos.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "resolved",
  },
  {
    id: `${project.id}-fb-2`,
    project_id: project.id,
    milestone_id: `${project.id}-m-2`,
    milestone_title: "Design System & Protótipo Navegável no Figma",
    stage_name: "UI/UX & Design",
    type: "approval",
    author_name: "Cliente do Projeto",
    author_email: "cliente@empresa.com.br",
    notes: "Telas aprovadas no Figma com as cores e fluxo principal. Autorizado o início do Front-end.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "resolved",
  },
];

type TabKey = "overview" | "projects" | "clients" | "finance" | "updates" | "proposals" | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Financial State Management
  const [projectFinances, setProjectFinances] = useState<Record<string, ProjectFinancialData>>({});
  const [financeSearchQuery, setFinanceSearchQuery] = useState("");
  const [financeStatusFilter, setFinanceStatusFilter] = useState<
    "all" | "pago" | "pendente" | "vencido" | "em_dia"
  >("all");
  const [financeProjectFilter, setFinanceProjectFilter] = useState<string>("all");

  // Modals for Finances
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<ProjectInstallment | null>(null);
  const [targetProjectIdForInstallment, setTargetProjectIdForInstallment] = useState<string>("");
  const [instTitle, setInstTitle] = useState("");
  const [instAmount, setInstAmount] = useState<number | string>("");
  const [instDueDate, setInstDueDate] = useState("");
  const [instPaidAt, setInstPaidAt] = useState("");
  const [instMethod, setInstMethod] = useState<PaymentMethod>("pix");
  const [instReceiptUrl, setInstReceiptUrl] = useState("");
  const [instNotes, setInstNotes] = useState("");
  const [instIsPaid, setInstIsPaid] = useState(false);

  // Contract Value Editing
  const [contractValueModalOpen, setContractValueModalOpen] = useState(false);
  const [contractValueInput, setContractValueInput] = useState<number | string>("");

  // Quick Split Generator Modal
  const [splitGeneratorOpen, setSplitGeneratorOpen] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);
  const [splitMethod, setSplitMethod] = useState<PaymentMethod>("pix");

  // Transactional Email Notifications State
  const [emailToast, setEmailToast] = useState<{ message: string; type: "delivery" | "payment" } | null>(null);
  const [emailLogsModalOpen, setEmailLogsModalOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<DispatchedEmailLog[]>([]);

  // Document & Contract Management State
  const [projectDocuments, setProjectDocuments] = useState<Record<string, ProjectDocument[]>>({});
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [targetProjectIdForDoc, setTargetProjectIdForDoc] = useState<string>("");
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<DocumentCategory>("contrato");
  const [docVisibility, setDocVisibility] = useState<DocumentVisibility>("client");
  const [docNotes, setDocNotes] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [docFileSize, setDocFileSize] = useState<number>(0);
  const [docFileError, setDocFileError] = useState<string | null>(null);
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("all");
  const [docVisibilityFilter, setDocVisibilityFilter] = useState<string>("all");

  // PDF Viewer Modal
  const [viewingDocument, setViewingDocument] = useState<ProjectDocument | null>(null);
  const [pdfViewerModalOpen, setPdfViewerModalOpen] = useState(false);

  // Quick Links State Management
  const [projectQuickLinks, setProjectQuickLinks] = useState<Record<string, ProjectQuickLink[]>>({});
  const [quickLinkModalOpen, setQuickLinkModalOpen] = useState(false);
  const [editingQuickLink, setEditingQuickLink] = useState<ProjectQuickLink | null>(null);
  const [targetProjectIdForLink, setTargetProjectIdForLink] = useState<string>("");
  const [qlLabel, setQlLabel] = useState("");
  const [qlUrl, setQlUrl] = useState("");
  const [qlCategory, setQlCategory] = useState<QuickLinkCategory>("figma");
  const [qlDescription, setQlDescription] = useState("");
  const [qlIsActive, setQlIsActive] = useState(true);

  // Delivery Feedbacks & Approvals State
  const [deliveryFeedbacks, setDeliveryFeedbacks] = useState<Record<string, DeliveryFeedbackItem[]>>({});

  // Search and Filter for Overview
  const [searchQuery, setSearchQuery] = useState("");

  // Search and Filters specifically for Projects Management
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    "all" | "planejamento" | "em_andamento" | "homologacao" | "concluido" | "pausado"
  >("all");
  const [projectClientFilter, setProjectClientFilter] = useState<string>("all");

  // Selected Stage Filter in Project Details
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [autoProgressEnabled, setAutoProgressEnabled] = useState<boolean>(true);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  // Form states for project
  const [pTitle, setPTitle] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pClientId, setPClientId] = useState("");
  const [pStatus, setPStatus] = useState<ProjectStatus>("planejamento");
  const [pProgress, setPProgress] = useState(0);
  const [pStartDate, setPStartDate] = useState("");
  const [pDeadline, setPDeadline] = useState("");
  const [pPreviewUrl, setPPreviewUrl] = useState("");
  const [pFigmaUrl, setPFigmaUrl] = useState("");
  const [pRepoUrl, setPRepoUrl] = useState("");
  const [pCategory, setPCategory] = useState("Mobile App (React Native)");

  // Form states for milestone / etapa
  const [mTitle, setMTitle] = useState("");
  const [mDescription, setMDescription] = useState("");
  const [mStage, setMStage] = useState<string>("Design UI/UX");
  const [mStatus, setMStatus] = useState<MilestoneStatus>("pending");
  const [mProgress, setMProgress] = useState<number>(0);
  const [mWeight, setMWeight] = useState<number>(1);
  const [mDueDate, setMDueDate] = useState("");

  // Timeline & Updates Management State
  const [projectUpdates, setProjectUpdates] = useState<Record<string, ProjectUpdate[]>>({});
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [targetProjectIdForUpdate, setTargetProjectIdForUpdate] = useState<string>("");
  const [uTitle, setUTitle] = useState("");
  const [uContent, setUContent] = useState("");
  const [uCategory, setUCategory] = useState<UpdateType>("update");
  const [uCreatedAt, setUCreatedAt] = useState("");
  const [uVersionTag, setUVersionTag] = useState("");
  const [uAttendees, setUAttendees] = useState("");
  const [uPreviewMode, setUPreviewMode] = useState(false);
  const [updateSearchQuery, setUpdateSearchQuery] = useState("");
  const [updateCategoryFilter, setUpdateCategoryFilter] = useState<string>("all");
  const [updateProjectFilter, setUpdateProjectFilter] = useState<string>("all");

  // Form states for client (Create / Edit)
  const [editingClient, setEditingClient] = useState<Profile | null>(null);
  const [selectedClientDetails, setSelectedClientDetails] = useState<Profile | null>(null);
  const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState(false);
  const [cFullName, setCFullName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cCompany, setCCompany] = useState("");
  const [cStatus, setCStatus] = useState<"active" | "blocked">("active");
  const [clientSaving, setClientSaving] = useState(false);
  const [createdClientInfo, setCreatedClientInfo] = useState<{
    name: string;
    email: string;
    pass: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Client search and pagination states
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [clientCurrentPage, setClientCurrentPage] = useState(1);

  // Impersonation / Client Vision Preview
  const [clientPreviewModalOpen, setClientPreviewModalOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const handleOpenClientPreview = (project: Project) => {
    setPreviewProject(project);
    setPreviewDevice("desktop");
    setClientPreviewModalOpen(true);
  };

  // Navigation Items on Left Sidebar
  const navItems = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: <LayoutDashboard size={18} />,
      badge: null,
    },
    {
      id: "projects",
      label: "Projetos & Entregas",
      icon: <FolderKanban size={18} />,
      badge: projects.length.toString(),
    },
    {
      id: "clients",
      label: "Gestão de Clientes",
      icon: <Users size={18} />,
      badge: clients.length.toString(),
    },
    {
      id: "finance",
      label: "Faturamento & Finanças",
      icon: <DollarSign size={18} />,
      badge: "",
    },
    {
      id: "updates",
      label: "Timeline de Updates",
      icon: <Send size={18} />,
      badge: null,
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings size={18} />,
      badge: null,
    },
  ];

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all projects
      const { data: pData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects((pData as Project[]) || []);

      // 2. Fetch all profiles (clients)
      const { data: cData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setClients((cData as Profile[]) || []);

      // 3. Load or seed financial data
      let storedFinances: Record<string, ProjectFinancialData> = {};
      try {
        const local = localStorage.getItem("portfolio_admin_finances_v1");
        if (local) {
          storedFinances = JSON.parse(local);
        }
      } catch (e) {
        console.error("Error reading finances from storage:", e);
      }

      if (pData && pData.length > 0) {
        let hasChanges = false;
        for (const p of pData as Project[]) {
          if (!storedFinances[p.id]) {
            storedFinances[p.id] = generateDefaultProjectFinances(p);
            hasChanges = true;
          }
        }
        if (hasChanges) {
          try {
            localStorage.setItem("portfolio_admin_finances_v1", JSON.stringify(storedFinances));
          } catch (e) {}
        }
      }
      setProjectFinances(storedFinances);

      // 4. Load or seed project documents
      let storedDocs: Record<string, ProjectDocument[]> = {};
      try {
        const localDocs = localStorage.getItem("portfolio_admin_documents_v1");
        if (localDocs) {
          storedDocs = JSON.parse(localDocs);
        }
      } catch (e) {
        console.error("Error reading documents from storage:", e);
      }

      if (pData && pData.length > 0) {
        let hasDocChanges = false;
        for (const p of pData as Project[]) {
          if (!storedDocs[p.id]) {
            storedDocs[p.id] = generateDefaultProjectDocuments(p);
            hasDocChanges = true;
          }
        }
        if (hasDocChanges) {
          try {
            localStorage.setItem("portfolio_admin_documents_v1", JSON.stringify(storedDocs));
          } catch (e) {}
        }
      }
      setProjectDocuments(storedDocs);

      // 5. Load or seed project updates
      let storedUpdates: Record<string, ProjectUpdate[]> = {};
      try {
        const localUpdates = localStorage.getItem("portfolio_admin_updates_v1");
        if (localUpdates) {
          storedUpdates = JSON.parse(localUpdates);
        }
      } catch (e) {
        console.error("Error reading updates from storage:", e);
      }

      if (pData && pData.length > 0) {
        let hasUpdateChanges = false;
        for (const p of pData as Project[]) {
          if (!storedUpdates[p.id] || storedUpdates[p.id].length === 0) {
            storedUpdates[p.id] = generateDefaultProjectUpdates(p);
            hasUpdateChanges = true;
          }
        }
        if (hasUpdateChanges) {
          try {
            localStorage.setItem("portfolio_admin_updates_v1", JSON.stringify(storedUpdates));
          } catch (e) {}
        }
      }
      setProjectUpdates(storedUpdates);

      // 6. Load or seed project quick links
      let storedQuickLinks: Record<string, ProjectQuickLink[]> = {};
      try {
        const localLinks = localStorage.getItem("portfolio_admin_quick_links_v1");
        if (localLinks) {
          storedQuickLinks = JSON.parse(localLinks);
        }
      } catch (e) {
        console.error("Error reading quick links from storage:", e);
      }

      if (pData && pData.length > 0) {
        let hasLinksChanges = false;
        for (const p of pData as Project[]) {
          if (!storedQuickLinks[p.id] || storedQuickLinks[p.id].length === 0) {
            storedQuickLinks[p.id] = generateDefaultProjectQuickLinks(p);
            hasLinksChanges = true;
          }
        }
        if (hasLinksChanges) {
          try {
            localStorage.setItem("portfolio_admin_quick_links_v1", JSON.stringify(storedQuickLinks));
          } catch (e) {}
        }
      }
      setProjectQuickLinks(storedQuickLinks);

      // 7. Load or seed delivery feedbacks
      let storedFeedbacks: Record<string, DeliveryFeedbackItem[]> = {};
      try {
        const localFb = localStorage.getItem("portfolio_delivery_feedbacks_v1");
        if (localFb) {
          const parsed = JSON.parse(localFb);
          if (Array.isArray(parsed)) {
            for (const item of parsed as DeliveryFeedbackItem[]) {
              if (!storedFeedbacks[item.project_id]) storedFeedbacks[item.project_id] = [];
              storedFeedbacks[item.project_id].push(item);
            }
          } else if (typeof parsed === "object") {
            storedFeedbacks = parsed;
          }
        }
      } catch (e) {
        console.error("Error reading delivery feedbacks from storage:", e);
      }

      if (pData && pData.length > 0) {
        let hasFbChanges = false;
        for (const p of pData as Project[]) {
          if (!storedFeedbacks[p.id] || storedFeedbacks[p.id].length === 0) {
            storedFeedbacks[p.id] = generateDefaultDeliveryFeedbacks(p);
            hasFbChanges = true;
          }
        }
        if (hasFbChanges) {
          try {
            const flatList = Object.values(storedFeedbacks).flat();
            localStorage.setItem("portfolio_delivery_feedbacks_v1", JSON.stringify(flatList));
          } catch (e) {}
        }
      }
      setDeliveryFeedbacks(storedFeedbacks);

      if (pData && pData.length > 0) {
        const current = selectedProject
          ? pData.find((p) => p.id === selectedProject.id) || pData[0]
          : pData[0];
        setSelectedProject(current);
        await fetchProjectDetails(current.id);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const { data: mData } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });
      setMilestones((mData as Milestone[]) || []);

      const { data: uData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (uData && uData.length > 0) {
        setUpdates(uData as ProjectUpdate[]);
      } else {
        const localUpdates = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_updates_v1") : null;
        if (localUpdates) {
          try {
            const parsed = JSON.parse(localUpdates);
            if (parsed[projectId]) {
              setUpdates(parsed[projectId]);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/admin");
    } else if (user && profile) {
      if (profile.role !== "admin") {
        router.push("/portal");
      } else {
        fetchData();
      }
    }
  }, [user, profile, authLoading, router]);

  // Handle Project Create / Update
  const handleOpenProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setPTitle(proj.title);
      setPDescription(proj.description || "");
      setPClientId(proj.client_id || "");
      setPStatus(proj.status);
      setPProgress(proj.progress);
      setPStartDate(proj.start_date || "");
      setPDeadline(proj.deadline || "");
      setPPreviewUrl(proj.preview_url || "");
      setPFigmaUrl(proj.figma_url || "");
      setPRepoUrl(proj.repo_url || "");
      setPCategory(proj.category || "Mobile App");
    } else {
      setEditingProject(null);
      setPTitle("");
      setPDescription("");
      setPClientId(clients[0]?.id || "");
      setPStatus("planejamento");
      setPProgress(0);
      setPStartDate(new Date().toISOString().split("T")[0]);
      setPDeadline("");
      setPPreviewUrl("");
      setPFigmaUrl("");
      setPRepoUrl("");
      setPCategory("Mobile App (React Native)");
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectPayload = {
        title: pTitle,
        description: pDescription,
        client_id: pClientId || null,
        status: pStatus,
        progress: Number(pProgress),
        start_date: pStartDate || null,
        deadline: pDeadline || null,
        preview_url: pPreviewUrl || null,
        figma_url: pFigmaUrl || null,
        repo_url: pRepoUrl || null,
        category: pCategory,
        updated_at: new Date().toISOString(),
      };

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectPayload)
          .eq("id", editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([projectPayload]);
        if (error) throw error;
      }

      setProjectModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao salvar projeto: " + err.message);
    }
  };

  const handleQuickUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", projectId);
      if (error) throw error;
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, status: newStatus });
      }
      await fetchData();
    } catch (err: any) {
      alert("Erro ao alterar status do projeto: " + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;
    try {
      await supabase.from("projects").delete().eq("id", id);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // Milestone & Stage Actions
  const handleOpenMilestoneModal = (milestone?: Milestone, defaultStage?: string) => {
    if (milestone) {
      const pm = parseMilestone(milestone);
      setEditingMilestone(milestone);
      setMTitle(pm.title);
      setMDescription(pm.description);
      setMStage(pm.stage);
      setMStatus(pm.status);
      setMProgress(pm.progress);
      setMWeight(pm.weight);
      setMDueDate(pm.due_date || "");
    } else {
      setEditingMilestone(null);
      setMTitle("");
      setMDescription("");
      setMStage(defaultStage || "Design UI/UX");
      setMStatus("pending");
      setMProgress(0);
      setMWeight(1);
      setMDueDate("");
    }
    setMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const isApproved = mStatus === "approved";
      const finalProgress = isApproved ? 100 : mProgress;
      const serializedDesc = serializeMilestoneDescription(
        mDescription,
        mStage,
        mWeight,
        finalProgress,
        mStatus
      );

      if (editingMilestone) {
        const { error } = await supabase
          .from("project_milestones")
          .update({
            title: mTitle,
            description: serializedDesc,
            due_date: mDueDate || null,
            completed: isApproved,
            completed_at: isApproved ? (editingMilestone.completed_at || new Date().toISOString()) : null,
          })
          .eq("id", editingMilestone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("project_milestones").insert([
          {
            project_id: selectedProject.id,
            title: mTitle,
            description: serializedDesc,
            due_date: mDueDate || null,
            order_index: milestones.length + 1,
            completed: isApproved,
            completed_at: isApproved ? new Date().toISOString() : null,
          },
        ]);
        if (error) throw error;
      }

      //  Trigger 1: Email notification when delivery is completed
      if (isApproved && selectedProject) {
        const matchedClient = clients.find((c) => c.id === selectedProject.client_id);
        const clientEmail = matchedClient?.email || "cliente@empresa.com";
        const clientName = matchedClient?.full_name || "Cliente Contratante";

        sendTransactionalEmail({
          type: "delivery_completed",
          recipientEmail: clientEmail,
          recipientName: clientName,
          projectName: selectedProject.title,
          projectId: selectedProject.id,
          milestoneTitle: mTitle,
          stageName: mStage || "Homologação & Entrega",
          completedAt: new Date().toISOString(),
          deliverables: ["Validação técnica em homologação", "Checklist de entrega finalizado"],
          notes: mDescription || undefined,
        });

        setEmailToast({
          message: `E-mail de Entrega Concluída disparado para ${clientName} (${clientEmail})!`,
          type: "delivery",
        });
        setTimeout(() => setEmailToast(null), 5000);
      }

      setMilestoneModalOpen(false);
      await fetchProjectDetails(selectedProject.id);

      if (autoProgressEnabled) {
        const updatedList = await supabase
          .from("project_milestones")
          .select("*")
          .eq("project_id", selectedProject.id)
          .order("order_index", { ascending: true });
        if (updatedList.data) {
          const newProg = calculateWeightedProgress(updatedList.data as Milestone[]);
          await supabase
            .from("projects")
            .update({ progress: newProg, updated_at: new Date().toISOString() })
            .eq("id", selectedProject.id);
          setSelectedProject((prev) => (prev ? { ...prev, progress: newProg } : null));
          setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, progress: newProg } : p)));
        }
      }
    } catch (err: any) {
      alert("Erro ao salvar marco: " + err.message);
    }
  };

  const handleQuickUpdateMilestoneStatus = async (
    milestone: Milestone,
    newStatus: MilestoneStatus
  ) => {
    if (!selectedProject) return;
    try {
      const pm = parseMilestone(milestone);
      const isApproved = newStatus === "approved";
      const newProgress = isApproved ? 100 : newStatus === "in_review" ? 75 : 0;
      const serializedDesc = serializeMilestoneDescription(
        pm.description,
        pm.stage,
        pm.weight,
        newProgress,
        newStatus
      );

      const { error } = await supabase
        .from("project_milestones")
        .update({
          description: serializedDesc,
          completed: isApproved,
          completed_at: isApproved ? new Date().toISOString() : null,
        })
        .eq("id", milestone.id);
      if (error) throw error;

      //  Trigger 1: Email notification when delivery is completed
      if (isApproved && selectedProject) {
        const matchedClient = clients.find((c) => c.id === selectedProject.client_id);
        const clientEmail = matchedClient?.email || "cliente@empresa.com";
        const clientName = matchedClient?.full_name || "Cliente Contratante";

        sendTransactionalEmail({
          type: "delivery_completed",
          recipientEmail: clientEmail,
          recipientName: clientName,
          projectName: selectedProject.title,
          projectId: selectedProject.id,
          milestoneTitle: milestone.title,
          stageName: pm.stage || "Homologação & Entrega",
          completedAt: new Date().toISOString(),
          deliverables: (pm as any).deliverables || ["Validação técnica em homologação", "Checklist de entrega finalizado"],
          notes: pm.description || undefined,
        });

        setEmailToast({
          message: `E-mail de Entrega Concluída disparado para ${clientName} (${clientEmail})!`,
          type: "delivery",
        });
        setTimeout(() => setEmailToast(null), 5000);
      }

      await fetchProjectDetails(selectedProject.id);

      if (autoProgressEnabled) {
        const updatedList = await supabase
          .from("project_milestones")
          .select("*")
          .eq("project_id", selectedProject.id)
          .order("order_index", { ascending: true });
        if (updatedList.data) {
          const newProg = calculateWeightedProgress(updatedList.data as Milestone[]);
          await supabase
            .from("projects")
            .update({ progress: newProg, updated_at: new Date().toISOString() })
            .eq("id", selectedProject.id);
          setSelectedProject((prev) => (prev ? { ...prev, progress: newProg } : null));
          setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, progress: newProg } : p)));
        }
      }
    } catch (err: any) {
      alert("Erro ao atualizar status do marco: " + err.message);
    }
  };

  const handleApplyCalculatedProgress = async () => {
    if (!selectedProject) return;
    const newProg = calculateWeightedProgress(milestones);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ progress: newProg, updated_at: new Date().toISOString() })
        .eq("id", selectedProject.id);
      if (error) throw error;
      setSelectedProject({ ...selectedProject, progress: newProg });
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, progress: newProg } : p)));
    } catch (err: any) {
      alert("Erro ao aplicar progresso calculado: " + err.message);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!selectedProject) return;
    if (!confirm("Deseja remover este marco?")) return;
    try {
      await supabase.from("project_milestones").delete().eq("id", id);
      await fetchProjectDetails(selectedProject.id);

      if (autoProgressEnabled) {
        const updatedList = await supabase
          .from("project_milestones")
          .select("*")
          .eq("project_id", selectedProject.id)
          .order("order_index", { ascending: true });
        if (updatedList.data) {
          const newProg = calculateWeightedProgress(updatedList.data as Milestone[]);
          await supabase
            .from("projects")
            .update({ progress: newProg, updated_at: new Date().toISOString() })
            .eq("id", selectedProject.id);
          setSelectedProject((prev) => (prev ? { ...prev, progress: newProg } : null));
          setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, progress: newProg } : p)));
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Timeline Updates & Notes Actions
  const saveUpdatesToStorage = (updated: Record<string, ProjectUpdate[]>) => {
    setProjectUpdates(updated);
    try {
      localStorage.setItem("portfolio_admin_updates_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving updates to localStorage:", e);
    }
  };

  const handleOpenUpdateModal = (projectId?: string, update?: ProjectUpdate) => {
    const targetProjId = projectId || (selectedProject ? selectedProject.id : (projects[0]?.id || ""));
    setTargetProjectIdForUpdate(targetProjId);
    if (update) {
      setEditingUpdate(update);
      setUTitle(update.title);
      setUContent(update.content);
      setUCategory(update.category || "update");
      setUCreatedAt(update.created_at ? update.created_at.substring(0, 16) : new Date().toISOString().substring(0, 16));
      setUVersionTag(update.version_tag || "");
      setUAttendees(update.meeting_attendees || "");
    } else {
      setEditingUpdate(null);
      setUTitle("");
      setUContent("");
      setUCategory("update");
      setUCreatedAt(new Date().toISOString().substring(0, 16));
      setUVersionTag("");
      setUAttendees("");
    }
    setUPreviewMode(false);
    setUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const projId = targetProjectIdForUpdate || (selectedProject ? selectedProject.id : (projects[0]?.id || ""));
    if (!projId) {
      alert("Selecione um projeto para associar este update.");
      return;
    }

    const newUpdate: ProjectUpdate = {
      id: editingUpdate ? editingUpdate.id : `upd-${Date.now()}`,
      project_id: projId,
      title: uTitle,
      content: uContent,
      category: uCategory,
      created_at: uCreatedAt ? new Date(uCreatedAt).toISOString() : new Date().toISOString(),
      version_tag: uVersionTag ? uVersionTag.trim() : null,
      meeting_attendees: uAttendees ? uAttendees.trim() : null,
    };

    // Update in Supabase (if available)
    try {
      if (editingUpdate) {
        await supabase
          .from("project_updates")
          .update({
            title: newUpdate.title,
            content: newUpdate.content,
            category: newUpdate.category,
            created_at: newUpdate.created_at,
          })
          .eq("id", editingUpdate.id);
      } else {
        await supabase.from("project_updates").insert([
          {
            id: newUpdate.id,
            project_id: newUpdate.project_id,
            title: newUpdate.title,
            content: newUpdate.content,
            category: newUpdate.category,
            created_at: newUpdate.created_at,
          },
        ]);
      }
    } catch (err) {
      console.warn("Supabase update fallback to localStorage:", err);
    }

    // Update local storage dictionary
    const currentList = projectUpdates[projId] || generateDefaultProjectUpdates(projects.find((p) => p.id === projId) || ({ id: projId } as Project));
    let updatedList: ProjectUpdate[];
    if (editingUpdate) {
      updatedList = currentList.map((u) => (u.id === editingUpdate.id ? newUpdate : u));
    } else {
      updatedList = [newUpdate, ...currentList];
    }

    const newProjectUpdates = {
      ...projectUpdates,
      [projId]: updatedList,
    };
    saveUpdatesToStorage(newProjectUpdates);

    if (selectedProject && selectedProject.id === projId) {
      setUpdates(updatedList);
    }

    setUpdateModalOpen(false);
  };

  const handleDeleteUpdate = async (projId: string, id: string) => {
    if (!confirm("Deseja realmente remover este registro da timeline?")) return;
    try {
      await supabase.from("project_updates").delete().eq("id", id);
    } catch (e) {}

    const currentList = projectUpdates[projId] || [];
    const updatedList = currentList.filter((u) => u.id !== id);
    const newProjectUpdates = {
      ...projectUpdates,
      [projId]: updatedList,
    };
    saveUpdatesToStorage(newProjectUpdates);

    if (selectedProject && selectedProject.id === projId) {
      setUpdates(updatedList);
    }
  };

  // Helper to generate secure random password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCPassword(pass);
  };

  const handleOpenClientModal = (client?: Profile) => {
    if (client) {
      setEditingClient(client);
      setCFullName(client.full_name || "");
      setCEmail(client.email || "");
      setCPhone(client.phone || "");
      setCCompany(client.company || "");
      setCStatus(client.status || "active");
      setCPassword("");
    } else {
      setEditingClient(null);
      setCFullName("");
      setCEmail("");
      setCPhone("");
      setCCompany("");
      setCStatus("active");
      generateRandomPassword();
    }
    setCreatedClientInfo(null);
    setClientModalOpen(true);
  };

  const handleOpenClientDetails = (client: Profile) => {
    setSelectedClientDetails(client);
    setClientDetailsModalOpen(true);
  };

  // Client Registration & Edit Action
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientSaving(true);
    try {
      if (editingClient) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: cFullName,
            phone: cPhone || null,
            company: cCompany || null,
            status: cStatus,
          })
          .eq("id", editingClient.id);

        if (error) throw error;
        setClientModalOpen(false);
        if (selectedClientDetails?.id === editingClient.id) {
          setSelectedClientDetails({
            ...selectedClientDetails,
            full_name: cFullName,
            phone: cPhone || null,
            company: cCompany || null,
            status: cStatus,
          });
        }
      } else {
        // Create new client via API
        const res = await fetch("/api/admin/create-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: cFullName,
            email: cEmail,
            password: cPassword,
            phone: cPhone,
            company: cCompany,
            status: cStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar cliente");

        setCreatedClientInfo({
          name: cFullName,
          email: cEmail,
          pass: cPassword,
        });
      }

      await fetchData();
    } catch (err: any) {
      alert("Erro ao salvar dados do cliente: " + err.message);
    } finally {
      setClientSaving(false);
    }
  };

  const handleToggleClientStatus = async (client: Profile) => {
    try {
      const newStatus = client.status === "blocked" ? "active" : "blocked";
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", client.id);

      if (error) throw error;
      if (selectedClientDetails?.id === client.id) {
        setSelectedClientDetails({ ...selectedClientDetails, status: newStatus });
      }
      await fetchData();
    } catch (err: any) {
      alert("Erro ao alterar status: " + err.message);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente? Seus projetos ficarão desvinculados.")) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      if (selectedClientDetails?.id === id) {
        setClientDetailsModalOpen(false);
        setSelectedClientDetails(null);
      }
      await fetchData();
    } catch (err: any) {
      alert("Erro ao excluir cliente: " + err.message);
    }
  };

  const copyWhatsAppMessage = () => {
    if (!createdClientInfo) return;
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://www.mairareis.com.br";
    const msg = `Olá ${createdClientInfo.name}! 🚀\nSeu acesso ao Portal do Cliente está pronto para você acompanhar o desenvolvimento do seu projeto em tempo real:\n\n🌐 Link: ${siteUrl}/login\n📧 E-mail: ${createdClientInfo.email}\n🔑 Senha: ${createdClientInfo.pass}\n\nQualquer dúvida estou à disposição!`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Financial & Installments Actions
  const saveFinancesToStorage = (updated: Record<string, ProjectFinancialData>) => {
    setProjectFinances(updated);
    try {
      localStorage.setItem("portfolio_admin_finances_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving finances to localStorage:", e);
    }
  };

  const handleOpenInstallmentModal = (projectId: string, installment?: ProjectInstallment) => {
    setTargetProjectIdForInstallment(projectId);
    if (installment) {
      setEditingInstallment(installment);
      setInstTitle(installment.title);
      setInstAmount(installment.amount);
      setInstDueDate(installment.due_date);
      setInstPaidAt(installment.paid_at || "");
      setInstIsPaid(!!installment.paid_at);
      setInstMethod(installment.payment_method || "pix");
      setInstReceiptUrl(installment.receipt_url || "");
      setInstNotes(installment.notes || "");
    } else {
      const currentFin = projectFinances[projectId];
      const nextNum = (currentFin?.installments?.length || 0) + 1;
      setEditingInstallment(null);
      setInstTitle(`Parcela ${nextNum}`);
      setInstAmount("");
      setInstDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setInstPaidAt("");
      setInstIsPaid(false);
      setInstMethod("pix");
      setInstReceiptUrl("");
      setInstNotes("");
    }
    setInstallmentModalOpen(true);
  };

  const handleSaveInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForInstallment) return;

    const projectId = targetProjectIdForInstallment;
    const currentFin = projectFinances[projectId] || {
      project_id: projectId,
      total_contract_value: Number(instAmount) || 0,
      installments: [],
    };

    const numAmount = Number(instAmount) || 0;
    const finalPaidAt = instIsPaid ? (instPaidAt || new Date().toISOString().split("T")[0]) : null;

    let updatedInstallments: ProjectInstallment[] = [];

    if (editingInstallment) {
      updatedInstallments = (currentFin.installments || []).map((inst) => {
        if (inst.id === editingInstallment.id) {
          return {
            ...inst,
            title: instTitle,
            amount: numAmount,
            due_date: instDueDate,
            paid_at: finalPaidAt,
            payment_method: instMethod,
            receipt_url: instReceiptUrl || null,
            notes: instNotes || null,
          };
        }
        return inst;
      });
    } else {
      const newInst: ProjectInstallment = {
        id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        project_id: projectId,
        installment_number: (currentFin.installments?.length || 0) + 1,
        title: instTitle,
        amount: numAmount,
        due_date: instDueDate,
        paid_at: finalPaidAt,
        payment_method: instMethod,
        receipt_url: instReceiptUrl || null,
        notes: instNotes || null,
      };
      updatedInstallments = [...(currentFin.installments || []), newInst];
    }

    const updatedProjectFinance: ProjectFinancialData = {
      ...currentFin,
      installments: updatedInstallments,
    };

    const nextState = {
      ...projectFinances,
      [projectId]: updatedProjectFinance,
    };

    saveFinancesToStorage(nextState);

    //  Trigger 2: Email notification on payment confirmation
    if (finalPaidAt && (!editingInstallment || !editingInstallment.paid_at)) {
      const targetProj = projects.find((p) => p.id === projectId);
      const matchedClient = clients.find((c) => c.id === targetProj?.client_id);
      const clientEmail = matchedClient?.email || "cliente@empresa.com";
      const clientName = matchedClient?.full_name || "Cliente Contratante";
      const receiptNum = `REC-${projectId.slice(0, 6).toUpperCase()}-${String(editingInstallment ? editingInstallment.installment_number : updatedInstallments.length).padStart(2, "0")}`;

      sendTransactionalEmail({
        type: "payment_confirmed",
        recipientEmail: clientEmail,
        recipientName: clientName,
        projectName: targetProj?.title || "Projeto Contratado",
        projectId: projectId,
        installmentNumber: editingInstallment ? editingInstallment.installment_number : updatedInstallments.length,
        totalInstallments: updatedInstallments.length,
        installmentTitle: instTitle,
        amount: numAmount,
        paymentMethod: getPaymentMethodLabel(instMethod),
        paidAt: finalPaidAt,
        receiptNumber: receiptNum,
        authCode: instReceiptUrl || `AUT-${projectId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      });

      setEmailToast({
        message: `Comprovante & E-mail de Pagamento disparados para ${clientName} (${clientEmail})!`,
        type: "payment",
      });
      setTimeout(() => setEmailToast(null), 5000);
    }

    setInstallmentModalOpen(false);
  };

  const handleQuickPayInstallment = (projectId: string, installmentId: string) => {
    const currentFin = projectFinances[projectId];
    if (!currentFin) return;

    const todayStr = new Date().toISOString().split("T")[0];
    let justPaidInstallment: ProjectInstallment | null = null;

    const updatedInsts = currentFin.installments.map((inst) => {
      if (inst.id === installmentId) {
        const willBePaid = !inst.paid_at;
        if (willBePaid) {
          justPaidInstallment = { ...inst, paid_at: todayStr };
        }
        return {
          ...inst,
          paid_at: inst.paid_at ? null : todayStr,
        };
      }
      return inst;
    });

    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        ...currentFin,
        installments: updatedInsts,
      },
    });

    //  Trigger 2: Email notification on quick pay confirmation
    if (justPaidInstallment) {
      const targetInst: ProjectInstallment = justPaidInstallment;
      const targetProj = projects.find((p) => p.id === projectId);
      const matchedClient = clients.find((c) => c.id === targetProj?.client_id);
      const clientEmail = matchedClient?.email || "cliente@empresa.com";
      const clientName = matchedClient?.full_name || "Cliente Contratante";
      const receiptNum = `REC-${projectId.slice(0, 6).toUpperCase()}-${String(targetInst.installment_number).padStart(2, "0")}`;

      sendTransactionalEmail({
        type: "payment_confirmed",
        recipientEmail: clientEmail,
        recipientName: clientName,
        projectName: targetProj?.title || "Projeto Contratado",
        projectId: projectId,
        installmentNumber: targetInst.installment_number,
        totalInstallments: currentFin.installments.length,
        installmentTitle: targetInst.title,
        amount: targetInst.amount,
        paymentMethod: getPaymentMethodLabel(targetInst.payment_method),
        paidAt: todayStr,
        receiptNumber: receiptNum,
        authCode: targetInst.receipt_url || `AUT-${projectId.slice(0, 4).toUpperCase()}-${targetInst.id.slice(0, 6).toUpperCase()}`,
      });

      setEmailToast({
        message: `Comprovante & E-mail de Pagamento disparados para ${clientName} (${clientEmail})!`,
        type: "payment",
      });
      setTimeout(() => setEmailToast(null), 5000);
    }
  };

  const handleDeleteInstallment = (projectId: string, installmentId: string) => {
    if (!confirm("Deseja realmente excluir esta parcela?")) return;
    const currentFin = projectFinances[projectId];
    if (!currentFin) return;

    const filtered = currentFin.installments.filter((inst) => inst.id !== installmentId);
    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        ...currentFin,
        installments: filtered,
      },
    });
  };

  const handleOpenContractValueModal = (projectId: string) => {
    setTargetProjectIdForInstallment(projectId);
    const currentFin = projectFinances[projectId];
    setContractValueInput(currentFin?.total_contract_value || 0);
    setContractValueModalOpen(true);
  };

  const handleSaveContractValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForInstallment) return;
    const projectId = targetProjectIdForInstallment;
    const currentFin = projectFinances[projectId] || {
      project_id: projectId,
      total_contract_value: 0,
      installments: [],
    };

    const newValue = Number(contractValueInput) || 0;
    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        ...currentFin,
        total_contract_value: newValue,
      },
    });
    setContractValueModalOpen(false);
  };

  const handleOpenSplitGenerator = (projectId: string) => {
    setTargetProjectIdForInstallment(projectId);
    setSplitCount(3);
    setSplitMethod("pix");
    setSplitGeneratorOpen(true);
  };

  const handleExecuteSplitGenerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForInstallment) return;
    const projectId = targetProjectIdForInstallment;
    const currentFin = projectFinances[projectId];
    const contractTotal = currentFin?.total_contract_value || 12000;
    const count = Math.max(1, Math.min(12, splitCount));
    const partAmount = Math.round((contractTotal / count) * 100) / 100;

    const generated: ProjectInstallment[] = [];
    const baseDate = new Date();

    for (let i = 1; i <= count; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + (i - 1));
      const isFirstPaid = i === 1;

      generated.push({
        id: `inst-gen-${Date.now()}-${i}`,
        project_id: projectId,
        installment_number: i,
        title: count === 1 ? "Pagamento Único (À Vista)" : `Parcela ${i}/${count}`,
        amount: partAmount,
        due_date: d.toISOString().split("T")[0],
        paid_at: isFirstPaid ? baseDate.toISOString().split("T")[0] : null,
        payment_method: splitMethod,
        receipt_url: isFirstPaid ? "REC-ENTRADA-SPLIT-AUTO" : null,
        notes: `Parcelamento automático gerado (${count}x)`,
      });
    }

    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        project_id: projectId,
        total_contract_value: contractTotal,
        notes: `Contrato parcelado em ${count}x via ${getPaymentMethodLabel(splitMethod)}`,
        installments: generated,
      },
    });
    setSplitGeneratorOpen(false);
  };

  // Document & Contract Actions
  const saveDocumentsToStorage = (updated: Record<string, ProjectDocument[]>) => {
    setProjectDocuments(updated);
    try {
      localStorage.setItem("portfolio_admin_documents_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving documents to localStorage:", e);
    }
  };

  const handleOpenDocumentModal = (projectId: string, doc?: ProjectDocument) => {
    setTargetProjectIdForDoc(projectId);
    setDocFileError(null);
    if (doc) {
      setEditingDocument(doc);
      setDocTitle(doc.title);
      setDocCategory(doc.category);
      setDocVisibility(doc.visibility);
      setDocNotes(doc.notes || "");
      setDocFileUrl(doc.file_url);
      setDocFileName(doc.filename);
      setDocFileSize(doc.file_size_bytes);
    } else {
      setEditingDocument(null);
      setDocTitle("");
      setDocCategory("contrato");
      setDocVisibility("client");
      setDocNotes("");
      setDocFileUrl("");
      setDocFileName("");
      setDocFileSize(0);
    }
    setDocModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setDocFileError(null);
    if (!file) return;

    // MIME Type Validation (application/pdf or .pdf)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setDocFileError("Formato inválido: Somente arquivos no formato PDF (.pdf) são permitidos.");
      return;
    }

    // Size limit: 15MB
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setDocFileError(
        `Arquivo muito grande (${formatFileSize(file.size)}). O limite máximo permitido é de 15MB.`
      );
      return;
    }

    setDocFileName(file.name);
    setDocFileSize(file.size);
    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setDocTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Read file as Base64 Data URL for standalone offline & cloud persistence
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setDocFileUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForDoc) return;

    if (!docFileUrl && !editingDocument) {
      setDocFileError("Por favor, selecione um arquivo PDF para upload ou forneça um link.");
      return;
    }

    const projectId = targetProjectIdForDoc;
    const currentList = projectDocuments[projectId] || [];

    if (editingDocument) {
      const updated = currentList.map((d) => {
        if (d.id === editingDocument.id) {
          return {
            ...d,
            title: docTitle,
            category: docCategory,
            visibility: docVisibility,
            notes: docNotes || null,
            filename: docFileName || d.filename,
            file_size_bytes: docFileSize || d.file_size_bytes,
            file_size_formatted: formatFileSize(docFileSize || d.file_size_bytes),
            file_url: docFileUrl || d.file_url,
          };
        }
        return d;
      });

      saveDocumentsToStorage({
        ...projectDocuments,
        [projectId]: updated,
      });
    } else {
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        project_id: projectId,
        title: docTitle,
        filename: docFileName || "documento_contrato.pdf",
        category: docCategory,
        visibility: docVisibility,
        file_url: docFileUrl || "#",
        file_size_bytes: docFileSize || 1500000,
        file_size_formatted: formatFileSize(docFileSize || 1500000),
        mime_type: "application/pdf",
        uploaded_at: new Date().toISOString().split("T")[0],
        notes: docNotes || null,
      };

      saveDocumentsToStorage({
        ...projectDocuments,
        [projectId]: [newDoc, ...currentList],
      });
    }

    setDocModalOpen(false);
  };

  const handleToggleDocumentVisibility = (projectId: string, docId: string) => {
    const currentList = projectDocuments[projectId] || [];
    const updated = currentList.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          visibility: (d.visibility === "client" ? "internal" : "client") as DocumentVisibility,
        };
      }
      return d;
    });

    saveDocumentsToStorage({
      ...projectDocuments,
      [projectId]: updated,
    });
  };

  const handleDeleteDocument = (projectId: string, docId: string) => {
    if (!confirm("Deseja realmente excluir este documento do projeto?")) return;
    const currentList = projectDocuments[projectId] || [];
    const filtered = currentList.filter((d) => d.id !== docId);

    saveDocumentsToStorage({
      ...projectDocuments,
      [projectId]: filtered,
    });
  };

  const handleOpenPdfViewer = (doc: ProjectDocument) => {
    setViewingDocument(doc);
    setPdfViewerModalOpen(true);
  };

  // Quick Links Management Actions
  const saveQuickLinksToStorage = (updated: Record<string, ProjectQuickLink[]>) => {
    setProjectQuickLinks(updated);
    try {
      localStorage.setItem("portfolio_admin_quick_links_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving quick links to localStorage:", e);
    }
  };

  const handleOpenQuickLinkModal = (projectId: string, link?: ProjectQuickLink) => {
    setTargetProjectIdForLink(projectId);
    if (link) {
      setEditingQuickLink(link);
      setQlLabel(link.label);
      setQlUrl(link.url);
      setQlCategory(link.category);
      setQlDescription(link.description || "");
      setQlIsActive(link.is_active);
    } else {
      setEditingQuickLink(null);
      setQlLabel("");
      setQlUrl("");
      setQlCategory("figma");
      setQlDescription("");
      setQlIsActive(true);
    }
    setQuickLinkModalOpen(true);
  };

  const handleSaveQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForLink || !qlLabel.trim() || !qlUrl.trim()) return;

    const projectId = targetProjectIdForLink;
    const currentList = projectQuickLinks[projectId] || [];

    let updatedList: ProjectQuickLink[];
    if (editingQuickLink) {
      updatedList = currentList.map((item) =>
        item.id === editingQuickLink.id
          ? {
              ...item,
              label: qlLabel.trim(),
              url: qlUrl.trim(),
              category: qlCategory,
              description: qlDescription.trim() || null,
              is_active: qlIsActive,
            }
          : item
      );
    } else {
      const newLink: ProjectQuickLink = {
        id: `${projectId}-link-${Date.now()}`,
        project_id: projectId,
        label: qlLabel.trim(),
        url: qlUrl.trim(),
        category: qlCategory,
        description: qlDescription.trim() || null,
        is_active: qlIsActive,
        created_at: new Date().toISOString(),
      };
      updatedList = [...currentList, newLink];
    }

    saveQuickLinksToStorage({
      ...projectQuickLinks,
      [projectId]: updatedList,
    });

    setQuickLinkModalOpen(false);
    setEditingQuickLink(null);
  };

  const handleDeleteQuickLink = (projectId: string, linkId: string) => {
    if (!confirm("Deseja realmente remover este atalho rápido?")) return;
    const currentList = projectQuickLinks[projectId] || [];
    const filtered = currentList.filter((l) => l.id !== linkId);
    saveQuickLinksToStorage({
      ...projectQuickLinks,
      [projectId]: filtered,
    });
  };

  const handleToggleQuickLinkActive = (projectId: string, linkId: string) => {
    const currentList = projectQuickLinks[projectId] || [];
    const updated = currentList.map((l) =>
      l.id === linkId ? { ...l, is_active: !l.is_active } : l
    );
    saveQuickLinksToStorage({
      ...projectQuickLinks,
      [projectId]: updated,
    });
  };

  // Delivery Feedbacks & Approvals Actions
  const handleToggleFeedbackStatus = (projectId: string, feedbackId: string) => {
    const currentList = deliveryFeedbacks[projectId] || [];
    const updated = currentList.map((f) =>
      f.id === feedbackId
        ? {
            ...f,
            status: (f.status === "resolved" ? "pending_review" : "resolved") as "pending_review" | "resolved",
          }
        : f
    );
    const newMap = { ...deliveryFeedbacks, [projectId]: updated };
    setDeliveryFeedbacks(newMap);
    try {
      const flatList = Object.values(newMap).flat();
      localStorage.setItem("portfolio_delivery_feedbacks_v1", JSON.stringify(flatList));
    } catch (e) {}
  };

  const handleDeleteFeedback = (projectId: string, feedbackId: string) => {
    if (!confirm("Deseja realmente remover este registro de feedback?")) return;
    const currentList = deliveryFeedbacks[projectId] || [];
    const filtered = currentList.filter((f) => f.id !== feedbackId);
    const newMap = { ...deliveryFeedbacks, [projectId]: filtered };
    setDeliveryFeedbacks(newMap);
    try {
      const flatList = Object.values(newMap).flat();
      localStorage.setItem("portfolio_delivery_feedbacks_v1", JSON.stringify(flatList));
    } catch (e) {}
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Carregando painel de administração...</p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalProjects = projects.length;
  const countPlanejamento = projects.filter((p) => p.status === "planejamento").length;
  const countEmAndamento = projects.filter(
    (p) => p.status === "em_andamento" || p.status === "desenvolvimento" || p.status === "design"
  ).length;
  const countHomologacao = projects.filter((p) => p.status === "homologacao" || p.status === "testes").length;
  const completedProjects = projects.filter((p) => p.status === "concluido").length;
  const countPausados = projects.filter((p) => p.status === "pausado").length;
  const activeProjects = projects.filter((p) => p.status !== "concluido").length;
  const totalClients = clients.length;

  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.client_id);
    const searchTarget = (activeTab === "projects" ? projectSearchQuery : searchQuery).toLowerCase().trim();

    const matchesSearch =
      !searchTarget ||
      p.title.toLowerCase().includes(searchTarget) ||
      (p.description?.toLowerCase().includes(searchTarget) || false) ||
      (p.category?.toLowerCase().includes(searchTarget) || false) ||
      (client?.full_name?.toLowerCase().includes(searchTarget) || false) ||
      (client?.company?.toLowerCase().includes(searchTarget) || false) ||
      (client?.email?.toLowerCase().includes(searchTarget) || false);

    const matchesStatus =
      activeTab !== "projects" ||
      projectStatusFilter === "all" ||
      (projectStatusFilter === "planejamento" && p.status === "planejamento") ||
      (projectStatusFilter === "em_andamento" &&
        (p.status === "em_andamento" || p.status === "desenvolvimento" || p.status === "design")) ||
      (projectStatusFilter === "homologacao" && (p.status === "homologacao" || p.status === "testes")) ||
      (projectStatusFilter === "concluido" && p.status === "concluido") ||
      (projectStatusFilter === "pausado" && p.status === "pausado");

    const matchesClient =
      activeTab !== "projects" ||
      projectClientFilter === "all" ||
      p.client_id === projectClientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  return (
    <div className="min-h-screen bg-[#070913] text-white flex selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090c19] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-bold text-base leading-tight text-white block">
                Maira Reis <span className="text-gradient">Admin</span>
              </span>
              <span className="text-[11px] text-purple-300">Gestão & Clientes</span>
            </div>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Módulos & Recursos
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabKey);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-gray-400 border border-white/10"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          <Link
            href="/portal"
            className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-indigo-400" />
              <span>Visão do Cliente</span>
            </div>
            <ArrowUpRight size={13} className="text-gray-400" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                MR
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {profile?.full_name || "Maira Reis"}
                </p>
                <p className="text-[10px] text-purple-400 truncate">Administradora</p>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#070913]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-white"
            >
              <Menu size={20} />
            </button>

            <div className="relative hidden sm:block w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar projetos..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEmailLogs(getDispatchedEmailLogs());
                setEmailLogsModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Histórico de E-mails Transacionais"
            >
              <Mail size={14} className="text-purple-400" />
              <span className="hidden md:inline">E-mails Enviados</span>
            </button>

            <button
              onClick={() => handleOpenProjectModal()}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Novo Projeto</span>
              <span className="sm:hidden">Projeto</span>
            </button>

            <button
              onClick={() => {
                setCreatedClientInfo(null);
                setClientModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Users size={15} />
              <span className="hidden sm:inline">Novo Cliente</span>
              <span className="sm:hidden">Cliente</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-slate-900/70 border border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Painel de Controle Executivo</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Visão Geral da Operação 🚀
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
                    Acompanhe o andamento dos projetos, gerencie acessos de clientes e publique atualizações em tempo real com controle total.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => fetchData()}
                    className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
                    title="Recarregar métricas"
                  >
                    <RefreshCw size={15} className={loading ? "animate-spin text-indigo-400" : ""} />
                    <span>Atualizar Dados</span>
                  </button>
                </div>
              </div>

              {/* Top Dynamic Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Total de Projetos */}
                <div
                  onClick={() => setActiveTab("projects")}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 transition-all backdrop-blur-xl shadow-lg cursor-pointer group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Projetos</span>
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <FolderKanban size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{totalProjects}</p>
                    <span className="text-xs text-indigo-300 font-semibold">no portfólio</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Apps & Softwares</span>
                    <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Gerenciar →
                    </span>
                  </div>
                </div>

                {/* 2. Projetos em Andamento */}
                <div
                  onClick={() => setActiveTab("projects")}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition-all backdrop-blur-xl shadow-lg cursor-pointer group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Em Andamento</span>
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                      <Clock size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">{activeProjects}</p>
                    <span className="text-xs text-amber-300/80 font-semibold">ativos</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Em produção / QA</span>
                    <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Ver Fases →
                    </span>
                  </div>
                </div>

                {/* 3. Projetos Concluídos */}
                <div
                  onClick={() => setActiveTab("projects")}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all backdrop-blur-xl shadow-lg cursor-pointer group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projetos Concluídos</span>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">{completedProjects}</p>
                    <span className="text-xs text-emerald-300/80 font-semibold">entregues</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>100% Homologados</span>
                    <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Histórico →
                    </span>
                  </div>
                </div>

                {/* 4. Clientes Cadastrados */}
                <div
                  onClick={() => setActiveTab("clients")}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 transition-all backdrop-blur-xl shadow-lg cursor-pointer group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes Cadastrados</span>
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight">{totalClients}</p>
                    <span className="text-xs text-purple-300/80 font-semibold">contas</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Com acesso ao portal</span>
                    <span className="text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Clientes →
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Shortcuts Banner */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0d1224] to-[#080b18] border border-indigo-500/25 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-400" />
                      <span>Atalhos de Ação Rápida</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Crie novos registros ou publique sprints e atualizações com apenas um clique.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <button
                    onClick={() => handleOpenProjectModal()}
                    className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 border border-indigo-400/40 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-white/15">
                      <Plus size={18} />
                    </div>
                    <div className="text-left">
                      <p className="leading-tight font-bold">Novo Projeto</p>
                      <p className="text-[10px] text-indigo-100 font-normal mt-0.5">Cadastrar app ou site</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCreatedClientInfo(null);
                      setClientModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-purple-300 hover:text-white font-bold text-xs sm:text-sm border border-purple-500/40 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Users size={18} />
                    </div>
                    <div className="text-left">
                      <p className="leading-tight font-bold">Novo Cliente</p>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">Gerar credenciais de acesso</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (projects.length > 0) {
                        setSelectedProject(projects[0]);
                        setUpdateModalOpen(true);
                      } else {
                        handleOpenProjectModal();
                      }
                    }}
                    className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-emerald-300 hover:text-white font-bold text-xs sm:text-sm border border-emerald-500/40 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <Send size={18} />
                    </div>
                    <div className="text-left">
                      <p className="leading-tight font-bold">Postar Update</p>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">Notificar avanço ao cliente</p>
                    </div>
                  </button>

                  <Link
                    href="/portal"
                    target="_blank"
                    className="p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm border border-cyan-500/40 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                      <Smartphone size={18} />
                    </div>
                    <div className="text-left">
                      <p className="leading-tight font-bold">Visão do Portal</p>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">Abrir como cliente</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Projects Highlights */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FolderKanban size={18} className="text-indigo-400" />
                    <span>Projetos em Destaque</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Todos ({projects.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/5 space-y-3">
                    <FolderKanban size={36} className="text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400">Nenhum projeto cadastrado no momento.</p>
                    <button
                      onClick={() => handleOpenProjectModal()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                    >
                      + Cadastrar Primeiro Projeto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.slice(0, 6).map((proj) => {
                      const client = clients.find((c) => c.id === proj.client_id);
                      return (
                        <div
                          key={proj.id}
                          onClick={() => {
                            setSelectedProject(proj);
                            fetchProjectDetails(proj.id);
                            setActiveTab("projects");
                          }}
                          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3 hover:bg-white/[0.05]"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {proj.category || "App Mobile"}
                              </span>
                              <span className="text-xs font-bold text-indigo-400">{proj.progress}%</span>
                            </div>

                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                              {proj.title}
                            </h4>

                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Cliente: <strong className="text-gray-300">{client?.full_name || "Não vinculado"}</strong>
                            </p>
                          </div>

                          <div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all"
                                style={{ width: `${proj.progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span className="capitalize font-medium text-amber-300/90">{proj.status}</span>
                              <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                                Acessar <ArrowUpRight size={11} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROJECTS MANAGEMENT & SCOPE */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              {/* Header & Controls Bar */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FolderKanban size={20} className="text-indigo-400" />
                    <span>Gestão de Projetos & Escopo ({projects.length})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cadastre escopos, controle prazos de entrega e parametrize status de desenvolvimento em tempo real.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenProjectModal()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Cadastrar Novo Projeto</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar: Text Search, Status Pills & Client Dropdown */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Text Search */}
                  <div className="md:col-span-7 relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="Buscar por título, escopo, categoria, cliente ou empresa..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
                    />
                    {projectSearchQuery && (
                      <button
                        onClick={() => setProjectSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Client Filter Dropdown */}
                  <div className="md:col-span-5 relative">
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                      <select
                        value={projectClientFilter}
                        onChange={(e) => setProjectClientFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                      >
                        <option value="all">Filtrar por Cliente: Todos ({projects.length} projetos)</option>
                        {clients.map((c) => {
                          const clientProjectCount = projects.filter((p) => p.client_id === c.id).length;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.full_name || c.email} {c.company ? `(${c.company})` : ""} — {clientProjectCount} {clientProjectCount === 1 ? "projeto" : "projetos"}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                      <Filter size={12} />
                      Status:
                    </span>

                    {[
                      { key: "all", label: `Todos (${projects.length})` },
                      { key: "planejamento", label: `Planejamento (${countPlanejamento})`, dot: "bg-amber-400" },
                      { key: "em_andamento", label: `Em Andamento (${countEmAndamento})`, dot: "bg-blue-400" },
                      { key: "homologacao", label: `Homologação (${countHomologacao})`, dot: "bg-cyan-400" },
                      { key: "concluido", label: `Concluídos (${completedProjects})`, dot: "bg-emerald-400" },
                      { key: "pausado", label: `Pausados (${countPausados})`, dot: "bg-rose-400" },
                    ].map((pill) => {
                      const isActive = projectStatusFilter === pill.key;
                      return (
                        <button
                          key={pill.key}
                          onClick={() => setProjectStatusFilter(pill.key as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20"
                              : "bg-black/30 text-gray-400 border-white/10 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {pill.dot && <span className={`w-2 h-2 rounded-full ${pill.dot}`} />}
                          <span>{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {(projectSearchQuery || projectStatusFilter !== "all" || projectClientFilter !== "all") && (
                    <button
                      onClick={() => {
                        setProjectSearchQuery("");
                        setProjectStatusFilter("all");
                        setProjectClientFilter("all");
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <RotateCcw size={12} />
                      <span>Limpar Filtros</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content: Split List and Detail/Scope Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Filtered Project List */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Resultados ({filteredProjects.length})
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Clique para inspecionar ou gerenciar
                    </span>
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div className="p-10 text-center rounded-3xl bg-slate-900/50 border border-white/10">
                      <FolderKanban size={36} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-300">Nenhum projeto encontrado</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tente ajustar os termos de busca ou os filtros de status e cliente.
                      </p>
                      <button
                        onClick={() => handleOpenProjectModal()}
                        className="mt-4 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/30 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Cadastrar Projeto</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProjects.map((proj) => {
                        const client = clients.find((c) => c.id === proj.client_id);
                        const isSelected = selectedProject?.id === proj.id;
                        const statusCfg = getStatusConfig(proj.status);

                        return (
                          <div
                            key={proj.id}
                            onClick={() => {
                              setSelectedProject(proj);
                              fetchProjectDetails(proj.id);
                            }}
                            className={`p-5 rounded-3xl border transition-all cursor-pointer relative group ${
                              isSelected
                                ? "bg-indigo-950/50 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/50"
                                : "bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-900/90"
                            }`}
                          >
                            {/* Top metadata */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                  {proj.category || "App Mobile"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenClientPreview(proj);
                                  }}
                                  className="px-2 py-0.5 rounded-full bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Simular Visão do Cliente"
                                >
                                  <Eye size={10} />
                                  <span>Ver como Cliente</span>
                                </button>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                                {statusCfg.label}
                              </span>
                            </div>

                            {/* Title & Scope preview */}
                            <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                              {proj.title}
                            </h4>

                            {proj.description && (
                              <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                {proj.description}
                              </p>
                            )}

                            {/* Client & Deadline Info */}
                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                              <span className="flex items-center gap-1 text-gray-300 truncate max-w-[180px]">
                                <User size={12} className="text-indigo-400 shrink-0" />
                                <strong className="font-medium text-white truncate">
                                  {client?.full_name || client?.email || "Interno / Sem cliente"}
                                </strong>
                              </span>

                              <span>
                                {proj.deadline ? `Prazo: ${new Date(proj.deadline).toLocaleDateString("pt-BR")}` : "Sem prazo"}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2.5 space-y-1">
                              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                                <span>Progresso da Entrega</span>
                                <span className="text-indigo-300 font-mono">{proj.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                                  style={{ width: `${proj.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Project Scope & Management Console */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {selectedProject ? (
                    <>
                      {/* Project Scope & Control Console */}
                      {(() => {
                        const selectedClient = clients.find((c) => c.id === selectedProject.client_id);
                        const statusCfg = getStatusConfig(selectedProject.status);

                        return (
                          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
                            {/* Header: Title, Category & Action buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    {selectedProject.title}
                                  </h2>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                                    {statusCfg.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                  <span className="text-indigo-300 font-medium">{selectedProject.category || "Desenvolvimento de Software"}</span>
                                  <span>•</span>
                                  <span>Criado em {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenClientPreview(selectedProject)}
                                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-900/20"
                                  title="Simular visualização do cliente em modo somente leitura"
                                >
                                  <Eye size={14} />
                                  <span>Visualizar como Cliente</span>
                                </button>
                                <button
                                  onClick={() => handleOpenProjectModal(selectedProject)}
                                  className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit2 size={14} />
                                  <span>Editar Escopo</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(selectedProject.id)}
                                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                                  title="Excluir projeto"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Client Association Card */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                  {selectedClient?.full_name?.charAt(0) || "C"}
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                    Cliente Associado:
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-white">
                                    {selectedClient?.full_name || "Nenhum cliente vinculado (Projeto Geral/Admin)"}
                                  </p>
                                  {selectedClient?.company && (
                                    <p className="text-[11px] text-purple-300">{selectedClient.company}</p>
                                  )}
                                </div>
                              </div>

                              {selectedClient && (
                                <div className="flex items-center gap-2">
                                  {selectedClient.phone && (
                                    <a
                                      href={`https://wa.me/${selectedClient.phone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                                    >
                                      <MessageCircle size={13} />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleOpenClientDetails(selectedClient)}
                                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Ver Cliente
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Scope & Description Panel */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText size={14} className="text-indigo-400" />
                                  Descrição & Escopo do Projeto
                                </span>
                              </div>
                              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                {selectedProject.description ? (
                                  <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                                    {selectedProject.description}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-500 italic">
                                    Nenhum escopo detalhado foi inserido. Clique em "Editar Escopo" para cadastrar os requisitos e entregáveis.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quick Status Selector Buttons */}
                            <div className="space-y-2.5">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                Alterar Status do Projeto:
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {[
                                  { key: "planejamento", label: "Planejamento", color: "hover:border-amber-500/60", activeBg: "bg-amber-500/20 border-amber-500 text-amber-300" },
                                  { key: "em_andamento", label: "Em Andamento", color: "hover:border-blue-500/60", activeBg: "bg-blue-500/20 border-blue-500 text-blue-300" },
                                  { key: "homologacao", label: "Homologação", color: "hover:border-cyan-500/60", activeBg: "bg-cyan-500/20 border-cyan-500 text-cyan-300" },
                                  { key: "concluido", label: "Concluído", color: "hover:border-emerald-500/60", activeBg: "bg-emerald-500/20 border-emerald-500 text-emerald-300" },
                                ].map((st) => {
                                  const isCurrent =
                                    selectedProject.status === st.key ||
                                    (st.key === "em_andamento" && (selectedProject.status === "desenvolvimento" || selectedProject.status === "design")) ||
                                    (st.key === "homologacao" && selectedProject.status === "testes");

                                  return (
                                    <button
                                      key={st.key}
                                      onClick={() => handleQuickUpdateStatus(selectedProject.id, st.key as ProjectStatus)}
                                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isCurrent
                                          ? `${st.activeBg} shadow-md`
                                          : `bg-black/30 border-white/5 text-gray-400 hover:text-white ${st.color}`
                                      }`}
                                    >
                                      {isCurrent && <Check size={13} />}
                                      <span>{st.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Dates and Progress Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                                  Data de Início
                                </span>
                                <p className="text-xs font-semibold text-white">
                                  {selectedProject.start_date
                                    ? new Date(selectedProject.start_date).toLocaleDateString("pt-BR")
                                    : "Não definida"}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                                  Prazo Estimado
                                </span>
                                <p className="text-xs font-semibold text-white">
                                  {selectedProject.deadline
                                    ? new Date(selectedProject.deadline).toLocaleDateString("pt-BR")
                                    : "Não definido"}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                                  Progresso ({selectedProject.progress}%)
                                </span>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-1.5">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                                    style={{ width: `${selectedProject.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* URLs Links */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                              {selectedProject.figma_url && (
                                <a
                                  href={selectedProject.figma_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/20 transition-colors"
                                >
                                  <Palette size={13} />
                                  <span>Figma Protótipo</span>
                                </a>
                              )}
                              {selectedProject.preview_url && (
                                <a
                                  href={selectedProject.preview_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors"
                                >
                                  <Globe size={13} />
                                  <span>Staging Web Preview</span>
                                </a>
                              )}
                              {selectedProject.repo_url && (
                                <a
                                  href={selectedProject.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                                >
                                  <FolderGit2 size={13} />
                                  <span>Repositório GitHub</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Painel de Gestão de Links Rápidos & Ambientes */}
                      {(() => {
                        const links = projectQuickLinks[selectedProject.id] || [];
                        return (
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Link2 size={16} className="text-indigo-400" />
                                    <span>Painel de Links Rápidos & Ambientes</span>
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                                    {links.length} {links.length === 1 ? "link" : "links"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Cadastre pares de (Rótulo + URL) para Protótipo (Figma), Ambiente de Testes (Staging) e Documentação Técnica.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenQuickLinkModal(selectedProject.id)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 border border-indigo-400/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95"
                              >
                                <Plus size={14} />
                                <span>+ Adicionar Link Rápido</span>
                              </button>
                            </div>

                            {links.length === 0 ? (
                              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                                <Link2 size={24} className="text-gray-600 mx-auto" />
                                <p className="text-xs text-gray-400">Nenhum atalho rápido cadastrado para este projeto.</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const defaultLinks = generateDefaultProjectQuickLinks(selectedProject);
                                    saveQuickLinksToStorage({
                                      ...projectQuickLinks,
                                      [selectedProject.id]: defaultLinks,
                                    });
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                                >
                                  Gerar Atalhos Padrão (Figma, Staging, Docs)
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {links.map((item) => {
                                  const catInfo = getQuickLinkCategoryInfo(item.category);
                                  const IconComponent = catInfo.icon;

                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                        item.is_active
                                          ? "bg-black/40 border-white/10 hover:border-indigo-500/40"
                                          : "bg-black/20 border-white/5 opacity-60"
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div
                                              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${catInfo.iconColor}`}
                                            >
                                              <IconComponent size={16} />
                                            </div>
                                            <div className="overflow-hidden">
                                              <h4 className="text-xs font-bold text-white truncate">
                                                {item.label}
                                              </h4>
                                              <p className="text-[10px] text-gray-400 truncate">{catInfo.label}</p>
                                            </div>
                                          </div>

                                          <span
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                              item.is_active ? catInfo.badgeClass : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                            }`}
                                          >
                                            {item.is_active ? "Ativo" : "Inativo"}
                                          </span>
                                        </div>

                                        {item.description && (
                                          <p className="text-[11px] text-gray-400 leading-relaxed mb-2 line-clamp-2">
                                            {item.description}
                                          </p>
                                        )}

                                        <p className="text-[10px] text-indigo-300 font-mono truncate bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                          {item.url}
                                        </p>
                                      </div>

                                      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleQuickLinkActive(selectedProject.id, item.id)}
                                            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                              item.is_active
                                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                                            }`}
                                            title={item.is_active ? "Desativar atalho no portal" : "Ativar atalho no portal"}
                                          >
                                            {item.is_active ? <Check size={12} /> : <X size={12} />}
                                          </button>
                                          <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                                            title="Testar URL em nova aba"
                                          >
                                            <ExternalLink size={12} />
                                          </a>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenQuickLinkModal(selectedProject.id, item)}
                                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1"
                                          >
                                            <Edit2 size={11} />
                                            <span>Editar</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteQuickLink(selectedProject.id, item.id)}
                                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                                            title="Remover link"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Central de Feedbacks & Aceites Formais dos Clientes */}
                      {(() => {
                        const feedbacks = deliveryFeedbacks[selectedProject.id] || [];
                        const pendingCount = feedbacks.filter((f) => f.status === "pending_review").length;
                        const approvalsCount = feedbacks.filter((f) => f.type === "approval").length;
                        const changesCount = feedbacks.filter((f) => f.type === "change_request").length;

                        return (
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <MessageSquare size={16} className="text-indigo-400" />
                                    <span>Central de Feedbacks & Aceites Formais</span>
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                    {feedbacks.length} {feedbacks.length === 1 ? "interação" : "interações"}
                                  </span>
                                  {pendingCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 animate-pulse">
                                      {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Histórico cronológico de aceites de entregas e solicitações de ajuste enviadas pelos clientes pelo portal.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                                  ✅ {approvalsCount} Aceites
                                </span>
                                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                                  ⚠️ {changesCount} Ajustes
                                </span>
                              </div>
                            </div>

                            {feedbacks.length === 0 ? (
                              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-400 space-y-1">
                                <MessageSquare size={24} className="text-gray-600 mx-auto mb-1" />
                                <p className="font-semibold text-gray-300">Nenhum feedback registrado ainda para este projeto.</p>
                                <p className="text-[10px]">Quando o cliente aprovar entregas ou solicitar ajustes no portal, as considerações aparecerão aqui em tempo real.</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {feedbacks.map((fb) => (
                                  <div
                                    key={fb.id}
                                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col gap-3 ${
                                      fb.type === "approval"
                                        ? "bg-emerald-950/15 border-emerald-500/30"
                                        : "bg-amber-950/15 border-amber-500/30"
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                                            fb.type === "approval"
                                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                          }`}
                                        >
                                          {fb.type === "approval" ? (
                                            <CheckCheck size={18} />
                                          ) : (
                                            <AlertCircle size={18} />
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                                                fb.type === "approval"
                                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                              }`}
                                            >
                                              {fb.type === "approval" ? "Aceite Formal (Aprovado)" : "Ajuste Solicitado"}
                                            </span>
                                            <span className="text-xs font-bold text-white">
                                              {fb.milestone_title}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                                            <span>Por: <strong className="text-gray-300">{fb.author_name}</strong> ({fb.author_email})</span>
                                            <span>•</span>
                                            <span>{new Date(fb.created_at).toLocaleString("pt-BR")}</span>
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleFeedbackStatus(selectedProject.id, fb.id)}
                                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${
                                            fb.status === "resolved"
                                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                              : "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                                          }`}
                                          title="Alternar status de resolução"
                                        >
                                          {fb.status === "resolved" ? "✅ Resolvido" : "⏳ Pendente de Ação"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteFeedback(selectedProject.id, fb.id)}
                                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                                          title="Excluir feedback"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Considerations text */}
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                      <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                                        Considerações Pontuais do Cliente:
                                      </span>
                                      <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
                                        "{fb.notes}"
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Milestones / Gestão de Etapas, Tarefas e Progresso */}
                      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>Gestão de Milestones & Etapas</span>
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                                {milestones.length} {milestones.length === 1 ? "marco" : "marcos"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Estrutura de sprints/etapas, pesos, homologação e cálculo automático de progresso.
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleOpenMilestoneModal(
                                undefined,
                                selectedStageFilter === "all" ? "Design UI/UX" : selectedStageFilter
                              )
                            }
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                          >
                            <Plus size={14} />
                            <span>Novo Marco / Tarefa</span>
                          </button>
                        </div>

                        {/* Automatic Progress & Override Console */}
                        {(() => {
                          const calculatedProg = calculateWeightedProgress(milestones);
                          const isSynced = selectedProject.progress === calculatedProg;

                          return (
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <BarChart3 size={20} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">
                                        Progresso do Projeto:{" "}
                                        <span className="text-indigo-400 font-extrabold">{selectedProject.progress}%</span>
                                      </span>
                                      <span className="text-[11px] text-gray-400">
                                        (Média Ponderada das Etapas: <strong className="text-emerald-400">{calculatedProg}%</strong>)
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">
                                      {autoProgressEnabled
                                        ? "Sincronização automática ativa: o progresso é recalculado ao alterar marcos."
                                        : "Modo Override Manual: você pode definir manualmente ou sincronizar com 1 clique."}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => setAutoProgressEnabled(!autoProgressEnabled)}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                      autoProgressEnabled
                                        ? "bg-indigo-600/30 border-indigo-500/40 text-indigo-200"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                    }`}
                                    title="Alternar entre cálculo automático e manual"
                                  >
                                    <Sparkles size={13} className={autoProgressEnabled ? "text-indigo-400" : "text-gray-400"} />
                                    <span>{autoProgressEnabled ? "Auto: Ligado" : "Auto: Desligado"}</span>
                                  </button>

                                  {!isSynced && (
                                    <button
                                      type="button"
                                      onClick={handleApplyCalculatedProgress}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                      title="Aplicar média calculada ao progresso geral"
                                    >
                                      <RefreshCw size={12} />
                                      <span>Aplicar Média ({calculatedProg}%)</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Dual Visual Progress Bars */}
                              <div className="space-y-1.5">
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                                    style={{ width: `${selectedProject.progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400">
                                  <span>Início (0%)</span>
                                  <span>
                                    {selectedProject.progress >= 100
                                      ? "✅ 100% Concluído"
                                      : `${selectedProject.progress}% em andamento`}
                                  </span>
                                  <span>Entrega Final (100%)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Stages / Sprints Tabs Filter with Stage Progress % */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                              <Layers size={14} className="text-indigo-400" />
                              <span>Etapas do Projeto (Sprints)</span>
                            </span>
                            <span className="text-[11px] text-gray-400">
                              Filtre para visualizar as tarefas ativas da etapa
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {/* All Filter */}
                            <button
                              type="button"
                              onClick={() => setSelectedStageFilter("all")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                selectedStageFilter === "all"
                                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                                  : "bg-black/30 text-gray-400 border-white/5 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span>Todas</span>
                              <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px]">
                                {milestones.length}
                              </span>
                            </button>

                            {/* Stage Tabs */}
                            {PROJECT_STAGES.map((stg) => {
                              const stgMilestones = milestones
                                .map(parseMilestone)
                                .filter((m) => m.stage === stg);
                              const totalWeight = stgMilestones.reduce((acc, curr) => acc + curr.weight, 0);
                              const stageProg =
                                stgMilestones.length === 0
                                  ? 0
                                  : Math.round(
                                      stgMilestones.reduce((acc, curr) => {
                                        const p = curr.status === "approved" ? 100 : curr.progress;
                                        return acc + p * curr.weight;
                                      }, 0) / (totalWeight || 1)
                                    );
                              const isSelected = selectedStageFilter === stg;

                              return (
                                <button
                                  key={stg}
                                  type="button"
                                  onClick={() => setSelectedStageFilter(stg)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                                    isSelected
                                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                                      : "bg-black/30 text-gray-400 border-white/5 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <span>{stg}</span>
                                  {stgMilestones.length > 0 ? (
                                    <span
                                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                                        stageProg === 100
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : stageProg > 0
                                          ? "bg-indigo-500/20 text-indigo-300"
                                          : "bg-white/10 text-gray-400"
                                      }`}
                                    >
                                      {stageProg}%
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 opacity-60">0</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Listagem das Tarefas / Marcos Ativos */}
                        {(() => {
                          const parsedAll = milestones.map(parseMilestone);
                          const filtered =
                            selectedStageFilter === "all"
                              ? parsedAll
                              : parsedAll.filter((m) => m.stage === selectedStageFilter);

                          if (filtered.length === 0) {
                            return (
                              <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                                <ListTodo size={28} className="mx-auto text-gray-600" />
                                <p className="text-xs text-gray-400">
                                  {selectedStageFilter === "all"
                                    ? "Nenhum marco cadastrado para este projeto."
                                    : `Nenhuma tarefa ativa cadastrada na etapa "${selectedStageFilter}".`}
                                </p>
                                <button
                                  onClick={() =>
                                    handleOpenMilestoneModal(
                                      undefined,
                                      selectedStageFilter === "all" ? "Design UI/UX" : selectedStageFilter
                                    )
                                  }
                                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
                                >
                                  <Plus size={13} />
                                  <span>Criar primeiro marco desta etapa</span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2.5">
                              {filtered.map((m) => {
                                const original = milestones.find((x) => x.id === m.id)!;
                                const isApproved = m.status === "approved";
                                const isInReview = m.status === "in_review";

                                return (
                                  <div
                                    key={m.id}
                                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                      isApproved
                                        ? "bg-emerald-950/10 border-emerald-500/20"
                                        : isInReview
                                        ? "bg-blue-950/10 border-blue-500/20"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      {/* Title & Stage Pill */}
                                      <div className="flex items-start gap-3">
                                        <div className="pt-0.5">
                                          {isApproved ? (
                                            <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                              <Check size={13} />
                                            </div>
                                          ) : isInReview ? (
                                            <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center">
                                              <Eye size={12} />
                                            </div>
                                          ) : (
                                            <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center text-gray-400">
                                              <Clock size={12} />
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h4
                                              className={`text-xs font-bold ${
                                                isApproved ? "text-emerald-300" : "text-white"
                                              }`}
                                            >
                                              {m.title}
                                            </h4>

                                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                                              {m.stage}
                                            </span>

                                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[10px] font-semibold">
                                              Peso: {m.weight}x
                                            </span>
                                          </div>

                                          {m.description && (
                                            <p className="text-[11px] text-gray-400">{m.description}</p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Status Switcher & Action Buttons */}
                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {/* Status Switcher */}
                                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleQuickUpdateMilestoneStatus(original, "pending")
                                            }
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              m.status === "pending"
                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Marcar como Pendente"
                                          >
                                            Pendente
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleQuickUpdateMilestoneStatus(original, "in_review")
                                            }
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              m.status === "in_review"
                                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Enviar para Homologação"
                                          >
                                            Em Homologação
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleQuickUpdateMilestoneStatus(original, "approved")
                                            }
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              m.status === "approved"
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Aprovar Marco"
                                          >
                                            Aprovado
                                          </button>
                                        </div>

                                        {/* Edit */}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenMilestoneModal(original)}
                                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                          title="Editar marco / progresso / peso"
                                        >
                                          <Edit2 size={13} />
                                        </button>

                                        {/* Delete */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMilestone(m.id)}
                                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                          title="Excluir marco"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Task Progress Bar and Date Metadata */}
                                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-gray-400">
                                      {/* Individual Progress */}
                                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                                        <span className="font-semibold text-gray-300">
                                          Progresso: {isApproved ? 100 : m.progress}%
                                        </span>
                                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all ${
                                              isApproved
                                                ? "bg-emerald-400"
                                                : isInReview
                                                ? "bg-blue-400"
                                                : "bg-indigo-400"
                                            }`}
                                            style={{ width: `${isApproved ? 100 : m.progress}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Dates: Due Date & Approval Date */}
                                      <div className="flex flex-wrap items-center gap-3">
                                        {m.due_date && (
                                          <span className="flex items-center gap-1">
                                            <Calendar size={11} className="text-gray-500" />
                                            <span>
                                              Previsto:{" "}
                                              <strong className="text-gray-300">
                                                {new Date(m.due_date).toLocaleDateString("pt-BR")}
                                              </strong>
                                            </span>
                                          </span>
                                        )}

                                        {isApproved && m.completed_at && (
                                          <span className="flex items-center gap-1 text-emerald-400">
                                            <ShieldCheck size={11} />
                                            <span>
                                              Aprovado em:{" "}
                                              <strong>
                                                {new Date(m.completed_at).toLocaleDateString("pt-BR")}
                                              </strong>
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Gestão Manual de Pagamentos e Faturamento */}
                      {(() => {
                        const projectFin =
                          projectFinances[selectedProject.id] ||
                          generateDefaultProjectFinances(selectedProject);
                        const finSummary = calculateFinancialSummary(projectFin);

                        return (
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <DollarSign size={16} className="text-emerald-400" />
                                    <span>Gestão de Pagamentos & Faturamento</span>
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    {finSummary.installmentsCount}{" "}
                                    {finSummary.installmentsCount === 1 ? "parcela" : "parcelas"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Acompanhamento manual de contrato, parcelas, vencimentos, quitação e comprovantes.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSplitGenerator(selectedProject.id)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                                  title="Gerar parcelamento automático (ex: 2x, 3x, 4x, 6x)"
                                >
                                  <Zap size={13} className="text-purple-400" />
                                  <span>Gerar Parcelas</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenInstallmentModal(selectedProject.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                                >
                                  <Plus size={14} />
                                  <span>Nova Parcela</span>
                                </button>
                              </div>
                            </div>

                            {/* Financial Totalizers Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {/* 1. Valor Total do Contrato */}
                              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 relative group">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                                    Valor do Contrato
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenContractValueModal(selectedProject.id)}
                                    className="text-gray-400 hover:text-white p-0.5"
                                    title="Editar Valor Total do Contrato"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                </div>
                                <p className="text-sm sm:text-base font-extrabold text-white mt-1">
                                  {formatBRL(finSummary.contractValue)}
                                </p>
                                <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">
                                  {finSummary.installmentsCount} parcelas configuradas
                                </span>
                              </div>

                              {/* 2. Total Quitado (Pago) */}
                              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                                <span className="text-[10px] text-emerald-400/80 uppercase font-bold block">
                                  Total Pago
                                </span>
                                <p className="text-sm sm:text-base font-extrabold text-emerald-400 mt-1">
                                  {formatBRL(finSummary.totalPaid)}
                                </p>
                                <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">
                                  {finSummary.percentPaid}% liquidado ({finSummary.paidCount} pagas)
                                </span>
                              </div>

                              {/* 3. Saldo Restante */}
                              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                                <span className="text-[10px] text-purple-300/80 uppercase font-bold block">
                                  Saldo Restante
                                </span>
                                <p className="text-sm sm:text-base font-extrabold text-purple-300 mt-1">
                                  {formatBRL(finSummary.remainingBalance)}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {100 - finSummary.percentPaid}% a faturar
                                </span>
                              </div>

                              {/* 4. Em Atraso / Vencido */}
                              <div
                                className={`p-3.5 rounded-2xl border ${
                                  finSummary.totalOverdue > 0
                                    ? "bg-rose-950/20 border-rose-500/30"
                                    : "bg-black/40 border-white/10"
                                }`}
                              >
                                <span
                                  className={`text-[10px] uppercase font-bold block ${
                                    finSummary.totalOverdue > 0 ? "text-rose-400" : "text-gray-400"
                                  }`}
                                >
                                  Em Atraso / Vencido
                                </span>
                                <p
                                  className={`text-sm sm:text-base font-extrabold mt-1 ${
                                    finSummary.totalOverdue > 0 ? "text-rose-400" : "text-gray-300"
                                  }`}
                                >
                                  {formatBRL(finSummary.totalOverdue)}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  {finSummary.totalOverdue > 0
                                    ? "⚠️ Requer cobrança"
                                    : "Nenhum atraso"}
                                </span>
                              </div>
                            </div>

                            {/* Financial Progress Bar */}
                            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                                <span>Taxa de Quitação do Contrato</span>
                                <span className="font-mono text-emerald-400 font-bold">
                                  {finSummary.percentPaid}% ({formatBRL(finSummary.totalPaid)} de{" "}
                                  {formatBRL(finSummary.contractValue)})
                                </span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${finSummary.percentPaid}%` }}
                                />
                              </div>
                            </div>

                            {/* Tabela de Parcelas */}
                            <div>
                              {projectFin.installments.length === 0 ? (
                                <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                                  <DollarSign size={28} className="mx-auto text-gray-600" />
                                  <p className="text-xs text-gray-400">
                                    Nenhuma parcela cadastrada para este contrato.
                                  </p>
                                  <div className="flex items-center justify-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSplitGenerator(selectedProject.id)}
                                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold cursor-pointer flex items-center gap-1"
                                    >
                                      <Zap size={12} />
                                      <span>Gerar 3x Automático</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInstallmentModal(selectedProject.id)}
                                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      <span>Criar Parcela Manual</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-2xl border border-white/10">
                                  <table className="w-full text-left text-xs text-gray-300 min-w-[700px]">
                                    <thead className="bg-black/60 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">
                                      <tr>
                                        <th className="py-3 px-3.5">Parcela / Título</th>
                                        <th className="py-3 px-3.5">Valor (R$)</th>
                                        <th className="py-3 px-3.5">Vencimento</th>
                                        <th className="py-3 px-3.5">Quitação</th>
                                        <th className="py-3 px-3.5">Método</th>
                                        <th className="py-3 px-3.5">Status</th>
                                        <th className="py-3 px-3.5">Comprovante</th>
                                        <th className="py-3 px-3.5 text-right">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 bg-black/20">
                                      {projectFin.installments.map((inst, idx) => {
                                        const st = getInstallmentStatus(inst);
                                        const isPaid = st.status === "pago";

                                        return (
                                          <tr
                                            key={inst.id}
                                            className={`hover:bg-white/[0.02] transition-colors ${
                                              isPaid ? "bg-emerald-950/5" : ""
                                            }`}
                                          >
                                            {/* Title */}
                                            <td className="py-3 px-3.5">
                                              <div className="font-bold text-white flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono flex items-center justify-center text-gray-300">
                                                  {idx + 1}
                                                </span>
                                                <span>{inst.title}</span>
                                              </div>
                                              {inst.notes && (
                                                <p className="text-[10px] text-gray-500 mt-0.5 pl-7">
                                                  {inst.notes}
                                                </p>
                                              )}
                                            </td>

                                            {/* Amount */}
                                            <td className="py-3 px-3.5 font-extrabold text-white font-mono">
                                              {formatBRL(inst.amount)}
                                            </td>

                                            {/* Due Date */}
                                            <td className="py-3 px-3.5 font-medium">
                                              <span
                                                className={
                                                  st.status === "vencido"
                                                    ? "text-rose-400 font-bold"
                                                    : "text-gray-300"
                                                }
                                              >
                                                {inst.due_date
                                                  ? new Date(inst.due_date).toLocaleDateString("pt-BR")
                                                  : "Não definida"}
                                              </span>
                                            </td>

                                            {/* Paid At */}
                                            <td className="py-3 px-3.5">
                                              {inst.paid_at ? (
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                  <CheckCircle2 size={12} />
                                                  <span>
                                                    {new Date(inst.paid_at).toLocaleDateString("pt-BR")}
                                                  </span>
                                                </span>
                                              ) : (
                                                <span className="text-gray-500 italic text-[11px]">
                                                  Pendente
                                                </span>
                                              )}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="py-3 px-3.5">
                                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300">
                                                {getPaymentMethodLabel(inst.payment_method)}
                                              </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3 px-3.5">
                                              <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${st.badgeClass}`}
                                              >
                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                                                <span>{st.label}</span>
                                              </span>
                                            </td>

                                            {/* Receipt */}
                                            <td className="py-3 px-3.5">
                                              {inst.receipt_url ? (
                                                <a
                                                  href={
                                                    inst.receipt_url.startsWith("http")
                                                      ? inst.receipt_url
                                                      : undefined
                                                  }
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  onClick={(e) => {
                                                    if (!inst.receipt_url?.startsWith("http")) {
                                                      e.preventDefault();
                                                      alert(`Comprovante / Código:\n${inst.receipt_url}`);
                                                    }
                                                  }}
                                                  className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                                  title={inst.receipt_url}
                                                >
                                                  <FileText size={11} />
                                                  <span className="max-w-[80px] truncate">
                                                    {inst.receipt_url}
                                                  </span>
                                                </a>
                                              ) : (
                                                <span className="text-gray-600 text-[11px]">—</span>
                                              )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-3.5 text-right">
                                              <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleQuickPayInstallment(selectedProject.id, inst.id)
                                                  }
                                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                                    isPaid
                                                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                                                      : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                                                  }`}
                                                  title={
                                                    isPaid
                                                      ? "Reabrir parcela (Desmarcar Quitação)"
                                                      : "Quitar parcela com 1 clique"
                                                  }
                                                >
                                                  <Check size={11} />
                                                  <span>{isPaid ? "Reabrir" : "Quitar"}</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleOpenInstallmentModal(selectedProject.id, inst)
                                                  }
                                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                                  title="Editar Parcela"
                                                >
                                                  <Edit2 size={12} />
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeleteInstallment(selectedProject.id, inst.id)
                                                  }
                                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                                  title="Excluir Parcela"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Contratos, Termos & Documentos do Projeto */}
                      {(() => {
                        const allDocs =
                          projectDocuments[selectedProject.id] ||
                          generateDefaultProjectDocuments(selectedProject);
                        const filteredDocs = allDocs.filter((d) => {
                          const matchesCat =
                            docCategoryFilter === "all" || d.category === docCategoryFilter;
                          const matchesVis =
                            docVisibilityFilter === "all" || d.visibility === docVisibilityFilter;
                          return matchesCat && matchesVis;
                        });

                        const clientVisibleCount = allDocs.filter((d) => d.visibility === "client").length;
                        const internalCount = allDocs.filter((d) => d.visibility === "internal").length;

                        return (
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-rose-400" />
                                    <span>Contratos & Documentos Oficiais (PDF)</span>
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                                    {allDocs.length} {allDocs.length === 1 ? "arquivo" : "arquivos"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Upload de PDFs com controle de visibilidade (Visível para o Cliente vs. Uso Interno).
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDocumentModal(selectedProject.id)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 border border-rose-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                              >
                                <Plus size={14} />
                                <span>Upload de Documento (PDF)</span>
                              </button>
                            </div>

                            {/* Summary Badges & Filters */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                              {/* Quick Stats */}
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
                                  <Eye size={12} />
                                  <span>{clientVisibleCount} Visíveis ao Cliente</span>
                                </span>
                                <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold flex items-center gap-1.5">
                                  <Lock size={12} />
                                  <span>{internalCount} Uso Interno</span>
                                </span>
                              </div>

                              {/* Filter Controls */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Category Filter */}
                                <select
                                  value={docCategoryFilter}
                                  onChange={(e) => setDocCategoryFilter(e.target.value)}
                                  className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500 cursor-pointer"
                                >
                                  <option value="all">Todas as Categorias</option>
                                  <option value="contrato">Contratos</option>
                                  <option value="proposta">Propostas</option>
                                  <option value="termo_aceite">Termos de Aceite</option>
                                  <option value="briefing">Briefing Técnico</option>
                                  <option value="nda">Acordo NDA</option>
                                  <option value="recibo">Recibos Fiscais</option>
                                </select>

                                {/* Visibility Filter */}
                                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
                                  <button
                                    type="button"
                                    onClick={() => setDocVisibilityFilter("all")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                      docVisibilityFilter === "all"
                                        ? "bg-white/15 text-white"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    Todos
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDocVisibilityFilter("client")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                      docVisibilityFilter === "client"
                                        ? "bg-emerald-600 text-white"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    Cliente
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDocVisibilityFilter("internal")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                      docVisibilityFilter === "internal"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    Interno
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Documents Grid / List */}
                            {filteredDocs.length === 0 ? (
                              <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                                <FileText size={28} className="mx-auto text-gray-600" />
                                <p className="text-xs text-gray-400">
                                  Nenhum documento encontrado com os filtros selecionados.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDocumentModal(selectedProject.id)}
                                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
                                >
                                  <Plus size={13} />
                                  <span>Fazer upload de um arquivo PDF</span>
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredDocs.map((doc) => {
                                  const catInfo = getDocumentCategoryInfo(doc.category);
                                  const isClientVisible = doc.visibility === "client";

                                  return (
                                    <div
                                      key={doc.id}
                                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                        isClientVisible
                                          ? "bg-white/[0.02] border-white/10 hover:border-white/20"
                                          : "bg-purple-950/10 border-purple-500/20"
                                      }`}
                                    >
                                      {/* Header: Title, Category & Visibility */}
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                          {/* PDF Icon */}
                                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex flex-col items-center justify-center shrink-0">
                                            <FileText size={18} />
                                            <span className="text-[8px] font-extrabold uppercase">PDF</span>
                                          </div>

                                          <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-white leading-tight">
                                              {doc.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catInfo.badgeClass}`}
                                              >
                                                {catInfo.label}
                                              </span>
                                              <span className="text-[10px] text-gray-500">
                                                {doc.file_size_formatted}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Visibility Toggle Button */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleToggleDocumentVisibility(selectedProject.id, doc.id)
                                          }
                                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                            isClientVisible
                                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                                              : "bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25"
                                          }`}
                                          title={
                                            isClientVisible
                                              ? "Clique para mudar para Uso Interno (Ocultar do cliente)"
                                              : "Clique para tornar Visível para o Cliente"
                                          }
                                        >
                                          {isClientVisible ? (
                                            <>
                                              <Eye size={11} className="text-emerald-400" />
                                              <span>Visível ao Cliente</span>
                                            </>
                                          ) : (
                                            <>
                                              <Lock size={11} className="text-purple-400" />
                                              <span>Uso Interno</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      {/* Document Notes & Metadata */}
                                      {doc.notes && (
                                        <p className="text-[11px] text-gray-400 pl-1">
                                          {doc.notes}
                                        </p>
                                      )}

                                      {/* Footer: Date & Action Buttons */}
                                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[10px] text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Calendar size={11} className="text-gray-500" />
                                          <span>
                                            Enviado em:{" "}
                                            <strong className="text-gray-300">
                                              {new Date(doc.uploaded_at).toLocaleDateString("pt-BR")}
                                            </strong>
                                          </span>
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                          {/* View PDF */}
                                          <button
                                            type="button"
                                            onClick={() => handleOpenPdfViewer(doc)}
                                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                            title="Visualizar PDF"
                                          >
                                            <Eye size={11} />
                                            <span>Visualizar</span>
                                          </button>

                                          {/* Download */}
                                          <a
                                            href={doc.file_url !== "#" ? doc.file_url : undefined}
                                            download={doc.filename}
                                            onClick={(e) => {
                                              if (doc.file_url === "#") {
                                                e.preventDefault();
                                                alert(
                                                  `Download Simulado:\nArquivo: ${doc.filename}\nTamanho: ${doc.file_size_formatted}\n\nPara arquivos reais enviados via upload, o download inicia imediatamente.`
                                                );
                                              }
                                            }}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                            title="Download PDF"
                                          >
                                            <ExternalLink size={12} />
                                          </a>

                                          {/* Edit */}
                                          <button
                                            type="button"
                                            onClick={() => handleOpenDocumentModal(selectedProject.id, doc)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                            title="Editar Documento"
                                          >
                                            <Edit2 size={12} />
                                          </button>

                                          {/* Delete */}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteDocument(selectedProject.id, doc.id)}
                                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                            title="Excluir Documento"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Timeline Updates & Notas */}
                      {(() => {
                        const projUpdates =
                          projectUpdates[selectedProject.id] ||
                          updates.length > 0
                            ? (projectUpdates[selectedProject.id] || updates)
                            : generateDefaultProjectUpdates(selectedProject);

                        return (
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Send size={16} className="text-purple-400" />
                                    <span>Timeline de Alinhamentos & Notas de Versão</span>
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                    {projUpdates.length} {projUpdates.length === 1 ? "evento" : "eventos"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Linha do tempo pública visível no Portal do Cliente com atas, comunicados e notas de release.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenUpdateModal(selectedProject.id)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 border border-purple-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                              >
                                <Plus size={14} />
                                <span>Publicar na Timeline</span>
                              </button>
                            </div>

                            {projUpdates.length === 0 ? (
                              <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                                <Send size={28} className="mx-auto text-gray-600" />
                                <p className="text-xs text-gray-400">
                                  Nenhum registro postado na timeline deste projeto ainda.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUpdateModal(selectedProject.id)}
                                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
                                >
                                  <Plus size={13} />
                                  <span>Publicar primeiro comunicado ou reunião</span>
                                </button>
                              </div>
                            ) : (
                              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 via-indigo-500 to-pink-500">
                                {projUpdates.map((u) => {
                                  const typeInfo = getUpdateTypeInfo(u.category);
                                  const IconComp = typeInfo.icon;

                                  return (
                                    <div key={u.id} className="relative group">
                                      <div
                                        className={`absolute -left-6 top-1.5 w-6 h-6 rounded-lg bg-slate-950 border border-white/15 flex items-center justify-center text-white ring-4 ring-[#070913] shadow-md ${typeInfo.colorText}`}
                                      >
                                        <IconComp size={12} />
                                      </div>

                                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/25 transition-all space-y-2.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span
                                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badgeClass}`}
                                            >
                                              {typeInfo.label}
                                            </span>
                                            {u.version_tag && (
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                                                {u.version_tag}
                                              </span>
                                            )}
                                            <span className="text-[11px] text-gray-400 font-medium">
                                              {new Date(u.created_at).toLocaleString("pt-BR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                              })}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenUpdateModal(selectedProject.id, u)}
                                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                              title="Editar Update"
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteUpdate(selectedProject.id, u.id)}
                                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                              title="Remover Update"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </div>

                                        <h5 className="text-sm font-bold text-white">{u.title}</h5>

                                        {u.meeting_attendees && (
                                          <div className="p-2 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-200">
                                            <strong>Participantes:</strong> {u.meeting_attendees}
                                          </div>
                                        )}

                                        <div className="text-xs text-gray-300">
                                          {renderRichMarkdown(u.content)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-white/10">
                      <FolderKanban size={40} className="mx-auto text-gray-600 mb-3" />
                      <p className="text-sm font-bold text-gray-300">Nenhum projeto selecionado</p>
                      <p className="text-xs text-gray-500 mt-1">Selecione um projeto na lista ao lado ou crie um novo para gerenciar o escopo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTS MANAGEMENT */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              {/* Clients Header & Controls Bar */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Users size={20} className="text-purple-400" />
                    <span>Gestão de Clientes ({clients.length})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Controle cadastros, status de acesso (Ativo/Bloqueado) e projetos vinculados a cada cliente.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenClientModal()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Cadastrar Novo Cliente</span>
                  </button>
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setClientCurrentPage(1);
                    }}
                    placeholder="Buscar por nome, e-mail, empresa..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {(["all", "active", "blocked"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => {
                        setClientStatusFilter(filterKey);
                        setClientCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        clientStatusFilter === filterKey
                          ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/20"
                          : "bg-slate-900/80 text-gray-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {filterKey === "all" && `Todos (${clients.length})`}
                      {filterKey === "active" && `Ativos (${clients.filter((c) => c.status !== "blocked").length})`}
                      {filterKey === "blocked" && `Bloqueados (${clients.filter((c) => c.status === "blocked").length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients Grid */}
              {(() => {
                const filteredClients = clients.filter((c) => {
                  const matchesSearch =
                    (c.full_name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) || false) ||
                    (c.email?.toLowerCase().includes(clientSearchQuery.toLowerCase()) || false) ||
                    (c.company?.toLowerCase().includes(clientSearchQuery.toLowerCase()) || false) ||
                    (c.phone?.includes(clientSearchQuery) || false);

                  const matchesStatus =
                    clientStatusFilter === "all" ||
                    (clientStatusFilter === "active" && c.status !== "blocked") ||
                    (clientStatusFilter === "blocked" && c.status === "blocked");

                  return matchesSearch && matchesStatus;
                });

                const clientsPerPage = 6;
                const totalClientPages = Math.ceil(filteredClients.length / clientsPerPage) || 1;
                const paginatedClients = filteredClients.slice(
                  (clientCurrentPage - 1) * clientsPerPage,
                  clientCurrentPage * clientsPerPage
                );

                if (filteredClients.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
                      <Users size={36} className="text-gray-600 mx-auto" />
                      <p className="text-sm font-semibold text-gray-300">Nenhum cliente encontrado.</p>
                      <p className="text-xs text-gray-500">Tente ajustar seus termos de busca ou cadastrar um novo cliente.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginatedClients.map((c) => {
                        const clientProjects = projects.filter((p) => p.client_id === c.id);
                        const isBlocked = c.status === "blocked";

                        return (
                          <div
                            key={c.id}
                            className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-4 shadow-lg group hover:bg-slate-900"
                          >
                            <div>
                              {/* Header Card: Avatar, Name, Status Badge */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center font-black text-sm text-white shadow-md">
                                    {c.full_name?.charAt(0) || c.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                      {c.full_name || "Sem Nome"}
                                    </h4>
                                    {c.company ? (
                                      <span className="text-[11px] text-indigo-300 font-semibold block">
                                        🏢 {c.company}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-gray-500">Pessoa Física</span>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                                    isBlocked
                                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? "bg-rose-400" : "bg-emerald-400 animate-pulse"}`} />
                                  {isBlocked ? "Bloqueado" : "Ativo"}
                                </span>
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-1.5 text-xs text-gray-400 my-3 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                  <Mail size={13} className="text-gray-500 shrink-0" />
                                  <span className="truncate text-gray-300">{c.email}</span>
                                </div>
                                {c.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone size={13} className="text-emerald-400 shrink-0" />
                                    <a
                                      href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-400 hover:underline"
                                    >
                                      {c.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bottom Card Footer: Projects Count & Actions */}
                            <div className="pt-3 border-t border-white/10 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Projetos Atribuídos:</span>
                                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                  {clientProjects.length} {clientProjects.length === 1 ? "projeto" : "projetos"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleOpenClientDetails(c)}
                                  className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <FolderKanban size={13} />
                                  <span>Ver Projetos</span>
                                </button>

                                <button
                                  onClick={() => handleOpenClientModal(c)}
                                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Edit2 size={13} />
                                  <span>Editar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalClientPages > 1 && (
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-400">
                          Mostrando página <strong className="text-white">{clientCurrentPage}</strong> de{" "}
                          <strong className="text-white">{totalClientPages}</strong> ({filteredClients.length} clientes)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={clientCurrentPage === 1}
                            onClick={() => setClientCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs text-white border border-white/10 transition-colors"
                          >
                            ← Anterior
                          </button>

                          {Array.from({ length: totalClientPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setClientCurrentPage(i + 1)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                clientCurrentPage === i + 1
                                  ? "bg-purple-600 text-white"
                                  : "bg-white/5 text-gray-400 hover:text-white"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}

                          <button
                            disabled={clientCurrentPage === totalClientPages}
                            onClick={() => setClientCurrentPage((prev) => Math.min(totalClientPages, prev + 1))}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs text-white border border-white/10 transition-colors"
                          >
                            Próxima →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}



          {/* TAB: PROPOSALS & PLANS */}
          {activeTab === "proposals" && (
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-400" />
                    <span>Orçamentos & Planos Cadastrados</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modelos de pacotes de serviços disponíveis no seu portfólio.
                  </p>
                </div>
                <Link
                  href="/valores"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5"
                >
                  <span>Ver Página Pública de Valores</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold text-blue-400 uppercase">Landing Page Express</span>
                  <p className="text-xl font-extrabold text-white mt-1">R$ 1.500</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">3x sem juros ou 50% / 50%</p>
                  <p className="text-xs text-gray-400 mt-2">Design sob medida no Figma, Next.js, SEO e WhatsApp integrado.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-indigo-500/30 bg-indigo-950/20">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Software/App (Contrato 12m)</span>
                  <p className="text-xl font-extrabold text-white mt-1">12x de R$ 350 <span className="text-xs text-gray-400 font-normal">/mês</span></p>
                  <p className="text-[11px] text-purple-300 font-semibold mt-1">1 update mensal + suporte</p>
                  <p className="text-xs text-gray-400 mt-2">+ R$ 1.500 opcional para entrega definitiva do código-fonte.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold text-teal-400 uppercase">Redesign & Consultoria UX/UI</span>
                  <p className="text-xl font-extrabold text-white mt-1">R$ 3.500</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">3x sem juros ou 50% / 50%</p>
                  <p className="text-xs text-gray-400 mt-2">Prazo 30 a 60 dias • Auditoria, novos fluxos e protótipo Figma.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold text-cyan-400 uppercase">Pós-Contrato (12 meses)</span>
                  <p className="text-xl font-extrabold text-white mt-1">R$ 250 ou R$ 350</p>
                  <p className="text-[11px] text-cyan-300 font-semibold mt-1">Hospedagem vs Manutenção</p>
                  <p className="text-xs text-gray-400 mt-2">R$ 250 apenas servidores no ar, ou R$ 350 com suporte e updates.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FINANCE & BILLING */}
          {activeTab === "finance" && (
            <div className="space-y-8">
              {/* Financial Welcome & Header */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900/80 border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span>Módulo de Faturamento & Controle Financeiro</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Gestão Manual de Pagamentos 💳
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
                    Controle de contratos, emissão de parcelas, registro de quitações em tempo real, cálculo de saldos e controle de inadimplência.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 shrink-0 flex-wrap">
                  {selectedProject && (
                    <button
                      type="button"
                      onClick={() => handleOpenInstallmentModal(selectedProject.id)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus size={15} />
                      <span>Nova Parcela ({selectedProject.title.slice(0, 16)}...)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Global Financial KPI Cards */}
              {(() => {
                let globalContractTotal = 0;
                let globalTotalPaid = 0;
                let globalRemaining = 0;
                let globalOverdue = 0;
                let globalInstallmentsCount = 0;
                let globalPaidCount = 0;

                for (const p of projects) {
                  const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                  const summary = calculateFinancialSummary(pFin);
                  globalContractTotal += summary.contractValue;
                  globalTotalPaid += summary.totalPaid;
                  globalRemaining += summary.remainingBalance;
                  globalOverdue += summary.totalOverdue;
                  globalInstallmentsCount += summary.installmentsCount;
                  globalPaidCount += summary.paidCount;
                }

                const globalPercent =
                  globalContractTotal > 0
                    ? Math.round((globalTotalPaid / globalContractTotal) * 100)
                    : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* 1. Faturamento Total Contratado */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Total em Contratos
                        </span>
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <DollarSign size={18} />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {formatBRL(globalContractTotal)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{projects.length} contratos ativos</span>
                        <span className="text-indigo-400 font-semibold">{globalInstallmentsCount} parcelas</span>
                      </div>
                    </div>

                    {/* 2. Total Recebido / Quitado */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Receita Realizada (Pago)
                        </span>
                        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={18} />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                        {formatBRL(globalTotalPaid)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-300/80">
                        <span>{globalPercent}% do montante</span>
                        <span className="font-bold">{globalPaidCount} parcelas pagas</span>
                      </div>
                    </div>

                    {/* 3. Saldo a Receber */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                          Contas a Receber
                        </span>
                        <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Clock size={18} />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
                        {formatBRL(globalRemaining)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{100 - globalPercent}% em aberto</span>
                        <span className="text-purple-400 font-semibold">Fluxo futuro</span>
                      </div>
                    </div>

                    {/* 4. Total em Atraso */}
                    <div
                      className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl shadow-lg ${
                        globalOverdue > 0
                          ? "bg-rose-950/20 border-rose-500/40"
                          : "bg-slate-900/80 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            globalOverdue > 0 ? "text-rose-400" : "text-gray-400"
                          }`}
                        >
                          Inadimplência / Atraso
                        </span>
                        <div
                          className={`p-2.5 rounded-2xl border ${
                            globalOverdue > 0
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-white/5 text-gray-400 border-white/10"
                          }`}
                        >
                          <AlertCircle size={18} />
                        </div>
                      </div>
                      <p
                        className={`text-2xl sm:text-3xl font-black tracking-tight ${
                          globalOverdue > 0 ? "text-rose-400" : "text-gray-300"
                        }`}
                      >
                        {formatBRL(globalOverdue)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          {globalOverdue > 0 ? "⚠️ Requer contato" : "Em dia"}
                        </span>
                        <span className={globalOverdue > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                          {globalOverdue > 0 ? "Parcelas vencidas" : "Zero pendências"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Search, Filter & Project Selector Bar */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={financeSearchQuery}
                    onChange={(e) => setFinanceSearchQuery(e.target.value)}
                    placeholder="Buscar por parcela, cliente ou comprovante..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  {/* Filter by Project */}
                  <select
                    value={financeProjectFilter}
                    onChange={(e) => setFinanceProjectFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">Todos os Projetos ({projects.length})</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>

                  {/* Filter by Installment Status */}
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                    {[
                      { key: "all", label: "Todas" },
                      { key: "pago", label: "Pagas" },
                      { key: "em_dia", label: "Em dia" },
                      { key: "pendente", label: "Pendentes" },
                      { key: "vencido", label: "Vencidas" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFinanceStatusFilter(f.key as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          financeStatusFilter === f.key
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master Installments Table Across Projects */}
              {(() => {
                // Collect all installments from projects matching filters
                const allList: { project: Project; installment: ProjectInstallment }[] = [];

                for (const p of projects) {
                  if (financeProjectFilter !== "all" && p.id !== financeProjectFilter) continue;
                  const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                  for (const inst of pFin.installments) {
                    const st = getInstallmentStatus(inst);
                    if (financeStatusFilter !== "all" && st.status !== financeStatusFilter) continue;

                    const client = clients.find((c) => c.id === p.client_id);
                    const searchTarget = financeSearchQuery.toLowerCase().trim();

                    const matchesSearch =
                      !searchTarget ||
                      inst.title.toLowerCase().includes(searchTarget) ||
                      p.title.toLowerCase().includes(searchTarget) ||
                      (client?.full_name?.toLowerCase().includes(searchTarget) || false) ||
                      (inst.receipt_url?.toLowerCase().includes(searchTarget) || false) ||
                      (inst.notes?.toLowerCase().includes(searchTarget) || false) ||
                      inst.amount.toString().includes(searchTarget);

                    if (matchesSearch) {
                      allList.push({ project: p, installment: inst });
                    }
                  }
                }

                // Sort: Overdue and pending first, then by due_date
                allList.sort((a, b) => {
                  if (a.installment.paid_at && !b.installment.paid_at) return 1;
                  if (!a.installment.paid_at && b.installment.paid_at) return -1;
                  return (a.installment.due_date || "").localeCompare(b.installment.due_date || "");
                });

                if (allList.length === 0) {
                  return (
                    <div className="p-12 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-3">
                      <DollarSign size={36} className="mx-auto text-gray-600" />
                      <h4 className="text-base font-bold text-white">Nenhuma parcela encontrada</h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto">
                        Não há parcelas que correspondam aos filtros de busca selecionados.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText size={16} className="text-emerald-400" />
                        <span>Listagem Geral de Parcelas ({allList.length})</span>
                      </h3>
                      <span className="text-xs text-gray-400">
                        Total listado:{" "}
                        <strong className="text-emerald-400">
                          {formatBRL(allList.reduce((acc, curr) => acc + curr.installment.amount, 0))}
                        </strong>
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                      <table className="w-full text-left text-xs text-gray-300 min-w-[850px]">
                        <thead className="bg-black/60 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">
                          <tr>
                            <th className="py-3 px-3.5">Projeto / Cliente</th>
                            <th className="py-3 px-3.5">Parcela / Título</th>
                            <th className="py-3 px-3.5">Valor (R$)</th>
                            <th className="py-3 px-3.5">Vencimento</th>
                            <th className="py-3 px-3.5">Quitação</th>
                            <th className="py-3 px-3.5">Método</th>
                            <th className="py-3 px-3.5">Status</th>
                            <th className="py-3 px-3.5">Comprovante</th>
                            <th className="py-3 px-3.5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/20">
                          {allList.map(({ project, installment: inst }) => {
                            const st = getInstallmentStatus(inst);
                            const isPaid = st.status === "pago";
                            const client = clients.find((c) => c.id === project.client_id);

                            return (
                              <tr
                                key={inst.id}
                                className={`hover:bg-white/[0.02] transition-colors ${
                                  isPaid ? "bg-emerald-950/5" : ""
                                }`}
                              >
                                {/* Project & Client */}
                                <td className="py-3 px-3.5">
                                  <div className="font-bold text-white">{project.title}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {client?.full_name || "Sem cliente"} {client?.company ? `(${client.company})` : ""}
                                  </div>
                                </td>

                                {/* Installment Title */}
                                <td className="py-3 px-3.5">
                                  <span className="font-semibold text-gray-200">{inst.title}</span>
                                  {inst.notes && (
                                    <p className="text-[10px] text-gray-500 mt-0.5">{inst.notes}</p>
                                  )}
                                </td>

                                {/* Amount */}
                                <td className="py-3 px-3.5 font-extrabold text-white font-mono">
                                  {formatBRL(inst.amount)}
                                </td>

                                {/* Due Date */}
                                <td className="py-3 px-3.5 font-medium">
                                  <span
                                    className={
                                      st.status === "vencido"
                                        ? "text-rose-400 font-bold"
                                        : "text-gray-300"
                                    }
                                  >
                                    {inst.due_date
                                      ? new Date(inst.due_date).toLocaleDateString("pt-BR")
                                      : "Não definida"}
                                  </span>
                                </td>

                                {/* Paid At */}
                                <td className="py-3 px-3.5">
                                  {inst.paid_at ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                      <CheckCircle2 size={12} />
                                      <span>
                                        {new Date(inst.paid_at).toLocaleDateString("pt-BR")}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 italic text-[11px]">
                                      Pendente
                                    </span>
                                  )}
                                </td>

                                {/* Payment Method */}
                                <td className="py-3 px-3.5">
                                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300">
                                    {getPaymentMethodLabel(inst.payment_method)}
                                  </span>
                                </td>

                                {/* Status Badge */}
                                <td className="py-3 px-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${st.badgeClass}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                                    <span>{st.label}</span>
                                  </span>
                                </td>

                                {/* Receipt */}
                                <td className="py-3 px-3.5">
                                  {inst.receipt_url ? (
                                    <a
                                      href={
                                        inst.receipt_url.startsWith("http")
                                          ? inst.receipt_url
                                          : undefined
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        if (!inst.receipt_url?.startsWith("http")) {
                                          e.preventDefault();
                                          alert(`Comprovante / Código:\n${inst.receipt_url}`);
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                      title={inst.receipt_url}
                                    >
                                      <FileText size={11} />
                                      <span className="max-w-[80px] truncate">
                                        {inst.receipt_url}
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="text-gray-600 text-[11px]">—</span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickPayInstallment(project.id, inst.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                        isPaid
                                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                                          : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                                      }`}
                                      title={
                                        isPaid
                                          ? "Reabrir parcela (Desmarcar Quitação)"
                                          : "Quitar parcela com 1 clique"
                                      }
                                    >
                                      <Check size={11} />
                                      <span>{isPaid ? "Reabrir" : "Quitar"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenInstallmentModal(project.id, inst)}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                      title="Editar Parcela"
                                    >
                                      <Edit2 size={12} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInstallment(project.id, inst.id)}
                                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                      title="Excluir Parcela"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "updates" && (
            <div className="space-y-6">
              {/* Header & Metrics */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      Timeline de Updates, Reuniões & Notas
                    </h2>
                    
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Registro cronológico unificado de alinhamentos, atas de reunião, notas de versão e comunicados aos clientes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenUpdateModal()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Plus size={16} />
                  <span>Novo Registro na Timeline</span>
                </button>
              </div>

              {/* Aggregated Metric Cards */}
              {(() => {
                const allUpdatesList: (ProjectUpdate & { projectTitle: string })[] = [];
                for (const proj of projects) {
                  const list = projectUpdates[proj.id] || generateDefaultProjectUpdates(proj);
                  for (const u of list) {
                    allUpdatesList.push({ ...u, projectTitle: proj.title });
                  }
                }

                // Sort by created_at desc
                allUpdatesList.sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                const totalReunioes = allUpdatesList.filter((u) => u.category === "reuniao").length;
                const totalVersoes = allUpdatesList.filter(
                  (u) => u.category === "versao" || u.category === "release"
                ).length;
                const totalComunicados = allUpdatesList.filter(
                  (u) => u.category === "comunicado" || u.category === "alert"
                ).length;

                return (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Total de Eventos
                        </span>
                        <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                          {allUpdatesList.length}
                        </p>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">Histórico de projetos</span>
                      </div>

                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users size={13} /> Reuniões & Pautas
                        </span>
                        <p className="text-xl sm:text-2xl font-extrabold text-blue-300 mt-1">
                          {totalReunioes}
                        </p>
                        <span className="text-[10px] text-blue-400/70 mt-0.5 block">Alinhamentos com cliente</span>
                      </div>

                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Rocket size={13} /> Versões & Releases
                        </span>
                        <p className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1">
                          {totalVersoes}
                        </p>
                        <span className="text-[10px] text-emerald-400/70 mt-0.5 block">Entregas e builds ativas</span>
                      </div>

                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Megaphone size={13} /> Comunicados Oficiais
                        </span>
                        <p className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1">
                          {totalComunicados}
                        </p>
                        <span className="text-[10px] text-amber-400/70 mt-0.5 block">Avisos e comunicados</span>
                      </div>
                    </div>

                    {/* Filter & Search Toolbar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Category Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { key: "all", label: "Todos os Tipos" },
                          { key: "reuniao", label: "Reuniões" },
                          { key: "versao", label: "Versões & Releases" },
                          { key: "comunicado", label: "Comunicados" },
                          { key: "milestone", label: "Marcos" },
                          { key: "update", label: "Geral" },
                        ].map((cat) => (
                          <button
                            key={cat.key}
                            onClick={() => setUpdateCategoryFilter(cat.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              updateCategoryFilter === cat.key
                                ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Project Filter & Search */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          value={updateProjectFilter}
                          onChange={(e) => setUpdateProjectFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="all">Todos os Projetos ({projects.length})</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>

                        <div className="relative min-w-[200px]">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                          />
                          <input
                            type="text"
                            value={updateSearchQuery}
                            onChange={(e) => setUpdateSearchQuery(e.target.value)}
                            placeholder="Buscar no histórico..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Timeline Feed */}
                    {(() => {
                      const filtered = allUpdatesList.filter((item) => {
                        if (
                          updateCategoryFilter !== "all" &&
                          item.category !== updateCategoryFilter &&
                          !(updateCategoryFilter === "versao" && item.category === "release") &&
                          !(updateCategoryFilter === "comunicado" && item.category === "alert")
                        ) {
                          return false;
                        }
                        if (updateProjectFilter !== "all" && item.project_id !== updateProjectFilter) {
                          return false;
                        }
                        if (updateSearchQuery) {
                          const q = updateSearchQuery.toLowerCase();
                          return (
                            item.title.toLowerCase().includes(q) ||
                            item.content.toLowerCase().includes(q) ||
                            (item.projectTitle && item.projectTitle.toLowerCase().includes(q)) ||
                            (item.version_tag && item.version_tag.toLowerCase().includes(q)) ||
                            (item.meeting_attendees && item.meeting_attendees.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-white/10 flex flex-col items-center justify-center">
                            <Send size={40} className="text-gray-600 mb-3" />
                            <h4 className="text-base font-bold text-white">Nenhum registro encontrado</h4>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">
                              Não há eventos cadastrados correspondentes aos filtros selecionados.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleOpenUpdateModal()}
                              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                            >
                              Publicar Primeiro Update
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 via-indigo-500 to-pink-500">
                          {filtered.map((item) => {
                            const typeInfo = getUpdateTypeInfo(item.category);
                            const IconComp = typeInfo.icon;
                            const targetProj = projects.find((p) => p.id === item.project_id);

                            return (
                              <div key={item.id} className="relative group">
                                {/* Dot Icon */}
                                <div
                                  className={`absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center text-white ring-4 ring-[#070913] shadow-lg ${typeInfo.colorText}`}
                                >
                                  <IconComp size={14} />
                                </div>

                                {/* Event Card */}
                                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/30 backdrop-blur-xl shadow-xl transition-all space-y-4">
                                  {/* Header Info */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (targetProj) {
                                            setSelectedProject(targetProj);
                                            setActiveTab("projects");
                                          }
                                        }}
                                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        title="Ver console do projeto"
                                      >
                                        <FolderKanban size={13} className="text-purple-400" />
                                        <span>{item.projectTitle}</span>
                                      </button>

                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.badgeClass}`}
                                      >
                                        {typeInfo.label}
                                      </span>

                                      {item.version_tag && (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                          <Tag size={10} />
                                          {item.version_tag}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-500" />
                                        {new Date(item.created_at).toLocaleString("pt-BR", {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        })}
                                      </span>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1 ml-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenUpdateModal(item.project_id, item)}
                                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                          title="Editar Registro"
                                        >
                                          <Edit2 size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteUpdate(item.project_id, item.id)}
                                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                          title="Remover Registro"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-base font-bold text-white leading-snug">
                                    {item.title}
                                  </h4>

                                  {/* Meeting Attendees if any */}
                                  {item.meeting_attendees && (
                                    <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
                                      <Users size={14} className="text-blue-400 shrink-0" />
                                      <span>
                                        <strong>Participantes:</strong> {item.meeting_attendees}
                                      </span>
                                    </div>
                                  )}

                                  {/* Rich Markdown Rendered Body */}
                                  <div className="pt-1">
                                    {renderRichMarkdown(item.content)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-gray-400" />
                <span>Configurações do Sistema</span>
              </h3>

              <div className="space-y-4 max-w-xl">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-white">Banco de Dados Supabase</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Conexão ativa com PostgreSQL e autenticação em tempo real.</p>
                  <span className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    ● Status: Online e Operacional
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-white">Notificações WhatsApp</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Mensagens de feedback e dúvidas do portal encaminhadas para o seu número.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal: Project Form (Create / Edit - ) */}
      <AnimatePresence>
        {projectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl my-8 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderKanban size={20} className="text-indigo-400" />
                    <span>{editingProject ? "Editar Projeto e Escopo" : "Cadastrar Novo Projeto"}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingProject
                      ? "Atualize as parametrizações, escopo, cliente vinculado ou status de desenvolvimento."
                      : "Defina o escopo, cliente associado, prazos e links de entrega do projeto."}
                  </p>
                </div>
                <button
                  onClick={() => setProjectModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                {/* Row 1: Title & Client Association */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Título do Projeto *
                    </label>
                    <input
                      type="text"
                      required
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      placeholder="Ex: App Delivery Mobile (iOS & Android)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Associação de Cliente *
                    </label>
                    <select
                      value={pClientId}
                      onChange={(e) => setPClientId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">Sem cliente vinculado (Projeto Interno/Admin)</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || "Sem Nome"} {c.company ? `(${c.company})` : ""} — {c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scope & Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Descrição & Escopo Detalhado do Projeto
                  </label>
                  <textarea
                    rows={4}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Descreva o escopo, requisitos funcionais, telas principais e entregáveis acordados com o cliente..."
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Project Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Status do Projeto (Ciclo de Vida) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { key: "planejamento", label: "Planejamento", desc: "Briefing & Escopo", activeClass: "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10", dot: "bg-amber-400" },
                      { key: "em_andamento", label: "Em Andamento", desc: "Design & Sprints", activeClass: "bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10", dot: "bg-blue-400" },
                      { key: "homologacao", label: "Homologação", desc: "Testes & Validação", activeClass: "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10", dot: "bg-cyan-400" },
                      { key: "concluido", label: "Concluído", desc: "Entrega Finalizada", activeClass: "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10", dot: "bg-emerald-400" },
                    ].map((st) => {
                      const isSelected =
                        pStatus === st.key ||
                        (st.key === "em_andamento" && (pStatus === "desenvolvimento" || pStatus === "design")) ||
                        (st.key === "homologacao" && pStatus === "testes");

                      return (
                        <button
                          type="button"
                          key={st.key}
                          onClick={() => setPStatus(st.key as ProjectStatus)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? st.activeClass
                              : "bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span className="text-xs font-bold text-white">{st.label}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{st.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tech Category and Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Categoria / Stack Tecnológica
                    </label>
                    <input
                      type="text"
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      placeholder="Ex: Mobile App (React Native)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {["Mobile React Native", "Web App Next.js", "SaaS / Painel", "API Node.js"].map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setPCategory(tag)}
                          className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Progresso Geral
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-400">{pProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={pProgress}
                      onChange={(e) => setPProgress(Number(e.target.value))}
                      className="w-full mt-3 accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>0% (Início)</span>
                      <span>50% (Sprints)</span>
                      <span>100% (Pronto)</span>
                    </div>
                  </div>
                </div>

                {/* Dates: Start Date & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={pStartDate}
                      onChange={(e) => setPStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Prazo Estimado de Entrega
                    </label>
                    <input
                      type="date"
                      value={pDeadline}
                      onChange={(e) => setPDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* External Scope Links */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Links de Acesso & Entregáveis
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="url"
                      value={pFigmaUrl}
                      onChange={(e) => setPFigmaUrl(e.target.value)}
                      placeholder="URL Figma UI/UX"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                    <input
                      type="url"
                      value={pPreviewUrl}
                      onChange={(e) => setPPreviewUrl(e.target.value)}
                      placeholder="URL Staging Web Preview"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-cyan-500"
                    />
                    <input
                      type="url"
                      value={pRepoUrl}
                      onChange={(e) => setPRepoUrl(e.target.value)}
                      placeholder="URL Repositório GitHub"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setProjectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    {editingProject ? "Salvar Alterações do Escopo" : "Cadastrar Projeto"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Client Registration & Edit */}
      <AnimatePresence>
        {clientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <User size={20} className="text-purple-400" />
                    <span>{editingClient ? "Editar Dados do Cliente" : "Cadastrar Novo Cliente"}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingClient
                      ? "Atualize as informações de contato, empresa ou status de acesso."
                      : "Gere o cadastro e as credenciais de acesso ao Portal do Cliente."}
                  </p>
                </div>
                <button
                  onClick={() => setClientModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {createdClientInfo ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Cliente Criado com Sucesso!
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      As credenciais de acesso abaixo já estão ativas para login no portal:
                    </p>
                    <div className="mt-3 p-3.5 rounded-xl bg-black/60 font-mono text-xs space-y-1.5 text-white border border-white/10">
                      <p><span className="text-gray-400">Nome:</span> <strong className="text-white">{createdClientInfo.name}</strong></p>
                      <p><span className="text-gray-400">E-mail:</span> <strong className="text-purple-300">{createdClientInfo.email}</strong></p>
                      <p><span className="text-gray-400">Senha Provisória:</span> <strong className="text-emerald-400">{createdClientInfo.pass}</strong></p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={copyWhatsAppMessage}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Mensagem Copiada!" : "Copiar Dados formatados para WhatsApp"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedClientInfo(null);
                      setClientModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveClient} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Nome Completo do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={cFullName}
                      onChange={(e) => setCFullName(e.target.value)}
                      placeholder="Ex: Roberto Andrade"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        E-mail de Login *
                      </label>
                      <input
                        type="email"
                        required
                        disabled={!!editingClient}
                        value={cEmail}
                        onChange={(e) => setCEmail(e.target.value)}
                        placeholder="cliente@empresa.com"
                        className={`w-full px-4 py-2.5 rounded-xl border text-white text-sm outline-none focus:border-purple-500 ${
                          editingClient
                            ? "bg-white/5 border-white/5 text-gray-400 cursor-not-allowed"
                            : "bg-black/40 border border-white/10"
                        }`}
                      />
                      {editingClient && (
                        <p className="text-[10px] text-gray-500 mt-1">E-mail fixo de autenticação</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={cPhone}
                        onChange={(e) => setCPhone(e.target.value)}
                        placeholder="Ex: (71) 99999-9999"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Empresa / Organização
                    </label>
                    <input
                      type="text"
                      value={cCompany}
                      onChange={(e) => setCCompany(e.target.value)}
                      placeholder="Ex: TechCorp Inovações LTDA"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Status de Acesso */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Status de Acesso ao Portal *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCStatus("active")}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          cStatus === "active"
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                            : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 size={16} className={cStatus === "active" ? "text-emerald-400" : "text-gray-500"} />
                        <div className="text-left">
                          <p className="text-xs font-bold">Ativo</p>
                          <p className="text-[10px] text-gray-400">Pode acessar o portal</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCStatus("blocked")}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          cStatus === "blocked"
                            ? "bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-500/10"
                            : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Lock size={16} className={cStatus === "blocked" ? "text-rose-400" : "text-gray-500"} />
                        <div className="text-left">
                          <p className="text-xs font-bold">Bloqueado</p>
                          <p className="text-[10px] text-gray-400">Acesso suspenso</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Senha Inicial (Only on creation) */}
                  {!editingClient && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Senha Inicial de Acesso *
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Sparkles size={12} />
                          <span>Gerar Senha Segura</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={cPassword}
                        onChange={(e) => setCPassword(e.target.value)}
                        placeholder="Ex: Cliente2026!MR"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500 font-mono"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Esta senha será exibida após o cadastro para envio imediato ao cliente via WhatsApp ou e-mail.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setClientModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={clientSaving}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {clientSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check size={14} />
                          <span>{editingClient ? "Salvar Alterações" : "Cadastrar e Gerar Credenciais"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Client Details & Associated Projects */}
      <AnimatePresence>
        {clientDetailsModalOpen && selectedClientDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
            >
              {/* Client Header */}
              <div className="flex items-start justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
                    {selectedClientDetails.full_name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-bold text-white">
                        {selectedClientDetails.full_name || "Cliente Sem Nome"}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          selectedClientDetails.status === "blocked"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {selectedClientDetails.status === "blocked" ? (
                          <>
                            <Lock size={11} /> Bloqueado
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={11} /> Ativo
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                      {selectedClientDetails.company ? (
                        <span className="flex items-center gap-1 text-purple-300 font-medium">
                          <Building2 size={13} />
                          {selectedClientDetails.company}
                        </span>
                      ) : (
                        <span className="text-gray-500">Pessoa Física / Sem empresa</span>
                      )}
                      <span>•</span>
                      <span>
                        Cliente desde{" "}
                        {selectedClientDetails.created_at
                          ? new Date(selectedClientDetails.created_at).toLocaleDateString("pt-BR")
                          : "Recente"}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setClientDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto space-y-6 pt-6 pr-1 custom-scrollbar">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      E-mail de Acesso
                    </span>
                    <p className="text-xs font-bold text-white break-all">{selectedClientDetails.email}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      WhatsApp / Telefone
                    </span>
                    {selectedClientDetails.phone ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-emerald-400">{selectedClientDetails.phone}</p>
                        <a
                          href={`https://wa.me/${selectedClientDetails.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                        >
                          <MessageCircle size={12} />
                          Conversar
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Não informado</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Status de Acesso
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${selectedClientDetails.status === "blocked" ? "text-rose-400" : "text-emerald-400"}`}>
                        {selectedClientDetails.status === "blocked" ? "Acesso Suspenso" : "Acesso Permitido"}
                      </span>
                      <button
                        onClick={() => handleToggleClientStatus(selectedClientDetails)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                      >
                        {selectedClientDetails.status === "blocked" ? "Desbloquear" : "Bloquear"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex items-center gap-2.5 flex-wrap p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <button
                    onClick={() => {
                      setClientDetailsModalOpen(false);
                      handleOpenClientModal(selectedClientDetails);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} className="text-purple-400" />
                    <span>Editar Dados</span>
                  </button>

                  <button
                    onClick={() => {
                      setClientDetailsModalOpen(false);
                      setPClientId(selectedClientDetails.id);
                      setEditingProject(null);
                      setPTitle("");
                      setPDescription("");
                      setPStatus("planejamento");
                      setPProgress(0);
                      setPStartDate(new Date().toISOString().split("T")[0]);
                      setPDeadline("");
                      setPPreviewUrl("");
                      setPFigmaUrl("");
                      setPRepoUrl("");
                      setPCategory("Mobile App (React Native)");
                      setProjectModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 border border-purple-500/30 transition-colors cursor-pointer"
                  >
                    <Plus size={13} className="text-purple-300" />
                    <span>Novo Projeto para este Cliente</span>
                  </button>

                  <button
                    onClick={() => handleToggleClientStatus(selectedClientDetails)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      selectedClientDetails.status === "blocked"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                    }`}
                  >
                    {selectedClientDetails.status === "blocked" ? (
                      <>
                        <Unlock size={13} />
                        <span>Desbloquear Acesso</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Bloquear Acesso</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteClient(selectedClientDetails.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/20 transition-colors cursor-pointer ml-auto"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                </div>

                {/* Section: Associated Projects */}
                <div>
                  {(() => {
                    const clientProjects = projects.filter((p) => p.client_id === selectedClientDetails.id);

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <FolderKanban size={16} className="text-purple-400" />
                            <span>Projetos Associados a este Cliente ({clientProjects.length})</span>
                          </h4>

                          <button
                            onClick={() => {
                              setClientDetailsModalOpen(false);
                              setPClientId(selectedClientDetails.id);
                              handleOpenProjectModal();
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Adicionar Projeto</span>
                          </button>
                        </div>

                        {clientProjects.length === 0 ? (
                          <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <FolderKanban size={32} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-xs text-gray-400">
                              Nenhum projeto vinculado a este cliente até o momento.
                            </p>
                            <button
                              onClick={() => {
                                setClientDetailsModalOpen(false);
                                setPClientId(selectedClientDetails.id);
                                handleOpenProjectModal();
                              }}
                              className="mt-3 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/30 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>Vincular Primeiro Projeto</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {clientProjects.map((p) => (
                              <div
                                key={p.id}
                                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                      {p.title}
                                    </h5>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                      {p.status}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                                    {p.description || "Sem descrição informada."}
                                  </p>

                                  {/* Progress bar */}
                                  <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                                      <span>Progresso</span>
                                      <span className="text-purple-300">{p.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                        style={{ width: `${p.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Project Links & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    {p.preview_url && (
                                      <a
                                        href={p.preview_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-indigo-300 transition-colors"
                                        title="Abrir Preview"
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    )}
                                    {p.figma_url && (
                                      <a
                                        href={p.figma_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-pink-300 transition-colors"
                                        title="Abrir Figma"
                                      >
                                        <Palette size={13} />
                                      </a>
                                    )}
                                    {p.repo_url && (
                                      <a
                                        href={p.repo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Repositório"
                                      >
                                        <FolderGit2 size={13} />
                                      </a>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => {
                                      setClientDetailsModalOpen(false);
                                      setSelectedProject(p);
                                      setActiveTab("projects");
                                    }}
                                    className="text-purple-400 hover:text-purple-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Ver no Dashboard</span>
                                    <ChevronRight size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setClientDetailsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Milestone & Stage Add/Edit */}
      <AnimatePresence>
        {milestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>{editingMilestone ? "Editar Marco / Tarefa" : "Novo Marco de Entrega"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMilestoneModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMilestone} className="space-y-4">
                {/* Título do Marco */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Título da Tarefa / Marco *
                  </label>
                  <input
                    type="text"
                    required
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Ex: Wireframes das Telas Principais & Fluxo do Usuário"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Etapa / Sprint & Peso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Etapa / Sprint *
                    </label>
                    <select
                      value={mStage}
                      onChange={(e) => setMStage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                    >
                      {PROJECT_STAGES.map((stg) => (
                        <option key={stg} value={stg} className="bg-slate-900 text-white">
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Peso no Cálculo (1x a 5x)
                    </label>
                    <select
                      value={mWeight}
                      onChange={(e) => setMWeight(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                    >
                      <option value={1} className="bg-slate-900">Peso 1x (Padrão)</option>
                      <option value={2} className="bg-slate-900">Peso 2x (Importante)</option>
                      <option value={3} className="bg-slate-900">Peso 3x (Crítico / Núcleo)</option>
                      <option value={4} className="bg-slate-900">Peso 4x (Alta Complexidade)</option>
                      <option value={5} className="bg-slate-900">Peso 5x (Entrega Maior)</option>
                    </select>
                  </div>
                </div>

                {/* Status do Marco */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Status do Marco
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMStatus("pending");
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mStatus === "pending"
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md"
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Clock size={13} />
                      <span>Pendente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMStatus("in_review");
                        if (mProgress === 0) setMProgress(75);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mStatus === "in_review"
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-md"
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Eye size={13} />
                      <span>Homologação</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMStatus("approved");
                        setMProgress(100);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        mStatus === "approved"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md"
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>Aprovado</span>
                    </button>
                  </div>
                </div>

                {/* Progresso Individual (0 a 100%) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300 uppercase">
                      Progresso Individual da Tarefa
                    </label>
                    <span className="text-xs font-bold text-indigo-400">
                      {mStatus === "approved" ? 100 : mProgress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={mStatus === "approved" ? 100 : mProgress}
                    disabled={mStatus === "approved"}
                    onChange={(e) => setMProgress(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                    <span>0% (Não iniciado)</span>
                    <span>50% (Em dev)</span>
                    <span>100% (Concluído)</span>
                  </div>
                </div>

                {/* Descrição & Entregáveis */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Descrição dos Entregáveis
                  </label>
                  <input
                    type="text"
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    placeholder="Ex: Telas de login, feed e perfil exportadas no Figma..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Data Prevista */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Data Prevista de Conclusão
                  </label>
                  <input
                    type="date"
                    value={mDueDate}
                    onChange={(e) => setMDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Botoes */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setMilestoneModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 cursor-pointer"
                  >
                    {editingMilestone ? "Atualizar Marco" : "Salvar Marco"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Timeline Update & Notes Form */}
      <AnimatePresence>
        {updateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 sm:p-7 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Send size={18} className="text-purple-400" />
                    <span>{editingUpdate ? "Editar Registro na Timeline" : "Novo Registro na Timeline"}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Publique alinhamentos de reunião, comunicados oficiais ou notas de versão visíveis ao cliente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveUpdate} className="space-y-4">
                {/* Project Selector (if multiple projects) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Projeto Associado *
                  </label>
                  <select
                    value={targetProjectIdForUpdate}
                    onChange={(e) => setTargetProjectIdForUpdate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Tipo de Evento / Nota *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: "reuniao", label: "Reunião de Alinhamento", icon: Users, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
                      { key: "versao", label: "Atualização de Versão", icon: Rocket, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
                      { key: "comunicado", label: "Comunicado Oficial", icon: Megaphone, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
                      { key: "milestone", label: "Marco Concluído", icon: CheckCircle2, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
                      { key: "update", label: "Atualização Geral", icon: Send, color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
                    ].map((t) => {
                      const IconC = t.icon;
                      const isSelected = uCategory === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setUCategory(t.key as UpdateType)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? `${t.color} border shadow-md`
                              : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          <IconC size={14} className={isSelected ? "" : "opacity-60"} />
                          <span className="text-xs font-bold leading-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Título do Evento / Resumo *
                  </label>
                  <input
                    type="text"
                    required
                    value={uTitle}
                    onChange={(e) => setUTitle(e.target.value)}
                    placeholder={
                      uCategory === "reuniao"
                        ? "Ex: Reunião de Alinhamento de UI/UX e Aprovação do Protótipo"
                        : uCategory === "versao"
                        ? "Ex: Release Beta v1.2.0 - Módulo de Autenticação e Notificações"
                        : "Ex: Comunicado: Início da Sprint de Desenvolvimento Front-end"
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                {/* Conditional Fields based on Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uCategory === "versao" ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                        Tag de Versão (ex: v1.2.0)
                      </label>
                      <input
                        type="text"
                        value={uVersionTag}
                        onChange={(e) => setUVersionTag(e.target.value)}
                        placeholder="Ex: v1.2.0 ou Build 48"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono outline-none focus:border-purple-500"
                      />
                    </div>
                  ) : uCategory === "reuniao" ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                        Participantes da Reunião
                      </label>
                      <input
                        type="text"
                        value={uAttendees}
                        onChange={(e) => setUAttendees(e.target.value)}
                        placeholder="Ex: Maira Reis, Cliente, Equipe Design"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Data e Hora da Publicação *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={uCreatedAt}
                      onChange={(e) => setUCreatedAt(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Rich Markdown Editor & Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-gray-300 uppercase">
                      Conteúdo Rico / Formatação Markdown *
                    </label>

                    {/* Toolbar & Preview Toggle */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUContent((prev) => prev + "\n**Texto em destaque**")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 flex items-center gap-1"
                        title="Negrito (**texto**)"
                      >
                        <Bold size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUContent((prev) => prev + "\n- Item de alinhamento")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 flex items-center gap-1"
                        title="Tópico (- item)"
                      >
                        <List size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUContent((prev) => prev + "\n[x] Tarefa concluída\n[ ] Tarefa pendente")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 flex items-center gap-1"
                        title="Checklist ([x] item)"
                      >
                        <CheckSquare size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUContent((prev) => prev + "\n> Nota / Citação importante")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 flex items-center gap-1"
                        title="Citação (> texto)"
                      >
                        <Quote size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUContent((prev) => prev + "\n`codigo_ou_endpoint`")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold border border-white/10 flex items-center gap-1"
                        title="Código (`código`)"
                      >
                        <Code size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setUPreviewMode(!uPreviewMode)}
                        className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          uPreviewMode
                            ? "bg-purple-600 text-white border-purple-500"
                            : "bg-white/5 text-purple-300 border-purple-500/30 hover:bg-white/10"
                        }`}
                      >
                        {uPreviewMode ? "Voltar ao Editor" : "Ver Prévia"}
                      </button>
                    </div>
                  </div>

                  {uPreviewMode ? (
                    <div className="w-full min-h-[140px] max-h-[260px] overflow-y-auto p-4 rounded-2xl bg-black/50 border border-purple-500/30 text-white">
                      <span className="text-[10px] uppercase font-bold text-purple-400 block mb-2">
                        Prévia da Visualização do Cliente:
                      </span>
                      {uContent.trim() ? (
                        renderRichMarkdown(uContent)
                      ) : (
                        <p className="text-xs text-gray-500 italic">Digite algum texto no editor para visualizar a prévia.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      rows={5}
                      required
                      value={uContent}
                      onChange={(e) => setUContent(e.target.value)}
                      placeholder="Descreva as deliberações da reunião, changelog de versão ou comunicado oficial... Suporta formatação em tópicos (- ), negrito (**texto**), checklists ([x]) e citações (> )."
                      className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 resize-none font-sans leading-relaxed"
                    />
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setUpdateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 border border-purple-400/30 cursor-pointer"
                  >
                    {editingUpdate ? "Atualizar Evento" : "Publicar na Timeline"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal: Add / Edit Installment */}
      <AnimatePresence>
        {installmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span>{editingInstallment ? "Editar Parcela de Pagamento" : "Nova Parcela do Contrato"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setInstallmentModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveInstallment} className="space-y-4">
                {/* Título da Parcela */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Título / Identificação da Parcela *
                  </label>
                  <input
                    type="text"
                    required
                    value={instTitle}
                    onChange={(e) => setInstTitle(e.target.value)}
                    placeholder="Ex: Parcela 2/3 - Entrega Protótipo Figma"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Valor & Método */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Valor da Parcela (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={instAmount}
                      onChange={(e) => setInstAmount(e.target.value)}
                      placeholder="Ex: 3500.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Método de Pagamento *
                    </label>
                    <select
                      value={instMethod}
                      onChange={(e) => setInstMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="pix" className="bg-slate-900">Pix Instantâneo</option>
                      <option value="cartao" className="bg-slate-900">Cartão de Crédito</option>
                      <option value="boleto" className="bg-slate-900">Boleto Bancário</option>
                      <option value="transferencia" className="bg-slate-900">Transferência / TED</option>
                      <option value="cripto" className="bg-slate-900">Cripto / USDT</option>
                      <option value="dinheiro" className="bg-slate-900">Dinheiro em Espécie</option>
                      <option value="outro" className="bg-slate-900">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Vencimento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={instDueDate}
                    onChange={(e) => setInstDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status de Quitação */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className={instIsPaid ? "text-emerald-400" : "text-gray-500"} />
                      <span>Parcela já quitada (Paga)?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextPaid = !instIsPaid;
                        setInstIsPaid(nextPaid);
                        if (nextPaid && !instPaidAt) {
                          setInstPaidAt(new Date().toISOString().split("T")[0]);
                        }
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        instIsPaid
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                          : "bg-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {instIsPaid ? "Sim, Quitada" : "Não, Pendente"}
                    </button>
                  </div>

                  {instIsPaid && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                        Data Efetiva da Quitação
                      </label>
                      <input
                        type="date"
                        value={instPaidAt}
                        onChange={(e) => setInstPaidAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Comprovante Interno (Opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Comprovante Interno / Link / Código (Opcional)
                  </label>
                  <input
                    type="text"
                    value={instReceiptUrl}
                    onChange={(e) => setInstReceiptUrl(e.target.value)}
                    placeholder="Ex: https://drive.google.com/... ou AUT-PIX-98124"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Link de drive, código de autorização bancária ou número do documento.
                  </p>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Observações Adicionais
                  </label>
                  <input
                    type="text"
                    value={instNotes}
                    onChange={(e) => setInstNotes(e.target.value)}
                    placeholder="Ex: Aguardando compensação do boleto no banco..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setInstallmentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 cursor-pointer"
                  >
                    {editingInstallment ? "Atualizar Parcela" : "Salvar Parcela"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Total Contract Value */}
      <AnimatePresence>
        {contractValueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span>Definir Valor Total do Contrato</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setContractValueModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveContractValue} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Novo Valor Total do Contrato (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={contractValueInput}
                    onChange={(e) => setContractValueInput(e.target.value)}
                    placeholder="Ex: 15000.00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-mono outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Este valor servirá como base para o cálculo em tempo real do Saldo Restante e Taxa de Quitação.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setContractValueModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 cursor-pointer"
                  >
                    Atualizar Contrato
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Smart Split Installments Generator */}
      <AnimatePresence>
        {splitGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap size={18} className="text-purple-400" />
                  <span>Gerador Rápido de Parcelamento</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSplitGeneratorOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteSplitGenerator} className="space-y-4">
                <p className="text-xs text-gray-300">
                  Gere automaticamente o plano de parcelamento dividindo o valor total do contrato em datas mensais consecutivas:
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Número de Parcelas
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 6].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setSplitCount(n)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          splitCount === n
                            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                            : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {n === 1 ? "1x (À Vista)" : `${n}x`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Método de Pagamento Padrão
                  </label>
                  <select
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="pix">Pix Instantâneo</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="transferencia">Transferência / TED</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                  ✨ A 1ª parcela será gerada com status <strong>Pago (Entrada)</strong> na data de hoje e as demais parcelas a cada 30 dias em status <strong>Em Aberto</strong>.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSplitGeneratorOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 border border-purple-400/30 cursor-pointer"
                  >
                    Gerar {splitCount}x Parcelas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Document Upload & Edit */}
      <AnimatePresence>
        {docModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-rose-400" />
                  <span>{editingDocument ? "Editar Metadados do Documento" : "Upload de Documento (PDF)"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDocument} className="space-y-4">
                {/* Upload Zone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                    Arquivo PDF * (Máximo: 15MB)
                  </label>

                  <div className="border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-2xl p-5 text-center bg-black/30 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText size={20} />
                      </div>
                      {docFileName ? (
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-xs">{docFileName}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            ✅ {formatFileSize(docFileSize)} • Arquivo PDF validado
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-gray-300">
                            Clique ou arraste seu arquivo PDF aqui
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Suporta Contratos, Termos de Aceite, Propostas e Briefings (application/pdf)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {docFileError && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{docFileError}</span>
                    </div>
                  )}
                </div>

                {/* Título do Documento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Título do Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Ex: Contrato de Desenvolvimento de Software v1.2"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                  />
                </div>

                {/* Categoria & Visibilidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Categoria do Documento *
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="contrato" className="bg-slate-900">Contrato Principal</option>
                      <option value="proposta" className="bg-slate-900">Proposta Comercial</option>
                      <option value="termo_aceite" className="bg-slate-900">Termo de Aceite / Homologação</option>
                      <option value="briefing" className="bg-slate-900">Briefing Técnico / Requisitos</option>
                      <option value="nda" className="bg-slate-900">Acordo de Confidencialidade (NDA)</option>
                      <option value="recibo" className="bg-slate-900">Recibo Fiscal</option>
                      <option value="outro" className="bg-slate-900">Outro Documento</option>
                    </select>
                  </div>

                  {/* Visibility Setting */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Nível de Acesso *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setDocVisibility("client")}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          docVisibility === "client"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md"
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Eye size={12} />
                        <span>Cliente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocVisibility("internal")}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          docVisibility === "internal"
                            ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-md"
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Lock size={12} />
                        <span>Interno</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visibility explanation */}
                <div
                  className={`p-3 rounded-2xl border text-[11px] leading-relaxed ${
                    docVisibility === "client"
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                      : "bg-purple-950/20 border-purple-500/20 text-purple-300"
                  }`}
                >
                  {docVisibility === "client" ? (
                    <span>
                      👁️ <strong>Visível para o Cliente:</strong> Este documento ficará disponível para download e consulta no Portal do Cliente.
                    </span>
                  ) : (
                    <span>
                      🔒 <strong>Uso Interno:</strong> Este documento ficará protegido e restrito ao painel administrativo. O cliente <strong>não terá acesso</strong> a este arquivo.
                    </span>
                  )}
                </div>

                {/* Notas / Observações */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Notas Internas / Observações
                  </label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="Ex: Assinado em cartório digital / Versão final aprovada..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setDocModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 border border-rose-400/30 cursor-pointer"
                  >
                    {editingDocument ? "Salvar Alterações" : "Salvar Documento"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: PDF Viewer (Embedded Preview) */}
      <AnimatePresence>
        {pdfViewerModalOpen && viewingDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl h-[85vh] p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-md">{viewingDocument.title}</h3>
                    <p className="text-[11px] text-gray-400">
                      {viewingDocument.filename} • {viewingDocument.file_size_formatted} •{" "}
                      {viewingDocument.visibility === "client" ? "👁️ Visível ao Cliente" : "🔒 Uso Interno"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={viewingDocument.file_url !== "#" ? viewingDocument.file_url : undefined}
                    download={viewingDocument.filename}
                    onClick={(e) => {
                      if (viewingDocument.file_url === "#") {
                        e.preventDefault();
                        alert(`Download do arquivo simulado: ${viewingDocument.filename}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Download</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setPdfViewerModalOpen(false)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body: Embedded PDF or Preview Slate */}
              <div className="flex-1 bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                {viewingDocument.file_url && viewingDocument.file_url.startsWith("data:application/pdf") ? (
                  <iframe
                    src={viewingDocument.file_url}
                    className="w-full h-full rounded-xl"
                    title={viewingDocument.title}
                  />
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex flex-col items-center justify-center shadow-lg shadow-rose-900/20">
                      <FileText size={32} />
                      <span className="text-[9px] font-black uppercase">PDF</span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{viewingDocument.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{viewingDocument.filename}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs text-gray-300 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Categoria:</span>
                        <span className="font-semibold text-white">
                          {getDocumentCategoryInfo(viewingDocument.category).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span className="font-semibold text-white">{viewingDocument.file_size_formatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Visibilidade:</span>
                        <span
                          className={`font-semibold ${
                            viewingDocument.visibility === "client" ? "text-emerald-400" : "text-purple-400"
                          }`}
                        >
                          {viewingDocument.visibility === "client"
                            ? "Visível no Portal do Cliente"
                            : "Uso Interno Administrativo"}
                        </span>
                      </div>
                      {viewingDocument.notes && (
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-gray-500 block mb-0.5">Notas do Documento:</span>
                          <p className="text-gray-300 italic">{viewingDocument.notes}</p>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Visualizador seguro de documentos em conformidade com as diretrizes do portal.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ================= MODAL: CLIENT VISION / IMPERSONATION READ-ONLY ================= */}
      <AnimatePresence>
        {clientPreviewModalOpen && previewProject && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md overflow-hidden">
            {/* Top Impersonation Control Bar */}
            <div className="bg-[#0b0e1d] border-b border-purple-500/30 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xl">
              {/* Left: Mode & Client Identifier */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <ShieldAlert size={18} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Visão do Cliente (Impersonation Read-Only)
                    </span>
                    
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Visualizando:{" "}
                    <strong className="text-white">
                      {clients.find((c) => c.id === previewProject.client_id)?.full_name || "Cliente Não Vinculado"}
                    </strong>
                    {clients.find((c) => c.id === previewProject.client_id)?.company && (
                      <span className="text-purple-300">
                        {" "}
                        ({clients.find((c) => c.id === previewProject.client_id)?.company})
                      </span>
                    )}{" "}
                    • Projeto: <span className="text-indigo-300">{previewProject.title}</span>
                  </p>
                </div>
              </div>

              {/* Center: Device Viewport Switcher */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Visão Desktop / Tela Cheia"
                >
                  <Monitor size={14} />
                  <span className="hidden sm:inline">Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === "tablet"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Visão Tablet (768px)"
                >
                  <Tablet size={14} />
                  <span className="hidden sm:inline">Tablet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Visão Mobile (400px)"
                >
                  <Smartphone size={14} />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Right: Open in Portal Tab & Close Button */}
              <div className="flex items-center gap-2">
                <a
                  href={`/portal?impersonateProjectId=${previewProject.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Abrir a rota real /portal com impersonação em nova aba"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Abrir em Nova Aba</span>
                </a>

                <button
                  type="button"
                  onClick={() => setClientPreviewModalOpen(false)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Fechar modo de visualização"
                >
                  <X size={15} />
                  <span>Sair da Visão</span>
                </button>
              </div>
            </div>

            {/* Read-Only Notice Bar */}
            <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-purple-950/60 border-b border-purple-500/20 px-4 py-1.5 text-center text-[11px] text-purple-200 flex items-center justify-center gap-2">
              <Lock size={12} className="text-purple-400" />
              <span>
                <strong>Modo Somente Leitura Ativo:</strong> Simulação exata dos elementos, documentos públicos e timeline autorizados para o cliente.
              </span>
            </div>

            {/* Viewport Frame Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#050711]">
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === "desktop"
                    ? "max-w-7xl"
                    : previewDevice === "tablet"
                    ? "max-w-3xl border-x border-white/10 px-2"
                    : "max-w-md border-x-4 border-y-4 border-slate-700/60 rounded-[36px] p-3 shadow-2xl bg-[#070913]"
                }`}
              >
                {/* Simulated Portal Content */}
                {(() => {
                  const client = clients.find((c) => c.id === previewProject.client_id);
                  const statusCfg = getStatusConfig(previewProject.status);
                  const clientMilestones = milestones.filter(
                    (m) => m.project_id === previewProject.id
                  );
                  const clientDocs = (
                    projectDocuments[previewProject.id] ||
                    generateDefaultProjectDocuments(previewProject)
                  ).filter((d) => d.visibility === "client");
                  const clientUpdatesList =
                    projectUpdates[previewProject.id] ||
                    generateDefaultProjectUpdates(previewProject);

                  const currentPhaseIndex =
                    previewProject.status === "planejamento"
                      ? 1
                      : previewProject.status === "design"
                      ? 2
                      : previewProject.status === "desenvolvimento" ||
                        previewProject.status === "em_andamento"
                      ? 3
                      : previewProject.status === "testes" ||
                        previewProject.status === "homologacao"
                      ? 4
                      : previewProject.status === "concluido"
                      ? 5
                      : 3;

                  return (
                    <div className="space-y-6 text-white pb-12">
                      {/* Simulated Client Navbar */}
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm leading-tight tracking-tight text-white block">
                            Portal do Cliente <span className="text-gradient">MR</span>
                          </span>
                          <span className="text-[10px] text-gray-400 hidden sm:inline">
                            • Maira Reis
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs">
                            {client?.full_name?.charAt(0) || "C"}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-semibold text-white block leading-tight">
                              {client?.full_name || "Cliente Autorizado"}
                            </span>
                            <span className="text-[9px] text-emerald-400">Acesso Concedido</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Grid: Left 8 cols, Right 4 cols */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column (8 cols) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                          {/* Card 1: Project Overview Hero */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                  {previewProject.category || "Desenvolvimento de Software"}
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                                  {previewProject.title}
                                </h1>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit ${statusCfg.badgeClass}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                                {statusCfg.label}
                              </span>
                            </div>

                            {previewProject.description && (
                              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                                {previewProject.description}
                              </p>
                            )}

                            {/* Progress bar */}
                            <div className="space-y-2 mb-6">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-300">Progresso Geral das Sprints</span>
                                <span className="text-indigo-400 font-mono text-sm">
                                  {previewProject.progress}% Concluído
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50"
                                  style={{ width: `${previewProject.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Key Stats Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5">
                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                  <Calendar size={11} className="text-indigo-400" /> Início
                                </span>
                                <p className="text-xs font-semibold text-white mt-1">
                                  {previewProject.start_date
                                    ? new Date(previewProject.start_date).toLocaleDateString("pt-BR")
                                    : "A definir"}
                                </p>
                              </div>

                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                  <Clock size={11} className="text-pink-400" /> Previsão
                                </span>
                                <p className="text-xs font-semibold text-white mt-1">
                                  {previewProject.deadline
                                    ? new Date(previewProject.deadline).toLocaleDateString("pt-BR")
                                    : "Em andamento"}
                                </p>
                              </div>

                              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                  <ShieldCheck size={11} className="text-emerald-400" /> Garantia
                                </span>
                                <p className="text-xs font-semibold text-emerald-300 mt-1">
                                  Inclusa (30 dias)
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Interactive Phase Stepper */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                              <Layers size={16} className="text-indigo-400" />
                              <span>Fases de Desenvolvimento</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                              {[
                                { step: 1, label: "Planejamento & Requisitos" },
                                { step: 2, label: "UI/UX & Protótipo" },
                                { step: 3, label: "Desenvolvimento" },
                                { step: 4, label: "Testes & QA" },
                                { step: 5, label: "Lançamento & Suporte" },
                              ].map((phase) => {
                                const isCompleted = phase.step < currentPhaseIndex;
                                const isCurrent = phase.step === currentPhaseIndex;

                                return (
                                  <div
                                    key={phase.step}
                                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 ${
                                      isCurrent
                                        ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20"
                                        : isCompleted
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                        : "bg-white/[0.02] border-white/5 text-gray-500"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                          isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : isCurrent
                                            ? "bg-indigo-500 text-white animate-pulse"
                                            : "bg-white/10 text-gray-400"
                                        }`}
                                      >
                                        {isCompleted ? <Check size={10} /> : phase.step}
                                      </span>
                                      {isCurrent && (
                                        <span className="text-[8px] font-bold uppercase text-indigo-300 bg-indigo-500/20 px-1 py-0.5 rounded">
                                          Atual
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-[11px] font-bold leading-tight ${
                                        isCurrent
                                          ? "text-white"
                                          : isCompleted
                                          ? "text-emerald-300"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {phase.label}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Card: Módulo Financeiro do Cliente */}
                          {(() => {
                            const pFin = projectFinances[previewProject.id] || generateDefaultProjectFinances(previewProject);
                            const finSummary = calculateFinancialSummary(pFin);
                            const installments = pFin.installments || [];

                            return (
                              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                      <DollarSign size={16} className="text-emerald-400" />
                                      <span>Extrato & Quitação do Contrato (Somente Leitura)</span>
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      Visão de quitação consolidada disponibilizada para o cliente.
                                    </p>
                                  </div>
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                                    {finSummary.percentPaid}% Quitado
                                  </span>
                                </div>

                                {/* 3 KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Contratado</span>
                                    <p className="text-lg font-black text-white font-mono mt-1">{formatBRL(finSummary.contractValue)}</p>
                                  </div>
                                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                                    <span className="text-[10px] uppercase font-bold text-emerald-400">Valor Já Pago</span>
                                    <p className="text-lg font-black text-emerald-400 font-mono mt-1">{formatBRL(finSummary.totalPaid)}</p>
                                  </div>
                                  <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-purple-300">Saldo Restante</span>
                                    <p className="text-lg font-black text-purple-300 font-mono mt-1">{formatBRL(finSummary.remainingBalance)}</p>
                                  </div>
                                </div>

                                {/* Table Extrato */}
                                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/30">
                                  <table className="w-full text-left text-[11px]">
                                    <thead>
                                      <tr className="border-b border-white/10 text-gray-400 uppercase font-bold bg-white/[0.02]">
                                        <th className="py-2 px-3">Parcela</th>
                                        <th className="py-2 px-3">Valor</th>
                                        <th className="py-2 px-3">Vencimento</th>
                                        <th className="py-2 px-3">Status</th>
                                        <th className="py-2 px-3">Confirmação</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {installments.map((inst) => {
                                        const st = getInstallmentStatus(inst);
                                        return (
                                          <tr key={inst.id} className="hover:bg-white/[0.02]">
                                            <td className="py-2.5 px-3 font-semibold text-white">#{inst.installment_number} - {inst.title}</td>
                                            <td className="py-2.5 px-3 font-mono font-bold text-white">{formatBRL(inst.amount)}</td>
                                            <td className="py-2.5 px-3 text-gray-300">{inst.due_date ? new Date(inst.due_date).toLocaleDateString("pt-BR") : "-"}</td>
                                            <td className="py-2.5 px-3">
                                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${st.badgeClass}`}>
                                                {st.label}
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-emerald-400">
                                              {inst.paid_at ? `Quitado em ${new Date(inst.paid_at).toLocaleDateString("pt-BR")}` : <span className="text-gray-500">Aguardando quitação</span>}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Card 3: Milestones & Deliverables */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>Entregas & Marcos Concluídos</span>
                              </h3>
                              <span className="text-xs text-gray-400">
                                {clientMilestones.filter((m) => m.completed).length} de{" "}
                                {clientMilestones.length} concluídos
                              </span>
                            </div>

                            {clientMilestones.length === 0 ? (
                              <p className="text-xs text-gray-400 py-3 text-center">
                                Marcos em processo de definição pela equipe.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {clientMilestones.map((m) => {
                                  const pm = parseMilestone(m);
                                  return (
                                    <div
                                      key={m.id}
                                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                        pm.completed
                                          ? "bg-emerald-500/[0.04] border-emerald-500/20"
                                          : "bg-white/[0.02] border-white/5"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <div
                                          className={`w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                                            pm.completed
                                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                              : "bg-white/5 text-gray-500 border border-white/10"
                                          }`}
                                        >
                                          {pm.completed ? <Check size={12} /> : <Clock size={10} />}
                                        </div>
                                        <div>
                                          <p
                                            className={`text-xs font-semibold ${
                                              pm.completed ? "text-white line-through text-gray-300" : "text-gray-200"
                                            }`}
                                          >
                                            {m.title}
                                          </p>
                                          {pm.description && (
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                              {pm.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {m.due_date && (
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                          {new Date(m.due_date).toLocaleDateString("pt-BR")}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Card 4: Timeline de Updates e Notas */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <div className="flex items-center justify-between mb-5">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400" />
                                <span>Timeline de Alinhamentos & Notas de Versão</span>
                              </h3>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                                {clientUpdatesList.length} registros
                              </span>
                            </div>

                            <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 via-purple-500 to-pink-500">
                              {clientUpdatesList.map((update) => {
                                const typeInfo = getUpdateTypeInfo(update.category);
                                const TypeIcon = typeInfo.icon;
                                const dateObj = new Date(update.created_at);
                                const formattedDate = !isNaN(dateObj.getTime())
                                  ? dateObj.toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "short",
                                    }) +
                                    " às " +
                                    dateObj.toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "";

                                return (
                                  <div key={update.id} className="relative">
                                    <div
                                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${typeInfo.dotClass} ring-4 ring-[#070913]`}
                                    />
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${typeInfo.badgeClass}`}
                                          >
                                            <TypeIcon size={10} />
                                            <span>{typeInfo.label}</span>
                                          </span>
                                          {update.version_tag && (
                                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                                              <Tag size={9} />
                                              {update.version_tag}
                                            </span>
                                          )}
                                          {update.meeting_attendees && (
                                            <span className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                              <Users size={9} className="text-indigo-400" />
                                              {update.meeting_attendees}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-gray-400">{formattedDate}</span>
                                      </div>

                                      <h4 className="text-xs sm:text-sm font-bold text-white">
                                        {update.title}
                                      </h4>

                                      <div className="pt-1 border-t border-white/5 text-xs text-gray-300">
                                        {renderRichMarkdown(update.content)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Card 5: Contratos & Documentos */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileText size={16} className="text-pink-400" />
                                <span>Contratos & Documentos Oficiais (PDF)</span>
                              </h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                                {clientDocs.length} arquivos disponíveis
                              </span>
                            </div>

                            {clientDocs.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-4">
                                Nenhum documento público anexado a este projeto ainda.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {clientDocs.map((doc) => {
                                  const catInfo = getDocumentCategoryInfo(doc.category);
                                  return (
                                    <div
                                      key={doc.id}
                                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between gap-2"
                                    >
                                      <div>
                                        <div className="flex items-start justify-between gap-1 mb-1.5">
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catInfo.badgeClass}`}
                                          >
                                            {catInfo.label}
                                          </span>
                                          <span className="text-[9px] text-gray-400 font-mono">
                                            {doc.file_size_formatted}
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-white line-clamp-2">
                                          {doc.title}
                                        </p>
                                      </div>

                                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] text-gray-500">
                                          {new Date(doc.uploaded_at).toLocaleDateString("pt-BR")}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setViewingDocument(doc);
                                            setPdfViewerModalOpen(true);
                                          }}
                                          className="text-[10px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Eye size={11} />
                                          <span>Visualizar PDF</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column (4 cols): Deliverables & Direct Contact */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                          {/* Deliverables Card */}
                          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                              <ExternalLink size={14} className="text-indigo-400" />
                              <span>Entregáveis & Acessos</span>
                            </h3>

                            <div className="space-y-2.5">
                              {previewProject.figma_url ? (
                                <a
                                  href={previewProject.figma_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 rounded-2xl bg-[#1e1b2e]/80 border border-purple-500/30 flex items-center justify-between text-white transition-all hover:border-purple-400"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                      <Palette size={16} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold">Protótipo Figma</p>
                                      <p className="text-[10px] text-gray-400">Design navegável</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-400" />
                                </a>
                              ) : (
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-gray-500">
                                  <Palette size={16} className="opacity-40" />
                                  <div>
                                    <p className="text-xs font-semibold">Protótipo Figma</p>
                                    <p className="text-[10px] text-gray-500">Liberado na fase de Design</p>
                                  </div>
                                </div>
                              )}

                              {previewProject.preview_url ? (
                                <a
                                  href={previewProject.preview_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 rounded-2xl bg-[#11262d]/80 border border-cyan-500/30 flex items-center justify-between text-white transition-all hover:border-cyan-400"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                                      <Globe size={16} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold">Ambiente Staging</p>
                                      <p className="text-[10px] text-gray-400">Testes online</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-400" />
                                </a>
                              ) : (
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-gray-500">
                                  <Globe size={16} className="opacity-40" />
                                  <div>
                                    <p className="text-xs font-semibold">Ambiente de Testes</p>
                                    <p className="text-[10px] text-gray-500">Liberado na fase de Testes</p>
                                  </div>
                                </div>
                              )}

                              {previewProject.repo_url && (
                                <a
                                  href={previewProject.repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 rounded-2xl bg-[#1a1c29]/80 border border-white/10 flex items-center justify-between text-white transition-all hover:border-white/20"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white/5 text-gray-300">
                                      <FolderGit2 size={16} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold">Repositório GitHub</p>
                                      <p className="text-[10px] text-gray-400">Código auditável</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-400" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Direct Contact Simulator */}
                          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                MR
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white">Maira Reis</h4>
                                <p className="text-[10px] text-gray-400">Desenvolvedora Responsável</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              Canal direto no WhatsApp para alinhamentos, dúvidas de escopo e aprovações rápidas.
                            </p>
                            <a
                              href="https://wa.me/553598030543"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageSquare size={13} />
                              <span>Simular Contato WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Link Create/Edit Modal */}
      <AnimatePresence>
        {quickLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Link2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingQuickLink ? "Editar Link Rápido" : "Cadastrar Novo Link Rápido"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Vincule um atalho externo ou ambiente ao portal do cliente.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickLinkModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveQuickLink} className="space-y-4">
                {/* Rótulo */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Rótulo do Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={qlLabel}
                    onChange={(e) => setQlLabel(e.target.value)}
                    placeholder="Ex: Protótipo Interativo Figma, Staging v1.2, Docs Swagger"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    URL de Destino *
                  </label>
                  <input
                    type="url"
                    required
                    value={qlUrl}
                    onChange={(e) => setQlUrl(e.target.value)}
                    placeholder="https://figma.com/file/... ou https://staging.meuapp.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>

                {/* Categoria & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Categoria / Tipo
                    </label>
                    <select
                      value={qlCategory}
                      onChange={(e) => setQlCategory(e.target.value as QuickLinkCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="figma">Protótipo (Figma)</option>
                      <option value="staging">Ambiente de Testes (Staging)</option>
                      <option value="docs">Documentação Técnica / Guias</option>
                      <option value="github">Repositório Git (GitHub)</option>
                      <option value="api">API / Swagger</option>
                      <option value="production">Aplicação em Produção</option>
                      <option value="outro">Outro Link Externo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Status de Visibilidade
                    </label>
                    <div className="flex items-center gap-2 h-[42px] px-3.5 rounded-xl bg-black/40 border border-white/10">
                      <input
                        type="checkbox"
                        id="qlIsActive"
                        checked={qlIsActive}
                        onChange={(e) => setQlIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="qlIsActive" className="text-xs text-white cursor-pointer select-none">
                        {qlIsActive ? "Ativo (Visível no Portal)" : "Oculto (Rascunho)"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Descrição Opcional */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Descrição Auxiliar (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={qlDescription}
                    onChange={(e) => setQlDescription(e.target.value)}
                    placeholder="Instruções para o cliente, credenciais de teste ou escopo do ambiente..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setQuickLinkModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>{editingQuickLink ? "Salvar Alterações" : "Cadastrar Link"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transactional Email Toast Notification */}
      <AnimatePresence>
        {emailToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 text-white ${
              emailToast.type === "payment"
                ? "bg-emerald-950/95 border-emerald-500/40 shadow-emerald-950/50"
                : "bg-indigo-950/95 border-indigo-500/40 shadow-indigo-950/50"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                emailToast.type === "payment"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              <Mail size={18} />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-white">Disparo Transacional</p>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                  Assíncrono
                </span>
              </div>
              <p className="mt-1 text-gray-200 leading-relaxed">{emailToast.message}</p>
            </div>
            <button
              onClick={() => setEmailToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatched Email Logs Modal */}
      <AnimatePresence>
        {emailLogsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Histórico de E-mails Transacionais</span>
                      
                    </h3>
                    <p className="text-xs text-gray-400">
                      Disparos automáticos em eventos críticos (Entregas e Quitações)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEmailLogsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {emailLogs.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    <Mail size={32} className="mx-auto mb-2 text-gray-600" />
                    <p>Nenhum e-mail transacional disparado nesta sessão ainda.</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Os e-mails são disparados automaticamente ao concluir uma entrega ou dar baixa manual em parcelas.
                    </p>
                  </div>
                ) : (
                  emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              log.type === "payment_confirmed"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                            }`}
                          >
                            {log.type === "payment_confirmed"
                              ? "💳 Pagamento Quitado"
                              : "🚀 Entrega Concluída"}
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-xs">
                            {log.projectName}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-gray-400">
                          {new Date(log.sentAt).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 font-medium">
                        <strong>Assunto:</strong> {log.subject}
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-white/5">
                        <span>
                          Destinatário: <strong className="text-white">{log.recipientName}</strong> &lt;{log.recipientEmail}&gt;
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Disparado Assincronamente</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Gatilhos ativos: Conclusão de Entrega & Baixa de Pagamento</span>
                <button
                  onClick={() => setEmailLogsModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
