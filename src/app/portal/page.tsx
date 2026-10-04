"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Palette,
  Globe,
  MessageSquare,
  LogOut,
  Sparkles,
  AlertCircle,
  Calendar,
  Layers,
  LayoutDashboard,
  ChevronRight,
  Send,
  FileText,
  User,
  ShieldCheck,
  Check,
  RefreshCw,
  Bell,
  Code2,
  FolderGit2,
  Download,
  Eye,
  FileCheck,
  Lock,
  FileCode,
  X,
  Search,
  Rocket,
  Megaphone,
  CheckSquare,
  Tag,
  Quote,
  Code,
  Users,
  ShieldAlert,
  DollarSign,
  CreditCard,
  Receipt,
  Coins,
  Shield,
  HelpCircle,
  Target,
  ListTodo,
  History,
  CheckCheck,
  PlayCircle,
  Zap,
  ArrowRight,
  Hourglass,
  BookOpen,
  Terminal,
  Link2,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Mail,
  Headphones,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  ReceiptData,
  DEFAULT_AGENCY_DATA,
  openReceiptInNewWindow,
  downloadReceiptDocument,
  numberToBRLWords,
} from "@/lib/receiptGenerator";

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

export const formatDateBR = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const cleanStr = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [year, month, day] = cleanStr.split("-");
    return `${day}/${month}/${year}`;
  }
  if (cleanStr.includes("T")) {
    const datePart = cleanStr.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    }
  }
  try {
    const d = new Date(cleanStr.includes("T") ? cleanStr : `${cleanStr}T12:00:00`);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("pt-BR");
    }
  } catch {}
  return cleanStr;
};

export const getInstallmentStatus = (inst: ProjectInstallment) => {
  if (inst.paid_at) {
    return {
      status: "pago" as const,
      label: "Pago",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      dotClass: "bg-emerald-400 ring-emerald-500/30",
    };
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const dueStr = inst.due_date ? inst.due_date.split("T")[0] : "";
  if (dueStr && dueStr < todayStr) {
    return {
      status: "vencido" as const,
      label: "Vencido",
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      dotClass: "bg-rose-400 ring-rose-500/30",
    };
  }

  if (dueStr) {
    const [dYear, dMonth, dDay] = dueStr.split("-").map(Number);
    const dueDate = new Date(dYear, dMonth - 1, dDay, 12, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      return {
        status: "em_dia" as const,
        label: "Em dia (Vence em breve)",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dotClass: "bg-amber-400 ring-amber-500/30",
      };
    }
  }

  return {
    status: "pendente" as const,
    label: "Pendente",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dotClass: "bg-blue-400 ring-blue-500/30",
  };
};

export const calculateFinancialSummary = (financialData?: ProjectFinancialData | null) => {
  const installments = financialData?.installments || [];
  const installmentsSum = installments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const contractValue = installments.length > 0 ? installmentsSum : (financialData?.total_contract_value || 0);

  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let totalDueSoon = 0;

  for (const inst of installments) {
    const st = getInstallmentStatus(inst);
    const amt = Number(inst.amount) || 0;
    if (st.status === "pago") {
      totalPaid += amt;
    } else if (st.status === "vencido") {
      totalOverdue += amt;
    } else if (st.status === "em_dia") {
      totalDueSoon += amt;
      totalPending += amt;
    } else {
      totalPending += amt;
    }
  }

  const remainingBalance = Math.max(0, contractValue - totalPaid);
  const percentPaid = contractValue > 0 ? Math.min(100, Math.round((totalPaid / contractValue) * 100)) : 0;
  const overdueCount = installments.filter((i) => getInstallmentStatus(i).status === "vencido").length;
  const dueSoonCount = installments.filter((i) => getInstallmentStatus(i).status === "em_dia").length;
  const pendingCount = installments.filter((i) => {
    const st = getInstallmentStatus(i).status;
    return st === "pendente" || st === "em_dia";
  }).length;

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
    overdueCount,
    dueSoonCount,
    pendingCount,
  };
};

export const generateDefaultProjectFinances = (project: Project): ProjectFinancialData => {
  return {
    project_id: project.id,
    total_contract_value: 0,
    notes: "",
    installments: [],
  };
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
        icon: BookOpen,
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
        icon: Terminal,
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
  const links: ProjectQuickLink[] = [];
  if (project.figma_url) {
    links.push({
      id: `${project.id}-link-figma`,
      project_id: project.id,
      label: "Protótipo Figma",
      url: project.figma_url,
      category: "figma",
      description: "Protótipo e Design UI/UX",
      is_active: true,
    });
  }
  if (project.preview_url) {
    links.push({
      id: `${project.id}-link-staging`,
      project_id: project.id,
      label: "Ambiente Staging / Preview",
      url: project.preview_url,
      category: "staging",
      description: "Acesse a versão de homologação online",
      is_active: true,
    });
  }
  if (project.repo_url) {
    links.push({
      id: `${project.id}-link-repo`,
      project_id: project.id,
      label: "Repositório GitHub",
      url: project.repo_url,
      category: "github",
      description: "Repositório do código-fonte",
      is_active: true,
    });
  }
  return links;
};

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

export const formatDateSafe = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  if (dateStr.length === 10 && dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
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
        label: "Termo de Aceite",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        colorText: "text-emerald-400",
      };
    case "briefing":
      return {
        label: "Briefing Técnico",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        colorText: "text-amber-400",
      };
    case "nda":
      return {
        label: "Acordo NDA",
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

export const generateDefaultProjectDocuments = (project: Project): ProjectDocument[] => [];

export interface MilestoneCheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order_index: number;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  stage?: string | null;
  deliverables?: string[] | null;
  priority?: "alta" | "media" | "critica" | "normal" | "baixa" | null;
  status?: "pending" | "in_progress" | "completed" | string;
  progress?: number;
}

export const parseMilestoneTasks = (m: Milestone | { description: string | null }): MilestoneCheckItem[] => {
  if (!m.description) return [];

  // 1. Modern [TASKS_JSON]...[/TASKS_JSON] tag
  const modernMatch = m.description.match(/\[TASKS_JSON\]([\s\S]*?)\[\/TASKS_JSON\]/);
  if (modernMatch && modernMatch[1]) {
    try {
      const parsed = JSON.parse(modernMatch[1].trim());
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, idx) => ({
            id: item.id || `task-${idx}-${Date.now()}`,
            text: typeof item === "string" ? item : (item.text || ""),
            completed: Boolean(item.completed),
          }))
          .filter((t) => t.text.trim().length > 0);
      }
    } catch (e) {
      console.error("Error parsing [TASKS_JSON] in portal:", e);
    }
  }

  // 2. Fallback to legacy [TASKS: [...]] tag
  const legacyMatch = m.description.match(/\[TASKS:\s*(\[[\s\S]*?\])\s*\]/);
  if (legacyMatch && legacyMatch[1]) {
    try {
      const parsed = JSON.parse(legacyMatch[1].trim());
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, idx) => ({
            id: item.id || `task-${idx}-${Date.now()}`,
            text: typeof item === "string" ? item : (item.text || ""),
            completed: Boolean(item.completed),
          }))
          .filter((t) => t.text.trim().length > 0);
      }
    } catch (e) {
      console.error("Error parsing legacy [TASKS] in portal:", e);
    }
  }

  return [];
};

export const getMilestoneCleanDescription = (m: Milestone | { description: string | null }): string => {
  if (!m.description) return "";
  let desc = m.description;
  desc = desc.replace(/\[TASKS_JSON\][\s\S]*?\[\/TASKS_JSON\]/g, "");
  desc = desc.replace(/\[TASKS:\s*\[[\s\S]*?\]\s*\]/g, "");
  desc = desc.replace(/\[TASKS:[^\]]*\]/g, "");
  desc = desc.replace(/\[STATUS:\s*[^\]]+\]/g, "");
  desc = desc.replace(/\[ETAPA:[^\]]+\]\n?/g, "");
  desc = desc.replace(/^[\]\s]+/, "");
  return desc.trim();
};

export const getMilestoneStatus = (m: Milestone): string => {
  if (m.completed || m.status === "completed") return "concluido";
  if (m.description) {
    const statusMatch = m.description.match(/\[STATUS:\s*([a-zA-Z_]+)\]/);
    if (statusMatch && statusMatch[1]) {
      const st = statusMatch[1].trim();
      if (["pendente", "em_andamento", "concluido"].includes(st)) return st;
    }
  }
  if (m.status === "in_progress") return "em_andamento";
  return "pendente";
};

export const getMilestoneProgress = (m: Milestone): number => {
  const tasks = parseMilestoneTasks(m);
  if (tasks.length > 0) {
    const completedCount = tasks.filter((t) => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }
  if (m.progress !== undefined && m.progress !== null) return m.progress;
  if (m.completed || getMilestoneStatus(m) === "concluido") return 100;
  return 0;
};

export const getMilestoneMonthKey = (dueDate?: string | null): string => {
  if (!dueDate) return "sem_data";
  try {
    const d = new Date(dueDate.includes("T") ? dueDate : `${dueDate}T12:00:00`);
    if (isNaN(d.getTime())) return "sem_data";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  } catch {
    return "sem_data";
  }
};

export const formatMonthKeyLabel = (monthKey: string): string => {
  if (monthKey === "sem_data") return "Sem prazo";
  const parts = monthKey.split("-");
  if (parts.length !== 2) return monthKey;
  const [yearStr, monthStr] = parts;
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mIndex = parseInt(monthStr, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${monthNames[mIndex]} ${yearStr}`;
  }
  return monthKey;
};

export interface TimelineProgressInfo {
  percent: number;
  label: string;
  detail: string;
  totalMonths: number;
  currentMonth: number;
}

export const calculateTimelineProgress = (
  startDate?: string | null,
  deadline?: string | null
): TimelineProgressInfo => {
  if (!startDate || !deadline) {
    return {
      percent: 0,
      label: "0% do Prazo",
      detail: "Cronograma e previsão em definição",
      totalMonths: 0,
      currentMonth: 0,
    };
  }

  const start = new Date(startDate);
  const end = new Date(deadline);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      percent: 0,
      label: "0% do Prazo",
      detail: "Datas do cronograma não preenchidas",
      totalMonths: 0,
      currentMonth: 0,
    };
  }

  const totalTime = end.getTime() - start.getTime();
  if (totalTime <= 0) {
    return {
      percent: 100,
      label: "100% do Prazo",
      detail: "Período estimado concluído",
      totalMonths: 1,
      currentMonth: 1,
    };
  }

  const totalMonths = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
  );

  const elapsed = now.getTime() - start.getTime();
  if (elapsed <= 0) {
    return {
      percent: 0,
      label: "0% Decorrido",
      detail: `Mês 1 de ${totalMonths} • Início em ${start.toLocaleDateString("pt-BR")}`,
      totalMonths,
      currentMonth: 1,
    };
  }

  if (now.getTime() >= end.getTime()) {
    return {
      percent: 100,
      label: "100% Decorrido",
      detail: `Mês ${totalMonths} de ${totalMonths} • Previsão atingida em ${end.toLocaleDateString("pt-BR")}`,
      totalMonths,
      currentMonth: totalMonths,
    };
  }

  const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalTime) * 100)));
  const currentMonth = Math.min(
    totalMonths,
    Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1)
  );

  return {
    percent,
    label: `${percent}% Decorrido`,
    detail: `Mês ${currentMonth} de ${totalMonths} (atualizado mensalmente)`,
    totalMonths,
    currentMonth,
  };
};

export interface SprintProgressInfo {
  percent: number;
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
  label: string;
  detail: string;
}

export const calculateSprintProgress = (milestonesList: Milestone[]): SprintProgressInfo => {
  if (!milestonesList || milestonesList.length === 0) {
    return {
      percent: 0,
      completedTasks: 0,
      totalTasks: 0,
      completedMilestones: 0,
      totalMilestones: 0,
      label: "0% Concluído",
      detail: "Nenhum check cadastrado nesta sprint",
    };
  }

  const allTasks = milestonesList.flatMap((m) => parseMilestoneTasks(m));
  const completedMilestones = milestonesList.filter(
    (m) => m.completed || getMilestoneStatus(m) === "concluido"
  ).length;

  if (allTasks.length > 0) {
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const percent = Math.round((completedTasks / allTasks.length) * 100);
    return {
      percent,
      completedTasks,
      totalTasks: allTasks.length,
      completedMilestones,
      totalMilestones: milestonesList.length,
      label: `${percent}% Concluído`,
      detail: `${completedTasks} de ${allTasks.length} checks finalizados na sprint`,
    };
  }

  const percent = Math.round((completedMilestones / milestonesList.length) * 100);
  return {
    percent,
    completedTasks: 0,
    totalTasks: 0,
    completedMilestones,
    totalMilestones: milestonesList.length,
    label: `${percent}% Concluído`,
    detail: `${completedMilestones} de ${milestonesList.length} entregas concluídas`,
  };
};

export const generateDefaultMilestones = (project: Project): Milestone[] => [];

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

export const generateDefaultProjectUpdates = (project: Project): ProjectUpdate[] => [];

// FAQ & Contact Widget Types & Constants
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "suporte" | "entregas" | "financeiro" | "reunioes";
  highlight?: string;
}

export const PORTAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "entregas",
    question: "Como solicitar um ajuste ou homologar uma entrega?",
    answer:
      "Na aba 'Linha do Tempo', identifique a entrega em andamento ou em homologação. Você encontrará os botões 'Aprovar Entrega' ou 'Solicitar Ajuste'. Ao preencher suas considerações, nossa equipe recebe uma notificação instantânea e inicia o tratamento em até 24h úteis.",
    highlight: "Processo 100% registrado no dossiê do projeto.",
  },
  {
    id: "faq-2",
    category: "suporte",
    question: "Quais são os horários e tempo médio de resposta do suporte?",
    answer:
      "Nosso atendimento operacional funciona de Segunda a Sexta-feira, das 09:00 às 18:00 (Horário de Brasília). Mensagens via WhatsApp possuem tempo médio de resposta inferior a 2 horas úteis. Para emergências fora do horário comercial, chamados críticos recebem triagem automática.",
    highlight: "Atendimento ágil e direto com a desenvolvedora responsável.",
  },
  {
    id: "faq-3",
    category: "financeiro",
    question: "Como emitir e baixar o recibo oficial de quitação das parcelas?",
    answer:
      "Acesse a aba 'Financeiro & Contrato' no topo da página. Ao lado de cada parcela com status 'Pago', clique no botão 'Baixar Recibo'. O sistema gera instantaneamente um documento padrão PDF A4 com dados fiscais, valor por extenso, termo irrevogável de quitação e chave de autenticação digital SHA-256.",
    highlight: "Emissão em tempo real com validade fiscal e jurídica.",
  },
  {
    id: "faq-4",
    category: "reunioes",
    question: "Como agendar uma reunião de alinhamento ou Sprint Review?",
    answer:
      "Você pode solicitar um alinhamento a qualquer momento através do nosso WhatsApp oficial de suporte ou clicando no botão 'Solicitar Reunião'. Nossas reuniões são realizadas via Google Meet com ata e resumo publicados automaticamente na sua Timeline de Updates.",
    highlight: "Sessões com demonstração em tela e ata registrada.",
  },
  {
    id: "faq-5",
    category: "entregas",
    question: "Como funciona a garantia e o suporte após o deploy em produção?",
    answer:
      "Todos os softwares e aplicações entregues contam com 30 dias corridos de garantia integral e gratuita para correção de qualquer instabilidade ou inconformidade. Além disso, disponibilizamos planos mensais de manutenção preventiva, atualizações de segurança e evolução contínua.",
    highlight: "Tranquilidade e sustentabilidade para a sua operação.",
  },
];

interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: "planejamento" | "design" | "desenvolvimento" | "testes" | "concluido" | "pausado";
  progress: number;
  start_date: string | null;
  deadline: string | null;
  preview_url: string | null;
  figma_url: string | null;
  repo_url: string | null;
  category: string | null;
  next_update_at?: string | null;
  countdown_released?: boolean;
  created_at: string;
}

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

export const getPortalStatusInfo = (status: string) => {
  switch (status) {
    case "planejamento":
      return {
        label: "Planejamento",
        sublabel: "Briefing & Definição de Escopo",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dotClass: "bg-amber-400 ring-amber-500/30",
        gradient: "from-amber-500 to-orange-500",
      };
    case "em_andamento":
    case "desenvolvimento":
    case "design":
      return {
        label: "Em Andamento",
        sublabel: "Desenvolvimento & Sprints Ativas",
        badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        dotClass: "bg-blue-400 ring-blue-500/30",
        gradient: "from-indigo-500 via-purple-500 to-pink-500",
      };
    case "homologacao":
    case "testes":
    case "pausado":
      return {
        label: "Aguardando Validação",
        sublabel: "Homologação & Testes com Cliente",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        dotClass: "bg-cyan-400 ring-cyan-500/30",
        gradient: "from-cyan-500 to-blue-500",
      };
    case "concluido":
      return {
        label: "Concluído",
        sublabel: "Entregue & Publicado",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        dotClass: "bg-emerald-400 ring-emerald-500/30",
        gradient: "from-emerald-500 to-teal-500",
      };
    default:
      return {
        label: "Em Andamento",
        sublabel: "Desenvolvimento Ativo",
        badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        dotClass: "bg-indigo-400 ring-indigo-500/30",
        gradient: "from-indigo-500 to-purple-500",
      };
  }
};

const statusMap = {
  planejamento: { label: "Planejamento", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  design: { label: "Em Andamento (UI/UX)", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  desenvolvimento: { label: "Em Andamento", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  testes: { label: "Aguardando Validação", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  homologacao: { label: "Aguardando Validação", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  concluido: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pausado: { label: "Aguardando Validação", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const PHASES = [
  { step: 1, label: "Planejamento & Requisitos" },
  { step: 2, label: "UI/UX & Protótipo" },
  { step: 3, label: "Desenvolvimento" },
  { step: 4, label: "Testes & QA" },
  { step: 5, label: "Lançamento & Suporte" },
];

function ClientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const impersonateProjectId = searchParams.get("impersonateProjectId") || searchParams.get("projectId");
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const isImpersonating = Boolean(
    impersonateProjectId || (profile?.role === "admin" && searchParams.get("preview") === "true")
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [selectedUpdateCategory, setSelectedUpdateCategory] = useState<string>("all");
  const [updateSearchQuery, setUpdateSearchQuery] = useState("");
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<ProjectDocument | null>(null);

  // Financial State Management
  const [financialData, setFinancialData] = useState<ProjectFinancialData | null>(null);
  const [financeStatusFilter, setFinanceStatusFilter] = useState<
    "all" | "pago" | "em_dia" | "pendente" | "vencido"
  >("all");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState<ReceiptData | null>(null);
  const [copiedReceiptAuth, setCopiedReceiptAuth] = useState(false);

  // Tab Menu Navigation State
  const [activeTab, setActiveTabState] = useState<
    "overview" | "milestones" | "financial" | "updates" | "documents" | "support"
  >("overview");

  const setActiveTab = (tab: "overview" | "milestones" | "financial" | "updates" | "documents" | "support") => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("portfolio_portal_active_tab_v1", tab);
        const u = new URL(window.location.href);
        if (u.searchParams.get("tab") !== tab) {
          u.searchParams.set("tab", tab);
          window.history.replaceState({}, "", u.toString());
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const savedTab = typeof window !== "undefined" ? (localStorage.getItem("portfolio_portal_active_tab_v1") as any) : null;
    const targetTab = tabParam || savedTab;
    if (
      targetTab &&
      ["overview", "milestones", "financial", "updates", "documents", "support"].includes(targetTab)
    ) {
      setActiveTabState(targetTab as any);
    }
  }, [searchParams]);

  // Public Billing & Pix Settings State
  const [portalIssuerSettings, setPortalIssuerSettings] = useState<{
    pixKeyType: string;
    pixKey: string;
    pixBeneficiary: string;
    bankName: string;
    bankAgency: string;
    bankAccount: string;
    companyName: string;
    documentNumber: string;
    email: string;
    phone: string;
  }>({
    pixKeyType: "cnpj",
    pixKey: "55.843.406/0001-28",
    pixBeneficiary: "Maira Reis",
    bankName: "C6",
    bankAgency: "0001",
    bankAccount: "",
    companyName: "Maira Reis - Desenvolvimento & UI/UX Design",
    documentNumber: "55.843.406/0001-28",
    email: "mairareis2017@gmail.com",
    phone: "553598030543",
  });

  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [pixPaymentModalOpen, setPixPaymentModalOpen] = useState(false);
  const [activePayingInstallment, setActivePayingInstallment] = useState<ProjectInstallment | null>(null);

  const handleCopyPixKey = (keyToCopy: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(keyToCopy);
      setCopiedPixKey(true);
      setTimeout(() => setCopiedPixKey(false), 2500);
    }
  };

  const handleOpenPixModal = (inst: ProjectInstallment) => {
    setActivePayingInstallment(inst);
    setPixPaymentModalOpen(true);
  };

  // Sync Pix & Billing Settings from Server API and LocalStorage in real time
  useEffect(() => {
    const fetchPortalSettings = async () => {
      try {
        const res = await fetch("/api/portal/settings", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.pixKey) {
            setPortalIssuerSettings((prev) => ({ ...prev, ...json }));
          }
        }
      } catch {}

      if (typeof window !== "undefined") {
        try {
          const localSettings = localStorage.getItem("portfolio_admin_issuer_settings_v1");
          if (localSettings) {
            const parsed = JSON.parse(localSettings);
            setPortalIssuerSettings((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    };

    fetchPortalSettings();

    const handleSettingsUpdate = (e: any) => {
      if (e?.detail) {
        setPortalIssuerSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener("portfolio_settings_updated", handleSettingsUpdate);
    window.addEventListener("storage", fetchPortalSettings);
    return () => {
      window.removeEventListener("portfolio_settings_updated", handleSettingsUpdate);
      window.removeEventListener("storage", fetchPortalSettings);
    };
  }, []);

  // Contact & FAQ Widget State
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [floatingSupportOpen, setFloatingSupportOpen] = useState(false);

  const handleCopyEmail = (emailStr: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(emailStr);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Helper to build dynamic receipt data for 
  const buildReceiptData = (inst: ProjectInstallment): ReceiptData => {
    const proj = selectedProject;
    const projectTitle = proj?.title || "Projeto Contratado";
    const projectId = proj?.id || "PROJ-01";
    const totalInstallments = financialData?.installments?.length || 3;
    const clientName = profile?.full_name || (user?.user_metadata as any)?.full_name || user?.email?.split("@")[0] || "Cliente Contratante";

    return {
      receiptNumber: `REC-${projectId.slice(0, 6).toUpperCase()}-${String(inst.installment_number).padStart(2, "0")}`,
      projectId: projectId,
      projectTitle: projectTitle,
      installmentNumber: inst.installment_number,
      totalInstallments: totalInstallments,
      installmentTitle: inst.title,
      amount: inst.amount,
      dueDate: inst.due_date,
      paidAt: inst.paid_at || new Date().toISOString(),
      paymentMethod: getPaymentMethodLabel(inst.payment_method),
      authCode: inst.receipt_url || `AUT-SHA256-${projectId.slice(0, 4).toUpperCase()}-${inst.id.slice(0, 8).toUpperCase()}`,
      notes: inst.notes || undefined,
      client: {
        name: clientName,
        email: user?.email || undefined,
        company: (profile as any)?.company_name || undefined,
        document: (profile as any)?.document || undefined,
      },
      agency: {
        name: portalIssuerSettings.pixBeneficiary || "Maira Reis",
        tradeName: portalIssuerSettings.companyName || "Maira Reis - Desenvolvimento & UI/UX Design",
        document: portalIssuerSettings.documentNumber || portalIssuerSettings.pixKey || "55.843.406/0001-28",
        email: portalIssuerSettings.email || "mairareis2017@gmail.com",
        phone: portalIssuerSettings.phone || "+55 (35) 9803-0543",
        city: "Pouso Alegre",
        state: "MG",
        role: "Engenheira de Software & UI/UX Designer",
      },
    };
  };

  const handleOpenReceiptModal = (inst: ProjectInstallment) => {
    const data = buildReceiptData(inst);
    setActiveReceiptData(data);
    setReceiptModalOpen(true);
  };

  const handleDirectPrintReceipt = (inst: ProjectInstallment, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const data = buildReceiptData(inst);
    openReceiptInNewWindow(data, true);
  };

  const handleCopyReceiptAuth = (authCode: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(authCode);
      setCopiedReceiptAuth(true);
      setTimeout(() => setCopiedReceiptAuth(false), 2000);
    }
  };

  // Deliverables & Timeline State
  const [deliverableTab, setDeliverableTab] = useState<"all" | "upcoming" | "current" | "history">("all");
  const [portalMilestoneMonthFilter, setPortalMilestoneMonthFilter] = useState<string>("all");
  const [milestoneSearchQuery, setMilestoneSearchQuery] = useState<string>("");
  const [milestoneViewMode, setMilestoneViewMode] = useState<"grid" | "timeline">("grid");
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  const getEnrichedProject = (p: Project): Project => {
    let nextUpdate = p.next_update_at;
    let countdownReleased = p.countdown_released;
    if (typeof window !== "undefined") {
      const directId = localStorage.getItem(`portfolio_project_next_update_${p.id}`);
      const directTitle = p.title ? localStorage.getItem(`portfolio_project_next_update_title_${p.title.toLowerCase().trim()}`) : null;
      if (directId) nextUpdate = directId;
      else if (directTitle) nextUpdate = directTitle;

      const directReleasedId = localStorage.getItem(`portfolio_project_countdown_released_${p.id}`);
      const directReleasedTitle = p.title ? localStorage.getItem(`portfolio_project_countdown_released_title_${p.title.toLowerCase().trim()}`) : null;
      if (directReleasedId !== null) countdownReleased = directReleasedId === "true";
      else if (directReleasedTitle !== null) countdownReleased = directReleasedTitle === "true";

      if (!nextUpdate || countdownReleased === undefined) {
        try {
          const raw = localStorage.getItem("portfolio_local_projects_v1");
          if (raw) {
            const projs = JSON.parse(raw);
            const match = projs.find(
              (lp: any) =>
                lp.id === p.id ||
                (lp.title && p.title && lp.title.toLowerCase().trim() === p.title.toLowerCase().trim())
            );
            if (match?.next_update_at && !nextUpdate) nextUpdate = match.next_update_at;
            if (match?.countdown_released !== undefined && countdownReleased === undefined) countdownReleased = match.countdown_released;
          }
        } catch {}
      }
    }
    return {
      ...p,
      next_update_at: nextUpdate || null,
      countdown_released: countdownReleased,
    };
  };

  // Live Ticking Clock for Release & Publication Countdown Timer + Continuous Local Storage Sync + Background API Polling
  const [currentPortalTimestamp, setCurrentPortalTimestamp] = useState<number>(Date.now());
  useEffect(() => {
    let tickCount = 0;
    const timer = setInterval(async () => {
      setCurrentPortalTimestamp(Date.now());
      tickCount++;

      if (typeof window !== "undefined" && selectedProject) {
        const directId = localStorage.getItem(`portfolio_project_next_update_${selectedProject.id}`);
        const directTitle = selectedProject.title
          ? localStorage.getItem(`portfolio_project_next_update_title_${selectedProject.title.toLowerCase().trim()}`)
          : null;
        let bestNext = directId || directTitle;

        const directReleasedId = localStorage.getItem(`portfolio_project_countdown_released_${selectedProject.id}`);
        const directReleasedTitle = selectedProject.title
          ? localStorage.getItem(`portfolio_project_countdown_released_title_${selectedProject.title.toLowerCase().trim()}`)
          : null;
        let bestReleased =
          directReleasedId !== null
            ? directReleasedId === "true"
            : directReleasedTitle !== null
            ? directReleasedTitle === "true"
            : selectedProject.countdown_released;

        if (!bestNext) {
          try {
            const raw = localStorage.getItem("portfolio_local_projects_v1");
            if (raw) {
              const projs = JSON.parse(raw);
              const m = projs.find(
                (p: any) =>
                  p.id === selectedProject.id ||
                  (p.title &&
                    selectedProject.title &&
                    p.title.toLowerCase().trim() === selectedProject.title.toLowerCase().trim())
              );
              if (m?.next_update_at) bestNext = m.next_update_at;
              if (m?.countdown_released !== undefined && bestReleased === undefined) bestReleased = m.countdown_released;
            }
          } catch {}
        }

        // Lightweight poll every 3 seconds to keep sync even across different browsers/devices
        if (tickCount % 3 === 0 && selectedProject.id) {
          try {
            const pollRes = await fetch(
              `/api/portal/countdown?projectId=${encodeURIComponent(selectedProject.id)}&title=${encodeURIComponent(selectedProject.title || "")}`,
              { cache: "no-store" }
            );
            if (pollRes.ok) {
              const pollJson = await pollRes.json();
              if (pollJson.found) {
                bestNext = pollJson.next_update_at;
                bestReleased = Boolean(pollJson.countdown_released);
              }
            }
          } catch {}
        }

        if (
          (bestNext && bestNext !== selectedProject.next_update_at) ||
          (bestReleased !== undefined && bestReleased !== selectedProject.countdown_released)
        ) {
          setSelectedProject((prev) =>
            prev ? { ...prev, next_update_at: bestNext, countdown_released: bestReleased } : prev
          );
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedProject]);

  // Real-time synchronization for projects (e.g. next_update_at / countdown_released changes from admin)
  useEffect(() => {
    const syncLocalProject = (e?: any) => {
      if (typeof window === "undefined") return;
      try {
        const eventDetail = e?.detail;
        if (selectedProject) {
          const directId = localStorage.getItem(`portfolio_project_next_update_${selectedProject.id}`);
          const directTitle = selectedProject.title
            ? localStorage.getItem(`portfolio_project_next_update_title_${selectedProject.title.toLowerCase().trim()}`)
            : null;
          const directVal =
            (eventDetail &&
            (eventDetail.projectId === selectedProject.id || eventDetail.title === selectedProject.title)
              ? eventDetail.next_update_at
              : null) ||
            directId ||
            directTitle;

          const directRelId = localStorage.getItem(`portfolio_project_countdown_released_${selectedProject.id}`);
          const directRelTitle = selectedProject.title
            ? localStorage.getItem(`portfolio_project_countdown_released_title_${selectedProject.title.toLowerCase().trim()}`)
            : null;
          const directRelVal =
            eventDetail && (eventDetail.projectId === selectedProject.id || eventDetail.title === selectedProject.title) && eventDetail.countdown_released !== undefined
              ? eventDetail.countdown_released
              : directRelId !== null
              ? directRelId === "true"
              : directRelTitle !== null
              ? directRelTitle === "true"
              : selectedProject.countdown_released;

          if (
            (directVal && directVal !== selectedProject.next_update_at) ||
            (directRelVal !== undefined && directRelVal !== selectedProject.countdown_released)
          ) {
            setSelectedProject((prev) => (prev ? { ...prev, next_update_at: directVal, countdown_released: directRelVal } : prev));
          }
        }

        const raw = localStorage.getItem("portfolio_local_projects_v1");
        if (raw) {
          const projs: Project[] = JSON.parse(raw);
          if (Array.isArray(projs) && projs.length > 0) {
            setProjects((prev) =>
              prev.map((p) => {
                const found = projs.find(
                  (lp) =>
                    lp.id === p.id ||
                    (lp.title && p.title && lp.title.toLowerCase().trim() === p.title.toLowerCase().trim())
                );
                return found
                  ? {
                      ...p,
                      next_update_at: found.next_update_at || p.next_update_at,
                      countdown_released: found.countdown_released !== undefined ? found.countdown_released : p.countdown_released,
                    }
                  : p;
              })
            );
          }
        }
      } catch (e) {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "portfolio_local_projects_v1" ||
        e.key?.startsWith("portfolio_project_next_update_") ||
        e.key?.startsWith("portfolio_project_countdown_released_")
      ) {
        syncLocalProject();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", syncLocalProject);
    window.addEventListener("portfolio_project_updated", syncLocalProject);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncLocalProject);
      window.removeEventListener("portfolio_project_updated", syncLocalProject);
    };
  }, [selectedProject]);

  // Universal Escape Key Listener to Close Any Open Modal, Card, or Overlay in Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReceiptModalOpen(false);
        setPixPaymentModalOpen(false);
        setActivePayingInstallment(null);
        setFeedbackOpen(false);
        setApprovalModalOpen(false);
        setSelectedMilestoneForReview(null);
        setActiveReceiptData(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMilestoneExpanded = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick Links State
  const [quickLinks, setQuickLinks] = useState<ProjectQuickLink[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const hasInitialPortalFetched = useRef(false);

  // Message / Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Formal Feedback & Approval State
  const [deliveryFeedbacks, setDeliveryFeedbacks] = useState<DeliveryFeedbackItem[]>([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedMilestoneForReview, setSelectedMilestoneForReview] = useState<Milestone | null>(null);
  const [reviewType, setReviewType] = useState<DeliveryReviewType>("approval");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewFeedbackBanner, setReviewFeedbackBanner] = useState<string | null>(null);

  const handleCopyQuickLink = (linkId: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      setTimeout(() => {
        setCopiedLinkId((prev) => (prev === linkId ? null : prev));
      }, 2000);
    }
  };

  const handleOpenReviewModal = (milestone: Milestone, type: DeliveryReviewType) => {
    setSelectedMilestoneForReview(milestone);
    setReviewType(type);
    const existing = deliveryFeedbacks.find((f) => f.milestone_id === milestone.id);
    setReviewNotes(existing?.notes || "");
    setApprovalModalOpen(true);
  };

  const handleSubmitDeliveryReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneForReview || !selectedProject) return;

    const currentMilestone = selectedMilestoneForReview;
    const authorName = profile?.full_name || user?.email || "Cliente";
    const authorEmail = user?.email || "";

    const newFeedback: DeliveryFeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      project_id: selectedProject.id,
      milestone_id: currentMilestone.id,
      milestone_title: currentMilestone.title,
      stage_name: currentMilestone.stage || "Homologação",
      type: reviewType,
      author_name: authorName,
      author_email: authorEmail,
      notes:
        reviewNotes.trim() ||
        (reviewType === "approval"
          ? "Entrega formalmente aprovada e validada pelo cliente."
          : "Solicitação de ajustes para homologação."),
      created_at: new Date().toISOString(),
      status: "pending_review",
    };

    try {
      const rawFeedbacks = localStorage.getItem("portfolio_delivery_feedbacks_v1");
      let allFeedbacks: DeliveryFeedbackItem[] = rawFeedbacks ? JSON.parse(rawFeedbacks) : [];
      allFeedbacks = [
        newFeedback,
        ...allFeedbacks.filter((f) => f.milestone_id !== currentMilestone.id),
      ];
      localStorage.setItem("portfolio_delivery_feedbacks_v1", JSON.stringify(allFeedbacks));
      setDeliveryFeedbacks(allFeedbacks.filter((f) => f.project_id === selectedProject.id));
    } catch (err) {
      console.error("Error saving delivery feedback:", err);
    }

    setApprovalModalOpen(false);
    setReviewFeedbackBanner(
      reviewType === "approval"
        ? `🎉 Aceite formal registrado com sucesso para "${currentMilestone.title}"! Notificação encaminhada imediatamente à desenvolvedora.`
        : `⚠️ Solicitação de ajuste registrada para "${currentMilestone.title}"! Maira Reis foi notificada imediatamente.`
    );
    setTimeout(() => {
      setReviewFeedbackBanner(null);
    }, 6000);

    // Immediate WhatsApp link for notification
    const waText = encodeURIComponent(
      `🔔 *Notificação Formal de Validação (${reviewType === "approval" ? "✅ APROVAÇÃO DE ENTREGA" : "⚠️ SOLICITAÇÃO DE AJUSTE"})*\n\n` +
      `📁 *Projeto:* ${selectedProject.title}\n` +
      `📌 *Marco:* ${currentMilestone.title}\n` +
      `👤 *Cliente:* ${authorName}\n` +
      `📝 *Considerações:* ${reviewNotes.trim() || "(Sem observações adicionais)"}\n` +
      `⏰ *Data:* ${new Date().toLocaleString("pt-BR")}`
    );
    window.open(`https://wa.me/553598030543?text=${waText}`, "_blank");
  };

  // Redirect if unauthenticated (allow admin to view when impersonating)
  useEffect(() => {
    if (!authLoading && !user && !isImpersonating) {
      router.push("/login?redirect=/portal");
    }
  }, [user, authLoading, router, isImpersonating]);

  // Load project documents (strict client-visible filter)
  const loadProjectDocuments = async (projectId: string, projectTitle: string) => {
    try {
      let list: ProjectDocument[] = [];
      try {
        const res = await fetch(`/api/portal/documents?projectId=${encodeURIComponent(projectId)}&visibility=client`);
        if (res.ok) {
          const json = await res.json();
          if (json.documents && Array.isArray(json.documents)) {
            list = json.documents;
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch documents from server API:", apiErr);
      }

      if (list.length === 0) {
        const raw = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_documents_v1") : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed.filter(
              (d: ProjectDocument) => d.project_id === projectId && d.visibility === "client"
            );
          } else if (parsed && typeof parsed === "object" && parsed[projectId]) {
            list = (parsed[projectId] || []).filter(
              (d: ProjectDocument) => d.visibility === "client"
            );
          }
        }
      }
      setDocuments(list);
    } catch (err) {
      console.error("Error loading project documents:", err);
    }
  };

  // Load client projects with Multi-Tenant isolation
  const loadData = async (isSilent = false) => {
    if (!user) return;
    if (!isSilent && projects.length === 0) {
      setLoadingData(true);
    }
    try {
      // Multi-tenant isolation:
      // If client, fetch ONLY projects where client_id === user.id or matching client_email
      let clientProjects: Project[] = [];
      try {
        let query = supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (profile && profile.role !== "admin") {
          const userEmail = user.email || "";
          query = userEmail
            ? query.or(`client_id.eq.${user.id},client_id.eq.${userEmail},client_email.eq.${userEmail}`)
            : query.eq("client_id", user.id);
        }

        const { data: projData, error: projError } = await query;
        if (!projError && projData && Array.isArray(projData)) {
          clientProjects = (projData as Project[]).map((p) => {
            let nextUpdate = p.next_update_at;
            if (!nextUpdate && typeof window !== "undefined") {
              nextUpdate =
                localStorage.getItem(`portfolio_project_next_update_${p.id}`) ||
                (p.title ? localStorage.getItem(`portfolio_project_next_update_title_${p.title.toLowerCase().trim()}`) : null) ||
                null;
            }
            return {
              ...p,
              next_update_at: nextUpdate,
              status: (p.status as any) || "planejamento",
            };
          });
        }
      } catch (e) {}

      // Resilient server API fetch (Authoritative Source of Truth)
      try {
        const isAdmin = profile?.role === "admin";
        const apiUrl = `/api/portal/projects?clientId=${encodeURIComponent(user.id)}&clientEmail=${encodeURIComponent(user.email || "")}&isAdmin=${isAdmin}`;
        const res = await fetch(apiUrl, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.projects && Array.isArray(json.projects)) {
            clientProjects = json.projects.map((sp: any) => {
              let nextUpdate = sp.next_update_at;
              if (!nextUpdate && typeof window !== "undefined") {
                nextUpdate =
                  localStorage.getItem(`portfolio_project_next_update_${sp.id}`) ||
                  (sp.title ? localStorage.getItem(`portfolio_project_next_update_title_${sp.title.toLowerCase().trim()}`) : null) ||
                  null;
              }
              return {
                ...sp,
                next_update_at: nextUpdate,
                status: sp.status || "planejamento",
              };
            });
            try {
              localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(clientProjects));
            } catch (e) {}
          }
        }
      } catch (apiErr) {
        console.warn("Portal projects API load failed:", apiErr);
      }

      // Fallback to local storage ONLY if server API returned no projects
      if (clientProjects.length === 0) {
        try {
          const localProjects: Project[] = JSON.parse(localStorage.getItem("portfolio_local_projects_v1") || "[]");
          const cleanUserEmail = user.email?.toLowerCase().trim() || "";
          const cleanUserName = profile?.full_name?.toLowerCase().trim() || "";

          for (const lp of localProjects) {
            const matchesClient =
              profile?.role === "admin" ||
              (lp.client_id && (
                lp.client_id === user.id ||
                (cleanUserEmail && lp.client_id?.toLowerCase() === cleanUserEmail) ||
                (cleanUserEmail && (lp as any).client_email?.toLowerCase() === cleanUserEmail) ||
                (cleanUserName && (lp as any).client_name?.toLowerCase() === cleanUserName)
              ));

            if (matchesClient) {
              clientProjects.push(lp);
            }
          }
        } catch (e) {}
      }

      let current: Project | null = null;
      if (impersonateProjectId) {
        const found = clientProjects.find((p) => p.id === impersonateProjectId);
        if (found) {
          current = found;
        } else {
          // If not in standard list, fetch directly
          const { data: directProj } = await supabase
            .from("projects")
            .select("*")
            .eq("id", impersonateProjectId)
            .single();
          if (directProj) {
            current = directProj as Project;
            clientProjects = [directProj as Project, ...clientProjects];
          }
        }
      }

      const enrichedList = clientProjects.map((p) => getEnrichedProject(p));
      setProjects(enrichedList);

      if (!current && enrichedList.length > 0) {
        const savedProjectId = typeof window !== "undefined" ? localStorage.getItem("portfolio_client_selected_project_id") : null;
        current =
          (impersonateProjectId && enrichedList.find((p) => p.id === impersonateProjectId)) ||
          (selectedProject && enrichedList.find((p) => p.id === selectedProject.id)) ||
          (savedProjectId && enrichedList.find((p) => p.id === savedProjectId)) ||
          enrichedList[0];
      }

      if (current) {
        const enrichedCurrent = getEnrichedProject(current);
        setSelectedProject(enrichedCurrent);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("portfolio_client_selected_project_id", enrichedCurrent.id);
          } catch (e) {}
        }
        await loadProjectDetails(enrichedCurrent.id, enrichedCurrent.title, enrichedCurrent);
      } else {
        setSelectedProject(null);
        setMilestones([]);
        setUpdates([]);
        setDocuments([]);
        setFinancialData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadProjectDetails = async (projectId: string, projectTitle: string, currentProj?: Project) => {
    try {
      // Immediately reset previous project data so no old information lingers
      setDocuments([]);
      setFinancialData(null);
      setMilestones([]);
      setUpdates([]);
      setQuickLinks([]);
      setDeliveryFeedbacks([]);

      // Load documents for this project strictly
      await loadProjectDocuments(projectId, projectTitle);

      // Load financial data strictly for this project
      let projFinances: ProjectFinancialData | null = null;
      try {
        const finRes = await fetch(`/api/portal/finances?projectId=${encodeURIComponent(projectId)}`);
        if (finRes.ok) {
          const finJson = await finRes.json();
          if (finJson.finances) {
            projFinances = finJson.finances;
          }
        }
      } catch (fErr) {
        console.warn("Could not fetch finances from server API:", fErr);
      }

      if (!projFinances) {
        try {
          const rawFinances =
            typeof window !== "undefined"
              ? localStorage.getItem("portfolio_admin_finances_v1")
              : null;
          if (rawFinances) {
            const parsed = JSON.parse(rawFinances);
            if (parsed && typeof parsed === "object" && parsed[projectId]) {
              projFinances = parsed[projectId];
            }
          }
        } catch (e) {
          console.error("Error reading finances from localStorage:", e);
        }
      }

      setFinancialData(projFinances);

      // Load milestones strictly for this project
      let milestonesList: Milestone[] = [];
      try {
        const mRes = await fetch(`/api/portal/milestones?projectId=${encodeURIComponent(projectId)}`);
        if (mRes.ok) {
          const mJson = await mRes.json();
          if (mJson.milestones && Array.isArray(mJson.milestones)) {
            milestonesList = mJson.milestones;
          }
        }
      } catch (mApiErr) {
        console.warn("Could not fetch milestones from API:", mApiErr);
      }

      if (milestonesList.length === 0) {
        try {
          const { data: mData } = await supabase
            .from("project_milestones")
            .select("*")
            .eq("project_id", projectId)
            .order("order_index", { ascending: true });

          if (mData && mData.length > 0) {
            milestonesList = mData as Milestone[];
          }
        } catch (e) {}
      }

      // If no milestones found in Supabase/API, check localStorage for this specific project ID
      if (milestonesList.length === 0) {
        try {
          const rawM = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_milestones_v1") : null;
          if (rawM) {
            const parsed = JSON.parse(rawM);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed[projectId])) {
              milestonesList = parsed[projectId];
            }
          }
        } catch (e) {}
      }

      setMilestones(milestonesList);

      // Load updates strictly for this project from API + Supabase + localStorage
      let projectUpdatesList: ProjectUpdate[] = [];
      try {
        const upRes = await fetch(`/api/portal/updates?projectId=${encodeURIComponent(projectId)}`);
        if (upRes.ok) {
          const upJson = await upRes.json();
          if (upJson.updates && Array.isArray(upJson.updates)) {
            projectUpdatesList = upJson.updates.filter((u: ProjectUpdate) => u.project_id === projectId);
          }
        }
      } catch (e) {}

      if (projectUpdatesList.length === 0) {
        try {
          const { data: uData } = await supabase
            .from("project_updates")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

          if (uData && uData.length > 0) {
            projectUpdatesList = uData as ProjectUpdate[];
          }
        } catch (e) {}

        if (projectUpdatesList.length === 0) {
          const rawUpdates =
            typeof window !== "undefined"
              ? localStorage.getItem("portfolio_admin_updates_v1")
              : null;
          if (rawUpdates) {
            try {
              const parsed = JSON.parse(rawUpdates);
              if (parsed && typeof parsed === "object" && Array.isArray(parsed[projectId])) {
                projectUpdatesList = parsed[projectId];
              } else if (Array.isArray(parsed)) {
                projectUpdatesList = parsed.filter(
                  (u: ProjectUpdate) => u.project_id === projectId
                );
              }
            } catch (e) {
              console.error("Error reading updates from localStorage:", e);
            }
          }
        }
      }

      setUpdates(projectUpdatesList);

      // Load Quick Links strictly for this project from server API + localStorage + project URLs
      let projectLinksList: ProjectQuickLink[] = [];
      try {
        const linkRes = await fetch(`/api/portal/quick-links?projectId=${encodeURIComponent(projectId)}`);
        if (linkRes.ok) {
          const linkJson = await linkRes.json();
          if (linkJson.quickLinks && Array.isArray(linkJson.quickLinks)) {
            projectLinksList = linkJson.quickLinks;
          }
        }
      } catch (linkErr) {
        console.warn("Could not fetch quick links from API:", linkErr);
      }

      if (projectLinksList.length === 0) {
        try {
          const rawLinks =
            typeof window !== "undefined"
              ? localStorage.getItem("portfolio_admin_quick_links_v1")
              : null;
          if (rawLinks) {
            const parsed = JSON.parse(rawLinks);
            if (parsed && typeof parsed === "object") {
              if (Array.isArray(parsed[projectId])) {
                projectLinksList = parsed[projectId].filter(
                  (l: ProjectQuickLink) => l.is_active !== false && l.url && l.url.trim() !== ""
                );
              } else if (Array.isArray(parsed)) {
                projectLinksList = parsed.filter(
                  (l: ProjectQuickLink) =>
                    l.project_id === projectId && l.is_active !== false && l.url && l.url.trim() !== ""
                );
              }
            }
          }
        } catch (e) {
          console.error("Error reading quick links from localStorage:", e);
        }
      }

      const activeProj =
        currentProj ||
        ({ id: projectId, title: projectTitle } as Project);

      if (projectLinksList.length === 0) {
        projectLinksList = generateDefaultProjectQuickLinks(activeProj).filter(
          (l) => l.url && l.url.trim() !== ""
        );
      }

      setQuickLinks(projectLinksList);

      // Load Formal Feedbacks & Approvals strictly for this project
      let feedbackList: DeliveryFeedbackItem[] = [];
      try {
        const rawFeedbacks =
          typeof window !== "undefined"
            ? localStorage.getItem("portfolio_delivery_feedbacks_v1")
            : null;
        if (rawFeedbacks) {
          const parsed = JSON.parse(rawFeedbacks);
          if (Array.isArray(parsed)) {
            feedbackList = parsed.filter(
              (f: DeliveryFeedbackItem) => f.project_id === projectId
            );
          }
        }
      } catch (e) {
        console.error("Error reading delivery feedbacks from localStorage:", e);
      }
      setDeliveryFeedbacks(feedbackList);
    } catch (err) {
      console.error("Error loading project details:", err);
    }
  };

  useEffect(() => {
    if (user && profile && !hasInitialPortalFetched.current) {
      hasInitialPortalFetched.current = true;
      loadData();
    }
  }, [user?.id, profile?.id]);

  const handleSelectProject = (proj: Project) => {
    const enriched = getEnrichedProject(proj);
    setSelectedProject(enriched);
    setDocuments([]);
    setFinancialData(null);
    setMilestones([]);
    setUpdates([]);
    setQuickLinks([]);
    setDeliveryFeedbacks([]);
    loadProjectDetails(enriched.id, enriched.title, enriched);
  };

  const handleOpenPdfViewer = (doc: ProjectDocument) => {
    setViewingDocument(doc);
    setPdfViewerOpen(true);
  };

  const handleDownloadDocument = (doc: ProjectDocument) => {
    if (doc.file_url && doc.file_url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = doc.file_url;
      link.download = doc.filename || "documento.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const sampleContent = `%PDF-1.4\n1 0 obj\n<< /Title (${doc.title}) /Author (Maira Reis - Desenvolvedora) >>\nendobj\n%%EOF`;
      const blob = new Blob([sampleContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename || `${doc.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackMsg.trim()) return;

    // Record formal support ticket for Admin inbox
    try {
      const newTicket = {
        id: `ticket-${Date.now()}`,
        project_id: selectedProject?.id || "geral",
        project_title: selectedProject?.title || "Geral",
        client_id: user?.id,
        client_name: profile?.full_name || user?.email?.split("@")[0] || "Cliente",
        client_email: user?.email || "",
        subject: `Dúvida / Feedback (${selectedProject?.title || "Projeto"})`,
        message: feedbackMsg.trim(),
        priority: "media",
        status: "aberto",
        created_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("portfolio_support_tickets_v1") || "[]";
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.unshift(newTicket);
          localStorage.setItem("portfolio_support_tickets_v1", JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error("Error saving support ticket:", e);
    }

    const text = encodeURIComponent(
      `Olá Maira! Aqui é ${profile?.full_name || "Cliente"} do projeto "${selectedProject?.title || "Meu Projeto"}".\n\nMinha mensagem/feedback:\n${feedbackMsg}`
    );
    window.open(`https://wa.me/553598030543?text=${text}`, "_blank");
    setFeedbackMsg("");
    setFeedbackOpen(false);
  };

  if (authLoading || (loadingData && !selectedProject && projects.length === 0)) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Carregando painel do cliente...</p>
        </div>
      </div>
    );
  }

  const currentPhaseIndex = selectedProject
    ? selectedProject.status === "planejamento"
      ? 1
      : selectedProject.status === "design"
      ? 2
      : selectedProject.status === "desenvolvimento"
      ? 3
      : selectedProject.status === "testes"
      ? 4
      : selectedProject.status === "concluido"
      ? 5
      : 3
    : 1;

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-pink-900/95 border-b border-purple-500/40 px-4 py-2.5 text-xs text-white flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>MODO VISÃO DO CLIENTE (READ-ONLY):</strong> Você está inspecionando exatamente o que o cliente visualiza para o projeto{" "}
              <u>{selectedProject?.title}</u>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-purple-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              🔒 Ações Restritas
            </span>
            <Link
              href="/admin"
              className="px-3 py-1 rounded-xl bg-white text-gray-900 font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-1"
            >
              <span>Voltar ao Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className={`sticky ${isImpersonating ? "top-[41px]" : "top-0"} z-40 bg-[#0a0d1a]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div>
                <span className="font-bold text-base leading-tight tracking-tight text-white block">
                  Portal do Cliente <span className="text-gradient">MR</span>
                </span>
                <span className="text-[10px] text-gray-400">Maira Reis • Dev & UI/UX</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {(profile?.role === "admin" || (user?.email && ["mairareis2017@gmail.com", "maira.reis.ti@gmail.com", "admin@mairareis.dev"].includes(user.email.toLowerCase().trim()))) && (
              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Painel Admin</span>
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </span>
                <span className={`text-[10px] ${profile?.role === "admin" || (user?.email && ["mairareis2017@gmail.com", "maira.reis.ti@gmail.com", "admin@mairareis.dev"].includes(user.email.toLowerCase().trim())) ? "text-purple-400 font-semibold" : "text-emerald-400"}`}>
                  {profile?.role === "admin" || (user?.email && ["mairareis2017@gmail.com", "maira.reis.ti@gmail.com", "admin@mairareis.dev"].includes(user.email.toLowerCase().trim())) ? "Administrador" : "Cliente Autorizado"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              title="Sair do Portal"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Welcome Header */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles size={14} />
              <span>Espaço Exclusivo do Cliente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Olá, {profile?.full_name || "Cliente"}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-1 max-w-2xl">
              Aqui você acompanha a evolução do seu projeto em tempo real, valida protótipos, acessa versões de homologação e conversa diretamente com a desenvolvedora.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <MessageSquare size={16} />
              <span>Enviar Feedback ou Dúvida</span>
            </button>
            <button
              onClick={() => loadData()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Project Selector if user has multiple projects */}
        {projects.length > 1 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
              Seus Projetos:
            </span>
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedProject?.id === proj.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                    : "bg-slate-900/60 text-gray-300 border-white/10 hover:border-white/20"
                }`}
              >
                <span>{proj.title}</span>
                {proj.progress > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                    {proj.progress}%
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Menu de Navegação em Abas do Cliente (100% Responsivo) */}
        {selectedProject && (
          <div className="mb-8 border-b border-white/10 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-slate-900/70 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl w-full">
              {[
                { id: "overview", label: "Geral", icon: LayoutDashboard, badge: null },
                { id: "milestones", label: "Etapas", icon: ListTodo, badge: milestones.length > 0 ? `${milestones.filter((m) => m.completed).length}/${milestones.length}` : null },
                { id: "financial", label: "Financeiro", icon: Receipt, badge: null },
                { id: "updates", label: "Atualizações", icon: Sparkles, badge: updates.length > 0 ? `${updates.length}` : null },
                { id: "documents", label: "Documentos", icon: FileText, badge: documents.length > 0 ? `${documents.length}` : null },
                { id: "support", label: "Suporte", icon: Headphones, badge: null },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 scale-[1.01]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-white shrink-0" : "text-gray-400 shrink-0"} />
                    <span className="truncate">{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                          isActive
                            ? "bg-white/25 text-white border border-white/30"
                            : "bg-white/10 text-gray-300 border border-white/10"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

{/* No active project state */}
        {!selectedProject ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-white/10 flex flex-col items-center justify-center">
            <Layers size={48} className="text-indigo-400 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white">Nenhum projeto vinculado ainda</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2">
              Seu projeto está sendo configurado pela Maira. Em breve, todo o cronograma e entregáveis estarão visíveis aqui.
            </p>
            <a
              href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira!%20Acabei%20de%20acessar%20o%20portal%20do%20cliente."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={16} />
              <span>Falar com Maira no WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. ABA: VISÃO GERAL */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (8 cols): Progress, Stepper & Quick Hub */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {/* Card 1: Visão Geral e Barra de Progresso do Projeto */}
              {(() => {
                const statusInfo = getPortalStatusInfo(selectedProject.status);
                const completedMilestonesCount = milestones.filter((m) => m.completed).length;
                const nextPendingMilestone = milestones.find((m) => !m.completed);

                return (
                  <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden">
                    {/* Glowing background accent */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Header Row: Project Title, Tech Stack & Visual Status Tag */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10 relative z-10">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedProject.category && (
                            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5 shrink-0">
                              <Code2 size={12} className="text-indigo-400" />
                              <span>{selectedProject.category}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-mono">
                            ID: #{selectedProject.id.slice(0, 8)}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight break-words">
                          {selectedProject.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed whitespace-pre-line break-words">
                          {selectedProject.description || "Desenvolvimento e sustentação de solução digital sob medida com arquitetura modular e boas práticas de UI/UX."}
                        </p>
                      </div>

                      {/* Visual Status Tag */}
                      <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-1 sm:pt-0">
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-bold text-xs shadow-md ${statusInfo.badgeClass}`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotClass} animate-pulse`} />
                          <span>{statusInfo.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {statusInfo.sublabel}
                        </span>
                      </div>
                    </div>

                    {/* Live Publication & Release Countdown Timer (Strictly bound to next_update_at & countdown_released) */}
                    {(() => {
                      const nextUpdateRaw = (() => {
                        if (selectedProject?.next_update_at) return selectedProject.next_update_at;
                        if (typeof window !== "undefined" && selectedProject) {
                          const directId = localStorage.getItem(`portfolio_project_next_update_${selectedProject.id}`);
                          if (directId) return directId;
                          if (selectedProject.title) {
                            const directTitle = localStorage.getItem(`portfolio_project_next_update_title_${selectedProject.title.toLowerCase().trim()}`);
                            if (directTitle) return directTitle;
                          }
                          try {
                            const raw = localStorage.getItem("portfolio_local_projects_v1");
                            if (raw) {
                              const projs: Project[] = JSON.parse(raw);
                              const match = projs.find(
                                (p) =>
                                  p.id === selectedProject.id ||
                                  (p.title &&
                                    selectedProject.title &&
                                    p.title.toLowerCase().trim() === selectedProject.title.toLowerCase().trim())
                              );
                              if (match?.next_update_at) return match.next_update_at;
                            }
                          } catch {}
                        }
                        return null;
                      })();

                      const isReleased = Boolean(
                        selectedProject?.countdown_released !== false && (
                          selectedProject?.countdown_released ||
                          (typeof window !== "undefined" && (
                            localStorage.getItem(`portfolio_project_countdown_released_${selectedProject?.id}`) === "true" ||
                            (selectedProject?.title && localStorage.getItem(`portfolio_project_countdown_released_title_${selectedProject?.title.toLowerCase().trim()}`) === "true")
                          ))
                        )
                      );

                      const hasConfiguredDate = Boolean(nextUpdateRaw && !isNaN(new Date(nextUpdateRaw).getTime()));
                      const targetTimestamp = hasConfiguredDate ? new Date(nextUpdateRaw!).getTime() : null;
                      const diff = targetTimestamp ? targetTimestamp - currentPortalTimestamp : 0;
                      const isPast = Boolean(targetTimestamp && diff <= 0);

                      const days = Math.floor(Math.max(0, diff) / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((Math.max(0, diff) / (1000 * 60 * 60)) % 24);
                      const minutes = Math.floor((Math.max(0, diff) / (1000 * 60)) % 60);
                      const seconds = Math.floor((Math.max(0, diff) / 1000) % 60);

                      const formattedTargetDate = targetTimestamp
                        ? new Date(targetTimestamp).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null;

                      const showActiveCountdown = hasConfiguredDate && isReleased && !isPast;

                      return (
                        <div className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-indigo-950/90 border-2 border-purple-500/50 backdrop-blur-2xl shadow-2xl shadow-purple-950/60 space-y-4 relative overflow-hidden z-10">
                          {/* Ambient glow accents */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

                          {/* Top Row: Header & Status Badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 text-purple-200 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-purple-950/40">
                                <Clock size={20} className="text-purple-300 animate-pulse" />
                              </span>
                              <div>
                                <h4 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                                  <span>Próxima Publicação &amp; Release</span>
                                  {showActiveCountdown && (
                                    <span className="flex h-2.5 w-2.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-purple-200/80 font-medium">
                                  {hasConfiguredDate ? (
                                    isReleased ? (
                                      <>
                                        Data prevista agendada: <strong className="text-white font-semibold">{formattedTargetDate}</strong>
                                      </>
                                    ) : (
                                      "Data em homologação interna pela desenvolvedora (aguardando liberação formal)."
                                    )
                                  ) : (
                                    "Aguardando agendamento da próxima entrega pela desenvolvedora no painel."
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Status Pill */}
                            <div className="shrink-0 self-start sm:self-auto">
                              {!hasConfiguredDate ? (
                                <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5">
                                  <Calendar size={13} className="text-purple-400" />
                                  <span>Aguardando Agendamento</span>
                                </span>
                              ) : isPast ? (
                                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                                  <Sparkles size={13} className="text-emerald-400" />
                                  <span>Data Atingida / Homologação</span>
                                </span>
                              ) : isReleased ? (
                                <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-100 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-950/40">
                                  <Rocket size={13} className="text-pink-400 animate-bounce" />
                                  <span>Contagem Regressiva Ativa</span>
                                </span>
                              ) : (
                                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                                  <AlertCircle size={13} className="text-amber-400" />
                                  <span>Cronograma em Validação</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Digital Countdown Timer Modules (Always visible with 4 digital slots) */}
                          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative z-10 pt-1">
                            {[
                              { val: showActiveCountdown ? days : 0, label: "Dias", sub: "d" },
                              { val: showActiveCountdown ? hours : 0, label: "Horas", sub: "h" },
                              { val: showActiveCountdown ? minutes : 0, label: "Minutos", sub: "m" },
                              { val: showActiveCountdown ? seconds : 0, label: "Segundos", sub: "s" },
                            ].map((slot, idx) => (
                              <div
                                key={idx}
                                className="p-3 sm:p-4 rounded-2xl bg-black/70 border border-purple-500/30 flex flex-col items-center justify-center text-center shadow-inner relative group hover:border-purple-400/60 transition-all hover:scale-[1.02]"
                              >
                                <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-100 to-purple-300 drop-shadow-sm">
                                  {showActiveCountdown ? String(slot.val).padStart(2, "0") : (hasConfiguredDate && isPast ? "00" : "--")}
                                </span>
                                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-purple-300/90 mt-1 sm:mt-1.5">
                                  {slot.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom metadata note */}
                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-gray-400 border-t border-white/5 relative z-10">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full ${showActiveCountdown ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
                              <span>Sincronizado em tempo real com o painel administrativo</span>
                            </span>
                            <span className="font-mono text-purple-300/80 text-[10px] shrink-0">
                              {showActiveCountdown ? "● Ao Vivo" : (hasConfiguredDate ? (isPast ? "Finalizado" : "Pendente Liberação") : "Aguardando Agendamento")}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Macro Phase Stepper: Régua de Ciclo de Vida */}
                    {(() => {
                      let currentStep = 3;
                      if (selectedProject.status === "planejamento") currentStep = 1;
                      else if (selectedProject.status === "design") currentStep = 2;
                      else if (selectedProject.status === "desenvolvimento") currentStep = 3;
                      else if (selectedProject.status === "testes") currentStep = 4;
                      else if (selectedProject.status === "concluido" || selectedProject.progress === 100) currentStep = 5;

                      const STEPS = [
                        { num: 1, name: "Requisitos", icon: FileCode },
                        { num: 2, name: "UI/UX & Design", icon: Palette },
                        { num: 3, name: "Desenvolvimento", icon: Code2 },
                        { num: 4, name: "Homologação", icon: ShieldCheck },
                        { num: 5, name: "Lançamento", icon: Rocket },
                      ];

                      return (
                        <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md relative z-10">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              <Layers size={13} className="text-indigo-400" />
                              <span>Ciclo de Vida do Projeto</span>
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                              <span>Fase {currentStep} de 5: {STEPS[currentStep - 1].name}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                            {STEPS.map((st) => {
                              const isDone = st.num < currentStep;
                              const isCurrent = st.num === currentStep;
                              const StepIcon = st.icon;

                              return (
                                <div
                                  key={st.num}
                                  className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                                    isCurrent
                                      ? "bg-gradient-to-b from-indigo-950/90 to-purple-950/80 border-indigo-500/60 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/30"
                                      : isDone
                                      ? "bg-emerald-950/20 border-emerald-500/30"
                                      : "bg-white/[0.02] border-white/5 opacity-50"
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold transition-all ${
                                      isCurrent
                                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/50 ring-2 ring-indigo-400/40 animate-pulse"
                                        : isDone
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                        : "bg-white/10 text-gray-400"
                                    }`}
                                  >
                                    {isDone ? <Check size={12} /> : <StepIcon size={12} />}
                                  </div>
                                  <span
                                    className={`text-[9px] sm:text-xs font-bold leading-tight truncate w-full ${
                                      isCurrent
                                        ? "text-indigo-200"
                                        : isDone
                                        ? "text-emerald-300"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {st.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Dual Progress Bars: 1. Progresso Geral (Cronograma/Meses) + 2. Progresso da Sprint Mensal (Checks) */}
                    {(() => {
                      const timelineProg = calculateTimelineProgress(selectedProject.start_date, selectedProject.deadline);
                      const sprintProg = calculateSprintProgress(milestones);

                      return (
                        <div className="space-y-3.5 relative z-10 my-1">
                          {/* 1. Progresso Geral do Cronograma */}
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 space-y-2.5 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                                  <Calendar size={14} className="text-indigo-400 shrink-0" />
                                  <span>1. Progresso Geral do Cronograma</span>
                                </span>
                                <span className="text-[11px] text-gray-400 block mt-0.5 break-words">
                                  {timelineProg.detail}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1 shrink-0 self-start sm:self-auto">
                                <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 font-mono">
                                  {timelineProg.percent}%
                                </span>
                                <span className="text-xs font-bold text-indigo-300">Decorrido</span>
                              </div>
                            </div>

                            {/* Progress Bar 1 */}
                            <div className="w-full h-2.5 sm:h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${timelineProg.percent}%` }}
                                transition={{ duration: 1.0, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/40 relative"
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                              </motion.div>
                            </div>
                          </div>

                          {/* 2. Progresso da Sprint Mensal (Checks & Entregas) */}
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-950/30 border border-purple-500/25 space-y-2.5 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                                  <CheckSquare size={14} className="text-purple-400 shrink-0" />
                                  <span>2. Progresso da Sprint Mensal (Checks & Entregas)</span>
                                </span>
                                <span className="text-[11px] text-gray-400 block mt-0.5 break-words">
                                  {sprintProg.detail}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1 shrink-0 self-start sm:self-auto">
                                <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 font-mono">
                                  {sprintProg.percent}%
                                </span>
                                <span className="text-xs font-bold text-purple-300">Concluído</span>
                              </div>
                            </div>

                            {/* Progress Bar 2 */}
                            <div className="w-full h-2.5 sm:h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${sprintProg.percent}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 shadow-md shadow-purple-500/40 relative"
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Key Stats & Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 border-t border-white/10 relative z-10">
                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1.5 mb-1 truncate">
                          <Calendar size={12} className="text-indigo-400 shrink-0" /> Data de Início
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white truncate" title={selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString("pt-BR") : "A definir"}>
                          {selectedProject.start_date
                            ? new Date(selectedProject.start_date).toLocaleDateString("pt-BR")
                            : "A definir"}
                        </p>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1.5 mb-1 truncate">
                          <Clock size={12} className="text-pink-400 shrink-0" /> Previsão de Entrega
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white truncate" title={selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString("pt-BR") : "Cronograma ativo"}>
                          {selectedProject.deadline
                            ? new Date(selectedProject.deadline).toLocaleDateString("pt-BR")
                            : "Cronograma ativo"}
                        </p>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1.5 mb-1 truncate">
                          <ShieldCheck size={12} className="text-emerald-400 shrink-0" /> Garantia & Suporte
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-300 truncate" title="Inclusa (30 dias)">
                          Inclusa (30 dias)
                        </p>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between min-w-0">
                        <span className="text-[10px] sm:text-[11px] uppercase font-bold text-gray-400 flex items-center gap-1.5 mb-1 truncate">
                          <Sparkles size={12} className="text-purple-400 shrink-0" /> Próxima Entrega
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-purple-200 truncate" title={nextPendingMilestone?.title || (selectedProject.progress === 100 ? "Projeto Concluído" : "Homologação")}>
                          {nextPendingMilestone?.title || (selectedProject.progress === 100 ? "Projeto Concluído" : "Homologação")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

                  {/* Destaque: Foco Atual da Sprint & Status Operacional */}
                  {(() => {
                    const nextMilestone = milestones.find((m) => !m.completed) || milestones[0];
                    const stagingLink = quickLinks.find((l) => l.category === "staging" || l.category === "production");

                    if (!nextMilestone) return null;

                    return (
                      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-md">
                              <Target size={18} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span>Foco Ativo de Desenvolvimento</span>
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                {nextMilestone.title}
                              </h4>
                            </div>
                          </div>

                          {nextMilestone.due_date && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs font-semibold self-start sm:self-auto">
                              <Clock size={13} />
                              <span>Previsão: {formatDateBR(nextMilestone.due_date)}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-8 text-xs text-gray-300 space-y-1.5">
                            <p className="leading-relaxed">
                              {getMilestoneCleanDescription(nextMilestone) ||
                                "Implementação de módulos sob medida, validação de regras de negócio e boas práticas de UI/UX."}
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-300 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                              <span>Ambiente em evolução constante sob supervisão da desenvolvedora.</span>
                            </div>
                          </div>

                          <div className="sm:col-span-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                            {stagingLink ? (
                              <a
                                href={stagingLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                              >
                                <span>Testar em Staging</span>
                                <ExternalLink size={13} />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveTab("milestones")}
                                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <span>Ver Checklist Completo</span>
                                <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Hub de Acesso Rápido às Seções */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card Atalho: Etapas */}
                    <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ListTodo size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-white">Etapas & Entregas</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                              {calculateSprintProgress(milestones).percent}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {milestones.filter((m) => m.completed).length} de {milestones.length} entregas concluídas
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("milestones")}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Ver Checklist Completo</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Card Atalho: Financeiro */}
                    {(() => {
                      const finSummary = calculateFinancialSummary(financialData);
                      const nextUnpaidInst = financialData?.installments?.find((i) => !i.paid_at);

                      return (
                        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-4 group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Receipt size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-white">Financeiro & Recibos</h4>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                                  {finSummary.percentPaid}% pago
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">
                                {nextUnpaidInst
                                  ? `Próxima: ${formatBRL(nextUnpaidInst.amount)} (${nextUnpaidInst.due_date ? formatDateBR(nextUnpaidInst.due_date) : "A vencer"})`
                                  : `${formatBRL(finSummary.totalPaid)} de ${formatBRL(finSummary.contractValue)}`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("financial")}
                            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-emerald-300 hover:text-white border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>Ver Extrato & Quitação</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Card Atalho: Atualizações */}
                    <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Atualizações & Notas</h4>
                          <p className="text-xs text-gray-400">
                            {updates.length} {updates.length === 1 ? "registro" : "registros"} na timeline
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("updates")}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-purple-600/20 text-purple-300 hover:text-white border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Ver Linha do Tempo</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Card Atalho: Documentos */}
                    <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-pink-500/30 transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Documentos & Arquivos</h4>
                          <p className="text-xs text-gray-400">
                            {documents.length} {documents.length === 1 ? "documento" : "documentos"} homologados
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("documents")}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-pink-600/20 text-pink-300 hover:text-white border border-pink-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Acessar Documentos</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): Quick Links, Recent Updates & Direct Support */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Painel de Links Rápidos & Ambientes */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Link2 size={16} className="text-indigo-400" />
                    <span>Links Rápidos & Ambientes</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {quickLinks.length} {quickLinks.length === 1 ? "link" : "links"}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Atalhos diretos e homologados pela desenvolvedora para protótipos, ambientes de teste e documentação técnica.
                </p>

                <div className="space-y-3">
                  {quickLinks.map((link) => {
                    const catInfo = getQuickLinkCategoryInfo(link.category);
                    const IconComponent = catInfo.icon;
                    const isCopied = copiedLinkId === link.id;

                    return (
                      <div
                        key={link.id}
                        className={`p-4 rounded-2xl bg-gradient-to-br ${catInfo.btnClass} border transition-all duration-300 hover:shadow-lg hover:shadow-indigo-950/40 group relative flex flex-col justify-between gap-3`}
                      >
                        {/* Header: Icon, Label & Status Tag */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${catInfo.iconColor} group-hover:scale-105 transition-transform`}
                            >
                              <IconComponent size={20} />
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-200 transition-colors">
                                  {link.label}
                                </h4>
                              </div>
                              <p className="text-[11px] text-gray-300 truncate">
                                {catInfo.sublabel}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${catInfo.badgeClass}`}
                          >
                            {catInfo.statusTag}
                          </span>
                        </div>

                        {/* Description */}
                        {link.description && (
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            {link.description}
                          </p>
                        )}

                        {/* Actions: Open in new tab & Copy Link */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopyQuickLink(link.id, link.url, e)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCopied
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-black/40 text-gray-400 hover:text-white border-white/10 hover:border-white/20"
                            }`}
                            title="Copiar URL para a área de transferência"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            <span>{isCopied ? "Copiado!" : "Copiar Link"}</span>
                          </button>

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm transition-all group-hover:border-white/40 active:scale-95"
                          >
                            <span>{catInfo.actionLabel}</span>
                            <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  {quickLinks.length === 0 && (
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-500 space-y-1">
                      <Link2 size={24} className="mx-auto text-gray-600 mb-1" />
                      <p className="font-semibold text-gray-400">Nenhum atalho cadastrado</p>
                      <p className="text-[10px]">Os links de homologação serão disponibilizados nas próximas etapas.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feed: Últimas Atualizações do Projeto */}
              {updates.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-400" />
                      <span>Atualizações Recentes</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {updates.length} {updates.length === 1 ? "registro" : "registros"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {updates.slice(0, 2).map((up) => {
                      const typeInfo = getUpdateTypeInfo(up.category);
                      const IconComp = typeInfo.icon;

                      return (
                        <div
                          key={up.id}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeInfo.badgeClass}`}>
                              <IconComp size={10} />
                              <span>{typeInfo.label}</span>
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {up.created_at ? new Date(up.created_at).toLocaleDateString("pt-BR") : ""}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white truncate">
                            {up.title}
                          </h5>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                            {up.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("updates")}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-purple-600/20 text-purple-300 hover:text-white border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Ver Timeline Completa</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Quick Documents Card */}
              {documents.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck size={16} className="text-emerald-400" />
                      <span>Documentos Prontos</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {documents.length} PDF{documents.length > 1 ? "s" : ""}
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                            PDF
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                            <p className="text-[10px] text-gray-500">{doc.file_size_formatted}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-pink-600/20 text-gray-400 hover:text-pink-300 transition-colors shrink-0"
                          title="Baixar PDF"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                  {/* Fast Support Box */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Headphones size={18} className="text-indigo-400" />
                        <h4 className="text-sm font-bold text-white">Atendimento Direto</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Dúvidas sobre o andamento, entregas ou regras de negócio? Acesse nossa central de FAQ ou fale diretamente pelo WhatsApp.
                    </p>
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("support")}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Headphones size={14} />
                        <span>Abrir Central de Suporte & FAQ</span>
                      </button>
                      <a
                        href={`https://wa.me/553598030543?text=${encodeURIComponent(
                          `Olá Maira! Sou cliente do projeto "${selectedProject?.title || "MR Portfólio"}".`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <MessageSquare size={14} />
                        <span>Falar no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA: ETAPAS & ENTREGAS */}
            {activeTab === "milestones" && (
              <div className="w-full space-y-6">
              {(() => {
                const completedMilestones = [...milestones].filter((m) => m.completed || getMilestoneStatus(m) === "concluido").reverse();
                const upcomingMilestones = [...milestones].filter((m) => !m.completed && getMilestoneStatus(m) !== "concluido");
                const currentActiveMilestone = milestones.find((m) => getMilestoneStatus(m) === "em_andamento") || upcomingMilestones[0];
                const sprintProg = calculateSprintProgress(milestones);
                const overallPercent = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;
                const stagingLink = quickLinks.find((l) => l.category === "staging" || l.category === "production");

                const getScopeBadges = (title: string, stage?: string | null) => {
                  const lower = `${title} ${stage || ""}`.toLowerCase();
                  const badges: { label: string; icon: string }[] = [];
                  if (lower.includes("aluno") || lower.includes("crm") || lower.includes("gestão") || lower.includes("usuario") || lower.includes("perfil")) {
                    badges.push({ label: "Gestão & CRM", icon: "👥" });
                  }
                  if (lower.includes("plano") || lower.includes("pagamento") || lower.includes("financeiro") || lower.includes("checkout") || lower.includes("pix")) {
                    badges.push({ label: "Financeiro & Pix", icon: "💳" });
                  }
                  if (lower.includes("treino") || lower.includes("frequência") || lower.includes("agenda") || lower.includes("turma")) {
                    badges.push({ label: "Agenda & Treinos", icon: "📅" });
                  }
                  if (lower.includes("auth") || lower.includes("login") || lower.includes("segurança")) {
                    badges.push({ label: "Autenticação", icon: "🔐" });
                  }
                  if (lower.includes("api") || lower.includes("backend") || lower.includes("banco") || lower.includes("supabase")) {
                    badges.push({ label: "Backend & DB", icon: "⚡" });
                  }
                  if (lower.includes("ui") || lower.includes("ux") || lower.includes("design") || lower.includes("mobile") || lower.includes("app")) {
                    badges.push({ label: "UI/UX & Mobile", icon: "📱" });
                  }
                  if (badges.length === 0) {
                    badges.push({ label: stage || "Módulo Core", icon: "📦" });
                  }
                  return badges;
                };

                return (
                  <div className="space-y-6">
                    {/* Top Executive Mini-Dashboard (3 Stats Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Card 1: Taxa de Conclusão Global */}
                      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Target size={14} className="text-indigo-400" />
                            <span>Conclusão Global</span>
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {overallPercent}%
                          </span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white font-mono">
                              {completedMilestones.length}
                            </span>
                            <span className="text-xs text-gray-400">de {milestones.length} marcos entregues</span>
                          </div>
                          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mt-2 border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
                              style={{ width: `${overallPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Checks & Sub-tarefas da Sprint */}
                      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <CheckSquare size={14} className="text-purple-400" />
                            <span>Checks da Sprint</span>
                          </span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {sprintProg.percent}%
                          </span>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white font-mono">
                              {sprintProg.completedTasks}
                            </span>
                            <span className="text-xs text-gray-400">de {sprintProg.totalTasks} tarefas concluídas</span>
                          </div>
                          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mt-2 border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 rounded-full transition-all duration-700"
                              style={{ width: `${sprintProg.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Foco Ativo Corrente */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                            <Zap size={14} className="text-indigo-400 animate-pulse" />
                            <span>Foco Corrente</span>
                          </span>
                          {currentActiveMilestone?.due_date && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                              {new Date(currentActiveMilestone.due_date).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white truncate" title={currentActiveMilestone?.title || "Módulo Homologado"}>
                            {currentActiveMilestone?.title || "Todos os módulos entregues"}
                          </h5>
                          <p className="text-[11px] text-gray-300 mt-1 truncate">
                            {currentActiveMilestone?.stage || "Desenvolvimento em andamento"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Container */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                              <Target size={12} className="text-indigo-400" />
                              <span>Linha do Tempo & Entregas</span>
                            </span>
                            <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              Roadmap de Software & Homologação
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            <ListTodo size={22} className="text-indigo-400" />
                            <span>Acompanhamento de Entregas & Cronograma</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-300 mt-1">
                            Acompanhe os prazos iminentes, as tarefas ativas na sprint e o histórico de entregas já homologadas.
                          </p>
                        </div>

                        {/* View Mode Switcher (Cards vs Timeline) */}
                        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setMilestoneViewMode("grid")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              milestoneViewMode === "grid"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                                : "text-gray-400 hover:text-white"
                            }`}
                            title="Visualizar em Cards em Grade"
                          >
                            <LayoutDashboard size={13} />
                            <span>Grade</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMilestoneViewMode("timeline")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              milestoneViewMode === "timeline"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                                : "text-gray-400 hover:text-white"
                            }`}
                            title="Visualizar em Linha do Tempo Conectada"
                          >
                            <History size={13} />
                            <span>Roadmap</span>
                          </button>
                        </div>
                      </div>

                      {/* Review Feedback Banner Notification */}
                      <AnimatePresence>
                        {reviewFeedbackBanner && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-indigo-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-lg relative z-20"
                          >
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span>{reviewFeedbackBanner}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Unified Modern Control Bar */}
                      {(() => {
                        const inProgressCount = milestones.filter((m) => !m.completed && getMilestoneStatus(m) === "em_andamento").length || (currentActiveMilestone ? 1 : 0);
                        const totalCount = milestones.length;
                        const upcomingCount = upcomingMilestones.length;
                        const completedCount = completedMilestones.length;

                        const monthMap = new Map<string, { key: string; label: string; count: number; completed: number }>();
                        milestones.forEach((m) => {
                          const key = getMilestoneMonthKey(m.due_date);
                          const label = formatMonthKeyLabel(key);
                          const isDone = m.completed || getMilestoneStatus(m) === "concluido";
                          if (!monthMap.has(key)) {
                            monthMap.set(key, { key, label, count: 0, completed: 0 });
                          }
                          const curr = monthMap.get(key)!;
                          curr.count += 1;
                          if (isDone) curr.completed += 1;
                        });

                        const monthList = Array.from(monthMap.values()).sort((a, b) => {
                          if (a.key === "sem_data") return 1;
                          if (b.key === "sem_data") return -1;
                          return a.key.localeCompare(b.key);
                        });

                        const isAnyFilterActive = deliverableTab !== "all" || portalMilestoneMonthFilter !== "all" || milestoneSearchQuery.trim() !== "";

                        return (
                          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-2 relative z-10">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
                              
                              {/* 1. Sleek Segmented Status Tabs (Single Track) */}
                              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/5 overflow-x-auto no-scrollbar shrink-0">
                                {[
                                  { key: "all", label: "Todas", count: totalCount },
                                  { key: "current", label: "Em Andamento", count: inProgressCount },
                                  { key: "upcoming", label: "Próximas", count: upcomingCount },
                                  { key: "history", label: "Homologadas", count: completedCount },
                                ].map((tab) => {
                                  const isActive = deliverableTab === tab.key;
                                  return (
                                    <button
                                      key={tab.key}
                                      type="button"
                                      onClick={() => setDeliverableTab(tab.key as any)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap ${
                                        isActive
                                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-md shadow-indigo-600/40 border border-indigo-400/40 scale-[1.01]"
                                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                      }`}
                                    >
                                      <span>{tab.label}</span>
                                      <span
                                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                          isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-white/10 text-gray-400"
                                        }`}
                                      >
                                        {tab.count}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* 2. Unified Controls Toolbar (Search, Month, Staging) */}
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between xl:justify-end">
                                
                                {/* Search Input */}
                                <div className="relative flex-1 sm:flex-initial">
                                  <Search size={13} className="text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={milestoneSearchQuery}
                                    onChange={(e) => setMilestoneSearchQuery(e.target.value)}
                                    placeholder="Buscar entrega ou tarefa..."
                                    className="w-full sm:w-44 h-8.5 pl-7.5 pr-7 rounded-xl bg-black/40 hover:bg-black/60 focus:bg-black/80 border border-white/10 focus:border-indigo-500 text-xs text-white placeholder:text-gray-500 focus:outline-none transition-all"
                                  />
                                  {milestoneSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setMilestoneSearchQuery("")}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>

                                {/* Month Filter Selector */}
                                {monthList.length > 0 && (
                                  <div className="relative shrink-0">
                                    <Calendar size={13} className="text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                      value={portalMilestoneMonthFilter}
                                      onChange={(e) => setPortalMilestoneMonthFilter(e.target.value)}
                                      className={`h-8.5 pl-7.5 pr-7 rounded-xl text-xs font-semibold border appearance-none cursor-pointer focus:outline-none transition-all ${
                                        portalMilestoneMonthFilter !== "all"
                                          ? "bg-indigo-950/90 border-indigo-500/50 text-indigo-200 shadow-sm"
                                          : "bg-black/40 hover:bg-black/60 border-white/10 text-gray-300"
                                      }`}
                                    >
                                      <option value="all" className="bg-slate-900 text-white">Todos os Meses ({milestones.length})</option>
                                      {monthList.map((mMonth) => (
                                        <option key={mMonth.key} value={mMonth.key} className="bg-slate-900 text-white">
                                          {mMonth.key === "sem_data" ? `Sem data (${mMonth.count})` : `${mMonth.label} (${mMonth.completed}/${mMonth.count})`}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown size={12} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                )}

                                {/* Staging Button */}
                                {stagingLink && (
                                  <a
                                    href={stagingLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                                  >
                                    <Globe size={13} className="text-cyan-400" />
                                    <span>Staging</span>
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Active Filter Chips / Reset Bar */}
                            {isAnyFilterActive && (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                                <div className="flex flex-wrap items-center gap-1.5 text-gray-400">
                                  <span className="font-medium">Filtros ativos:</span>
                                  {deliverableTab !== "all" && (
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
                                      <span>Status: {deliverableTab === "current" ? "Em Andamento" : deliverableTab === "upcoming" ? "Próximas" : "Homologadas"}</span>
                                      <button type="button" onClick={() => setDeliverableTab("all")} className="hover:text-white cursor-pointer"><X size={10} /></button>
                                    </span>
                                  )}
                                  {portalMilestoneMonthFilter !== "all" && (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                                      <span>Mês: {formatMonthKeyLabel(portalMilestoneMonthFilter)}</span>
                                      <button type="button" onClick={() => setPortalMilestoneMonthFilter("all")} className="hover:text-white cursor-pointer"><X size={10} /></button>
                                    </span>
                                  )}
                                  {milestoneSearchQuery.trim() !== "" && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                                      <span>Busca: "{milestoneSearchQuery}"</span>
                                      <button type="button" onClick={() => setMilestoneSearchQuery("")} className="hover:text-white cursor-pointer"><X size={10} /></button>
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeliverableTab("all");
                                    setPortalMilestoneMonthFilter("all");
                                    setMilestoneSearchQuery("");
                                  }}
                                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium ml-auto"
                                >
                                  <RefreshCw size={11} />
                                  <span>Limpar filtros</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* MAIN CONTENT AREA: Render Milestones (Grid vs Timeline) */}
                      {(() => {
                        let filtered = milestones;

                        if (deliverableTab === "upcoming") {
                          filtered = upcomingMilestones;
                        } else if (deliverableTab === "current") {
                          filtered = currentActiveMilestone ? [currentActiveMilestone] : upcomingMilestones.slice(0, 1);
                        } else if (deliverableTab === "history") {
                          filtered = completedMilestones;
                        }

                        if (portalMilestoneMonthFilter !== "all") {
                          filtered = filtered.filter((m) => getMilestoneMonthKey(m.due_date) === portalMilestoneMonthFilter);
                        }

                        if (milestoneSearchQuery.trim()) {
                          const q = milestoneSearchQuery.toLowerCase().trim();
                          filtered = filtered.filter((m) => {
                            const titleMatch = (m.title || "").toLowerCase().includes(q);
                            const descMatch = (m.description || "").toLowerCase().includes(q);
                            const stageMatch = (m.stage || "").toLowerCase().includes(q);
                            const tasks = parseMilestoneTasks(m);
                            const taskMatch = tasks.some((t) => t.text.toLowerCase().includes(q));
                            return titleMatch || descMatch || stageMatch || taskMatch;
                          });
                        }

                        if (filtered.length === 0) {
                          return (
                            <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2 relative z-10">
                              <ListTodo size={28} className="mx-auto text-gray-500 mb-1" />
                              <h5 className="text-sm font-bold text-white">Nenhuma entrega encontrada para este filtro</h5>
                              <p className="text-xs text-gray-400">Tente alternar para a aba "Todas as Entregas" ou limpar seus critérios de busca.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeliverableTab("all");
                                  setPortalMilestoneMonthFilter("all");
                                  setMilestoneSearchQuery("");
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
                              >
                                <span>Restaurar Filtros</span>
                                <RefreshCw size={12} />
                              </button>
                            </div>
                          );
                        }

                        // 1. GRID VIEW MODE
                        if (milestoneViewMode === "grid") {
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                              {filtered.map((m, idx) => {
                                const status = getMilestoneStatus(m);
                                const cleanDesc = getMilestoneCleanDescription(m);
                                const tasks = parseMilestoneTasks(m);
                                const prog = getMilestoneProgress(m);
                                const isDone = status === "concluido" || prog === 100 || m.completed;
                                const isInProgress = !isDone && (status === "em_andamento" || idx === 0);
                                const dueDateObj = m.due_date ? new Date(m.due_date) : null;
                                const fb = deliveryFeedbacks.find((item) => item.milestone_id === m.id);
                                const isExpanded = expandedMilestones[m.id] ?? true;
                                const scopeBadges = getScopeBadges(m.title, m.stage);
                                const completedTasksCount = tasks.filter((t) => t.completed).length;

                                return (
                                  <div
                                    key={m.id}
                                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 group relative overflow-hidden ${
                                      isDone
                                        ? "bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/50"
                                        : isInProgress
                                        ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border-indigo-500/50 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/20"
                                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                    }`}
                                  >
                                    {/* Top Status & Badge */}
                                    <div className="space-y-2.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            Marco #{m.order_index}
                                          </span>
                                          {scopeBadges.map((badge, bIdx) => (
                                            <span
                                              key={bIdx}
                                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1"
                                            >
                                              <span>{badge.icon}</span>
                                              <span>{badge.label}</span>
                                            </span>
                                          ))}
                                        </div>

                                        <span
                                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                                            isDone
                                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                              : isInProgress
                                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse"
                                              : "bg-white/5 text-gray-400 border-white/10"
                                          }`}
                                        >
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              isDone ? "bg-emerald-400" : isInProgress ? "bg-indigo-400" : "bg-gray-400"
                                            }`}
                                          />
                                          <span>{isDone ? "Homologado" : isInProgress ? "Em Execução" : "Agendado"}</span>
                                        </span>
                                      </div>

                                      <h4 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                                        {m.title}
                                      </h4>

                                      {cleanDesc && (
                                        <p className="text-xs text-gray-300 leading-relaxed">
                                          {cleanDesc}
                                        </p>
                                      )}
                                    </div>

                                    {/* Progress Bar & Accordion Toggle */}
                                    <div className="space-y-3 pt-2 border-t border-white/10">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="text-gray-400 font-semibold flex items-center gap-1">
                                            <ListTodo size={12} className="text-indigo-400" />
                                            <span>Progresso da Entrega</span>
                                          </span>
                                          <span className="font-mono font-bold text-emerald-400">
                                            {prog}% Concluído {tasks.length > 0 && `(${completedTasksCount}/${tasks.length})`}
                                          </span>
                                        </div>
                                        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                          <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                              isDone
                                                ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                                                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                            }`}
                                            style={{ width: `${prog}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Accordion Trigger for Tasks */}
                                      {tasks.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => toggleMilestoneExpanded(m.id)}
                                          className="w-full py-1.5 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white flex items-center justify-between transition-all cursor-pointer"
                                        >
                                          <span>Checklist de Tarefas ({tasks.length} itens)</span>
                                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </button>
                                      )}

                                      {/* Accordion Content */}
                                      <AnimatePresence>
                                        {isExpanded && tasks.length > 0 && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1.5 overflow-hidden pt-1"
                                          >
                                            {tasks.map((task) => (
                                              <div
                                                key={task.id}
                                                className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition-colors ${
                                                  task.completed
                                                    ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                                                    : "bg-black/40 border-white/5 text-gray-300"
                                                }`}
                                              >
                                                <div
                                                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                                                    task.completed
                                                      ? "bg-emerald-500 text-white"
                                                      : "bg-white/10 border border-white/20 text-transparent"
                                                  }`}
                                                >
                                                  <Check size={10} />
                                                </div>
                                                <span
                                                  className={`text-[11px] leading-tight break-words ${
                                                    task.completed ? "line-through text-gray-400" : "text-white"
                                                  }`}
                                                >
                                                  {task.text}
                                                </span>
                                              </div>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5 text-pink-300 font-semibold">
                                        <Clock size={12} className="text-pink-400" />
                                        <span>
                                          {dueDateObj ? `Previsão: ${dueDateObj.toLocaleDateString("pt-BR")}` : "Cronograma Ativo"}
                                        </span>
                                      </div>

                                      <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                                        {isDone ? "✅ Homologado" : isInProgress ? "⚡ Em Execução" : "🗓️ Agendado"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        // 2. TIMELINE ROADMAP VIEW MODE
                        return (
                          <div className="relative z-10 space-y-6 pl-4 sm:pl-8 border-l-2 border-indigo-500/30 my-4">
                            {filtered.map((m, idx) => {
                              const status = getMilestoneStatus(m);
                              const cleanDesc = getMilestoneCleanDescription(m);
                              const tasks = parseMilestoneTasks(m);
                              const prog = getMilestoneProgress(m);
                              const isDone = status === "concluido" || prog === 100 || m.completed;
                              const isInProgress = !isDone && (status === "em_andamento" || idx === 0);
                              const dueDateObj = m.due_date ? new Date(m.due_date) : null;
                              const scopeBadges = getScopeBadges(m.title, m.stage);

                              return (
                                <div key={m.id} className="relative group">
                                  {/* Connector Node */}
                                  <div
                                    className={`absolute -left-[25px] sm:-left-[41px] top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs shadow-lg transition-all ${
                                      isDone
                                        ? "bg-emerald-950 border-emerald-500 text-emerald-400 shadow-emerald-900/50"
                                        : isInProgress
                                        ? "bg-indigo-950 border-indigo-400 text-white shadow-indigo-900/60 ring-4 ring-indigo-500/20 animate-pulse"
                                        : "bg-slate-900 border-gray-600 text-gray-500"
                                    }`}
                                  >
                                    {isDone ? <Check size={12} /> : <span className="font-bold text-[10px]">{m.order_index}</span>}
                                  </div>

                                  {/* Timeline Content Card */}
                                  <div
                                    className={`p-5 rounded-3xl border transition-all space-y-3.5 ${
                                      isDone
                                        ? "bg-emerald-950/15 border-emerald-500/30"
                                        : isInProgress
                                        ? "bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/40 border-indigo-500/50 shadow-xl"
                                        : "bg-white/[0.02] border-white/10"
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                          Marco #{m.order_index}
                                        </span>
                                        {scopeBadges.map((badge, bIdx) => (
                                          <span
                                            key={bIdx}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1"
                                          >
                                            <span>{badge.icon}</span>
                                            <span>{badge.label}</span>
                                          </span>
                                        ))}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {dueDateObj && (
                                          <span className="text-xs text-pink-300 font-semibold flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{dueDateObj.toLocaleDateString("pt-BR")}</span>
                                          </span>
                                        )}
                                        <span
                                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                            isDone
                                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                              : isInProgress
                                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                                              : "bg-white/5 text-gray-400 border-white/10"
                                          }`}
                                        >
                                          {isDone ? "Homologado" : isInProgress ? "Em Desenvolvimento" : "Previsto"}
                                        </span>
                                      </div>
                                    </div>

                                    <h4 className="text-base font-bold text-white">
                                      {m.title}
                                    </h4>

                                    {cleanDesc && (
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {cleanDesc}
                                      </p>
                                    )}

                                    {/* Task badges */}
                                    {tasks.length > 0 && (
                                      <div className="pt-2 flex flex-wrap gap-1.5">
                                        {tasks.map((task) => (
                                          <span
                                            key={task.id}
                                            className={`text-[10px] px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                              task.completed
                                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through"
                                                : "bg-black/40 border-white/10 text-gray-300"
                                            }`}
                                          >
                                            {task.completed ? <Check size={10} className="text-emerald-400" /> : <Clock size={9} />}
                                            <span>{task.text}</span>
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Action row */}
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                      <span className="text-[11px] text-gray-400 font-mono">
                                        Progresso: <strong className="text-emerald-400">{prog}%</strong>
                                      </span>
                                      <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                                        {isDone ? "✅ Homologado" : isInProgress ? "⚡ Em Execução" : "🗓️ Agendado"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
              </div>
            )}

            {/* 3. ABA: FINANCEIRO & EXTRATO */}
            {activeTab === "financial" && (
              <div className="w-full space-y-6">
                {/* Card 3: Módulo Financeiro do Cliente */}
              {(() => {
                const finSummary = calculateFinancialSummary(financialData);
                const allInstallments = financialData?.installments || [];

                const filteredInstallments = allInstallments.filter((inst) => {
                  if (financeStatusFilter === "all") return true;
                  const st = getInstallmentStatus(inst);
                  return st.status === financeStatusFilter;
                });

                return (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
                    {/* Glowing background accent */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                            <DollarSign size={12} className="text-emerald-400" />
                            <span>Módulo Financeiro do Cliente</span>
                          </span>
                          <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                            <Lock size={10} className="text-gray-400" />
                            <span>Visualização Somente Leitura</span>
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          <Receipt size={22} className="text-emerald-400" />
                          <span>Extrato & Quitação do Contrato</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 mt-1">
                          Acompanhamento transparente das parcelas contratadas, datas de vencimento e confirmações de quitação.
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span>Contrato Ativo #{selectedProject.id.slice(0, 8)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 4 Top Cards (Including Valor em Atraso) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                      {/* 1. Valor Total Contratado */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all shadow-lg flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Valor Total Contratado
                          </span>
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <DollarSign size={16} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                            {formatBRL(finSummary.contractValue)}
                          </p>
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                            <span>Investimento Global</span>
                            <span className="text-indigo-300 font-semibold">{finSummary.installmentsCount} parcelas</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Valor Já Pago */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-lg flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                            Valor Já Pago
                          </span>
                          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight font-mono">
                            {formatBRL(finSummary.totalPaid)}
                          </p>
                          <div className="mt-2 pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px] text-emerald-300">
                            <span>{finSummary.percentPaid}% quitado</span>
                            <span className="font-bold">{finSummary.paidCount} de {finSummary.installmentsCount} pagas</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Valor em Atraso (Inadimplência / Atrasadas) */}
                      <div
                        onClick={() => finSummary.overdueCount > 0 && setFinanceStatusFilter("vencido")}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between gap-3 ${
                          finSummary.overdueCount > 0
                            ? "bg-rose-950/30 border-rose-500/40 hover:border-rose-500/60 shadow-rose-950/30 cursor-pointer"
                            : "bg-rose-950/10 border-rose-500/20 hover:border-rose-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            {finSummary.overdueCount > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            )}
                            <span>Valor em Atraso</span>
                          </span>
                          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertCircle size={16} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight font-mono">
                            {formatBRL(finSummary.totalOverdue)}
                          </p>
                          <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-300">
                            <span>
                              {finSummary.overdueCount > 0
                                ? `⚠️ ${finSummary.overdueCount} ${finSummary.overdueCount === 1 ? "parcela atrasada" : "parcelas atrasadas"}`
                                : "Zero parcelas em atraso"}
                            </span>
                            <span className="font-bold">
                              {finSummary.overdueCount > 0 ? "Atrasada" : "Regularizada"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Saldo Restante */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                            Saldo Restante
                          </span>
                          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <Clock size={16} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-black text-purple-300 tracking-tight font-mono">
                            {formatBRL(finSummary.remainingBalance)}
                          </p>
                          <div className="mt-2 pt-2 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-purple-300/80">
                            <span>{100 - finSummary.percentPaid}% a faturar</span>
                            <span className="font-semibold text-purple-200">Conforme entregas</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consolidated Financial Progress Bar */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2 relative z-10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-300 flex items-center gap-1.5">
                          <Coins size={14} className="text-emerald-400" />
                          <span>Status Geral de Quitação Contratual</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-300">
                          {finSummary.percentPaid}% Liquidado ({formatBRL(finSummary.totalPaid)} de {formatBRL(finSummary.contractValue)})
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${finSummary.percentPaid}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 shadow-md shadow-emerald-500/30"
                        />
                      </div>
                    </div>

                    {/* Dedicated Pix Payment Details Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/60 border border-purple-500/30 relative z-10 shadow-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <QrCode size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>Dados Oficiais para Pagamento via Pix</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                ● Verificado
                              </span>
                            </h4>
                            <p className="text-[11px] text-gray-400">
                              Utilize a chave Pix abaixo para liquidação de qualquer parcela em aberto.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyPixKey(portalIssuerSettings.pixKey || "55.843.406/0001-28", e)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                            copiedPixKey
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/30"
                              : "bg-white/5 hover:bg-white/10 text-purple-200 border-purple-500/30 hover:border-purple-400"
                          }`}
                        >
                          {copiedPixKey ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span>Chave Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copiar Chave Pix</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Chave Pix ({portalIssuerSettings.pixKeyType?.toUpperCase() || "CNPJ"})</span>
                          <p className="font-mono font-bold text-white text-xs sm:text-sm break-all">{portalIssuerSettings.pixKey || "55.843.406/0001-28"}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Favorecido / Beneficiário</span>
                          <p className="font-bold text-purple-200">{portalIssuerSettings.pixBeneficiary || "Maira Reis"}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Instituição Bancária</span>
                          <p className="font-bold text-indigo-200">{portalIssuerSettings.bankName || "C6"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 relative z-10">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-semibold mr-1">Filtrar:</span>
                        {[
                          { key: "all", label: `Todas (${allInstallments.length})` },
                          { key: "pago", label: `Quitadas (${finSummary.paidCount})` },
                          { key: "em_dia", label: `A Vencer (${allInstallments.filter((i) => getInstallmentStatus(i).status === "em_dia").length})` },
                          { key: "pendente", label: `Pendentes (${allInstallments.filter((i) => getInstallmentStatus(i).status === "pendente").length})` },
                          { key: "vencido", label: `Atrasadas (${allInstallments.filter((i) => getInstallmentStatus(i).status === "vencido").length})` },
                        ].map((filter) => (
                          <button
                            key={filter.key}
                            type="button"
                            onClick={() => setFinanceStatusFilter(filter.key as any)}
                            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              financeStatusFilter === filter.key
                                ? filter.key === "vencido"
                                  ? "bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/30"
                                  : "bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30"
                                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Shield size={12} className="text-emerald-400" />
                        <span>Validação Fiscal e Notarial</span>
                      </div>
                    </div>

                    {/* Extrato em Tabela (Desktop: hidden sm:block) */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/10 relative z-10 shadow-lg bg-[#0a0d1a]/90">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.04] text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                            <th className="py-3.5 px-4">Identificador da Parcela</th>
                            <th className="py-3.5 px-4">Valor (R$)</th>
                            <th className="py-3.5 px-4">Vencimento</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Confirmação de Pagamento</th>
                            <th className="py-3.5 px-4">Forma / Comprovante</th>
                            <th className="py-3.5 px-4 text-right">Ação / Recibo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredInstallments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 px-4 text-center text-gray-400 text-xs">
                                Nenhuma parcela encontrada para este filtro.
                              </td>
                            </tr>
                          ) : (
                            filteredInstallments.map((inst) => {
                              const statusObj = getInstallmentStatus(inst);
                              const isPaid = statusObj.status === "pago";

                              return (
                                <tr
                                  key={inst.id}
                                  className={`hover:bg-white/[0.02] transition-colors ${
                                    isPaid ? "bg-emerald-500/[0.02]" : ""
                                  }`}
                                >
                                  {/* 1. Identificador da Parcela */}
                                  <td className="py-4 px-4 font-medium text-white">
                                    <div className="flex items-start gap-2.5">
                                      <span className="w-6 h-6 rounded-lg bg-white/10 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        #{inst.installment_number}
                                      </span>
                                      <div>
                                        <p className="font-bold text-white text-xs sm:text-sm">
                                          {inst.title}
                                        </p>
                                        {inst.notes && (
                                          <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs leading-relaxed">
                                            {inst.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* 2. Valor da Parcela */}
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <span className="text-sm font-black text-white font-mono">
                                      {formatBRL(inst.amount)}
                                    </span>
                                  </td>

                                  {/* 3. Vencimento */}
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                      <Calendar size={13} className="text-gray-400" />
                                      <span>
                                        {inst.due_date
                                          ? formatDateBR(inst.due_date)
                                          : "A combinar"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* 4. Status Visual Tag */}
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm ${statusObj.badgeClass}`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${statusObj.dotClass} animate-pulse`} />
                                      <span>{statusObj.label}</span>
                                    </span>
                                  </td>

                                  {/* 5. Data de Confirmação de Pagamento */}
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    {isPaid && inst.paid_at ? (
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                        <span>
                                          Quitado em {formatDateBR(inst.paid_at)}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Clock size={13} className="text-gray-500 shrink-0" />
                                        <span>Aguardando quitação</span>
                                      </div>
                                    )}
                                  </td>

                                  {/* 6. Forma de Pagamento & Comprovante Interno */}
                                  <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                                        <CreditCard size={12} className="text-indigo-400" />
                                        <span>{getPaymentMethodLabel(inst.payment_method)}</span>
                                      </span>
                                      {inst.receipt_url ? (
                                        <span
                                          className="text-[10px] font-mono text-emerald-300/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit flex items-center gap-1"
                                          title={`Código de autenticação: ${inst.receipt_url}`}
                                        >
                                          <ShieldCheck size={10} className="text-emerald-400" />
                                          <span className="truncate max-w-[140px]">{inst.receipt_url}</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 font-mono">
                                          Doc: #{inst.id.slice(0, 10)}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 7. : Botão Pagar Pix ou Baixar Recibo */}
                                  <td className="py-4 px-4 whitespace-nowrap text-right">
                                    {isPaid ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReceiptModal(inst)}
                                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold border border-emerald-400/30 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
                                          title="Visualizar e Baixar Recibo de Pagamento"
                                        >
                                          <Receipt size={13} />
                                          <span>Baixar Recibo</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleDirectPrintReceipt(inst, e)}
                                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                          title="Imprimir / Exportar PDF Direto"
                                        >
                                          <Printer size={13} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPixModal(inst)}
                                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold border border-purple-400/40 flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40 cursor-pointer active:scale-95"
                                          title="Pagar parcela via Pix Instantâneo"
                                        >
                                          <QrCode size={13} />
                                          <span>Pagar via Pix</span>
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Installment Card List (block sm:hidden) */}
                    <div className="block sm:hidden space-y-3 relative z-10">
                      {filteredInstallments.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-400">
                          Nenhuma parcela encontrada para este filtro.
                        </div>
                      ) : (
                        filteredInstallments.map((inst) => {
                          const statusObj = getInstallmentStatus(inst);
                          const isPaid = statusObj.status === "pago";

                          return (
                            <div
                              key={inst.id}
                              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                isPaid
                                  ? "bg-emerald-950/20 border-emerald-500/30"
                                  : "bg-white/[0.03] border-white/10"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                    #{inst.installment_number}
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-white text-xs leading-tight">
                                      {inst.title}
                                    </h5>
                                    {inst.notes && (
                                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{inst.notes}</p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border shrink-0 ${statusObj.badgeClass}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dotClass} animate-pulse`} />
                                  <span>{statusObj.label}</span>
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase block font-medium">Valor</span>
                                  <span className="font-black text-white text-sm font-mono">{formatBRL(inst.amount)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase block font-medium">Vencimento</span>
                                  <span className="font-semibold text-gray-200 text-xs">
                                    {inst.due_date ? formatDateBR(inst.due_date) : "A combinar"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase block font-medium">Forma</span>
                                  <span className="font-semibold text-indigo-300 text-xs">{getPaymentMethodLabel(inst.payment_method)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 uppercase block font-medium">Quitação</span>
                                  <span className={`font-semibold text-xs ${isPaid ? "text-emerald-400" : "text-gray-500"}`}>
                                    {isPaid && inst.paid_at ? formatDateBR(inst.paid_at) : "Pendente"}
                                  </span>
                                </div>
                              </div>

                              {isPaid ? (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReceiptModal(inst)}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                  >
                                    <Receipt size={14} />
                                    <span>Baixar Recibo Oficial</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDirectPrintReceipt(inst, e)}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                                    title="Imprimir"
                                  >
                                    <Printer size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPixModal(inst)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                  >
                                    <QrCode size={15} />
                                    <span>Pagar via Pix Instantâneo</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Information & Security Notice Banner (Strictly Read-Only Guarantee) */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 relative z-10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                        <span>
                          Extrato financeiro com garantia de imutabilidade e integridade contratual.
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/553598030543?text=${encodeURIComponent(
                          `Olá Maira! Gostaria de falar sobre o financeiro/faturamento do projeto "${selectedProject.title}".`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center gap-1.5 w-fit shrink-0"
                      >
                        <MessageSquare size={13} className="text-emerald-400" />
                        <span>Solicitar 2ª via ou NF-e</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
              </div>
            )}

            {/* 4. ABA: ATUALIZAÇÕES & NOTAS */}
            {activeTab === "updates" && (
              <div className="w-full space-y-6">
                {/* Card 5: Feed de Updates e Notas */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-400" />
                      <span>Timeline de Alinhamentos & Notas de Versão</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Registro cronológico e transparente de reuniões, sprints, notas de versão e comunicados oficiais.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 w-fit">
                    {updates.length} {updates.length === 1 ? "registro" : "registros"}
                  </span>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: "all", label: "Todos" },
                      { key: "reuniao", label: "Reuniões" },
                      { key: "versao", label: "Versões" },
                      { key: "comunicado", label: "Comunicados" },
                      { key: "milestone", label: "Marcos" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedUpdateCategory(cat.key)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                          selectedUpdateCategory === cat.key
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30"
                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={updateSearchQuery}
                      onChange={(e) => setUpdateSearchQuery(e.target.value)}
                      placeholder="Buscar notas e updates..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Timeline Feed */}
                {(() => {
                  const filteredUpdates = updates.filter((u) => {
                    if (selectedUpdateCategory !== "all") {
                      if (selectedUpdateCategory === "versao" && u.category !== "versao" && u.category !== "release") return false;
                      if (selectedUpdateCategory === "comunicado" && u.category !== "comunicado" && u.category !== "alert") return false;
                      if (selectedUpdateCategory === "reuniao" && u.category !== "reuniao") return false;
                      if (selectedUpdateCategory === "milestone" && u.category !== "milestone") return false;
                    }
                    if (updateSearchQuery) {
                      const q = updateSearchQuery.toLowerCase();
                      return (
                        u.title.toLowerCase().includes(q) ||
                        u.content.toLowerCase().includes(q) ||
                        (u.version_tag && u.version_tag.toLowerCase().includes(q)) ||
                        (u.meeting_attendees && u.meeting_attendees.toLowerCase().includes(q))
                      );
                    }
                    return true;
                  });

                  if (filteredUpdates.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
                        <Bell size={28} className="text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400">Nenhuma nota ou atualização encontrada para esta busca.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 via-purple-500 to-pink-500">
                      {filteredUpdates.map((update) => {
                        const typeInfo = getUpdateTypeInfo(update.category);
                        const TypeIcon = typeInfo.icon;
                        const dateObj = new Date(update.created_at);
                        const formattedDate = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) +
                            " às " +
                            dateObj.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Data não definida";

                        return (
                          <div key={update.id} className="relative group">
                            {/* Dot */}
                            <div
                              className={`absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full ${typeInfo.dotClass} ring-4 ring-[#070913] transition-transform group-hover:scale-125`}
                            />

                            {/* Card Box */}
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all shadow-sm flex flex-col gap-3">
                              {/* Header Meta */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${typeInfo.badgeClass}`}
                                  >
                                    <TypeIcon size={12} />
                                    <span>{typeInfo.label}</span>
                                  </span>

                                  {update.version_tag && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <Tag size={10} />
                                      {update.version_tag}
                                    </span>
                                  )}

                                  {update.meeting_attendees && (
                                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                                      <Users size={10} className="text-indigo-400" />
                                      {update.meeting_attendees}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                                  <Clock size={11} className="text-gray-500" />
                                  {formattedDate}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                                {update.title}
                              </h4>

                              {/* Rich Markdown Content */}
                              <div className="pt-1 border-t border-white/5">
                                {renderRichMarkdown(update.content)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              </div>
            )}

            {/* 5. ABA: DOCUMENTOS */}
            {activeTab === "documents" && (
              <div className="w-full space-y-6">
                {/* Card 6: Central de Documentos do Cliente */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
                {/* Glowing background accent */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
                        <FileCheck size={12} className="text-pink-400" />
                        <span>Central de Documentos do Cliente</span>
                      </span>
                      <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                        <Lock size={10} className="text-emerald-400" />
                        <span>Repositório Seguro</span>
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <FileText size={22} className="text-pink-400" />
                      <span>Documentos & Contratos do Projeto</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">
                      Repositório oficial para visualização inline (PDF viewer) e download direto de contratos, propostas e termos de aceite.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 w-fit shrink-0 shadow-sm">
                    {documents.length} {documents.length === 1 ? "arquivo liberado" : "arquivos liberados"}
                  </span>
                </div>

                {/* Search & Category Filter Pills */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: "all", label: "Todos" },
                      { key: "contrato", label: "Contratos" },
                      { key: "proposta", label: "Propostas" },
                      { key: "termo_aceite", label: "Termos de Aceite" },
                      { key: "recibo", label: "Recibos" },
                      { key: "briefing", label: "Briefings" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedDocCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedDocCategory === cat.key
                            ? "bg-pink-600 text-white border-pink-500 shadow-sm shadow-pink-600/30"
                            : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      placeholder="Buscar documento ou contrato..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Documents Grid / List */}
                {(() => {
                  const filtered = documents.filter((doc) => {
                    if (selectedDocCategory !== "all" && doc.category !== selectedDocCategory) return false;
                    if (docSearchQuery) {
                      const q = docSearchQuery.toLowerCase();
                      return (
                        doc.title.toLowerCase().includes(q) ||
                        doc.filename.toLowerCase().includes(q) ||
                        (doc.notes && doc.notes.toLowerCase().includes(q))
                      );
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center relative z-10">
                        <FileText size={32} className="text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400">Nenhum documento encontrado para os critérios selecionados.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {filtered.map((doc) => {
                        const catInfo = getDocumentCategoryInfo(doc.category);
                        return (
                          <div
                            key={doc.id}
                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between gap-3 group shadow-lg"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2.5">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${catInfo.badgeClass}`}>
                                  {catInfo.label}
                                </span>
                                <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">PDF</span>
                                  <span>{doc.file_size_formatted}</span>
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                                {doc.title}
                              </h4>

                              {doc.notes && (
                                <p className="text-xs text-gray-300 mt-1.5 line-clamp-2 leading-relaxed">
                                  {doc.notes}
                                </p>
                              )}
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar size={11} className="text-gray-600" />
                                {formatDateSafe(doc.uploaded_at)}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenPdfViewer(doc)}
                                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
                                  title="Visualizar documento online"
                                >
                                  <Eye size={13} className="text-indigo-400" />
                                  <span>Visualizar</span>
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5 active:scale-95"
                                  title="Baixar arquivo PDF"
                                >
                                  <Download size={13} />
                                  <span>Baixar PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Security Footer */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs text-gray-400 relative z-10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <span>Documentos criptografados com assinatura digital SHA-256 e autenticidade contratual.</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                    PDF Security Protocol v2
                  </span>
                </div>
              </div>
              </div>
            )}

            {/* 6. ABA: SUPORTE & FAQ */}
            {activeTab === "support" && (
              <div className="w-full space-y-6">
                {/* Full Contact & FAQ Accordion Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
                      <Headphones size={13} className="text-indigo-400" />
                      <span>Suporte Operacional & FAQ</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Central de Atendimento & Dúvidas Frequentes</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Suporte rápido, canais oficiais e esclarecimento de dúvidas sobre entregas e faturamento.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Atendimento Operacional Ativo</span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid: Left (Contact & Schedule) | Right (Mini Accordion FAQ) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Col (5 cols): Schedule & Direct Contacts */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Schedule & SLA Card */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                        <Clock size={15} className="text-indigo-400" />
                        <span>Horários de Atendimento & SLA</span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-gray-400">Dias Úteis:</span>
                          <span className="font-bold text-white text-right">Segunda a Sexta-feira</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-gray-400">Horário:</span>
                          <span className="font-bold text-emerald-400 text-right">09:00 às 18:00 (Brasília)</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-gray-400">SLA WhatsApp:</span>
                          <span className="font-bold text-indigo-300 text-right">&lt; 2 horas úteis</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                        Chamados críticos ou solicitações de ajuste abertas no portal são triadas com prioridade imediata.
                      </p>
                    </div>

                    {/* Official Channels Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 space-y-3">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                        Canais Oficiais Diretos
                      </span>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/553598030543?text=${encodeURIComponent(
                          `Olá Maira! Sou o cliente do projeto "${selectedProject.title}". Gostaria de solicitar suporte/alinhamento.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
                      >
                        <MessageSquare size={16} />
                        <span>Conversar no WhatsApp</span>
                        <ExternalLink size={13} className="opacity-70" />
                      </a>
                    </div>
                  </div>

                  {/* Right Col (7 cols): Mini Sanfona (Accordion) FAQ */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-purple-400" />
                        <span>Perguntas Frequentes do Cliente ({PORTAL_FAQS.length})</span>
                      </span>
                      <span className="text-[11px] text-gray-500">Clique para expandir</span>
                    </div>

                    <div className="space-y-2">
                      {PORTAL_FAQS.map((faq) => {
                        const isOpen = openFaqId === faq.id;

                        return (
                          <div
                            key={faq.id}
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                              isOpen
                                ? "bg-white/[0.04] border-indigo-500/40 shadow-lg shadow-indigo-950/30"
                                : "bg-white/[0.02] border-white/5 hover:border-white/15"
                            }`}
                          >
                            {/* Accordion Trigger Header */}
                            <button
                              type="button"
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                              className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  ?
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                                  {faq.question}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider hidden sm:inline-block ${
                                    faq.category === "entregas"
                                      ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                      : faq.category === "financeiro"
                                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                      : faq.category === "reunioes"
                                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                      : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                  }`}
                                >
                                  {faq.category}
                                </span>

                                <div
                                  className={`p-1 rounded-lg text-gray-400 transition-transform duration-200 ${
                                    isOpen ? "rotate-180 text-white bg-white/10" : ""
                                  }`}
                                >
                                  <ChevronDown size={14} />
                                </div>
                              </div>
                            </button>

                            {/* Accordion Content */}
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2 text-xs text-gray-300 leading-relaxed">
                                    <p>{faq.answer}</p>
                                    {faq.highlight && (
                                      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-[11px] font-semibold flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-indigo-400 shrink-0" />
                                        <span>{faq.highlight}</span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        )}
      </main>

{/* Floating Support & FAQ Button / Quick Drawer */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setFloatingSupportOpen(!floatingSupportOpen)}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-2xl shadow-indigo-950/80 border border-white/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
          title="Abrir Suporte e FAQ Rápido"
        >
          <div className="relative">
            <MessageCircle size={16} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-900 animate-pulse" />
          </div>
          <span>Suporte & FAQ</span>
        </button>

        {/* Floating Quick Drawer / Popover */}
        <AnimatePresence>
          {floatingSupportOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-14 right-0 w-80 sm:w-96 p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-4 text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <Headphones size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Suporte Direto MR</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online • Resposta em até 2h</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFloatingSupportOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Quick WhatsApp Action */}
              <a
                href={`https://wa.me/553598030543?text=${encodeURIComponent(
                  `Olá Maira! Sou o cliente do projeto "${selectedProject?.title || "Portfólio"}". Gostaria de tirar uma dúvida.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
              >
                <MessageSquare size={14} />
                <span>Conversar no WhatsApp</span>
              </a>

              {/* Schedule Snapshot */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-gray-300">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Atendimento:</span>
                  <span className="text-white font-semibold">Seg a Sex, 09h às 18h</span>
                </div>
              </div>

              {/* Mini Top FAQ list */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Top Dúvidas:
                </span>
                {PORTAL_FAQS.slice(0, 3).map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => {
                      setOpenFaqId(faq.id);
                      setFloatingSupportOpen(false);
                      const el = document.getElementById("faq-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-[11px] text-gray-300 hover:text-white transition-colors truncate block"
                  >
                    • {faq.question}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <MessageSquare size={20} className="text-indigo-400" />
                <span>Enviar Mensagem ou Solicitação</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Descreva sua dúvida, aprovação ou ajuste desejado. A mensagem será encaminhada diretamente para o WhatsApp da Maira com a identificação do seu projeto.
              </p>

              <textarea
                rows={4}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Ex: Olá Maira, validei as telas no Figma e gostaria de sugerir uma alteração no botão de login..."
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm outline-none resize-none"
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendFeedback}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Send size={14} />
                  <span>Enviar pelo WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Formal Delivery Feedback & Approval Modal */}
      <AnimatePresence>
        {approvalModalOpen && selectedMilestoneForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                      reviewType === "approval"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-950/40"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-950/40"
                    }`}
                  >
                    {reviewType === "approval" ? (
                      <CheckCheck size={22} />
                    ) : (
                      <AlertCircle size={22} />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        reviewType === "approval"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {reviewType === "approval"
                        ? "Aprovação de Entrega"
                        : "Solicitação de Ajustes"}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {reviewType === "approval"
                        ? "Aceite Formal de Entrega"
                        : "Solicitar Ajustes na Entrega"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Milestone Context Box */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    Marco #{selectedMilestoneForReview.order_index}
                  </span>
                  {selectedMilestoneForReview.stage && (
                    <span className="text-[10px] text-gray-400">
                      • {selectedMilestoneForReview.stage}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {selectedMilestoneForReview.title}
                </p>
                {selectedMilestoneForReview.description && (
                  <p className="text-[11px] text-gray-400 line-clamp-2">
                    {selectedMilestoneForReview.description}
                  </p>
                )}
              </div>

              {/* Form with single text area */}
              <form onSubmit={handleSubmitDeliveryReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    {reviewType === "approval"
                      ? "Considerações de Aceite & Validação (Opcional)"
                      : "Descreva os Ajustes e Correções Desejados *"}
                  </label>
                  <textarea
                    rows={4}
                    required={reviewType === "change_request"}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                      reviewType === "approval"
                        ? "Ex: Validei os requisitos da entrega e tudo está de acordo com o combinado. Autorizo a continuidade para a próxima etapa."
                        : "Ex: Identifiquei que na tela de pagamento o valor total está desalinhado e o botão de voltar não responde no iPhone..."
                    }
                    className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-xs sm:text-sm outline-none resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {reviewType === "approval"
                      ? "Ao confirmar, seu aceite formal será registrado no painel e a desenvolvedora será notificada imediatamente."
                      : "Seu apontamento será encaminhado imediatamente à desenvolvedora com prioridade na sprint."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setApprovalModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer ${
                      reviewType === "approval"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40"
                        : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/40"
                    }`}
                  >
                    {reviewType === "approval" ? (
                      <CheckCheck size={15} />
                    ) : (
                      <Send size={15} />
                    )}
                    <span>
                      {reviewType === "approval"
                        ? "Confirmar Aceite & Notificar"
                        : "Enviar Solicitação & Notificar"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Document Viewer Modal */}
      <AnimatePresence>
        {pdfViewerOpen && viewingDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                    PDF
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {viewingDocument.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getDocumentCategoryInfo(viewingDocument.category).badgeClass}`}>
                        {getDocumentCategoryInfo(viewingDocument.category).label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {viewingDocument.filename} • {viewingDocument.file_size_formatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadDocument(viewingDocument)}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md shadow-pink-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Baixar PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setPdfViewerOpen(false);
                      setViewingDocument(null);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body / PDF Viewer Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0c16] flex flex-col items-center justify-center min-h-[400px]">
                {viewingDocument.file_url && viewingDocument.file_url.startsWith("data:application/pdf") ? (
                  <iframe
                    src={viewingDocument.file_url}
                    title={viewingDocument.title}
                    className="w-full h-[600px] rounded-2xl border border-white/10 bg-white"
                  />
                ) : (
                  <div className="w-full max-w-2xl p-6 sm:p-10 rounded-2xl bg-white text-slate-900 shadow-2xl border border-white/20 flex flex-col gap-6">
                    {/* Simulated Document Header */}
                    <div className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                          Maira Reis • Engenharia de Software & Design
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                          {viewingDocument.title}
                        </h2>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-bold">
                        PDF CERTIFICADO
                      </div>
                    </div>

                    {/* Document Meta Table */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block">Projeto Associado</span>
                        <span className="text-slate-800 font-semibold">{selectedProject?.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block">Tipo de Documento</span>
                        <span className="text-slate-800 font-semibold">{getDocumentCategoryInfo(viewingDocument.category).label}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block">Data de Registro</span>
                        <span className="text-slate-800 font-semibold">{new Date(viewingDocument.uploaded_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block">Tamanho / Formato</span>
                        <span className="text-slate-800 font-semibold">{viewingDocument.file_size_formatted} (application/pdf)</span>
                      </div>
                    </div>

                    {/* Document Content / Summary */}
                    <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                      <p className="font-medium text-slate-800">
                        {viewingDocument.notes || "Este documento compõe o dossiê formal do projeto e atesta os termos, especificações e acordos técnicos celebrados."}
                      </p>
                      <p>
                        O presente arquivo digital foi gerado e homologado para acesso exclusivo do cliente através do Portal do Cliente MR.
                      </p>
                    </div>

                    {/* Security & Digital Signature Footer */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-semibold text-emerald-700">Autenticidade Verificada via Hash SHA-256</span>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(viewingDocument)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-2 transition-all shadow-md"
                      >
                        <Download size={14} />
                        <span>Fazer Download do Arquivo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Receipt & PDF Download Modal */}
      <AnimatePresence>
        {receiptModalOpen && activeReceiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 overflow-hidden"
            >
              {/* Modal Topbar */}
              <div className="p-4 sm:p-5 bg-black/50 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Receipt size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        Recibo Oficial de Quitação
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                        {activeReceiptData.receiptNumber}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {activeReceiptData.projectTitle} • Parcela #{activeReceiptData.installmentNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openReceiptInNewWindow(activeReceiptData, true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadReceiptDocument(activeReceiptData)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Baixar arquivo do recibo"
                  >
                    <Download size={14} />
                    <span className="hidden md:inline">Baixar Arquivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiptModalOpen(false);
                      setActiveReceiptData(null);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body / Live Receipt Card */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0d1a] flex flex-col items-center">
                <div className="w-full max-w-3xl rounded-2xl bg-white text-slate-900 p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden">
                  {/* Decorative Background Stamp */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-6xl sm:text-7xl font-black text-emerald-500/5 select-none pointer-events-none tracking-widest uppercase">
                    QUITADO
                  </div>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {activeReceiptData.agency.tradeName}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {activeReceiptData.agency.name} • CNPJ: {activeReceiptData.agency.document}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activeReceiptData.agency.email} • {activeReceiptData.agency.phone} • {activeReceiptData.agency.city}/{activeReceiptData.agency.state}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider">
                        Recibo de Quitação
                      </div>
                      <p className="text-xs font-mono font-bold text-indigo-600 mt-1">
                        Nº {activeReceiptData.receiptNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Emissão: {new Date(activeReceiptData.paidAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Value Highlight Banner */}
                  <div className="my-6 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Valor Recebido e Quitado
                      </span>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        ({numberToBRLWords(activeReceiptData.amount)})
                      </p>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
                      {formatBRL(activeReceiptData.amount)}
                    </div>
                  </div>

                  {/* Parties Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Prestador */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        🏢 Prestador de Serviços (Emissor)
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{activeReceiptData.agency.tradeName}</p>
                      <p className="text-slate-600"><strong>Responsável:</strong> {activeReceiptData.agency.name}</p>
                      <p className="text-slate-600"><strong>CNPJ:</strong> {activeReceiptData.agency.document}</p>
                      <p className="text-slate-600"><strong>E-mail:</strong> {activeReceiptData.agency.email}</p>
                    </div>

                    {/* Tomador */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        👤 Tomador do Serviço (Cliente)
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{activeReceiptData.client.name}</p>
                      {activeReceiptData.client.company && (
                        <p className="text-slate-600"><strong>Empresa:</strong> {activeReceiptData.client.company}</p>
                      )}
                      {activeReceiptData.client.document && (
                        <p className="text-slate-600"><strong>Documento:</strong> {activeReceiptData.client.document}</p>
                      )}
                      <p className="text-slate-600"><strong>E-mail:</strong> {activeReceiptData.client.email || "Não informado"}</p>
                    </div>
                  </div>

                  {/* Formal Statement */}
                  <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-500 text-xs leading-relaxed text-slate-700 mb-6">
                    Declaramos para os devidos fins de direito que recebemos do Tomador acima qualificado a quantia líquida de{" "}
                    <strong className="text-slate-900 font-bold">{formatBRL(activeReceiptData.amount)}</strong> ({numberToBRLWords(activeReceiptData.amount)}), referente ao pagamento integral da{" "}
                    <strong className="text-slate-900 font-bold">
                      Parcela #{activeReceiptData.installmentNumber} ({activeReceiptData.installmentTitle})
                    </strong>{" "}
                    vinculada ao projeto <strong className="text-slate-900 font-bold">&quot;{activeReceiptData.projectTitle}&quot;</strong>, conferindo por meio deste documento a respectiva e irrevogável quitação financeira quanto a esta parcela.
                  </div>

                  {/* Details Table */}
                  <div className="overflow-x-auto w-full mb-6 no-scrollbar">
                    <table className="w-full text-xs text-left border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                          <th className="py-2.5 px-3">Item / Parcela</th>
                          <th className="py-2.5 px-3">Vencimento</th>
                          <th className="py-2.5 px-3">Forma de Pagamento</th>
                          <th className="py-2.5 px-3">Data de Quitação</th>
                          <th className="py-2.5 px-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            Parcela #{activeReceiptData.installmentNumber} - {activeReceiptData.installmentTitle}
                            {activeReceiptData.notes && (
                              <p className="text-[11px] font-normal text-slate-500 mt-0.5">{activeReceiptData.notes}</p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {activeReceiptData.dueDate
                              ? new Date(activeReceiptData.dueDate).toLocaleDateString("pt-BR")
                              : "Conforme entrega"}
                          </td>
                          <td className="py-3 px-3 font-bold text-indigo-700 uppercase">
                            {activeReceiptData.paymentMethod}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700">
                            {new Date(activeReceiptData.paidAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                            {formatBRL(activeReceiptData.amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures & Stamp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-300">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold mb-3">
                        <CheckCircle2 size={12} />
                        <span>PAGAMENTO VERIFICADO & LIQUIDADO</span>
                      </div>
                      <div className="w-48 mx-auto border-t border-slate-900 pt-1.5">
                        <p className="text-xs font-bold text-slate-900">{activeReceiptData.agency.name}</p>
                        <p className="text-[11px] text-slate-500">{activeReceiptData.agency.tradeName}</p>
                      </div>
                    </div>

                    <div className="text-center flex flex-col justify-end">
                      <div className="w-48 mx-auto border-t border-slate-900 pt-1.5 mt-6">
                        <p className="text-xs font-bold text-slate-900">{activeReceiptData.client.name}</p>
                        <p className="text-[11px] text-slate-500">Tomador do Serviço</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Security / Auth */}
                  <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Autenticação: {activeReceiptData.authCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyReceiptAuth(activeReceiptData.authCode || "")}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                        title="Copiar código de autenticação"
                      >
                        {copiedReceiptAuth ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <span>Assinado digitalmente por Maira Reis</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Documento em conformidade fiscal e com validade jurídica de quitação.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => downloadReceiptDocument(activeReceiptData)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Salvar Arquivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openReceiptInNewWindow(activeReceiptData, true)}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Printer size={14} />
                    <span>Imprimir / PDF (A4)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Pagamento via Pix Instantâneo */}
      <AnimatePresence>
        {pixPaymentModalOpen && activePayingInstallment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0b0f19] border border-purple-500/30 shadow-2xl shadow-purple-950/50 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-[#0b0f19] border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>Pagamento via Pix Instantâneo</span>
                    </h3>
                    <p className="text-xs text-purple-200/80">
                      Parcela #{activePayingInstallment.installment_number}: {activePayingInstallment.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPixPaymentModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Amount Highlight */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-indigo-950/20 border border-purple-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase font-semibold block">Valor a Pagar</span>
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {formatBRL(activePayingInstallment.amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold block">Vencimento</span>
                    <span className="text-xs sm:text-sm font-bold text-purple-200">
                      {activePayingInstallment.due_date
                        ? formatDateBR(activePayingInstallment.due_date)
                        : "Imediato"}
                    </span>
                  </div>
                </div>

                {/* Pix Key Copy Box */}
                <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <QrCode size={14} />
                      <span>Chave Pix Oficial ({portalIssuerSettings.pixKeyType?.toUpperCase() || "CNPJ"})</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                      Copia e Cola
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="font-mono text-xs sm:text-sm font-bold text-white break-all flex-1 select-all">
                      {portalIssuerSettings.pixKey || "55.843.406/0001-28"}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleCopyPixKey(portalIssuerSettings.pixKey || "55.843.406/0001-28", e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                        copiedPixKey
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-purple-600 hover:bg-purple-500 text-white border-purple-400/40"
                      }`}
                    >
                      {copiedPixKey ? (
                        <>
                          <Check size={13} />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bank & Beneficiary Details */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Beneficiário / Favorecido:</span>
                    <span className="font-bold text-white">{portalIssuerSettings.pixBeneficiary || "Maira Reis"}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Instituição Bancária:</span>
                    <span className="font-bold text-indigo-300">{portalIssuerSettings.bankName || "C6"}</span>
                  </div>
                  {portalIssuerSettings.bankAgency && (
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Agência / Conta:</span>
                      <span className="font-mono text-gray-300">
                        {portalIssuerSettings.bankAgency} {portalIssuerSettings.bankAccount ? `/ ${portalIssuerSettings.bankAccount}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-gray-300 space-y-1">
                  <p className="font-semibold text-purple-200">Como efetuar o pagamento:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
                    <li>Copie a chave Pix acima e cole no aplicativo do seu banco.</li>
                    <li>Confira o nome do beneficiário (<strong>{portalIssuerSettings.pixBeneficiary || "Maira Reis"}</strong>).</li>
                    <li>Após transferir, envie o comprovante pelo botão abaixo para emissão do recibo.</li>
                  </ol>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => handleCopyPixKey(portalIssuerSettings.pixKey || "55.843.406/0001-28", e)}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>{copiedPixKey ? "Chave Copiada" : "Copiar Chave"}</span>
                </button>

                <a
                  href={`https://wa.me/553598030543?text=${encodeURIComponent(
                    `Olá Maira! Realizei o pagamento via Pix da parcela #${activePayingInstallment.installment_number} (${formatBRL(activePayingInstallment.amount)}) referente ao projeto "${selectedProject?.title || "Projeto"}". Segue comprovante em anexo:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare size={14} />
                  <span>Enviar Comprovante</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Carregando portal do cliente...</p>
          </div>
        </div>
      }
    >
      <ClientPortalContent />
    </Suspense>
  );
}