"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
  ThumbsUp,
  LifeBuoy,
  HelpCircle,
  Radio,
  PieChart,
  Award,
  FileSpreadsheet,
  SendHorizontal,
  MessageSquarePlus,
  Share2,
  ClipboardList,
  Inbox,
  BadgeCheck,
  FileCheck,
  Package,
  ChevronDown,
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
  GeneratedDocData,
  GeneratedDocType,
  openGeneratedDocument,
  getDocTypeLabel,
} from "@/lib/documentGenerator";
import {
  sendTransactionalEmail,
  getDispatchedEmailLogs,
  DispatchedEmailLog,
} from "@/lib/emailService";
import { ApprovalsModule } from "@/components/admin/ApprovalsModule";
import { DocumentsModule } from "@/components/admin/DocumentsModule";
import { SupportModule } from "@/components/admin/SupportModule";
import { BroadcastModule } from "@/components/admin/BroadcastModule";
import { ReportsModule } from "@/components/admin/ReportsModule";
import { ProposalsModule } from "@/components/admin/ProposalsModule";
import { KanbanModule } from "@/components/admin/KanbanModule";
import { SettingsModule } from "@/components/admin/SettingsModule";

export type ProjectStatus =
  | "planejamento"
  | "em_andamento"
  | "homologacao"
  | "concluido"
  | "desenvolvimento"
  | "design"
  | "testes"
  | "pausado";

export const normalizeProjectStatus = (status: string | null | undefined): ProjectStatus => {
  if (!status) return "planejamento";
  const s = String(status).toLowerCase().trim();
  if (
    s === "em_andamento" ||
    s === "in_progress" ||
    s === "active" ||
    s === "em andamento" ||
    s === "desenvolvimento" ||
    s === "design"
  ) {
    return "em_andamento";
  }
  if (
    s === "planejamento" ||
    s === "planning" ||
    s === "draft" ||
    s === "pending"
  ) {
    return "planejamento";
  }
  if (
    s === "homologacao" ||
    s === "review" ||
    s === "testing" ||
    s === "testes" ||
    s === "homologação"
  ) {
    return "homologacao";
  }
  if (
    s === "concluido" ||
    s === "completed" ||
    s === "done" ||
    s === "concluído" ||
    s === "finished"
  ) {
    return "concluido";
  }
  if (
    s === "pausado" ||
    s === "paused" ||
    s === "on_hold" ||
    s === "cancelled"
  ) {
    return "pausado";
  }
  return "em_andamento";
};

export const getStatusCandidates = (status: ProjectStatus): string[] => {
  switch (status) {
    case "em_andamento":
      return [
        "em_andamento",
        "in_progress",
        "active",
        "desenvolvimento",
        "design",
        "em andamento",
        "pending",
        "planejamento",
      ];
    case "planejamento":
      return [
        "planejamento",
        "planning",
        "pending",
        "draft",
        "in_progress",
        "active",
      ];
    case "homologacao":
      return [
        "homologacao",
        "review",
        "testing",
        "testes",
        "homologação",
        "in_progress",
      ];
    case "concluido":
      return [
        "concluido",
        "completed",
        "done",
        "concluído",
        "finished",
      ];
    case "pausado":
      return [
        "pausado",
        "paused",
        "on_hold",
        "cancelled",
        "pending",
      ];
    default:
      return [status, "in_progress", "planning", "completed", "pending", "active"];
  }
};

export interface Project {
  id: string;
  client_id: string | null;
  client_email?: string | null;
  client_name?: string | null;
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

export const matchProjectToClient = (p: Project | null | undefined, client: Profile | null | undefined): boolean => {
  if (!p || !client) return false;
  const cleanClientEmail = (client.email || "").toLowerCase().trim();
  const cleanClientId = (client.id || "").toLowerCase().trim();
  const pClientId = (p.client_id || "").toLowerCase().trim();
  const pClientEmail = (p.client_email || "").toLowerCase().trim();
  const cleanName = (client.full_name || "").toLowerCase().trim();
  const pClientName = (p.client_name || "").toLowerCase().trim();

  return Boolean(
    (client.id && p.client_id === client.id) ||
    (cleanClientId && pClientId === cleanClientId) ||
    (cleanClientEmail && pClientId === cleanClientEmail) ||
    (cleanClientEmail && pClientEmail === cleanClientEmail) ||
    (cleanName && pClientName === cleanName) ||
    (cleanName && pClientId && pClientId.includes(cleanName))
  );
};

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

export type MilestoneStatus = "pendente" | "em_andamento" | "concluido";

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
  completed_at?: string | null;
  due_date: string | null;
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
      console.error("Error parsing [TASKS_JSON]:", e);
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
      console.error("Error parsing legacy [TASKS]:", e);
    }
  }

  return [];
};

export const getMilestoneStatus = (m: Milestone): MilestoneStatus => {
  if (m.completed) return "concluido";
  if (m.description) {
    const statusMatch = m.description.match(/\[STATUS:\s*([a-zA-Z_]+)\]/);
    if (statusMatch && statusMatch[1]) {
      const status = statusMatch[1].trim() as MilestoneStatus;
      if (["pendente", "em_andamento", "concluido"].includes(status)) return status;
    }
  }
  return "pendente";
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

export const serializeMilestoneDescription = (
  cleanDesc: string,
  status: MilestoneStatus,
  tasks: MilestoneCheckItem[] = []
) => {
  let clean = cleanDesc || "";
  clean = clean.replace(/\[TASKS_JSON\][\s\S]*?\[\/TASKS_JSON\]/g, "");
  clean = clean.replace(/\[TASKS:\s*\[[\s\S]*?\]\s*\]/g, "");
  clean = clean.replace(/\[TASKS:[^\]]*\]/g, "");
  clean = clean.replace(/\[STATUS:\s*[^\]]+\]/g, "");
  clean = clean.replace(/\[ETAPA:[^\]]+\]\n?/g, "");
  clean = clean.replace(/^[\]\s]+/, "").trim();

  const statusTag = `[STATUS: ${status}]`;
  const tasksTag = tasks && tasks.length > 0 ? `[TASKS_JSON]${JSON.stringify(tasks)}[/TASKS_JSON]` : "";
  const header = `${statusTag}${tasksTag}`;
  return clean ? `${header}\n${clean}` : header;
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

export const getMilestoneProgress = (m: Milestone): number => {
  const tasks = parseMilestoneTasks(m);
  if (tasks.length > 0) {
    const completedCount = tasks.filter((t) => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }
  if (m.completed || getMilestoneStatus(m) === "concluido") return 100;
  return 0;
};

export const calculateSimpleProgress = (milestoneList: Milestone[]) => {
  if (!milestoneList || milestoneList.length === 0) return 0;
  return calculateSprintProgress(milestoneList).percent;
};

export const getMilestoneStatusConfig = (status: MilestoneStatus) => {
  switch (status) {
    case "concluido":
      return { label: "Concluído", color: "emerald", icon: "check" };
    case "em_andamento":
      return { label: "Em Andamento", color: "blue", icon: "play" };
    case "pendente":
    default:
      return { label: "Pendente", color: "amber", icon: "clock" };
  }
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
  return [];
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
  return {
    project_id: project.id,
    total_contract_value: 0,
    notes: "",
    installments: [],
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
  return [];
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
      description: "Acesse a versão em homologação",
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
      description: "Repositório oficial do código",
      is_active: true,
    });
  }
  return links;
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

export const generateDefaultDeliveryFeedbacks = (project: Project): DeliveryFeedbackItem[] => [];

// Support Ticket / Helpdesk Type
export interface SupportTicket {
  id: string;
  project_id: string;
  project_title?: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  subject: string;
  message: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "aberto" | "em_atendimento" | "resolvido";
  created_at: string;
  updated_at?: string;
  response_notes?: string;
}

type TabKey =
  | "overview"
  | "projects"
  | "kanban"
  | "clients"
  | "approvals"
  | "documents"
  | "support"
  | "finance"
  | "updates"
  | "broadcast"
  | "reports"
  | "proposals"
  | "products"
  | "templates"
  | "settings";

const VALID_ADMIN_TABS: TabKey[] = [
  "overview",
  "projects",
  "kanban",
  "clients",
  "approvals",
  "documents",
  "support",
  "finance",
  "updates",
  "broadcast",
  "reports",
  "proposals",
  "products",
  "templates",
  "settings",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTabState] = useState<TabKey>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setActiveTab = (tab: TabKey) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("portfolio_admin_active_tab_v1", tab);
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("tab") !== tab) {
          currentUrl.searchParams.set("tab", tab);
          window.history.replaceState({}, "", currentUrl.toString());
        }
      } catch (e) {}
    }
  };

  // Restore and maintain active tab across refreshes and history navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as TabKey | null;
      const savedTab = localStorage.getItem("portfolio_admin_active_tab_v1") as TabKey | null;

      const targetTab =
        tabParam && VALID_ADMIN_TABS.includes(tabParam)
          ? tabParam
          : savedTab && VALID_ADMIN_TABS.includes(savedTab)
          ? savedTab
          : "overview";

      setActiveTabState(targetTab);

      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get("tab") !== targetTab) {
        currentUrl.searchParams.set("tab", targetTab);
        window.history.replaceState({}, "", currentUrl.toString());
      }
    } catch (e) {}

    const handlePopState = () => {
      try {
        const tabParam = new URLSearchParams(window.location.search).get("tab") as TabKey | null;
        if (tabParam && VALID_ADMIN_TABS.includes(tabParam)) {
          setActiveTabState(tabParam);
          localStorage.setItem("portfolio_admin_active_tab_v1", tabParam);
        }
      } catch (e) {}
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInitialFetched = useRef(false);

  // Financial State Management
  const [projectFinances, setProjectFinances] = useState<Record<string, ProjectFinancialData>>({});
  const [financeSearchQuery, setFinanceSearchQuery] = useState("");
  const [financeStatusFilter, setFinanceStatusFilter] = useState<
    "all" | "pago" | "pendente" | "vencido" | "em_dia"
  >("all");
  const [financeProjectFilter, setFinanceProjectFilter] = useState<string>("all");
  const [financeMonthFilter, setFinanceMonthFilter] = useState<string>("current_and_overdue");

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
  const [splitStartDate, setSplitStartDate] = useState<string>("");
  const [splitFirstPaid, setSplitFirstPaid] = useState<boolean>(true);
  const [splitInstallmentAmount, setSplitInstallmentAmount] = useState<number | string>("");
  const [splitTotalContractAmount, setSplitTotalContractAmount] = useState<number | string>("");

  // Transactional Email Notifications State
  const [emailToast, setEmailToast] = useState<{ message: string; type: "delivery" | "payment" } | null>(null);
  const [emailLogsModalOpen, setEmailLogsModalOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<DispatchedEmailLog[]>([]);

  // Instant WhatsApp Update Notification State
  const [waNotifyModal, setWaNotifyModal] = useState<{
    open: boolean;
    clientName: string;
    clientPhone?: string | null;
    projectTitle: string;
    updateTitle: string;
    updateSummary: string;
  } | null>(null);
  const [copiedWaNotify, setCopiedWaNotify] = useState(false);

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
  const [docProjectFilter, setDocProjectFilter] = useState<string>("all");
  const [docSearchQuery, setDocSearchQuery] = useState<string>("");

  // Document Generator Modal State
  const [docGeneratorModalOpen, setDocGeneratorModalOpen] = useState(false);
  const [genProjectId, setGenProjectId] = useState<string>("");
  const [genDocType, setGenDocType] = useState<GeneratedDocType>("termo_aceite");
  const [genTitle, setGenTitle] = useState<string>("");
  const [genScope, setGenScope] = useState<string>("");
  const [genValue, setGenValue] = useState<string | number>("");
  const [genDueDate, setGenDueDate] = useState<string>("");
  const [genNotes, setGenNotes] = useState<string>("");

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
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>("all");
  const [feedbackProjectFilter, setFeedbackProjectFilter] = useState<string>("all");
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState<string>("");

  // Support & Helpdesk Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>("all");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [tClientName, setTClientName] = useState("");
  const [tClientEmail, setTClientEmail] = useState("");
  const [tProjectId, setTProjectId] = useState("");
  const [tSubject, setTSubject] = useState("");
  const [tMessage, setTMessage] = useState("");
  const [tPriority, setTPriority] = useState<"baixa" | "media" | "alta" | "urgente">("media");
  const [tStatus, setTStatus] = useState<"aberto" | "em_atendimento" | "resolvido">("aberto");
  const [tResponseNotes, setTResponseNotes] = useState("");

  // Broadcast & Ready Templates State
  const [broadcastTemplateId, setBroadcastTemplateId] = useState<string>("staging");
  const [broadcastProjectId, setBroadcastProjectId] = useState<string>("");
  const [broadcastClientId, setBroadcastClientId] = useState<string>("");
  const [customBroadcastText, setCustomBroadcastText] = useState<string>("");
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);

  // Search and Filter for Overview
  const [searchQuery, setSearchQuery] = useState("");

  // Search and Filters specifically for Projects Management
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    "all" | "planejamento" | "em_andamento" | "homologacao" | "concluido" | "pausado"
  >("all");
  const [projectClientFilter, setProjectClientFilter] = useState<string>("all");

  const isDbUuid = (id?: string | null): boolean =>
    !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneMonthFilter, setMilestoneMonthFilter] = useState<string>("all");
  const [previewMilestoneMonthFilter, setPreviewMilestoneMonthFilter] = useState<string>("all");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [allProjectMilestones, setAllProjectMilestones] = useState<Record<string, Milestone[]>>({});

  const handleOpenProjectDetails = (proj: Project) => {
    setSelectedProject(proj);
    setMilestones([]);
    setUpdates([]);
    fetchProjectDetails(proj.id);
    setProjectDetailsModalOpen(true);
  };

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

  // Form states for milestone / etapa (with checklist & progress percentage)
  const [mTitle, setMTitle] = useState("");
  const [mDescription, setMDescription] = useState("");
  const [mStatus, setMStatus] = useState<MilestoneStatus>("pendente");
  const [mDueDate, setMDueDate] = useState("");
  const [mTasks, setMTasks] = useState<MilestoneCheckItem[]>([]);
  const [mNewTaskText, setMNewTaskText] = useState("");

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
    phone?: string;
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

  const allFeedbacksFlat = useMemo(() => Object.values(deliveryFeedbacks).flat(), [deliveryFeedbacks]);
  const pendingApprovalsCount = useMemo(
    () => allFeedbacksFlat.filter((f) => f.status === "pending_review").length,
    [allFeedbacksFlat]
  );
  const allDocsCount = useMemo(
    () => Object.values(projectDocuments).flat().length,
    [projectDocuments]
  );
  const openTicketsCount = useMemo(
    () => supportTickets.filter((t) => t.status === "aberto" || t.status === "em_atendimento").length,
    [supportTickets]
  );

  // Global Search Omnibar State
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchFilterCategory, setSearchFilterCategory] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchDropdownOpen(true);
      }
      if (e.key === "Escape") {
        setSearchDropdownOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global Search Across Everything Registered in the Platform
  const allPlatformSearchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    interface SearchResultItem {
      id: string;
      category: "project" | "client" | "milestone" | "finance" | "document" | "support" | "update";
      categoryLabel: string;
      title: string;
      subtitle: string;
      badge?: string;
      badgeColor?: string;
      onSelect: () => void;
    }

    const list: SearchResultItem[] = [];

    // 1. PROJETOS
    for (const p of projects) {
      const client = clients.find((c) => c.id === p.client_id);
      const titleMatch = p.title.toLowerCase().includes(query);
      const descMatch = (p.description || "").toLowerCase().includes(query);
      const catMatch = (p.category || "").toLowerCase().includes(query);
      const clientMatch = (client?.full_name || client?.company || "").toLowerCase().includes(query);

      if (titleMatch || descMatch || catMatch || clientMatch) {
        list.push({
          id: `proj-${p.id}`,
          category: "project",
          categoryLabel: "Projeto",
          title: p.title,
          subtitle: `${p.category || "Software"} • Cliente: ${client?.full_name || client?.company || "Não vinculado"}`,
          badge: p.status === "concluido" ? "Concluído" : p.status === "em_andamento" ? "Em Andamento" : "Planejamento",
          badgeColor: p.status === "concluido" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          onSelect: () => {
            setSelectedProject(p);
            handleOpenProjectDetails(p);
            setSearchDropdownOpen(false);
          },
        });
      }
    }

    // 2. CLIENTES
    for (const c of clients) {
      const nameMatch = (c.full_name || "").toLowerCase().includes(query);
      const emailMatch = (c.email || "").toLowerCase().includes(query);
      const compMatch = (c.company || "").toLowerCase().includes(query);
      const phoneMatch = (c.phone || "").toLowerCase().includes(query);

      if (nameMatch || emailMatch || compMatch || phoneMatch) {
        const clientProjectsCount = projects.filter((p) => p.client_id === c.id).length;
        list.push({
          id: `client-${c.id}`,
          category: "client",
          categoryLabel: "Cliente",
          title: c.full_name || c.email || "Cliente",
          subtitle: `${c.email || ""} ${c.company ? `• ${c.company}` : ""} (${clientProjectsCount} projetos)`,
          badge: c.status === "blocked" ? "Bloqueado" : "Ativo",
          badgeColor: c.status === "blocked" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30",
          onSelect: () => {
            setSelectedClientDetails(c);
            setClientDetailsModalOpen(true);
            setActiveTab("clients");
            setSearchDropdownOpen(false);
          },
        });
      }
    }

    // 3. TAREFAS & ETAPAS
    for (const [projId, mList] of Object.entries(allProjectMilestones)) {
      const proj = projects.find((p) => p.id === projId);
      if (!Array.isArray(mList)) continue;
      for (const m of mList) {
        const mTitleMatch = m.title.toLowerCase().includes(query);
        const tasks = parseMilestoneTasks(m);
        const taskMatch = tasks.some((t) => t.text.toLowerCase().includes(query));
        const matchedTask = tasks.find((t) => t.text.toLowerCase().includes(query));

        if (mTitleMatch || taskMatch) {
          list.push({
            id: `milestone-${m.id}`,
            category: "milestone",
            categoryLabel: "Tarefa / Etapa",
            title: matchedTask ? matchedTask.text : m.title,
            subtitle: `Projeto: ${proj?.title || "Projeto"} ${matchedTask ? `(Etapa: ${m.title})` : ""}`,
            badge: m.completed ? "Concluída" : "Pendente",
            badgeColor: m.completed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30",
            onSelect: () => {
              if (proj) {
                setSelectedProject(proj);
                handleOpenProjectDetails(proj);
              }
              setSearchDropdownOpen(false);
            },
          });
        }
      }
    }

    // 4. FINANÇAS & PARCELAS
    for (const [projId, finData] of Object.entries(projectFinances)) {
      const proj = projects.find((p) => p.id === projId);
      const client = clients.find((c) => c.id === proj?.client_id);
      if (finData?.installments && Array.isArray(finData.installments)) {
        for (const inst of finData.installments) {
          const numMatch = `parcela ${inst.installment_number}`.includes(query);
          const valMatch = `${inst.amount}`.includes(query) || formatBRL(inst.amount).toLowerCase().includes(query);
          const projMatch = (proj?.title || "").toLowerCase().includes(query);

          if (numMatch || valMatch || (projMatch && query.length > 2)) {
            list.push({
              id: `fin-inst-${inst.id}`,
              category: "finance",
              categoryLabel: "Financeiro",
              title: `Parcela ${inst.installment_number} — ${formatBRL(inst.amount)}`,
              subtitle: `Projeto: ${proj?.title || "Projeto"} • Cliente: ${client?.full_name || "Não vinculado"}`,
              badge: inst.paid_at ? "Pago" : "A Receber",
              badgeColor: inst.paid_at ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
              onSelect: () => {
                if (proj) setSelectedProject(proj);
                setActiveTab("finance");
                setSearchDropdownOpen(false);
              },
            });
          }
        }
      }
    }

    // 5. DOCUMENTOS & CONTRATOS
    for (const [projId, docsList] of Object.entries(projectDocuments)) {
      const proj = projects.find((p) => p.id === projId);
      if (!Array.isArray(docsList)) continue;
      for (const doc of docsList) {
        const titleMatch = (doc.title || "").toLowerCase().includes(query);
        const catMatch = (doc.category || "").toLowerCase().includes(query);
        const fileMatch = (doc.filename || "").toLowerCase().includes(query);

        if (titleMatch || catMatch || fileMatch) {
          list.push({
            id: `doc-${doc.id}`,
            category: "document",
            categoryLabel: "Documento",
            title: doc.title,
            subtitle: `Arquivo: ${doc.filename || "Documento"} • Projeto: ${proj?.title || "Projeto"}`,
            badge: doc.category || "PDF",
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            onSelect: () => {
              if (proj) setSelectedProject(proj);
              setActiveTab("documents");
              setSearchDropdownOpen(false);
            },
          });
        }
      }
    }

    // 6. CHAMADOS & SUPORTE
    for (const t of supportTickets) {
      const subMatch = (t.subject || "").toLowerCase().includes(query);
      const msgMatch = (t.message || "").toLowerCase().includes(query);
      const idMatch = (t.id || "").toLowerCase().includes(query);
      const clientMatch = (t.client_name || "").toLowerCase().includes(query);

      if (subMatch || msgMatch || idMatch || clientMatch) {
        list.push({
          id: `sup-${t.id}`,
          category: "support",
          categoryLabel: "Suporte",
          title: `Chamado: ${t.subject}`,
          subtitle: `Cliente: ${t.client_name || "Cliente"} • Status: ${t.status}`,
          badge: t.priority,
          badgeColor: t.priority === "urgente" || t.priority === "alta" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30",
          onSelect: () => {
            setActiveTab("support");
            setSearchDropdownOpen(false);
          },
        });
      }
    }

    // 7. TIMELINE & UPDATES
    for (const [projId, updList] of Object.entries(projectUpdates)) {
      const proj = projects.find((p) => p.id === projId);
      if (!Array.isArray(updList)) continue;
      for (const u of updList) {
        const titleMatch = (u.title || "").toLowerCase().includes(query);
        const contMatch = (u.content || "").toLowerCase().includes(query);
        const tagMatch = (u.version_tag || "").toLowerCase().includes(query);

        if (titleMatch || contMatch || tagMatch) {
          list.push({
            id: `upd-${u.id}`,
            category: "update",
            categoryLabel: "Update / Nota",
            title: u.title,
            subtitle: `Projeto: ${proj?.title || "Projeto"} ${u.version_tag ? `• ${u.version_tag}` : ""}`,
            badge: u.category,
            badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
            onSelect: () => {
              if (proj) setSelectedProject(proj);
              setActiveTab("updates");
              setSearchDropdownOpen(false);
            },
          });
        }
      }
    }

    return list;
  }, [searchQuery, projects, clients, allProjectMilestones, projectFinances, projectDocuments, supportTickets, projectUpdates]);

  const filteredSearchResults = useMemo(() => {
    if (searchFilterCategory === "all") return allPlatformSearchResults;
    return allPlatformSearchResults.filter((item) => item.category === searchFilterCategory);
  }, [allPlatformSearchResults, searchFilterCategory]);

  // Navigation Items on Left Sidebar
  const navItems = [
    {
      id: "overview",
      label: "Geral",
      icon: <LayoutDashboard size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "projects",
      label: "Projetos",
      icon: <FolderKanban size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "kanban",
      label: "Kanban",
      icon: <Layers size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "clients",
      label: "Cliente",
      icon: <Users size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "support",
      label: "Suporte",
      icon: <MessageSquare size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "finance",
      label: "Faturamento",
      icon: <DollarSign size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "broadcast",
      label: "Disparos",
      icon: <Megaphone size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: <BarChart3 size={18} />,
      badge: null,
      badgeColor: undefined,
    },
    {
      id: "proposals",
      label: "Propostas",
      icon: <Receipt size={18} />,
      badge: null,
      badgeColor: undefined,
      subItems: [
        { id: "templates", label: "Modelos", icon: <Sliders size={14} /> },
        { id: "products", label: "Produtos", icon: <Package size={14} /> },
        { id: "proposals", label: "Propostas", icon: <FileText size={14} /> },
      ],
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings size={18} />,
      badge: null,
      badgeColor: undefined,
    },
  ];

  // Load Data
  const fetchData = async (isSilent = false) => {
    if (!isSilent && projects.length === 0) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      // 1. Fetch all projects
      let pData: any[] = [];
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          pData = data;
        }
      } catch (pErr) {
        console.warn("Could not fetch projects from supabase, relying on local sync:", pErr);
      }

      let localProjects: Project[] = [];
      try {
        localProjects = JSON.parse(localStorage.getItem("portfolio_local_projects_v1") || "[]");
      } catch (e) {}

      const dbProjects = (pData || []).map((p: any) => ({
        ...p,
        status: normalizeProjectStatus(p.status),
      }));

      // Deduplicate: if a local project already exists in db (by id or by title + client_id), clean from local storage
      const filteredLocal = localProjects.filter((lp) => {
        return !dbProjects.some(
          (dbp) => dbp.id === lp.id || (dbp.title === lp.title && dbp.client_id === lp.client_id)
        );
      });

      try {
        localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(filteredLocal));
      } catch (e) {}

      const mergedMap = new Map<string, Project>();
      for (const p of dbProjects) {
        mergedMap.set(p.id, p);
      }

      // Fetch from resilient server API
      try {
        const pRes = await fetch("/api/portal/projects?isAdmin=true");
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (pJson.projects && Array.isArray(pJson.projects)) {
            for (const sp of pJson.projects) {
              if (!mergedMap.has(sp.id)) {
                mergedMap.set(sp.id, { ...sp, status: normalizeProjectStatus(sp.status) });
              }
            }
          }
        }
      } catch (pApiErr) {
        console.warn("Could not fetch projects from server API:", pApiErr);
      }

      for (const p of filteredLocal) {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, { ...p, status: normalizeProjectStatus(p.status) });
        }
      }

      // Final safety deduplication strictly by title
      const finalProjectsList: Project[] = [];
      const seenKey = new Set<string>();
      for (const p of Array.from(mergedMap.values())) {
        const key = p.title.trim().toLowerCase();
        if (!seenKey.has(key)) {
          seenKey.add(key);
          finalProjectsList.push(p);
        } else {
          // If duplicate found, replace with the one that has richer configuration (e.g. deadline / start_date / db record)
          const idx = finalProjectsList.findIndex((item) => item.title.trim().toLowerCase() === key);
          if (idx !== -1) {
            const existing = finalProjectsList[idx];
            const pHasDates = Boolean(p.start_date || p.deadline);
            const existingHasDates = Boolean(existing.start_date || existing.deadline);
            if (!existingHasDates && pHasDates) {
              finalProjectsList[idx] = p;
            }
          }
        }
      }

      setProjects(finalProjectsList);

      // 2. Fetch all profiles (clients) with resilient API and DB support
      let rawProfiles: Profile[] = [];
      try {
        const { data: cData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (cData && Array.isArray(cData)) {
          rawProfiles = cData as Profile[];
        }
      } catch (dbErr) {
        console.warn("Direct DB profiles fetch failed:", dbErr);
      }

      // Fetch from resilient server clients API
      try {
        const apiRes = await fetch("/api/admin/clients");
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (apiJson.clients && Array.isArray(apiJson.clients)) {
            for (const ac of apiJson.clients) {
              if (!rawProfiles.some((p) => p.email?.toLowerCase() === ac.email?.toLowerCase())) {
                rawProfiles.push(ac);
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("Clients API fetch failed:", apiErr);
      }

      let localClientMeta: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          localClientMeta = JSON.parse(localStorage.getItem("portfolio_admin_clients_metadata_v1") || "{}");
        } catch (e) {}
      }

      const mergedClients: Profile[] = rawProfiles.map((p) => {
        const meta = localClientMeta[p.id] || (p.email ? localClientMeta[p.email.toLowerCase()] : {}) || {};
        return {
          ...p,
          company: p.company || meta.company || null,
          phone: p.phone || meta.phone || null,
          status: ((p.status || meta.status || "active") as "active" | "blocked"),
        };
      });

      setClients(mergedClients);

      // Clean up any legacy mock data from storage
      if (typeof window !== "undefined") {
        try {
          const rawFin = localStorage.getItem("portfolio_admin_finances_v1");
          if (rawFin && rawFin.includes("PIX-COMPROVANTE-SINAL-AUT-89421")) {
            localStorage.removeItem("portfolio_admin_finances_v1");
          }
          const rawDocs = localStorage.getItem("portfolio_admin_documents_v1");
          if (rawDocs && rawDocs.includes("Contrato_Prestacao_Servicos_Desenvolvimento.pdf")) {
            localStorage.removeItem("portfolio_admin_documents_v1");
          }
          const rawUpd = localStorage.getItem("portfolio_admin_updates_v1");
          if (rawUpd && rawUpd.includes("Sprint Review & Release Beta v1.2.0")) {
            localStorage.removeItem("portfolio_admin_updates_v1");
          }
          const rawFb = localStorage.getItem("portfolio_delivery_feedbacks_v1");
          if (rawFb && rawFb.includes("Briefing Técnico & Arquitetura de Requisitos")) {
            localStorage.removeItem("portfolio_delivery_feedbacks_v1");
          }

          // Clean legacy gearhead installments if present in localStorage
          const localFinRaw = localStorage.getItem("portfolio_admin_finances_v1");
          if (localFinRaw && (localFinRaw.includes("inst-gen-1790546177000") || localFinRaw.includes("proj-prontuario-gearhead"))) {
            try {
              const parsedFin = JSON.parse(localFinRaw);
              if (parsedFin["proj-prontuario-gearhead"]) {
                delete parsedFin["proj-prontuario-gearhead"];
                localStorage.setItem("portfolio_admin_finances_v1", JSON.stringify(parsedFin));
              }
            } catch (e) {}
          }
        } catch (e) {}
      }

      // 3. Load financial data
      let storedFinances: Record<string, ProjectFinancialData> = {};
      try {
        const finRes = await fetch("/api/portal/finances?all=true");
        if (finRes.ok) {
          const finJson = await finRes.json();
          if (finJson.finances && typeof finJson.finances === "object") {
            storedFinances = finJson.finances;
          }
        }
      } catch (fErr) {
        console.warn("Could not fetch finances from server API:", fErr);
      }

      try {
        const local = localStorage.getItem("portfolio_admin_finances_v1");
        if (local) {
          const parsed = JSON.parse(local);
          delete parsed["proj-prontuario-gearhead"];
          storedFinances = { ...storedFinances, ...parsed };
        }
      } catch (e) {
        console.error("Error reading finances from storage:", e);
      }
      delete storedFinances["proj-prontuario-gearhead"];
      setProjectFinances(storedFinances);

      // 4. Load project documents
      let storedDocs: Record<string, ProjectDocument[]> = {};
      try {
        const docRes = await fetch("/api/portal/documents?all=true");
        if (docRes.ok) {
          const docJson = await docRes.json();
          if (docJson.documents && typeof docJson.documents === "object") {
            storedDocs = docJson.documents;
          }
        }
      } catch (dErr) {
        console.warn("Could not fetch documents from server API:", dErr);
      }

      try {
        const localDocs = localStorage.getItem("portfolio_admin_documents_v1");
        if (localDocs) {
          const parsed = JSON.parse(localDocs);
          storedDocs = { ...storedDocs, ...parsed };
        }
      } catch (e) {
        console.error("Error reading documents from storage:", e);
      }
      setProjectDocuments(storedDocs);

      // 5. Load project updates
      let storedUpdates: Record<string, ProjectUpdate[]> = {};
      try {
        const localUpdates = localStorage.getItem("portfolio_admin_updates_v1");
        if (localUpdates) {
          storedUpdates = JSON.parse(localUpdates);
        }
      } catch (e) {
        console.error("Error reading updates from storage:", e);
      }
      setProjectUpdates(storedUpdates);

      // 6. Load project quick links
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
        for (const p of pData as Project[]) {
          if (!storedQuickLinks[p.id]) {
            const dynamicLinks = generateDefaultProjectQuickLinks(p);
            if (dynamicLinks.length > 0) {
              storedQuickLinks[p.id] = dynamicLinks;
            }
          }
        }
      }
      setProjectQuickLinks(storedQuickLinks);

      // 7. Load delivery feedbacks
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
      setDeliveryFeedbacks(storedFeedbacks);

      // 8. Load support & helpdesk tickets
      let storedTickets: SupportTicket[] = [];
      try {
        const localTickets = localStorage.getItem("portfolio_support_tickets_v1");
        if (localTickets) {
          const parsed = JSON.parse(localTickets);
          if (Array.isArray(parsed)) {
            storedTickets = parsed;
          }
        }
      } catch (e) {}
      setSupportTickets(storedTickets);

      // 9. Load all project milestones for all projects
      let allMilestonesMap: Record<string, Milestone[]> = {};
      try {
        const { data: mData } = await supabase
          .from("project_milestones")
          .select("*")
          .order("order_index", { ascending: true });
        if (mData && Array.isArray(mData)) {
          for (const m of mData as Milestone[]) {
            if (!allMilestonesMap[m.project_id]) allMilestonesMap[m.project_id] = [];
            allMilestonesMap[m.project_id].push(m);
          }
        }
      } catch (e) {
        console.warn("Could not fetch milestones from supabase:", e);
      }

      try {
        const rawM = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_milestones_v1") : null;
        if (rawM) {
          const parsed = JSON.parse(rawM);
          if (parsed && typeof parsed === "object") {
            for (const [pId, mList] of Object.entries(parsed)) {
              if (Array.isArray(mList)) {
                if (!allMilestonesMap[pId] || allMilestonesMap[pId].length === 0) {
                  allMilestonesMap[pId] = mList as Milestone[];
                }
              }
            }
          }
        }
      } catch (e) {}
      setAllProjectMilestones(allMilestonesMap);

      if (selectedProject) {
        const current = finalProjectsList.find((p) => p.id === selectedProject.id) || selectedProject;
        setSelectedProject(current);
        await fetchProjectDetails(current.id);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      let mList: Milestone[] = [];
      if (isDbUuid(projectId)) {
        try {
          const { data: mData } = await supabase
            .from("project_milestones")
            .select("*")
            .eq("project_id", projectId)
            .order("order_index", { ascending: true });
          if (mData && mData.length > 0) {
            mList = (mData as Milestone[]) || [];
          }
        } catch (e) {}
      }

      if (mList.length === 0) {
        try {
          const rawM = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_milestones_v1") : null;
          if (rawM) {
            const parsed = JSON.parse(rawM);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed[projectId])) {
              mList = parsed[projectId];
            }
          }
        } catch (e) {}
      }
      setMilestones(mList);
      setAllProjectMilestones((prev) => ({ ...prev, [projectId]: mList }));

      let uList: ProjectUpdate[] = [];
      if (isDbUuid(projectId)) {
        try {
          const { data: uData } = await supabase
            .from("project_updates")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });

          if (uData && uData.length > 0) {
            uList = uData as ProjectUpdate[];
          }
        } catch (e) {}
      }

      if (uList.length === 0) {
        const localUpdates = typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_updates_v1") : null;
        if (localUpdates) {
          try {
            const parsed = JSON.parse(localUpdates);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed[projectId])) {
              uList = parsed[projectId];
            } else if (Array.isArray(parsed)) {
              uList = parsed.filter((u: ProjectUpdate) => u.project_id === projectId);
            }
          } catch (e) {}
        }
      }
      setUpdates(uList);
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
      } else if (!hasInitialFetched.current) {
        hasInitialFetched.current = true;
        fetchData();
      }
    }
  }, [user?.id, profile?.role, authLoading, router]);

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
      const candidates = getStatusCandidates(pStatus);
      const dbClientId = isDbUuid(pClientId) ? pClientId : null;

      const basePayload = {
        title: pTitle,
        description: pDescription,
        client_id: dbClientId,
        progress: Number(pProgress),
        start_date: pStartDate || null,
        deadline: pDeadline || null,
        preview_url: pPreviewUrl || null,
        figma_url: pFigmaUrl || null,
        repo_url: pRepoUrl || null,
        category: pCategory,
        updated_at: new Date().toISOString(),
      };

      // Try Supabase update only if valid UUID
      if (editingProject && isDbUuid(editingProject.id)) {
        for (const cand of candidates) {
          try {
            const payload = { ...basePayload, status: cand };
            const { error } = await supabase
              .from("projects")
              .update(payload)
              .eq("id", editingProject.id);
            if (!error) break;
          } catch (innerErr: any) {
            console.warn("Supabase update error (falling back to server store):", innerErr);
          }
        }
      } else if (!editingProject) {
        for (const cand of candidates) {
          try {
            const payload = { ...basePayload, status: cand };
            const { error } = await supabase.from("projects").insert([payload]);
            if (!error) break;
          } catch (innerErr: any) {
            console.warn("Supabase insert error (falling back to server store):", innerErr);
          }
        }
      }

      const localId = editingProject?.id || `proj-${Date.now()}`;
      const newProj: Project = {
        id: localId,
        client_id: pClientId || null,
        title: pTitle,
        description: pDescription,
        status: pStatus,
        progress: Number(pProgress),
        start_date: pStartDate || null,
        deadline: pDeadline || null,
        preview_url: pPreviewUrl || null,
        figma_url: pFigmaUrl || null,
        repo_url: pRepoUrl || null,
        category: pCategory,
        created_at: editingProject?.created_at || new Date().toISOString(),
      };

      try {
        const existingLocal: Project[] = JSON.parse(localStorage.getItem("portfolio_local_projects_v1") || "[]");
        const updatedLocal = editingProject
          ? existingLocal.map((p) => (p.id === localId ? newProj : p))
          : [newProj, ...existingLocal.filter((p) => p.id !== localId)];
        localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(updatedLocal));
      } catch (e) {}

      // Always sync with server API and store
      try {
        const matchedClient = clients.find(
          (c) =>
            c.id === pClientId ||
            (c.email && c.email.toLowerCase() === pClientId?.toLowerCase())
        );
        const apiPayload = {
          id: localId,
          title: pTitle,
          description: pDescription,
          client_id: pClientId || (matchedClient ? matchedClient.id : null),
          client_email: matchedClient?.email || (pClientId?.includes("@") ? pClientId : null),
          client_name: matchedClient?.full_name || null,
          progress: Number(pProgress),
          start_date: pStartDate || null,
          deadline: pDeadline || null,
          preview_url: pPreviewUrl || null,
          figma_url: pFigmaUrl || null,
          repo_url: pRepoUrl || null,
          category: pCategory,
          status: pStatus,
        };
        await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });
      } catch (apiSaveErr) {
        console.warn("Could not save project to server API:", apiSaveErr);
      }

      if (selectedProject && selectedProject.id === localId) {
        setSelectedProject({ ...selectedProject, ...newProj });
      }

      setProjectModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao salvar projeto: " + err.message);
    }
  };

  const handleQuickUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      if (isDbUuid(projectId)) {
        const candidates = getStatusCandidates(newStatus);
        for (const cand of candidates) {
          try {
            const { error } = await supabase
              .from("projects")
              .update({ status: cand, updated_at: new Date().toISOString() })
              .eq("id", projectId);
            if (!error) break;
          } catch (e) {}
        }
      }

      try {
        const targetProj = projects.find((p) => p.id === projectId);
        if (targetProj) {
          await fetch("/api/admin/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...targetProj,
              status: newStatus,
            }),
          });
        }
      } catch (e) {}

      try {
        const localProjects: Project[] = JSON.parse(localStorage.getItem("portfolio_local_projects_v1") || "[]");
        const updatedLocal = localProjects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p));
        localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(updatedLocal));
      } catch (e) {}

      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, status: newStatus });
      }
      await fetchData();
    } catch (err: any) {
      console.warn("Erro ao alterar status do projeto:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;
    try {
      if (isDbUuid(id)) {
        try {
          await supabase.from("projects").delete().eq("id", id);
        } catch (e) {}
      }

      try {
        await fetch("/api/admin/delete-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch (e) {}

      try {
        const localProjects: Project[] = JSON.parse(localStorage.getItem("portfolio_local_projects_v1") || "[]");
        const updatedLocal = localProjects.filter((p) => p.id !== id);
        localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(updatedLocal));
      } catch (e) {}

      // Clean all cascading related data for this project:
      // 1. Finances
      const updatedFinances = { ...projectFinances };
      delete updatedFinances[id];
      saveFinancesToStorage(updatedFinances);

      // 2. Documents
      const updatedDocs = { ...projectDocuments };
      delete updatedDocs[id];
      saveDocumentsToStorage(updatedDocs);

      // 3. Milestones
      const updatedMilestones = { ...allProjectMilestones };
      delete updatedMilestones[id];
      setAllProjectMilestones(updatedMilestones);
      try {
        localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(updatedMilestones));
      } catch (e) {}

      // 4. Updates
      const updatedUpdates = { ...projectUpdates };
      delete updatedUpdates[id];
      setProjectUpdates(updatedUpdates);
      try {
        localStorage.setItem("portfolio_admin_updates_v1", JSON.stringify(updatedUpdates));
      } catch (e) {}

      // 5. Feedbacks
      const updatedFeedbacks = { ...deliveryFeedbacks };
      delete updatedFeedbacks[id];
      setDeliveryFeedbacks(updatedFeedbacks);
      try {
        localStorage.setItem("portfolio_delivery_feedbacks_v1", JSON.stringify(updatedFeedbacks));
      } catch (e) {}

      // 6. Quick links
      const updatedLinks = { ...projectQuickLinks };
      delete updatedLinks[id];
      setProjectQuickLinks(updatedLinks);
      try {
        localStorage.setItem("portfolio_admin_quick_links_v1", JSON.stringify(updatedLinks));
      } catch (e) {}

      // 7. Support tickets
      const updatedTickets = supportTickets.filter((t) => t.project_id !== id);
      setSupportTickets(updatedTickets);
      try {
        localStorage.setItem("portfolio_support_tickets_v1", JSON.stringify(updatedTickets));
      } catch (e) {}

      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setProjectDetailsModalOpen(false);
      }
      await fetchData();
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // Milestone & Stage Actions
  const handleOpenMilestoneModal = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setMTitle(milestone.title);
      setMDescription(getMilestoneCleanDescription(milestone));
      setMStatus(getMilestoneStatus(milestone));
      setMDueDate(milestone.due_date || "");
      setMTasks(parseMilestoneTasks(milestone));
    } else {
      setEditingMilestone(null);
      setMTitle("");
      setMDescription("");
      setMStatus("pendente");
      setMDueDate("");
      setMTasks([]);
    }
    setMNewTaskText("");
    setMilestoneModalOpen(true);
  };

  const syncProjectProgress = async (projectId: string) => {
    if (!isDbUuid(projectId)) return;
    try {
      const updatedList = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });
      if (updatedList.data) {
        const newProg = calculateSimpleProgress(updatedList.data as Milestone[]);
        await supabase
          .from("projects")
          .update({ progress: newProg, updated_at: new Date().toISOString() })
          .eq("id", projectId);
        setSelectedProject((prev) => (prev ? { ...prev, progress: newProg } : null));
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, progress: newProg } : p)));
      }
    } catch (e) {}
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      let finalStatus = mStatus;
      const allTasksDone = mTasks.length > 0 && mTasks.every((t) => t.completed);
      const anyTasksDone = mTasks.some((t) => t.completed);
      if (allTasksDone) {
        finalStatus = "concluido";
      } else if (anyTasksDone && finalStatus === "pendente") {
        finalStatus = "em_andamento";
      }
      const isCompleted = finalStatus === "concluido";
      const serializedDesc = serializeMilestoneDescription(mDescription, finalStatus, mTasks);

      if (isDbUuid(selectedProject.id)) {
        if (editingMilestone && isDbUuid(editingMilestone.id)) {
          try {
            await supabase
              .from("project_milestones")
              .update({
                title: mTitle,
                description: serializedDesc,
                due_date: mDueDate || null,
                completed: isCompleted,
                completed_at: isCompleted ? (editingMilestone.completed_at || new Date().toISOString()) : null,
              })
              .eq("id", editingMilestone.id);
          } catch (e) {}
        } else {
          try {
            await supabase.from("project_milestones").insert([
              {
                project_id: selectedProject.id,
                title: mTitle,
                description: serializedDesc,
                due_date: mDueDate || null,
                order_index: milestones.length + 1,
                completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
              },
            ]);
          } catch (e) {}
        }
      }

      let updatedMilestonesList: Milestone[] = [];
      setMilestones((prev) => {
        if (editingMilestone) {
          updatedMilestonesList = prev.map((m) =>
            m.id === editingMilestone.id
              ? {
                  ...m,
                  title: mTitle,
                  description: serializedDesc,
                  due_date: mDueDate || null,
                  completed: isCompleted,
                  completed_at: isCompleted ? (editingMilestone.completed_at || new Date().toISOString()) : null,
                }
              : m
          );
        } else {
          const newId = `milestone-${Date.now()}`;
          updatedMilestonesList = [
            ...prev,
            {
              id: newId,
              project_id: selectedProject.id,
              title: mTitle,
              description: serializedDesc,
              due_date: mDueDate || null,
              order_index: prev.length + 1,
              completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            },
          ];
        }
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("portfolio_admin_milestones_v1") || "{}";
            const parsed = JSON.parse(raw);
            parsed[selectedProject.id] = updatedMilestonesList;
            localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(parsed));
          } catch (e) {}
        }

        try {
          fetch("/api/portal/milestones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: selectedProject.id, milestones: updatedMilestonesList }),
          }).catch(() => {});
        } catch (e) {}

        return updatedMilestonesList;
      });

      if (isCompleted && selectedProject) {
        const matchedClient = clients.find((c) => matchProjectToClient(selectedProject, c));
        const clientEmail = matchedClient?.email || "cliente@empresa.com";
        const clientName = matchedClient?.full_name || "Cliente Contratante";

        sendTransactionalEmail({
          type: "delivery_completed",
          recipientEmail: clientEmail,
          recipientName: clientName,
          projectName: selectedProject.title,
          projectId: selectedProject.id,
          milestoneTitle: mTitle,
          stageName: "Entrega",
          completedAt: new Date().toISOString(),
          deliverables: ["Etapa concluída com sucesso"],
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
      await syncProjectProgress(selectedProject.id);
    } catch (err: any) {
      alert("Erro ao salvar etapa: " + err.message);
    }
  };

  const handleQuickUpdateMilestoneStatus = async (
    milestone: Milestone,
    newStatus: MilestoneStatus
  ) => {
    if (!selectedProject) return;
    try {
      const isCompleted = newStatus === "concluido";
      const cleanDesc = getMilestoneCleanDescription(milestone);
      let tasks = parseMilestoneTasks(milestone);
      if (newStatus === "concluido" && tasks.length > 0) {
        tasks = tasks.map((t) => ({ ...t, completed: true }));
      } else if (newStatus === "pendente" && tasks.length > 0) {
        tasks = tasks.map((t) => ({ ...t, completed: false }));
      }
      const serializedDesc = serializeMilestoneDescription(cleanDesc, newStatus, tasks);

      if (isDbUuid(milestone.id)) {
        try {
          await supabase
            .from("project_milestones")
            .update({
              description: serializedDesc,
              completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            })
            .eq("id", milestone.id);
        } catch (e) {}
      }

      setMilestones((prev) => {
        const updated = prev.map((m) =>
          m.id === milestone.id
            ? {
                ...m,
                description: serializedDesc,
                completed: isCompleted,
                completed_at: isCompleted ? (m.completed_at || new Date().toISOString()) : null,
              }
            : m
        );
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("portfolio_admin_milestones_v1") || "{}";
            const parsed = JSON.parse(raw);
            parsed[selectedProject.id] = updated;
            localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(parsed));
          } catch (e) {}
        }
        return updated;
      });

      if (isCompleted && selectedProject) {
        const matchedClient = clients.find((c) => matchProjectToClient(selectedProject, c));
        const clientEmail = matchedClient?.email || "cliente@empresa.com";
        const clientName = matchedClient?.full_name || "Cliente Contratante";

        sendTransactionalEmail({
          type: "delivery_completed",
          recipientEmail: clientEmail,
          recipientName: clientName,
          projectName: selectedProject.title,
          projectId: selectedProject.id,
          milestoneTitle: milestone.title,
          stageName: "Entrega",
          completedAt: new Date().toISOString(),
          deliverables: ["Etapa concluída com sucesso"],
          notes: cleanDesc || undefined,
        });

        setEmailToast({
          message: `E-mail de Entrega Concluída disparado para ${clientName} (${clientEmail})!`,
          type: "delivery",
        });
        setTimeout(() => setEmailToast(null), 5000);
      }

      await fetchProjectDetails(selectedProject.id);
      await syncProjectProgress(selectedProject.id);
    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      if (isDbUuid(projectId)) {
        await supabase
          .from("projects")
          .update({ status: newStatus })
          .eq("id", projectId);
      }
    } catch (e) {
      console.warn("Could not update project status in supabase:", e);
    }

    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("portfolio_local_projects_v1", JSON.stringify(updated));
        } catch (err) {}
      }
      return updated;
    });
  };

  const handleToggleMilestoneTask = async (
    milestone: Milestone,
    taskId: string
  ) => {
    if (!selectedProject) return;
    try {
      const tasks = parseMilestoneTasks(milestone);
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const allCompleted =
        updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
      const anyCompleted = updatedTasks.some((t) => t.completed);
      let newStatus = getMilestoneStatus(milestone);
      if (allCompleted) {
        newStatus = "concluido";
      } else if (anyCompleted && newStatus === "pendente") {
        newStatus = "em_andamento";
      } else if (!anyCompleted && newStatus === "concluido") {
        newStatus = "em_andamento";
      }
      const isCompleted = newStatus === "concluido";
      const cleanDesc = getMilestoneCleanDescription(milestone);
      const serializedDesc = serializeMilestoneDescription(
        cleanDesc,
        newStatus,
        updatedTasks
      );

      if (isDbUuid(milestone.id)) {
        try {
          await supabase
            .from("project_milestones")
            .update({
              description: serializedDesc,
              completed: isCompleted,
              completed_at: isCompleted ? (milestone.completed_at || new Date().toISOString()) : null,
            })
            .eq("id", milestone.id);
        } catch (e) {}
      }

      setMilestones((prev) => {
        const updated = prev.map((m) =>
          m.id === milestone.id
            ? {
                ...m,
                description: serializedDesc,
                completed: isCompleted,
                completed_at: isCompleted ? (m.completed_at || new Date().toISOString()) : null,
              }
            : m
        );
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("portfolio_admin_milestones_v1") || "{}";
            const parsed = JSON.parse(raw);
            parsed[selectedProject.id] = updated;
            localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(parsed));
          } catch (e) {}
        }
        return updated;
      });

      await fetchProjectDetails(selectedProject.id);
      await syncProjectProgress(selectedProject.id);
    } catch (err: any) {
      console.error("Erro ao alternar item da etapa:", err);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!selectedProject) return;
    if (!confirm("Tem certeza que deseja excluir esta etapa de entrega?")) return;
    try {
      if (isDbUuid(id)) {
        try {
          await supabase.from("project_milestones").delete().eq("id", id);
        } catch (e) {}
      }
      setMilestones((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("portfolio_admin_milestones_v1") || "{}";
            const parsed = JSON.parse(raw);
            parsed[selectedProject.id] = updated;
            localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(parsed));
          } catch (e) {}
        }
        return updated;
      });
      await fetchProjectDetails(selectedProject.id);
      await syncProjectProgress(selectedProject.id);
    } catch (err: any) {
      alert("Erro ao excluir etapa: " + err.message);
    }
  };

  const handleToggleWeeklyTask = async (
    project: Project,
    milestoneId: string,
    taskId?: string
  ) => {
    try {
      const currentMilestones = allProjectMilestones[project.id] || [];
      const targetMilestone = currentMilestones.find((m) => m.id === milestoneId);
      if (!targetMilestone) return;

      const tasks = parseMilestoneTasks(targetMilestone);
      let updatedTasks = tasks;
      let isCompleted = targetMilestone.completed;
      let newStatus = getMilestoneStatus(targetMilestone);

      if (taskId) {
        updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
        const anyDone = updatedTasks.some((t) => t.completed);
        if (allDone) {
          newStatus = "concluido";
          isCompleted = true;
        } else if (anyDone) {
          newStatus = "em_andamento";
          isCompleted = false;
        } else {
          newStatus = "pendente";
          isCompleted = false;
        }
      } else {
        isCompleted = !targetMilestone.completed;
        newStatus = isCompleted ? "concluido" : "pendente";
        if (tasks.length > 0) {
          updatedTasks = tasks.map((t) => ({ ...t, completed: isCompleted }));
        }
      }

      const cleanDesc = getMilestoneCleanDescription(targetMilestone);
      const serializedDesc = serializeMilestoneDescription(cleanDesc, newStatus, updatedTasks);

      if (isDbUuid(targetMilestone.id)) {
        try {
          await supabase
            .from("project_milestones")
            .update({
              description: serializedDesc,
              completed: isCompleted,
              completed_at: isCompleted ? (targetMilestone.completed_at || new Date().toISOString()) : null,
            })
            .eq("id", targetMilestone.id);
        } catch (e) {}
      }

      const updatedMilestonesList = currentMilestones.map((m) =>
        m.id === targetMilestone.id
          ? {
              ...m,
              description: serializedDesc,
              completed: isCompleted,
              completed_at: isCompleted ? (m.completed_at || new Date().toISOString()) : null,
            }
          : m
      );

      setAllProjectMilestones((prev) => ({
        ...prev,
        [project.id]: updatedMilestonesList,
      }));

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("portfolio_admin_milestones_v1") || "{}";
          const parsed = JSON.parse(raw);
          parsed[project.id] = updatedMilestonesList;
          localStorage.setItem("portfolio_admin_milestones_v1", JSON.stringify(parsed));
        } catch (e) {}
      }

      if (selectedProject && selectedProject.id === project.id) {
        setMilestones(updatedMilestonesList);
      }

      await syncProjectProgress(project.id);
    } catch (err: any) {
      console.error("Erro ao alternar tarefa semanal:", err);
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

    // Sync to real-time serverStore
    try {
      await fetch("/api/portal/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projId, update: newUpdate }),
      });
    } catch (apiErr) {
      console.warn("API portal updates sync failed:", apiErr);
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

    // Trigger instant WhatsApp notification modal for the client
    const currentProj = projects.find((p) => p.id === projId) || selectedProject;
    const clientRecord = clients.find(
      (c) =>
        c.id === currentProj?.client_id ||
        ((currentProj as any)?.client_email &&
          c.email?.toLowerCase() === (currentProj as any).client_email.toLowerCase())
    );

    if (currentProj) {
      setWaNotifyModal({
        open: true,
        clientName: clientRecord?.full_name || "Cliente",
        clientPhone: clientRecord?.phone || "553598030543",
        projectTitle: currentProj.title,
        updateTitle: newUpdate.title,
        updateSummary: newUpdate.content,
      });
    }
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

  // Default client password and generator
  const DEFAULT_CLIENT_PASSWORD = "Cliente@123";

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCPassword(pass);
  };

  const getClientMetaLocal = (id: string, email?: string) => {
    if (typeof window === "undefined") return null;
    try {
      const current = JSON.parse(localStorage.getItem("portfolio_admin_clients_metadata_v1") || "{}");
      if (id && current[id]) return current[id];
      if (email && current[email.toLowerCase()]) return current[email.toLowerCase()];
    } catch (e) {}
    return null;
  };

  // Local client metadata storage (preserves company, phone, status, and initial_password)
  const saveClientMetaLocal = (
    id: string,
    email: string,
    meta: {
      company?: string | null;
      phone?: string | null;
      status?: "active" | "blocked";
      full_name?: string | null;
      initial_password?: string | null;
    }
  ) => {
    if (typeof window === "undefined") return;
    try {
      const current = JSON.parse(localStorage.getItem("portfolio_admin_clients_metadata_v1") || "{}");
      const existing = current[id] || (email ? current[email.toLowerCase()] : {}) || {};
      const updated = { ...existing, ...meta, email, id };
      current[id] = updated;
      if (email) current[email.toLowerCase()] = updated;
      localStorage.setItem("portfolio_admin_clients_metadata_v1", JSON.stringify(current));
    } catch (e) {}
  };

  const handleOpenClientModal = (client?: Profile) => {
    if (client) {
      setEditingClient(client);
      setCFullName(client.full_name || "");
      setCEmail(client.email || "");
      setCPhone(client.phone || "");
      setCCompany(client.company || "");
      setCStatus(client.status || "active");
      const meta = getClientMetaLocal(client.id, client.email);
      setCPassword(meta?.initial_password || DEFAULT_CLIENT_PASSWORD);
    } else {
      setEditingClient(null);
      setCFullName("");
      setCEmail("");
      setCPhone("");
      setCCompany("");
      setCStatus("active");
      setCPassword(DEFAULT_CLIENT_PASSWORD);
    }
    setCreatedClientInfo(null);
    setClientModalOpen(true);
  };

  const handleOpenClientDetails = (client: Profile) => {
    setSelectedClientDetails(client);
    setClientDetailsModalOpen(true);
  };

  const safeUpdateProfileInDb = async (clientId: string, payload: any) => {
    let toSend = { ...payload };
    for (let i = 0; i < 4; i++) {
      const { error } = await supabase.from("profiles").update(toSend).eq("id", clientId);
      if (!error) return true;
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("company")) delete toSend.company;
      else if (msg.includes("phone")) delete toSend.phone;
      else if (msg.includes("status")) delete toSend.status;
      else if (msg.includes("column") && msg.includes("schema cache")) {
        toSend = { full_name: payload.full_name, email: payload.email };
      } else {
        throw error;
      }
    }
    return false;
  };

  // Client Registration & Edit Action
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = cEmail.trim().toLowerCase();
    const cleanFullName = cFullName.trim();
    const cleanPassword = cPassword.trim() || DEFAULT_CLIENT_PASSWORD;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      alert(`O e-mail "${cleanEmail}" está incompleto ou inválido.\n\nPor favor, informe um e-mail com domínio completo (ex: nome@hotmail.com, nome@gmail.com ou nome@empresa.com.br).`);
      return;
    }

    setClientSaving(true);
    try {
      if (editingClient) {
        // Save locally first to guarantee immediate persistence
        saveClientMetaLocal(editingClient.id, cleanEmail, {
          company: cCompany ? cCompany.trim() : null,
          phone: cPhone ? cPhone.trim() : null,
          status: cStatus,
          full_name: cleanFullName,
          initial_password: cleanPassword,
        });

        // Call backend update API to sync profile and update password in Supabase Auth if service role exists
        try {
          await fetch("/api/admin/update-client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId: editingClient.id,
              email: cleanEmail,
              password: cleanPassword,
              fullName: cleanFullName,
              phone: cPhone ? cPhone.trim() : null,
              company: cCompany ? cCompany.trim() : null,
              status: cStatus,
            }),
          });
        } catch (apiErr) {
          console.warn("Update API call failed, updating directly in DB:", apiErr);
        }

        // Update database with schema-resilient helper
        await safeUpdateProfileInDb(editingClient.id, {
          full_name: cleanFullName,
          email: cleanEmail,
          phone: cPhone ? cPhone.trim() : null,
          company: cCompany ? cCompany.trim() : null,
          status: cStatus,
        });

        setClientModalOpen(false);
        setEditingClient(null);
        if (selectedClientDetails?.id === editingClient.id) {
          setSelectedClientDetails({
            ...selectedClientDetails,
            full_name: cleanFullName,
            email: cleanEmail,
            phone: cPhone ? cPhone.trim() : null,
            company: cCompany ? cCompany.trim() : null,
            status: cStatus,
          });
        }
      } else {
        // Create new client via API
        const res = await fetch("/api/admin/create-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: cleanFullName,
            email: cleanEmail,
            password: cleanPassword,
            phone: cPhone ? cPhone.trim() : null,
            company: cCompany ? cCompany.trim() : null,
            status: cStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar cliente");

        if (data.user?.id) {
          saveClientMetaLocal(data.user.id, cleanEmail, {
            company: cCompany ? cCompany.trim() : null,
            phone: cPhone ? cPhone.trim() : null,
            status: cStatus,
            full_name: cleanFullName,
            initial_password: cleanPassword,
          });
        }

        setCreatedClientInfo({
          name: cleanFullName,
          email: cleanEmail,
          pass: cleanPassword,
          phone: cPhone ? cPhone.trim() : "",
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
      saveClientMetaLocal(client.id, client.email, { status: newStatus });
      await safeUpdateProfileInDb(client.id, { status: newStatus });
      if (selectedClientDetails?.id === client.id) {
        setSelectedClientDetails({ ...selectedClientDetails, status: newStatus });
      }
      await fetchData();
    } catch (err: any) {
      console.warn("Could not toggle status directly in DB, saved locally:", err);
      await fetchData();
    }
  };

  const handleDeleteClient = async (id: string, email?: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente permanentemente? Seus projetos vinculados serão desassociados.")) return;
    try {
      // 1. Delete from server API
      try {
        await fetch("/api/admin/delete-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: id, email }),
        });
      } catch (apiErr) {
        console.warn("Delete client API failed:", apiErr);
      }

      // 2. Delete from Supabase DB (safely ignore UUID format mismatch)
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from("profiles").delete().eq("id", id);
        } else if (email) {
          await supabase.from("profiles").delete().ilike("email", email);
        }
      } catch (dbErr) {
        console.warn("Supabase direct DB delete skipped/failed:", dbErr);
      }

      // 3. Clean from local storage
      if (typeof window !== "undefined") {
        try {
          const current = JSON.parse(localStorage.getItem("portfolio_admin_clients_metadata_v1") || "{}");
          delete current[id];
          if (email) delete current[email.toLowerCase()];
          localStorage.setItem("portfolio_admin_clients_metadata_v1", JSON.stringify(current));
        } catch (e) {}
      }

      if (selectedClientDetails?.id === id) {
        setClientDetailsModalOpen(false);
        setSelectedClientDetails(null);
      }
      setClientModalOpen(false);
      setEditingClient(null);
      await fetchData();
    } catch (err: any) {
      alert("Erro ao excluir cliente: " + err.message);
    }
  };

  const getClientLoginUrl = () => {
    return "https://www.mairareis.com.br/login";
  };

  const composeClientAccessMessage = (clientName: string, clientEmail: string, clientPassword?: string | null) => {
    const loginUrl = getClientLoginUrl();
    const pass = (clientPassword || "").trim() || DEFAULT_CLIENT_PASSWORD;
    const name = (clientName || "").trim() || "Cliente";
    return `Olá ${name}!\n\nAqui estão os seus dados de acesso ao Portal do Cliente para você acompanhar o desenvolvimento do seu projeto em tempo real:\n\n*Link de Acesso:* ${loginUrl}\n*E-mail de Login:* ${clientEmail}\n*Senha Inicial:* ${pass}\n\nVocê já pode fazer login para visualizar o andamento, entregas, extrato e documentos. Qualquer dúvida estou à disposição!`;
  };

  const getClientWhatsAppMessage = () => {
    if (!createdClientInfo) return "";
    return composeClientAccessMessage(
      createdClientInfo.name,
      createdClientInfo.email,
      createdClientInfo.pass
    );
  };

  const formatPhoneForWhatsApp = (raw?: string | null): string => {
    if (!raw) return "";
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      digits = digits.substring(1);
    }
    if (digits.length === 10 || digits.length === 11) {
      digits = "55" + digits;
    }
    return digits;
  };

  // 1. Direct Redirection ONLY to conversation on WhatsApp (no text attached)
  const handleOpenWhatsAppChatOnly = async (client: Profile) => {
    const clientName = client.full_name || "Cliente";
    let phoneDigits = formatPhoneForWhatsApp(client.phone);

    if (!phoneDigits || phoneDigits.length < 10) {
      const typed = prompt(
        `O cliente ${clientName} ainda não tem telefone cadastrado.\nDigite o WhatsApp com DDD para abrir a conversa:\n(Ex: 16974007791 ou 11999998888)`,
        ""
      );
      if (typed) {
        phoneDigits = formatPhoneForWhatsApp(typed);
        try {
          await supabase.from("profiles").update({ phone: typed.trim() }).eq("id", client.id);
          client.phone = typed.trim();
          saveClientMetaLocal(client.id, client.email, { phone: typed.trim() });
          if (selectedClientDetails?.id === client.id) {
            setSelectedClientDetails({ ...selectedClientDetails, phone: typed.trim() });
          }
        } catch (e) {}
      }
    }

    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}`, "_blank");
    } else {
      window.open(`https://web.whatsapp.com`, "_blank");
    }
  };

  // 2. "Enviar Acesso": Sends the formatted access credentials message to the client on WhatsApp
  const handleSendClientAccess = async (client: Profile) => {
    const clientName = client.full_name || "Cliente";
    const meta = getClientMetaLocal(client.id, client.email);
    const clientPassword = meta?.initial_password || DEFAULT_CLIENT_PASSWORD;
    const msg = composeClientAccessMessage(
      clientName,
      client.email,
      clientPassword
    );

    let phoneDigits = formatPhoneForWhatsApp(client.phone);

    if (!phoneDigits || phoneDigits.length < 10) {
      const typed = prompt(
        `O cliente ${clientName} ainda não tem telefone cadastrado.\nDigite o WhatsApp com DDD para enviar os dados de acesso:\n(Ex: 16974007791 ou 11999998888)`,
        ""
      );
      if (typed) {
        phoneDigits = formatPhoneForWhatsApp(typed);
        try {
          await supabase.from("profiles").update({ phone: typed.trim() }).eq("id", client.id);
          client.phone = typed.trim();
          saveClientMetaLocal(client.id, client.email, { phone: typed.trim() });
          if (selectedClientDetails?.id === client.id) {
            setSelectedClientDetails({ ...selectedClientDetails, phone: typed.trim() });
          }
        } catch (e) {}
      }
    }

    // Copy to clipboard as well
    try {
      navigator.clipboard.writeText(msg);
    } catch (e) {}

    const encodedMsg = encodeURIComponent(msg);
    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}?text=${encodedMsg}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, "_blank");
    }
  };

  const handleOpenWhatsAppDirect = () => {
    if (!createdClientInfo) return;
    const msg = getClientWhatsAppMessage();
    const encodedMsg = encodeURIComponent(msg);

    let phoneDigits = formatPhoneForWhatsApp(createdClientInfo.phone || cPhone);
    if (!phoneDigits || phoneDigits.length < 10) {
      const typed = prompt(
        `Informe o número do WhatsApp com DDD do cliente para enviar o acesso:\n(Ex: 16974007791 ou 11999998888)`,
        createdClientInfo.phone || cPhone || ""
      );
      if (typed) {
        phoneDigits = formatPhoneForWhatsApp(typed);
      }
    }

    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}?text=${encodedMsg}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, "_blank");
    }
  };

  const handleOpenWhatsAppChatDirect = () => {
    if (!createdClientInfo) return;
    let phoneDigits = formatPhoneForWhatsApp(createdClientInfo.phone || cPhone);
    if (!phoneDigits || phoneDigits.length < 10) {
      const typed = prompt(
        `Informe o número do WhatsApp com DDD do cliente para abrir a conversa:\n(Ex: 16974007791 ou 11999998888)`,
        createdClientInfo.phone || cPhone || ""
      );
      if (typed) {
        phoneDigits = formatPhoneForWhatsApp(typed);
      }
    }

    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}`, "_blank");
    } else {
      window.open(`https://web.whatsapp.com`, "_blank");
    }
  };

  const copyWhatsAppMessage = () => {
    if (!createdClientInfo) return;
    const msg = getClientWhatsAppMessage();
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
    // Sync with server API
    fetch("/api/portal/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ financesMap: updated }),
    }).catch((err) => console.warn("Could not save finances to server API:", err));
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

    const newTotalContract = updatedInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    const updatedProjectFinance: ProjectFinancialData = {
      ...currentFin,
      total_contract_value: newTotalContract > 0 ? newTotalContract : (currentFin.total_contract_value || 0),
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
    const newTotal = filtered.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        ...currentFin,
        total_contract_value: newTotal,
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
    setSplitCount(12);
    setSplitStartDate(new Date().toISOString().split("T")[0]);
    setSplitFirstPaid(true);
    setSplitMethod("pix");

    const currentFin = projectFinances[projectId];
    const contractTotal = currentFin?.total_contract_value || 0;
    if (contractTotal > 0) {
      setSplitTotalContractAmount(contractTotal);
      setSplitInstallmentAmount(Math.round((contractTotal / 12) * 100) / 100);
    } else {
      setSplitTotalContractAmount("");
      setSplitInstallmentAmount("");
    }

    setSplitGeneratorOpen(true);
  };

  const handleInstallmentAmountChange = (val: string) => {
    setSplitInstallmentAmount(val);
    const num = parseFloat(val.replace(",", "."));
    if (!isNaN(num) && num >= 0) {
      setSplitTotalContractAmount(Math.round(num * splitCount * 100) / 100);
    } else if (val === "") {
      setSplitTotalContractAmount("");
    }
  };

  const handleTotalContractAmountChange = (val: string) => {
    setSplitTotalContractAmount(val);
    const num = parseFloat(val.replace(",", "."));
    if (!isNaN(num) && num >= 0) {
      setSplitInstallmentAmount(Math.round((num / splitCount) * 100) / 100);
    } else if (val === "") {
      setSplitInstallmentAmount("");
    }
  };

  const handleSplitCountChange = (newCount: number) => {
    setSplitCount(newCount);
    const instNum = parseFloat(String(splitInstallmentAmount).replace(",", "."));
    const totalNum = parseFloat(String(splitTotalContractAmount).replace(",", "."));
    if (!isNaN(instNum) && instNum > 0) {
      setSplitTotalContractAmount(Math.round(instNum * newCount * 100) / 100);
    } else if (!isNaN(totalNum) && totalNum > 0) {
      setSplitInstallmentAmount(Math.round((totalNum / newCount) * 100) / 100);
    }
  };

  const handleExecuteSplitGenerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForInstallment) return;
    const projectId = targetProjectIdForInstallment;
    const currentFin = projectFinances[projectId];
    
    const count = Math.max(1, Math.min(12, Number(splitCount) || 1));
    const rawInstNum = parseFloat(String(splitInstallmentAmount).replace(",", "."));
    const rawTotalNum = parseFloat(String(splitTotalContractAmount).replace(",", "."));

    let finalPartAmount = 0;
    let finalContractTotal = 0;

    if (!isNaN(rawInstNum) && rawInstNum > 0) {
      finalPartAmount = rawInstNum;
      finalContractTotal = !isNaN(rawTotalNum) && rawTotalNum > 0 ? rawTotalNum : rawInstNum * count;
    } else if (!isNaN(rawTotalNum) && rawTotalNum > 0) {
      finalContractTotal = rawTotalNum;
      finalPartAmount = Math.round((rawTotalNum / count) * 100) / 100;
    } else if (currentFin && currentFin.total_contract_value > 0) {
      finalContractTotal = currentFin.total_contract_value;
      finalPartAmount = Math.round((currentFin.total_contract_value / count) * 100) / 100;
    }

    const generated: ProjectInstallment[] = [];
    const baseDateStr = splitStartDate || new Date().toISOString().split("T")[0];
    const [startYear, startMonth, startDay] = baseDateStr.split("-").map(Number);

    for (let i = 1; i <= count; i++) {
      const targetDate = new Date(startYear, startMonth - 1 + (i - 1), startDay || 1);
      const formattedDueDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
      const isFirstPaid = i === 1 && splitFirstPaid;

      generated.push({
        id: `inst-gen-${Date.now()}-${i}`,
        project_id: projectId,
        installment_number: i,
        title: count === 1 ? "Pagamento Único (À Vista)" : `Parcela ${i}/${count}`,
        amount: finalPartAmount,
        due_date: formattedDueDate,
        paid_at: isFirstPaid ? baseDateStr : null,
        payment_method: splitMethod,
        receipt_url: isFirstPaid ? "REC-ENTRADA-SPLIT-AUTO" : null,
        notes: `Parcelamento automático gerado (${count}x)`,
      });
    }

    saveFinancesToStorage({
      ...projectFinances,
      [projectId]: {
        project_id: projectId,
        total_contract_value: finalContractTotal,
        notes: `Contrato parcelado em ${count}x de ${formatBRL(finalPartAmount)} via ${getPaymentMethodLabel(splitMethod)}`,
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
    // Sync with server API
    fetch("/api/portal/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentsMap: updated }),
    }).catch((err) => console.warn("Could not save documents to server API:", err));
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

  // Action to reply to a feedback / approval on WhatsApp
  const handleAcknowledgeFeedbackWhatsApp = (item: DeliveryFeedbackItem) => {
    const project = projects.find((p) => p.id === item.project_id);
    const client = clients.find((c) => matchProjectToClient(project || ({ id: item.project_id } as any), c));
    const isApproval = item.type === "approval";
    const text = encodeURIComponent(
      `Olá ${item.author_name || "Cliente"}!\n\n` +
      `Recebi sua validação sobre o marco *"${item.milestone_title}"* do projeto *${project?.title || "Projeto"}*.\n\n` +
      (isApproval
        ? `✅ *Aprovação Confirmada:* Muito obrigada pelo feedback positivo e aceite formal! Já estamos avançando com os próximos passos da sprint.`
        : `⚠️ *Solicitação de Ajuste:* Li atentamente as considerações enviadas ("${item.notes}"). Já estou priorizando a revisão técnica para que fique 100% perfeito!`) +
      `\n\nQualquer dúvida adicional estou à disposição por aqui.`
    );
    let phoneDigits = formatPhoneForWhatsApp(client?.phone);
    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}?text=${text}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  // Support Tickets Actions
  const saveSupportTicketsToStorage = (updated: SupportTicket[]) => {
    setSupportTickets(updated);
    try {
      localStorage.setItem("portfolio_support_tickets_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving support tickets:", e);
    }
  };

  const handleOpenTicketModal = (ticket?: SupportTicket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTClientName(ticket.client_name);
      setTClientEmail(ticket.client_email);
      setTProjectId(ticket.project_id);
      setTSubject(ticket.subject);
      setTMessage(ticket.message);
      setTPriority(ticket.priority);
      setTStatus(ticket.status);
      setTResponseNotes(ticket.response_notes || "");
    } else {
      setEditingTicket(null);
      setTClientName(clients[0]?.full_name || "");
      setTClientEmail(clients[0]?.email || "");
      setTProjectId(projects[0]?.id || "");
      setTSubject("");
      setTMessage("");
      setTPriority("media");
      setTStatus("aberto");
      setTResponseNotes("");
    }
    setTicketModalOpen(true);
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === tProjectId);
    if (editingTicket) {
      const updated = supportTickets.map((t) =>
        t.id === editingTicket.id
          ? {
              ...t,
              client_name: tClientName.trim(),
              client_email: tClientEmail.trim(),
              project_id: tProjectId,
              project_title: proj?.title || t.project_title || "Projeto",
              subject: tSubject.trim(),
              message: tMessage.trim(),
              priority: tPriority,
              status: tStatus,
              response_notes: tResponseNotes.trim() || undefined,
              updated_at: new Date().toISOString(),
            }
          : t
      );
      saveSupportTicketsToStorage(updated);
    } else {
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        client_name: tClientName.trim() || "Cliente",
        client_email: tClientEmail.trim(),
        project_id: tProjectId || "geral",
        project_title: proj?.title || "Geral",
        subject: tSubject.trim() || "Solicitação de Atendimento",
        message: tMessage.trim(),
        priority: tPriority,
        status: tStatus,
        response_notes: tResponseNotes.trim() || undefined,
        created_at: new Date().toISOString(),
      };
      saveSupportTicketsToStorage([newTicket, ...supportTickets]);
    }
    setTicketModalOpen(false);
  };

  const handleToggleTicketStatus = (ticketId: string, newStatus: "aberto" | "em_atendimento" | "resolvido") => {
    const updated = supportTickets.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    );
    saveSupportTicketsToStorage(updated);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!confirm("Deseja realmente remover este chamado de suporte?")) return;
    const updated = supportTickets.filter((t) => t.id !== ticketId);
    saveSupportTicketsToStorage(updated);
  };

  const handleReplyTicketWhatsApp = (ticket: SupportTicket) => {
    const client = clients.find((c) => c.email.toLowerCase() === ticket.client_email.toLowerCase());
    const text = encodeURIComponent(
      `Olá ${ticket.client_name || "Cliente"}!\n\n` +
      `Aqui é a Maira Reis sobre o seu chamado *"${ticket.subject}"* (Projeto: ${ticket.project_title || "Projeto"}):\n\n` +
      `📝 *Mensagem recebida:* "${ticket.message}"\n\n` +
      (ticket.response_notes ? `💡 *Resposta / Solução:* ${ticket.response_notes}\n\n` : "") +
      `Estou à disposição para continuarmos por aqui!`
    );
    let phoneDigits = formatPhoneForWhatsApp(client?.phone);
    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}?text=${text}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  // Document Generator Actions
  const handleOpenDocGenerator = (projectId?: string) => {
    const targetProjId = projectId || (selectedProject ? selectedProject.id : (projects[0]?.id || ""));
    const proj = projects.find((p) => p.id === targetProjId);
    setGenProjectId(targetProjId);
    setGenDocType("termo_aceite");
    setGenTitle(proj ? `Termo de Aceite & Homologação - ${proj.title}` : "Termo de Aceite & Homologação");
    setGenScope(
      "1. Desenvolvimento da interface Mobile e Web\n2. Integração com Banco de Dados e APIs\n3. Homologação das funcionalidades e testes"
    );
    const fin = projectFinances[targetProjId];
    setGenValue(fin?.total_contract_value || 0);
    setGenDueDate(proj?.deadline || "");
    setGenNotes(
      "Este documento certifica a entrega e conformidade técnica dos itens homologados conforme especificado no escopo."
    );
    setDocGeneratorModalOpen(true);
  };

  const handleGenerateAndSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === genProjectId) || ({ id: "geral", title: "Projeto Oficial" } as Project);
    const client = clients.find((c) => matchProjectToClient(proj, c)) || ({ full_name: "Cliente Contratante", email: "cliente@empresa.com" } as Profile);

    const scopeList = genScope
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const docNumber = `DOC-${proj.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const docData: GeneratedDocData = {
      type: genDocType,
      docNumber: docNumber,
      title: genTitle.trim() || getDocTypeLabel(genDocType),
      projectId: proj.id,
      projectTitle: proj.title,
      client: {
        name: client.full_name || "Cliente Contratante",
        email: client.email,
        company: client.company || undefined,
        phone: client.phone || undefined,
      },
      agency: DEFAULT_AGENCY_DATA,
      scopeItems: scopeList,
      totalValue: Number(genValue) || undefined,
      deliveryDate: genDueDate || undefined,
      notes: genNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    // Open in print / save window
    openGeneratedDocument(docData);

    // Save into Project Documents
    const newDoc: ProjectDocument = {
      id: `${proj.id}-doc-${Date.now()}`,
      project_id: proj.id,
      title: genTitle.trim() || getDocTypeLabel(genDocType),
      filename: `${genTitle.trim().replace(/\s+/g, "_")}.pdf`,
      category: (genDocType === "proposta" ? "proposta" : genDocType === "termo_aceite" ? "termo_aceite" : genDocType === "nda" ? "nda" : "contrato") as DocumentCategory,
      visibility: "client",
      file_url: "data:application/pdf;base64,JVBERi0xLjQKJc...",
      file_size_bytes: 42000,
      file_size_formatted: "42 KB",
      mime_type: "application/pdf",
      uploaded_at: new Date().toISOString(),
      notes: `Documento gerado eletronicamente: ${docNumber}`,
    };

    const currentDocs = projectDocuments[proj.id] || [];
    saveDocumentsToStorage({
      ...projectDocuments,
      [proj.id]: [newDoc, ...currentDocs],
    });

    setDocGeneratorModalOpen(false);
    setEmailToast({
      message: `Documento "${newDoc.title}" gerado e salvo na Central com sucesso!`,
      type: "delivery",
    });
    setTimeout(() => setEmailToast(null), 5000);
  };

  // Broadcast & Quick Templates Helper
  const getBroadcastMessageText = (templateId: string, targetClient?: Profile, targetProject?: Project) => {
    const name = targetClient?.full_name || "Cliente";
    const projTitle = targetProject?.title || "Seu Projeto";
    const portalUrl = "https://www.mairareis.com.br/portal";
    const loginUrl = "https://www.mairareis.com.br/login";
    const previewUrl = targetProject?.preview_url || "(Ambiente de Testes)";
    const deadline = targetProject?.deadline ? new Date(targetProject.deadline).toLocaleDateString("pt-BR") : "em breve";
    const fin = targetProject ? projectFinances[targetProject.id] : null;
    const nextInst = fin?.installments?.find((i) => !i.paid_at);
    const amountStr = nextInst ? formatBRL(nextInst.amount) : "R$ 0,00";
    const dueDateStr = nextInst?.due_date ? new Date(nextInst.due_date).toLocaleDateString("pt-BR") : "no vencimento";
    const meta = targetClient ? getClientMetaLocal(targetClient.id, targetClient.email) : null;
    const initialPass = meta?.initial_password || DEFAULT_CLIENT_PASSWORD;

    switch (templateId) {
      case "staging":
        return `🚀 *Nova Versão Disponível em Homologação*\n\n` +
          `Olá ${name}!\n\n` +
          `Uma nova versão do projeto *${projTitle}* acabou de ser disponibilizada para você testar e validar em tempo real no nosso ambiente de testes:\n\n` +
          `🔗 *Link de Testes:* ${previewUrl}\n` +
          `📌 *Painel do Cliente:* ${portalUrl}\n\n` +
          `Fique à vontade para navegar e me enviar suas impressões e feedbacks!`;

      case "validation":
        return `📌 *Solicitação de Aceite & Validação de Entrega*\n\n` +
          `Olá ${name}!\n\n` +
          `Concluímos com sucesso uma etapa fundamental do projeto *${projTitle}*!\n\n` +
          `Para registrar formalmente o avanço da sprint, acesse a aba *Etapas & Entregas* no seu Portal do Cliente e clique em *Validar / Aprovar Entrega*:\n\n` +
          `👉 *Acessar Portal:* ${portalUrl}\n\n` +
          `Qualquer ajuste ou consideração, você também pode solicitar diretamente pelo portal.`;

      case "payment":
        return `💳 *Lembrete de Pagamento / Parcela do Projeto*\n\n` +
          `Olá ${name}!\n\n` +
          `Segue o lembrete referente à parcela do projeto *${projTitle}*:\n\n` +
          `💰 *Valor:* ${amountStr}\n` +
          `📅 *Vencimento:* ${dueDateStr}\n` +
          `🔑 *Chave Pix:* contato@mairareis.dev (Maira Reis da Silva)\n\n` +
          `Assim que realizar a transferência, basta enviar o comprovante por aqui. Muito obrigada!`;

      case "credentials":
        return `🔑 *Seus Dados de Acesso ao Portal do Cliente*\n\n` +
          `Olá ${name}!\n\n` +
          `Seu acesso exclusivo para acompanhar o desenvolvimento do projeto *${projTitle}* já está liberado:\n\n` +
          `🌐 *Link do Portal:* ${loginUrl}\n` +
          `👤 *E-mail de Login:* ${targetClient?.email || "seu-email"}\n` +
          `🔒 *Senha Inicial:* ${initialPass}\n\n` +
          `No portal você acompanha o cronograma em tempo real, visualiza telas, documentos e extrato financeiro.`;

      case "weekly_status":
        return `📊 *Status Semanal de Desenvolvimento*\n\n` +
          `Olá ${name}!\n\n` +
          `Resumo semanal do andamento do projeto *${projTitle}*:\n\n` +
          `✅ *Progresso Geral:* ${targetProject?.progress || 0}% concluído\n` +
          `📅 *Previsão de Entrega:* ${deadline}\n` +
          `🔗 *Acompanhe os detalhes no Portal:* ${portalUrl}\n\n` +
          `Seguimos no ritmo planejado! Qualquer dúvida estou sempre à disposição.`;

      default:
        return `Olá ${name}! Passando para compartilhar uma atualização sobre o projeto *${projTitle}*. Acesse seu Portal: ${portalUrl}`;
    }
  };

  const handleSendBroadcastWhatsApp = () => {
    const client = clients.find((c) => c.id === broadcastClientId) || clients[0];
    const project = projects.find((p) => p.id === broadcastProjectId) || projects[0];
    const msg = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, client, project);
    const encoded = encodeURIComponent(msg);
    let phoneDigits = formatPhoneForWhatsApp(client?.phone);
    if (phoneDigits && phoneDigits.length >= 10) {
      window.open(`https://wa.me/${phoneDigits}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }
  };

  const handleSendBroadcastEmail = () => {
    const client = clients.find((c) => c.id === broadcastClientId) || clients[0];
    const project = projects.find((p) => p.id === broadcastProjectId) || projects[0];
    const msg = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, client, project);

    if (!client?.email) {
      alert("Selecione um cliente com e-mail válido para disparar.");
      return;
    }

    sendTransactionalEmail({
      type: "update_posted",
      recipientEmail: client.email,
      recipientName: client.full_name || "Cliente",
      projectName: project?.title || "Projeto Contratado",
      projectId: project?.id || "geral",
      updateTitle: "Comunicado Oficial de Projeto",
      updateCategory: "Atualização",
      updateSummary: msg.slice(0, 300),
      actionUrl: "https://www.mairareis.com.br/portal",
    });

    setBroadcastToast(`E-mail transacional disparado com sucesso para ${client.email}!`);
    setTimeout(() => setBroadcastToast(null), 5000);
  };

  const handleCopyBroadcast = () => {
    const client = clients.find((c) => c.id === broadcastClientId) || clients[0];
    const project = projects.find((p) => p.id === broadcastProjectId) || projects[0];
    const msg = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, client, project);
    navigator.clipboard.writeText(msg);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  if (authLoading || (loading && projects.length === 0 && clients.length === 0)) {
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
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            const isChildActive = hasSubItems && item.subItems?.some((sub) => sub.id === activeTab);
            const isActive = activeTab === item.id || isChildActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab(item.id as TabKey);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                    isActive && !hasSubItems
                      ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30"
                      : isActive && hasSubItems
                      ? "bg-white/[0.08] text-white border border-white/10"
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

                  <div className="flex items-center gap-1.5">
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
                    {hasSubItems && (
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isActive ? "rotate-0 text-white" : "-rotate-90"
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Submenu Items (Produto e Propostas) */}
                {hasSubItems && isActive && (
                  <div className="pl-6 pr-1 py-1 space-y-1">
                    {item.subItems?.map((sub) => {
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab(sub.id as TabKey);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSubActive
                              ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-600/20 font-bold border border-indigo-500/30"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className={isSubActive ? "text-white" : "text-gray-500"}>
                            {sub.icon}
                          </div>
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

            <div ref={searchContainerRef} className="relative w-64 sm:w-80 md:w-96">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  placeholder="Buscar em toda a plataforma... (Ctrl+K)"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:bg-slate-900/90 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchDropdownOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
                    title="Limpar busca"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Global Search Results Dropdown */}
              {searchDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-[340px] sm:w-[480px] md:w-[560px] bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden max-h-[480px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Category Filter Pills */}
                  <div className="p-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] bg-black/20">
                    {[
                      { id: "all", label: "Tudo", count: allPlatformSearchResults.length },
                      { id: "project", label: "Projetos", count: allPlatformSearchResults.filter((i) => i.category === "project").length },
                      { id: "client", label: "Clientes", count: allPlatformSearchResults.filter((i) => i.category === "client").length },
                      { id: "milestone", label: "Tarefas", count: allPlatformSearchResults.filter((i) => i.category === "milestone").length },
                      { id: "finance", label: "Finanças", count: allPlatformSearchResults.filter((i) => i.category === "finance").length },
                      { id: "document", label: "Docs", count: allPlatformSearchResults.filter((i) => i.category === "document").length },
                      { id: "support", label: "Suporte", count: allPlatformSearchResults.filter((i) => i.category === "support").length },
                      { id: "update", label: "Updates", count: allPlatformSearchResults.filter((i) => i.category === "update").length },
                    ]
                      .filter((c) => c.id === "all" || c.count > 0)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSearchFilterCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                            searchFilterCategory === cat.id
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {cat.label} ({cat.count})
                        </button>
                      ))}
                  </div>

                  {/* Results List */}
                  <div className="overflow-y-auto max-h-[380px] p-2 space-y-1">
                    {filteredSearchResults.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <Search size={28} className="text-gray-600 mx-auto" />
                        <p className="text-xs text-gray-300 font-medium">Nenhum resultado encontrado para &quot;{searchQuery}&quot;</p>
                        <p className="text-[11px] text-gray-500">Tente buscar por nome de cliente, projeto, documento, chamado ou tarefa.</p>
                      </div>
                    ) : (
                      filteredSearchResults.map((res) => {
                        const getCategoryIcon = () => {
                          switch (res.category) {
                            case "project":
                              return <FolderKanban size={15} className="text-indigo-400" />;
                            case "client":
                              return <Users size={15} className="text-purple-400" />;
                            case "milestone":
                              return <CheckSquare size={15} className="text-emerald-400" />;
                            case "finance":
                              return <DollarSign size={15} className="text-emerald-400" />;
                            case "document":
                              return <FileText size={15} className="text-blue-400" />;
                            case "support":
                              return <MessageSquare size={15} className="text-rose-400" />;
                            case "update":
                              return <Send size={15} className="text-amber-400" />;
                            default:
                              return <FolderKanban size={15} className="text-indigo-400" />;
                          }
                        };

                        return (
                          <div
                            key={res.id}
                            onClick={res.onSelect}
                            className="p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                {getCategoryIcon()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                    {res.title}
                                  </span>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                    {res.categoryLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate mt-0.5">{res.subtitle}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {res.badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${res.badgeColor || "bg-white/5 text-gray-400 border-white/10"}`}>
                                  {res.badge}
                                </span>
                              )}
                              <ArrowUpRight size={14} className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 border-t border-white/10 bg-black/30 flex items-center justify-between text-[10px] text-gray-400 px-3">
                    <span>{filteredSearchResults.length} {filteredSearchResults.length === 1 ? "resultado" : "resultados"}</span>
                    <span className="flex items-center gap-1">Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">ESC</kbd> para fechar</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                    <span className="text-xs text-purple-300/80 font-semibold">cadastrados</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Base de Contas</span>
                    <span className="text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Gerenciar →
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 1. TAREFAS & ENTREGAS DA SEMANA                                            */}
              {/* ========================================================================= */}
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Compute start and end of current 7-day window
                const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                const startOfWeekFormatted = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                const endOfWeekFormatted = endOfWeek.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

                interface PriorityAlertItem {
                  id: string;
                  type: "finance" | "approval" | "support";
                  severity: "critical" | "warning";
                  title: string;
                  meta: string;
                  actionLabel: string;
                  onAction: () => void;
                }

                const operationalAlerts: PriorityAlertItem[] = [];

                // 1. Cobranças / Parcelas Vencidas
                for (const p of projects) {
                  const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                  const client = clients.find((c) => c.id === p.client_id);
                  if (pFin?.installments && Array.isArray(pFin.installments)) {
                    for (const inst of pFin.installments) {
                      if (!inst.paid_at && inst.due_date) {
                        const d = new Date(inst.due_date);
                        if (!isNaN(d.getTime())) {
                          d.setHours(0, 0, 0, 0);
                          const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (diff < 0) {
                            operationalAlerts.push({
                              id: `ov-fin-${inst.id}`,
                              type: "finance",
                              severity: "critical",
                              title: `Parcela Vencida (${formatBRL(inst.amount)}) — ${p.title} (${client?.full_name || "Cliente"})`,
                              meta: `Vencida há ${Math.abs(diff)}d`,
                              actionLabel: "Cobrar",
                              onAction: () => {
                                setSelectedProject(p);
                                setActiveTab("finance");
                              },
                            });
                          }
                        }
                      }
                    }
                  }
                }

                // 2. Aprovações & Feedbacks Pendentes de Clientes
                for (const fb of allFeedbacksFlat) {
                  if (fb.status === "pending_review") {
                    const p = projects.find((proj) => proj.id === fb.project_id);
                    operationalAlerts.push({
                      id: `ov-appr-${fb.id}`,
                      type: "approval",
                      severity: "warning",
                      title: `Validação Pendente: ${p?.title || "Projeto"} — etapa "${fb.milestone_title || fb.stage_name || "Entrega"}"`,
                      meta: "Aguardando Revisão",
                      actionLabel: "Ver",
                      onAction: () => setActiveTab("approvals"),
                    });
                  }
                }

                // 3. Chamados de Suporte Abertos
                for (const ticket of supportTickets) {
                  if (ticket.status === "aberto" || ticket.status === "em_atendimento") {
                    operationalAlerts.push({
                      id: `ov-sup-${ticket.id}`,
                      type: "support",
                      severity: ticket.priority === "urgente" || ticket.priority === "alta" ? "critical" : "warning",
                      title: `Chamado #${ticket.id.slice(-4)}: ${ticket.subject} (${ticket.client_name || "Cliente"})`,
                      meta: `Prioridade: ${ticket.priority}`,
                      actionLabel: "Responder",
                      onAction: () => setActiveTab("support"),
                    });
                  }
                }

                // Gather general tasks / milestone deliverables across all projects (Tarefa Geral)
                interface WeeklyTaskItem {
                  id: string;
                  milestoneId: string;
                  title: string;
                  completed: boolean;
                  totalSubtasks: number;
                  completedSubtasks: number;
                  progressPercent: number;
                  project: Project;
                  client: Profile | undefined;
                  dueDate: string | null;
                  formattedDueDate: string;
                  diffDays: number | null;
                  isThisWeek: boolean;
                  isOverdue: boolean;
                  urgency: "overdue" | "today" | "this_week" | "upcoming" | "done";
                  sortScore: number;
                }

                const weeklyTasksList: WeeklyTaskItem[] = [];

                for (const proj of projects) {
                  const client = clients.find((c) => c.id === proj.client_id);
                  const pMilestones = allProjectMilestones[proj.id] || [];

                  for (const m of pMilestones) {
                    const parsedTasks = parseMilestoneTasks(m);
                    const effectiveDueDate = m.due_date || proj.deadline || null;
                    let diffDays: number | null = null;
                    let isThisWeek = false;
                    let isOverdue = false;

                    if (effectiveDueDate) {
                      const d = new Date(effectiveDueDate);
                      if (!isNaN(d.getTime())) {
                        d.setHours(0, 0, 0, 0);
                        diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        isThisWeek = diffDays >= 0 && diffDays <= 7;
                        isOverdue = diffDays < 0;
                      }
                    }

                    const totalSubtasks = parsedTasks.length;
                    const completedSubtasks = parsedTasks.filter((t) => t.completed).length;
                    const isMilestoneDone =
                      m.completed ||
                      getMilestoneStatus(m) === "concluido" ||
                      (totalSubtasks > 0 && completedSubtasks === totalSubtasks);
                    const milestoneOverdue = isOverdue && !isMilestoneDone;

                    const progressPercent =
                      totalSubtasks > 0
                        ? Math.round((completedSubtasks / totalSubtasks) * 100)
                        : isMilestoneDone
                        ? 100
                        : 0;

                    let urgency: "overdue" | "today" | "this_week" | "upcoming" | "done" = "upcoming";
                    let sortScore = 50;

                    if (isMilestoneDone) {
                      urgency = "done";
                      sortScore = 1000;
                    } else if (milestoneOverdue) {
                      urgency = "overdue";
                      sortScore = -100 + (diffDays || 0);
                    } else if (diffDays === 0) {
                      urgency = "today";
                      sortScore = 0;
                    } else if (isThisWeek) {
                      urgency = "this_week";
                      sortScore = 10 + (diffDays || 0);
                    } else {
                      sortScore = 100 + (diffDays || 0);
                    }

                    weeklyTasksList.push({
                      id: `m-${m.id}`,
                      milestoneId: m.id,
                      title: m.title,
                      completed: isMilestoneDone,
                      totalSubtasks,
                      completedSubtasks,
                      progressPercent,
                      project: proj,
                      client,
                      dueDate: effectiveDueDate,
                      formattedDueDate: effectiveDueDate
                        ? new Date(effectiveDueDate).toLocaleDateString("pt-BR")
                        : "Sem prazo",
                      diffDays,
                      isThisWeek,
                      isOverdue: milestoneOverdue,
                      urgency,
                      sortScore,
                    });
                  }
                }

                // If no milestones exist at all, add active projects as high-level deliverables
                if (weeklyTasksList.length === 0) {
                  for (const proj of projects.filter((p) => p.status !== "concluido")) {
                    const client = clients.find((c) => c.id === proj.client_id);
                    let diffDays: number | null = null;
                    let isThisWeek = false;
                    let isOverdue = false;
                    if (proj.deadline) {
                      const d = new Date(proj.deadline);
                      if (!isNaN(d.getTime())) {
                        d.setHours(0, 0, 0, 0);
                        diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        isThisWeek = diffDays >= 0 && diffDays <= 7;
                        isOverdue = diffDays < 0;
                      }
                    }
                    weeklyTasksList.push({
                      id: `proj-main-${proj.id}`,
                      milestoneId: "",
                      title: proj.title,
                      completed: false,
                      totalSubtasks: 0,
                      completedSubtasks: 0,
                      progressPercent: proj.progress || 0,
                      project: proj,
                      client,
                      dueDate: proj.deadline,
                      formattedDueDate: proj.deadline
                        ? new Date(proj.deadline).toLocaleDateString("pt-BR")
                        : "Sem prazo",
                      diffDays,
                      isThisWeek,
                      isOverdue,
                      urgency: isOverdue
                        ? "overdue"
                        : diffDays === 0
                        ? "today"
                        : isThisWeek
                        ? "this_week"
                        : "upcoming",
                      sortScore: isOverdue ? -50 : diffDays !== null ? diffDays : 200,
                    });
                  }
                }

                weeklyTasksList.sort((a, b) => a.sortScore - b.sortScore);
                const pendingWeeklyTasksCount = weeklyTasksList.filter((t) => !t.completed).length;

                return (
                  <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <CheckSquare size={20} className="text-indigo-400" />
                            <span>Tarefas & Etapas da Semana 🚀</span>
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <Calendar size={11} /> {startOfWeekFormatted} a {endOfWeekFormatted}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {pendingWeeklyTasksCount} {pendingWeeklyTasksCount === 1 ? "tarefa pendente" : "tarefas pendentes"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Visão geral das etapas e tarefas macro programadas para entrega na semana.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab("projects")}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Ver Projetos ({projects.length})</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Operational Alerts Ribbon if any exist */}
                    {operationalAlerts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle size={13} className="text-amber-400" />
                          <span>Avisos Operacionais com Atenção Requerida ({operationalAlerts.length})</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {operationalAlerts.slice(0, 2).map((alt) => (
                            <div
                              key={alt.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                alt.severity === "critical"
                                  ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                                  : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    alt.severity === "critical" ? "bg-rose-400 animate-pulse" : "bg-amber-400"
                                  }`}
                                />
                                <span className="text-xs font-medium text-white truncate">{alt.title}</span>
                              </div>
                              <button
                                onClick={alt.onAction}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                                  alt.severity === "critical"
                                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                                    : "bg-amber-600 hover:bg-amber-500 text-white"
                                }`}
                              >
                                {alt.actionLabel} →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Tasks List / Grid */}
                    {weeklyTasksList.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/5 space-y-3">
                        <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                        <p className="text-xs text-gray-300 font-medium">Nenhuma tarefa com prazo para esta semana! 🎉</p>
                        <p className="text-[11px] text-gray-500">Todas as etapas e entregas estão em dia no momento.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weeklyTasksList.map((taskItem) => {
                          const { project, client, milestoneId, urgency, diffDays, completed } = taskItem;

                          return (
                            <div
                              key={taskItem.id}
                              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 group ${
                                completed
                                  ? "bg-white/[0.015] border-white/5 opacity-75"
                                  : urgency === "overdue"
                                  ? "bg-rose-950/20 border-rose-500/35 hover:border-rose-500/55"
                                  : urgency === "today"
                                  ? "bg-amber-950/20 border-amber-500/35 hover:border-amber-500/55"
                                  : "bg-white/[0.03] border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.05]"
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {/* Interactive Checkbox for general task */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (milestoneId) {
                                          handleToggleWeeklyTask(project, milestoneId);
                                        } else {
                                          handleOpenProjectDetails(project);
                                        }
                                      }}
                                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                        completed
                                          ? "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/20"
                                          : "border-white/20 bg-white/5 hover:border-indigo-400 hover:bg-indigo-500/20 text-transparent hover:text-indigo-300"
                                      }`}
                                      title={completed ? "Marcar etapa como pendente" : "Marcar etapa como concluída"}
                                    >
                                      <Check
                                        size={14}
                                        strokeWidth={3}
                                        className={completed ? "opacity-100" : "opacity-0 hover:opacity-100"}
                                      />
                                    </button>

                                    <div className="min-w-0">
                                      <h4
                                        className={`text-sm font-bold leading-snug line-clamp-1 transition-colors ${
                                          completed
                                            ? "line-through text-gray-500"
                                            : "text-white group-hover:text-indigo-200"
                                        }`}
                                      >
                                        {taskItem.title}
                                      </h4>
                                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                        Projeto: <strong className="text-gray-300">{project.title}</strong>
                                        {client && (
                                          <span className="text-gray-500"> • {client.full_name || client.company}</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Urgency Badge */}
                                  {completed ? (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                                      <CheckCircle2 size={10} /> Concluída
                                    </span>
                                  ) : urgency === "overdue" ? (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 flex items-center gap-1">
                                      <AlertCircle size={10} className="text-rose-400" /> Atrasada ({Math.abs(diffDays || 0)}d)
                                    </span>
                                  ) : urgency === "today" ? (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1">
                                      <Clock size={10} className="text-amber-400" /> Entrega Hoje!
                                    </span>
                                  ) : urgency === "this_week" ? (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 flex items-center gap-1">
                                      <Calendar size={10} /> Em {diffDays}d
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 shrink-0">
                                      {taskItem.formattedDueDate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Progress bar and metadata footer */}
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                {taskItem.totalSubtasks > 0 && (
                                  <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                      <span>
                                        {taskItem.completedSubtasks} de {taskItem.totalSubtasks} sub-tarefas concluídas
                                      </span>
                                      <span className="font-bold text-white">{taskItem.progressPercent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          completed
                                            ? "bg-emerald-400"
                                            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                        }`}
                                        style={{ width: `${taskItem.progressPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                                  <span className="flex items-center gap-1 text-gray-300 text-[11px]">
                                    <Calendar size={12} className="text-indigo-400" />
                                    {taskItem.formattedDueDate}
                                  </span>

                                  <button
                                    onClick={() => handleOpenProjectDetails(project)}
                                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                                  >
                                    Ver Etapa <ArrowUpRight size={12} />
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

              {/* ========================================================================= */}
              {/* 3. RESUMO FINANCEIRO & FLUXO DE RECEBIMENTO DO MÊS ATUAL                  */}
              {/* ========================================================================= */}
              {(() => {
                const now = new Date();
                const currYear = now.getFullYear();
                const currMonth = now.getMonth();
                const monthNameRaw = now.toLocaleDateString("pt-BR", { month: "long" });
                const capitalizedMonth = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
                const formattedMonthYear = `${capitalizedMonth} / ${currYear}`;

                let monthExpectedTotal = 0;
                let monthTotalPaid = 0;
                let monthRemaining = 0;
                let totalOverdue = 0;
                let monthInstallmentsCount = 0;
                let monthPaidCount = 0;
                let monthPendingCount = 0;
                let overdueCount = 0;

                let globalContractTotal = 0;
                let globalTotalPaid = 0;

                const allPendingInstallments: Array<{
                  project: Project;
                  client: Profile | undefined;
                  installment: ProjectInstallment;
                  diffDays: number | null;
                  isOverdue: boolean;
                  isCurrentMonth: boolean;
                }> = [];

                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);

                for (const p of projects) {
                  const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                  const summary = calculateFinancialSummary(pFin);
                  globalContractTotal += summary.contractValue;
                  globalTotalPaid += summary.totalPaid;
                  totalOverdue += summary.totalOverdue;

                  const client = clients.find((c) => c.id === p.client_id);
                  if (pFin?.installments && Array.isArray(pFin.installments)) {
                    for (const inst of pFin.installments) {
                      let diffDays: number | null = null;
                      let isOverdue = false;
                      let isCurrentMonth = false;

                      if (inst.due_date) {
                        const d = new Date(inst.due_date);
                        if (!isNaN(d.getTime())) {
                          const iYear = d.getFullYear();
                          const iMonth = d.getMonth();
                          isCurrentMonth = iYear === currYear && iMonth === currMonth;

                          d.setHours(0, 0, 0, 0);
                          diffDays = Math.ceil((d.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                          isOverdue = diffDays < 0 && !inst.paid_at;
                        }
                      }

                      if (isOverdue) {
                        overdueCount++;
                      }

                      if (isCurrentMonth) {
                        monthExpectedTotal += inst.amount;
                        monthInstallmentsCount++;
                        if (inst.paid_at) {
                          monthTotalPaid += inst.amount;
                          monthPaidCount++;
                        } else {
                          monthRemaining += inst.amount;
                          monthPendingCount++;
                        }
                      } else if (inst.paid_at) {
                        const pDate = new Date(inst.paid_at);
                        if (!isNaN(pDate.getTime()) && pDate.getFullYear() === currYear && pDate.getMonth() === currMonth) {
                          monthTotalPaid += inst.amount;
                          monthPaidCount++;
                        }
                      }

                      if (!inst.paid_at) {
                        allPendingInstallments.push({
                          project: p,
                          client,
                          installment: inst,
                          diffDays,
                          isOverdue,
                          isCurrentMonth,
                        });
                      }
                    }
                  }
                }

                allPendingInstallments.sort((a, b) => {
                  if (a.isOverdue && !b.isOverdue) return -1;
                  if (!a.isOverdue && b.isOverdue) return 1;
                  if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
                  if (!a.isCurrentMonth && b.isCurrentMonth) return 1;
                  if (a.diffDays !== null && b.diffDays !== null) return a.diffDays - b.diffDays;
                  return 0;
                });

                const monthPercent =
                  monthExpectedTotal > 0
                    ? Math.round((monthTotalPaid / monthExpectedTotal) * 100)
                    : monthTotalPaid > 0
                    ? 100
                    : 0;

                return (
                  <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-400" />
                            <span>Resumo Financeiro — Mês Atual ({capitalizedMonth})</span>
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <Calendar size={11} /> {formattedMonthYear}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Acompanhamento em tempo real de previsões, receita realizada e contas a receber no mês vigente.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab("finance")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt size={14} />
                        <span>Abrir Módulo Financeiro →</span>
                      </button>
                    </div>

                    {/* KPI Metrics Row - CURRENT MONTH */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 1. Previsto no Mês Atual */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Previsto no Mês ({capitalizedMonth})
                          </span>
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <DollarSign size={16} />
                          </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-white font-mono">
                          {formatBRL(monthExpectedTotal)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                          <span>{monthInstallmentsCount} parcelas neste mês</span>
                          <span className="text-indigo-400 font-semibold">{formatBRL(globalContractTotal)} total</span>
                        </div>
                      </div>

                      {/* 2. Recebido no Mês Atual */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Recebido no Mês
                          </span>
                          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                          {formatBRL(monthTotalPaid)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-emerald-500/10 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-emerald-300">
                            <span>{monthPercent}% do mês liquidado</span>
                            <span className="font-bold">{monthPaidCount} pagas</span>
                          </div>
                          <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${monthPercent}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* 3. A Receber no Mês Atual */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            A Receber no Mês
                          </span>
                          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                            <Clock size={16} />
                          </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                          {formatBRL(monthRemaining)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[11px] text-purple-300/80">
                          <span>{monthPendingCount} {monthPendingCount === 1 ? "parcela em aberto" : "parcelas em aberto"}</span>
                          <span className="font-semibold">Vencimento este mês</span>
                        </div>
                      </div>

                      {/* 4. INADIMPLÊNCIA / ATRASO - ALWAYS RED STYLED */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-rose-950/30 to-red-950/20 border border-rose-500/40 shadow-lg shadow-rose-950/30 flex flex-col justify-between hover:border-rose-500/60 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            Inadimplência
                          </span>
                          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <AlertCircle size={16} />
                          </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black font-mono text-rose-400">
                          {formatBRL(totalOverdue)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
                          <span className="text-rose-300/90 font-medium">
                            {totalOverdue > 0 ? `⚠️ ${overdueCount} em atraso` : "Zero pendências"}
                          </span>
                          <span className="text-rose-400 font-bold">
                            {totalOverdue > 0 ? "Cobrança necessária" : "Em dia"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Installments Mini-Table - ONLY CURRENT MONTH & OVERDUE */}
                    {(() => {
                      const monthOrOverdueInstallments = allPendingInstallments.filter(
                        (inst) => inst.isCurrentMonth || inst.isOverdue
                      );

                      return (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock size={14} className="text-indigo-400" />
                              <span>Parcelas a Receber — Mês Atual ({capitalizedMonth}) & Atrasos</span>
                            </h4>
                            <span className="text-[11px] text-gray-400">
                              {monthOrOverdueInstallments.length} {monthOrOverdueInstallments.length === 1 ? "parcela a receber" : "parcelas a receber"}
                            </span>
                          </div>

                          {monthOrOverdueInstallments.length === 0 ? (
                            <div className="p-6 text-center rounded-2xl bg-black/20 border border-white/5">
                              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-300 font-medium">Nenhuma parcela pendente para este mês ou em atraso! ✨</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Todas as parcelas de {capitalizedMonth} estão regularizadas.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {monthOrOverdueInstallments.map(({ project, client, installment, diffDays, isOverdue, isCurrentMonth }) => {
                                const formattedDueDate = installment.due_date
                                  ? new Date(installment.due_date).toLocaleDateString("pt-BR")
                                  : "Sem vencimento";

                                return (
                                  <div
                                    key={installment.id}
                                    className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isOverdue
                                        ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                                        : "bg-indigo-950/15 border-indigo-500/20 hover:border-indigo-500/40"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isOverdue
                                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                      }`}>
                                        {isOverdue ? "!" : installment.installment_number || "•"}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-bold text-white">
                                            Parcela {installment.installment_number} — {project.title}
                                          </span>
                                          {isCurrentMonth && (
                                            <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                                              Mês Atual
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                          Cliente: <strong className="text-gray-300">{client?.full_name || client?.company || "Não vinculado"}</strong>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                      <div className="text-left sm:text-right">
                                        <span className={`text-sm font-black font-mono block ${isOverdue ? "text-rose-400" : "text-white"}`}>
                                          {formatBRL(installment.amount)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                          <Calendar size={10} />
                                          {formattedDueDate}
                                        </span>
                                      </div>

                                      {isOverdue ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                          Vencida há {Math.abs(diffDays || 0)}d
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                          {diffDays === 0 ? "Vence hoje" : diffDays !== null && diffDays <= 7 ? `Vence em ${diffDays}d` : "Vence este mês"}
                                        </span>
                                      )}

                                      <button
                                        onClick={() => {
                                          setSelectedProject(project);
                                          setActiveTab("finance");
                                        }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        title="Ver no Módulo Financeiro"
                                      >
                                        <ArrowUpRight size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
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

              {/* Main Content: Projects Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Resultados ({filteredProjects.length})
                  </span>
                  <span className="text-xs text-gray-500">
                    Clique em um projeto para abrir o console de gestão completo
                  </span>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-white/10">
                    <FolderKanban size={40} className="mx-auto text-gray-600 mb-3" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((proj) => {
                      const client = clients.find((c) => matchProjectToClient(proj, c));
                      const isSelected = selectedProject?.id === proj.id;
                      const statusCfg = getStatusConfig(proj.status);
                      const projMilestones = milestones.filter((m) => m.project_id === proj.id);
                      const completedMilestones = projMilestones.filter((m) => m.completed).length;
                      const cat = (proj.category || "").toLowerCase();

                      // Category visual identity
                      const isMobile = cat.includes("mobile") || cat.includes("app") || cat.includes("react native") || cat.includes("flutter");
                      const isWeb = cat.includes("saas") || cat.includes("painel") || cat.includes("web") || cat.includes("plataforma");
                      const isDesign = cat.includes("design") || cat.includes("ui") || cat.includes("ux") || cat.includes("figma");

                      const iconGradient = isMobile
                        ? "from-violet-600 via-indigo-600 to-purple-700 shadow-violet-500/20"
                        : isWeb
                        ? "from-cyan-600 via-blue-600 to-indigo-700 shadow-cyan-500/20"
                        : isDesign
                        ? "from-pink-600 via-rose-600 to-purple-700 shadow-pink-500/20"
                        : "from-indigo-600 via-purple-600 to-slate-800 shadow-indigo-500/20";

                      return (
                        <div
                          key={proj.id}
                          onClick={() => handleOpenProjectDetails(proj)}
                          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/95 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between group space-y-4"
                        >
                          <div className="space-y-3.5">
                            {/* Card Top: Icon, Category & Status */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${iconGradient} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                  {isMobile ? (
                                    <Smartphone size={20} />
                                  ) : isWeb ? (
                                    <Globe size={20} />
                                  ) : isDesign ? (
                                    <Palette size={20} />
                                  ) : (
                                    <FolderKanban size={20} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block truncate">
                                    {proj.category || "Desenvolvimento"}
                                  </span>
                                  <h4 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                                    {proj.title}
                                  </h4>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusCfg.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                                {statusCfg.label}
                              </span>
                            </div>

                            {/* Client & Deadline Context */}
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                                    {client?.full_name?.charAt(0) || client?.email?.charAt(0).toUpperCase() || "C"}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-white truncate text-xs">
                                      {client?.full_name || client?.email || "Sem cliente atribuído"}
                                    </p>
                                    {client?.company && (
                                      <p className="text-[10px] text-indigo-300 truncate">
                                        🏢 {client.company}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                  <Calendar size={12} className="text-gray-500" />
                                  <span>
                                    {proj.deadline
                                      ? `Prazo: ${new Date(proj.deadline).toLocaleDateString("pt-BR")}`
                                      : "Sem prazo"}
                                  </span>
                                </div>
                              </div>

                              {/* Quick Stats Pills */}
                              <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap text-[11px] text-gray-400">
                                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1 text-gray-300 font-medium">
                                  <Sparkles size={11} className="text-amber-400" />
                                  <span>{projMilestones.length > 0 ? `${completedMilestones}/${projMilestones.length} etapas` : "Etapas a definir"}</span>
                                </span>
                                {proj.preview_url && (
                                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1 font-medium">
                                    <Globe size={11} />
                                    <span>Link Ativo</span>
                                  </span>
                                )}
                                {proj.figma_url && (
                                  <span className="px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 flex items-center gap-1 font-medium">
                                    <Palette size={11} />
                                    <span>Figma</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dual Progress Bars */}
                            {(() => {
                              const cardTimelineProg = calculateTimelineProgress(proj.start_date, proj.deadline);
                              const cardSprintProg = calculateSprintProgress(projMilestones);

                              return (
                                <div className="space-y-2.5 pt-1">
                                  {/* Cronograma / Meses */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-gray-400 font-medium flex items-center gap-1">
                                        <Calendar size={11} className="text-indigo-400" />
                                        <span>1. Cronograma ({cardTimelineProg.totalMonths > 0 ? `Mês ${cardTimelineProg.currentMonth}/${cardTimelineProg.totalMonths}` : "Prazo"})</span>
                                      </span>
                                      <span className="font-bold text-indigo-300 font-mono text-[10px]">
                                        {cardTimelineProg.percent}%
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                                        style={{ width: `${cardTimelineProg.percent}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Sprint / Checks */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-gray-400 font-medium flex items-center gap-1">
                                        <CheckSquare size={11} className="text-purple-400" />
                                        <span>2. Sprint Mensal (Checks)</span>
                                      </span>
                                      <span className="font-bold text-purple-300 font-mono text-[10px]">
                                        {cardSprintProg.percent}%
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                                        style={{ width: `${cardSprintProg.percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProjectDetails(proj);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              <Layers size={13} />
                              <span>Abrir Projeto</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenClientPreview(proj);
                              }}
                              className="py-2 px-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              title="Simular visualização do cliente"
                            >
                              <Eye size={13} />
                              <span className="hidden sm:inline">Ver como Cliente</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProjectModal(proj);
                              }}
                              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              title="Editar dados do projeto"
                            >
                              <Edit2 size={13} className="text-gray-400" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(proj.id);
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                              title="Excluir Projeto Permanentemente"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                        const clientProjects = projects.filter((p) => matchProjectToClient(p, c));
                        const isBlocked = c.status === "blocked";

                        return (
                          <div
                            key={c.id}
                            onClick={() => handleOpenClientDetails(c)}
                            className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/50 transition-all flex flex-col justify-between gap-4 shadow-lg group hover:bg-slate-900/95 cursor-pointer hover:shadow-purple-500/10 hover:-translate-y-0.5"
                          >
                            <div>
                              {/* Header Card: Avatar, Name, Status Badge */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
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
                                    <span className="text-emerald-400 font-medium">
                                      {c.phone}
                                    </span>
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

                              {/* Action Buttons Toolbar */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenClientModal(c);
                                  }}
                                  className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Edit2 size={12} className="text-purple-400" />
                                  <span>Editar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenWhatsAppChatOnly(c);
                                  }}
                                  className="py-2 px-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-xs font-semibold border border-emerald-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                  title="Abrir conversa direta no WhatsApp"
                                >
                                  <MessageCircle size={12} className="text-emerald-400" />
                                  <span>WhatsApp</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendClientAccess(c);
                                  }}
                                  className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Enviar dados de acesso (link, e-mail e senha padrão) no WhatsApp"
                                >
                                  <Send size={12} className="text-indigo-400" />
                                  <span className="truncate">Enviar Acesso</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClient(c.id, c.email);
                                  }}
                                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0"
                                  title="Excluir Cliente"
                                >
                                  <Trash2 size={13} />
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



          {/* TAB: APPROVALS & CLIENT FEEDBACKS */}
          {activeTab === "approvals" && (
            <ApprovalsModule
              feedbacks={deliveryFeedbacks}
              projects={projects}
              clients={clients}
              onToggleStatus={(projId, feedbackId) => handleToggleFeedbackStatus(projId, feedbackId)}
              onDeleteFeedback={(projId, feedbackId) => handleDeleteFeedback(projId, feedbackId)}
              onAcknowledgeWhatsApp={(item) => handleAcknowledgeFeedbackWhatsApp(item)}
              onOpenProjectDetails={(proj) => handleOpenProjectDetails(proj)}
            />
          )}

          {/* TAB: DOCUMENTS & CONTRACTS */}
          {activeTab === "documents" && (
            <DocumentsModule
              documents={projectDocuments}
              projects={projects}
              onOpenDocModal={(projId, doc) => handleOpenDocumentModal(projId, doc)}
              onOpenDocGenerator={(projId) => handleOpenDocGenerator(projId)}
              onOpenPdfViewer={(doc) => handleOpenPdfViewer(doc)}
              onDeleteDocument={(projId, docId) => handleDeleteDocument(projId, docId)}
            />
          )}

          {/* TAB: SUPPORT & HELPDESK INBOX */}
          {activeTab === "support" && (
            <SupportModule
              tickets={supportTickets}
              projects={projects}
              clients={clients}
              onOpenTicketModal={(ticket) => handleOpenTicketModal(ticket)}
              onToggleStatus={(ticketId, newStatus) =>
                handleToggleTicketStatus(ticketId, newStatus)
              }
              onDeleteTicket={(ticketId) => handleDeleteTicket(ticketId)}
              onReplyWhatsApp={(ticket) => handleReplyTicketWhatsApp(ticket)}
            />
          )}

          {/* TAB: BROADCAST & READY TEMPLATES */}
          {activeTab === "broadcast" && (
            <BroadcastModule
              projects={projects}
              clients={clients}
              selectedTemplateId={broadcastTemplateId}
              onSelectTemplate={(id) => setBroadcastTemplateId(id)}
              selectedProjectId={broadcastProjectId}
              onSelectProject={(id) => setBroadcastProjectId(id)}
              selectedClientId={broadcastClientId}
              onSelectClient={(id) => setBroadcastClientId(id)}
              customText={customBroadcastText}
              onChangeCustomText={(text) => setCustomBroadcastText(text)}
              copied={copiedBroadcast}
              onCopy={() => {
                const targetProj = projects.find((p) => p.id === broadcastProjectId);
                const targetClient = clients.find((c) => c.id === broadcastClientId);
                const text = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, targetClient, targetProj);
                navigator.clipboard.writeText(text);
                setCopiedBroadcast(true);
                setTimeout(() => setCopiedBroadcast(false), 2000);
              }}
              onSendWhatsApp={() => {
                const targetProj = projects.find((p) => p.id === broadcastProjectId);
                const targetClient = clients.find((c) => c.id === broadcastClientId);
                const text = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, targetClient, targetProj);
                const phoneDigits = formatPhoneForWhatsApp(targetClient?.phone);
                const encoded = encodeURIComponent(text);
                if (phoneDigits && phoneDigits.length >= 10) {
                  window.open(`https://wa.me/${phoneDigits}?text=${encoded}`, "_blank");
                } else {
                  window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
                }
              }}
              onSendEmail={() => {
                const targetProj = projects.find((p) => p.id === broadcastProjectId);
                const targetClient = clients.find((c) => c.id === broadcastClientId);
                const text = customBroadcastText || getBroadcastMessageText(broadcastTemplateId, targetClient, targetProj);
                const email = targetClient?.email || "";
                const subject = `Comunicado do Projeto: ${targetProj?.title || "Atualização Oficial"}`;
                window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, "_blank");
              }}
              getMessagePreview={(tmplId, client, project) =>
                getBroadcastMessageText(tmplId, client, project)
              }
            />
          )}

          {/* TAB: KANBAN PROSPECTION & SALES FUNNEL */}
          {activeTab === "kanban" && (
            <KanbanModule
              clients={clients}
              onOpenProposalModal={() => setActiveTab("proposals")}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
            />
          )}

          {/* TAB: EXECUTIVE REPORTS & ANALYTICS */}
          {activeTab === "reports" && (
            <ReportsModule
              projects={projects}
              clients={clients}
              projectFinances={projectFinances}
              milestones={milestones}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
              onOpenDocGenerator={(projId) => handleOpenDocGenerator(projId)}
            />
          )}

          {/* TAB: PROPOSALS & BUDGET GENERATOR / PRODUCTS / TEMPLATES */}
          {(activeTab === "proposals" || activeTab === "products" || activeTab === "templates") && (
            <ProposalsModule
              projects={projects}
              clients={clients}
              initialSubTab={activeTab === "products" ? "products" : activeTab === "templates" ? "templates" : "proposals"}
              onSubTabChange={(sub) => setActiveTab(sub as TabKey)}
              onSaveToProjectDocuments={(doc, projId) => {
                const currentDocs = projectDocuments[projId] || [];
                saveDocumentsToStorage({
                  ...projectDocuments,
                  [projId]: [doc, ...currentDocs],
                });
              }}
            />
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
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-rose-500/40 backdrop-blur-xl shadow-lg shadow-rose-950/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                          Inadimplência / Atraso
                        </span>
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertCircle size={18} />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                        {formatBRL(globalOverdue)}
                      </p>
                      <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-300/80">
                        <span>
                          {globalOverdue > 0 ? "⚠️ Requer contato" : "Em dia"}
                        </span>
                        <span className="text-rose-400 font-bold">
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
                <div className="relative w-full md:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={financeSearchQuery}
                    onChange={(e) => setFinanceSearchQuery(e.target.value)}
                    placeholder="Buscar por parcela, cliente..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  {/* Filter by Month */}
                  {(() => {
                    const monthsSet = new Set<string>();
                    const now = new Date();
                    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                    monthsSet.add(curKey);

                    for (const p of projects) {
                      const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                      for (const inst of pFin.installments) {
                        if (inst.due_date) {
                          const mKey = inst.due_date.slice(0, 7);
                          if (/^\d{4}-\d{2}$/.test(mKey)) {
                            monthsSet.add(mKey);
                          }
                        }
                      }
                    }
                    const sortedMonths = Array.from(monthsSet).sort();

                    return (
                      <select
                        value={financeMonthFilter}
                        onChange={(e) => setFinanceMonthFilter(e.target.value)}
                        className={`px-3 py-2 rounded-xl bg-black/40 border text-xs outline-none focus:border-emerald-500 cursor-pointer font-medium transition-all ${
                          financeMonthFilter === "current_and_overdue"
                            ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20"
                            : "border-white/10 text-white"
                        }`}
                      >
                        <option value="current_and_overdue" className="bg-slate-900 text-emerald-300 font-semibold">
                          📅 Mês Atual + Atrasadas (Padrão)
                        </option>
                        <option value="all" className="bg-slate-900 text-white">
                          🗓️ Todos os Meses
                        </option>
                        {sortedMonths.map((m) => (
                          <option key={m} value={m} className="bg-slate-900 text-gray-200">
                            {formatMonthKeyLabel(m)} {m === curKey ? "• (Mês Atual)" : ""}
                          </option>
                        ))}
                      </select>
                    );
                  })()}

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
                const now = new Date();
                const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                // Collect all installments from projects matching filters
                const allList: { project: Project; installment: ProjectInstallment }[] = [];

                for (const p of projects) {
                  if (financeProjectFilter !== "all" && p.id !== financeProjectFilter) continue;
                  const pFin = projectFinances[p.id] || generateDefaultProjectFinances(p);
                  for (const inst of pFin.installments) {
                    const st = getInstallmentStatus(inst);
                    if (financeStatusFilter !== "all" && st.status !== financeStatusFilter) continue;

                    // Month filter logic: default to current month and overdue
                    const instMonth = inst.due_date ? inst.due_date.slice(0, 7) : "";
                    const isOverdue = st.status === "vencido";
                    const isCurrentMonth = instMonth === currentMonthKey;

                    if (financeMonthFilter === "current_and_overdue") {
                      if (!isCurrentMonth && !isOverdue) continue;
                    } else if (financeMonthFilter !== "all") {
                      if (instMonth !== financeMonthFilter) continue;
                    }

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
                        Não há parcelas que correspondam aos filtros de busca e mês selecionados.
                      </p>
                      {financeMonthFilter !== "all" && (
                        <button
                          type="button"
                          onClick={() => setFinanceMonthFilter("all")}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors inline-block"
                        >
                          Ver parcelas de todos os meses
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FileText size={16} className="text-emerald-400" />
                          <span>Listagem de Parcelas ({allList.length})</span>
                        </h3>
                        {financeMonthFilter === "current_and_overdue" && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            📅 Mês Atual + Atrasadas
                          </span>
                        )}
                        {financeMonthFilter !== "current_and_overdue" && financeMonthFilter !== "all" && (
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            🗓️ {formatMonthKeyLabel(financeMonthFilter)}
                          </span>
                        )}
                      </div>
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
            <SettingsModule
              projects={projects}
              clients={clients}
              onRefreshData={fetchData}
            />
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal: Project Scope & Full Management Console */}
      <AnimatePresence>
        {projectDetailsModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-white/10 shadow-2xl my-auto overflow-hidden relative"
            >
              {/* Sticky Top Header */}
              {(() => {
                const selectedClient = clients.find((c) => matchProjectToClient(selectedProject, c));
                const statusCfg = getStatusConfig(selectedProject.status);

                return (
                  <div className="p-5 sm:p-6 bg-slate-900/95 border-b border-white/10 flex items-center justify-between gap-4 backdrop-blur-xl shrink-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                        <FolderKanban size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-xl font-bold text-white truncate">
                            {selectedProject.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          <span className="text-indigo-300 font-medium">{selectedProject.category || "Software"}</span>
                          <span>•</span>
                          <span>Criado em {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenClientPreview(selectedProject)}
                        className="hidden sm:flex px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-900/20"
                        title="Simular visualização do cliente"
                      >
                        <Eye size={14} />
                        <span>Ver como Cliente</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenProjectModal(selectedProject)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                        <span className="hidden sm:inline">Editar Escopo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                        title="Excluir projeto"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectDetailsModalOpen(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer ml-1"
                        title="Fechar Detalhes"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Scrollable Modal Body */}
              <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
                {(() => {
                  const selectedClient = clients.find((c) => matchProjectToClient(selectedProject, c));
                  const statusCfg = getStatusConfig(selectedProject.status);

                  return (
                    <>
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

                      {/* Dates and Dual Progress Stats */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              Prazo Estimado de Conclusão
                            </span>
                            <p className="text-xs font-semibold text-white">
                              {selectedProject.deadline
                                ? new Date(selectedProject.deadline).toLocaleDateString("pt-BR")
                                : "Não definido"}
                            </p>
                          </div>
                        </div>

                        {/* Dual Progress Bars */}
                        {(() => {
                          const modalTimelineProg = calculateTimelineProgress(selectedProject.start_date, selectedProject.deadline);
                          const modalSprintProg = calculateSprintProgress(milestones);

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* 1. Cronograma / Meses */}
                              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Calendar size={13} className="text-indigo-400" />
                                    <span>1. Cronograma Geral</span>
                                  </span>
                                  <span className="text-xs font-mono font-bold text-indigo-300">
                                    {modalTimelineProg.percent}%
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400">{modalTimelineProg.detail}</p>
                                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                                    style={{ width: `${modalTimelineProg.percent}%` }}
                                  />
                                </div>
                              </div>

                              {/* 2. Sprint / Checks */}
                              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <CheckSquare size={13} className="text-purple-400" />
                                    <span>2. Sprint Mensal (Checks)</span>
                                  </span>
                                  <span className="text-xs font-mono font-bold text-purple-300">
                                    {modalSprintProg.percent}%
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400">{modalSprintProg.detail}</p>
                                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                                    style={{ width: `${modalSprintProg.percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}
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

                      {/* Checklist de Etapas do Projeto */}
                      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <ListTodo size={16} className="text-emerald-400" />
                                <span>Etapas & Entregáveis</span>
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                                {milestones.filter((m) => m.completed || getMilestoneStatus(m) === "concluido").length}/{milestones.length} concluídas
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Lista de entregas do projeto com status e prazo previsto.
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenMilestoneModal()}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                          >
                            <Plus size={14} />
                            <span>Nova Etapa</span>
                          </button>
                        </div>

                        {/* Month Filter & Progress Bars */}
                        {milestones.length > 0 && (() => {
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

                          const totalCompleted = milestones.filter((m) => m.completed || getMilestoneStatus(m) === "concluido").length;
                          const totalProgressPct = Math.round((totalCompleted / milestones.length) * 100);

                          const displayedList = milestoneMonthFilter === "all"
                            ? milestones
                            : milestones.filter((m) => getMilestoneMonthKey(m.due_date) === milestoneMonthFilter);

                          const activeMonthObj = monthList.find((m) => m.key === milestoneMonthFilter);
                          const activeMonthCompleted = displayedList.filter((m) => m.completed || getMilestoneStatus(m) === "concluido").length;
                          const activeMonthPct = displayedList.length > 0
                            ? Math.round((activeMonthCompleted / displayedList.length) * 100)
                            : 0;

                          return (
                            <div className="space-y-4">
                              {/* Month Filter Tabs Bar */}
                              {monthList.length > 0 && (
                                <div className="space-y-2 p-3.5 rounded-2xl bg-black/30 border border-white/10">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                      <Calendar size={13} className="text-indigo-400" />
                                      <span>Filtro por Mês (Prazo das Etapas):</span>
                                    </span>
                                    {milestoneMonthFilter !== "all" && (
                                      <button
                                        type="button"
                                        onClick={() => setMilestoneMonthFilter("all")}
                                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                                      >
                                        Mostrar todos os meses
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                                    <button
                                      type="button"
                                      onClick={() => setMilestoneMonthFilter("all")}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                        milestoneMonthFilter === "all"
                                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400"
                                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                                      }`}
                                    >
                                      <ListTodo size={13} />
                                      <span>Todas as Etapas</span>
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-gray-300 font-mono">
                                        {milestones.length}
                                      </span>
                                    </button>

                                    {monthList.map((mMonth) => {
                                      const isSelected = milestoneMonthFilter === mMonth.key;
                                      return (
                                        <button
                                          key={mMonth.key}
                                          type="button"
                                          onClick={() => setMilestoneMonthFilter(mMonth.key)}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                            isSelected
                                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400"
                                              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                                          }`}
                                        >
                                          <Calendar size={13} className={isSelected ? "text-white" : "text-emerald-400"} />
                                          <span>{mMonth.label}</span>
                                          <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                              isSelected ? "bg-black/30 text-white" : "bg-black/40 text-emerald-400"
                                            }`}
                                          >
                                            {mMonth.completed}/{mMonth.count}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Progress Bar */}
                              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-gray-300 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span>
                                      {milestoneMonthFilter === "all"
                                        ? "Progresso Geral do Projeto"
                                        : `Progresso de ${activeMonthObj?.label || "Mês Selecionado"}`}
                                    </span>
                                  </span>
                                  <span className="font-mono font-bold text-emerald-300">
                                    {milestoneMonthFilter === "all"
                                      ? `${totalProgressPct}% (${totalCompleted} de ${milestones.length} etapas)`
                                      : `${activeMonthPct}% (${activeMonthCompleted} de ${displayedList.length} etapas)`}
                                  </span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-500 rounded-full"
                                    style={{
                                      width: `${milestoneMonthFilter === "all" ? totalProgressPct : activeMonthPct}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Checklist Items */}
                        {milestones.length === 0 ? (
                          <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                            <ListTodo size={28} className="mx-auto text-gray-600" />
                            <p className="text-xs text-gray-400">
                              Nenhuma etapa cadastrada para este projeto.
                            </p>
                            <button
                              onClick={() => handleOpenMilestoneModal()}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
                            >
                              <Plus size={13} />
                              <span>Criar primeira etapa</span>
                            </button>
                          </div>
                        ) : (() => {
                          const displayedMilestones = milestoneMonthFilter === "all"
                            ? milestones
                            : milestones.filter((m) => getMilestoneMonthKey(m.due_date) === milestoneMonthFilter);

                          if (displayedMilestones.length === 0) {
                            return (
                              <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
                                <Calendar size={28} className="mx-auto text-gray-600" />
                                <p className="text-xs text-gray-400">
                                  Nenhuma etapa encontrada com prazo para este mês.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setMilestoneMonthFilter("all")}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                                >
                                  Mostrar todas as etapas
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              {displayedMilestones.map((m) => {
                                const status = getMilestoneStatus(m);
                                const statusCfg = getMilestoneStatusConfig(status);
                                const cleanDesc = getMilestoneCleanDescription(m);
                                const tasks = parseMilestoneTasks(m);
                                const milestoneProg = getMilestoneProgress(m);
                                const isDone = status === "concluido" || milestoneProg === 100;
                                const isActive = status === "em_andamento" || (milestoneProg > 0 && !isDone);
                                const completedTasksCount = tasks.filter((t) => t.completed).length;

                                return (
                                  <div
                                    key={m.id}
                                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                                      isDone
                                        ? "bg-emerald-950/15 border-emerald-500/25 shadow-sm shadow-emerald-950/30"
                                        : isActive
                                        ? "bg-blue-950/15 border-blue-500/25 shadow-sm shadow-blue-950/30"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                    }`}
                                  >
                                    {/* Top Header: Status icon + Info + Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      {/* Left: Status icon + Title + Due Date */}
                                      <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="pt-0.5">
                                          {isDone ? (
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                                              <Check size={14} />
                                            </div>
                                          ) : isActive ? (
                                            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center">
                                              <Zap size={13} />
                                            </div>
                                          ) : (
                                            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center text-gray-400">
                                              <Clock size={13} />
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className={`text-xs sm:text-sm font-bold truncate ${isDone ? "text-emerald-300 line-through" : "text-white"}`}>
                                              {m.title}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${isDone ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : isActive ? "bg-blue-500/10 text-blue-300 border-blue-500/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"}`}>
                                              {statusCfg.label}
                                            </span>
                                          </div>

                                          {cleanDesc && (
                                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{cleanDesc}</p>
                                          )}

                                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 pt-0.5">
                                            {m.due_date && (
                                              <span className="flex items-center gap-1">
                                                <Calendar size={10} className="text-gray-500" />
                                                <span>Prazo: <strong className="text-gray-300">{new Date(m.due_date.includes("T") ? m.due_date : `${m.due_date}T12:00:00`).toLocaleDateString("pt-BR")}</strong></span>
                                              </span>
                                            )}
                                            {isDone && m.completed_at && (
                                              <span className="flex items-center gap-1 text-emerald-400">
                                                <ShieldCheck size={10} />
                                                <span>Concluído em {new Date(m.completed_at).toLocaleDateString("pt-BR")}</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right: Status Switcher + Actions */}
                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {/* Status Switcher */}
                                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                                          <button
                                            type="button"
                                            onClick={() => handleQuickUpdateMilestoneStatus(m, "pendente")}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              status === "pendente"
                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Marcar como Pendente"
                                          >
                                            Pendente
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleQuickUpdateMilestoneStatus(m, "em_andamento")}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              status === "em_andamento"
                                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Marcar como Em Andamento"
                                          >
                                            Em Andamento
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleQuickUpdateMilestoneStatus(m, "concluido")}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                              status === "concluido"
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                            title="Marcar como Concluído"
                                          >
                                            Concluído
                                          </button>
                                        </div>

                                        {/* Edit */}
                                        <button
                                          type="button"
                                          onClick={() => handleOpenMilestoneModal(m)}
                                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                          title="Editar etapa e checks"
                                        >
                                          <Edit2 size={13} />
                                        </button>

                                        {/* Delete */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMilestone(m.id)}
                                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                          title="Excluir etapa"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Milestone Individual Progress Bar */}
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                                          <TrendingUp size={12} className={isDone ? "text-emerald-400" : "text-indigo-400"} />
                                          <span>Conclusão da Etapa:</span>
                                        </span>
                                        <span className={`font-mono font-bold ${
                                          isDone
                                            ? "text-emerald-400"
                                            : milestoneProg > 0
                                            ? "text-indigo-300"
                                            : "text-gray-400"
                                        }`}>
                                          {milestoneProg}% Concluído {tasks.length > 0 && `(${completedTasksCount}/${tasks.length} itens)`}
                                        </span>
                                      </div>
                                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                          className={`h-full transition-all duration-500 rounded-full ${
                                            isDone
                                              ? "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm shadow-emerald-500/40"
                                              : milestoneProg > 0
                                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                              : "bg-transparent"
                                          }`}
                                          style={{ width: `${milestoneProg}%` }}
                                        />
                                      </div>
                                    </div>

                                    {/* Checklist Items of what will be done */}
                                    {tasks.length > 0 ? (
                                      <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                          <span className="flex items-center gap-1 text-gray-300">
                                            <CheckSquare size={11} className="text-indigo-400" />
                                            O que será feito nesta etapa (Checklist)
                                          </span>
                                          <span className="text-indigo-300">
                                            {completedTasksCount} de {tasks.length} checks finalizados
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {tasks.map((task) => (
                                            <button
                                              key={task.id}
                                              type="button"
                                              onClick={() => handleToggleMilestoneTask(m, task.id)}
                                              className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer group ${
                                                task.completed
                                                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30"
                                                  : "bg-black/30 border-white/5 hover:border-indigo-500/30 text-gray-300 hover:bg-white/[0.02]"
                                              }`}
                                              title={task.completed ? "Clique para desmarcar check" : "Clique para marcar check como concluído"}
                                            >
                                              <div
                                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5 transition-colors ${
                                                  task.completed
                                                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/50"
                                                    : "bg-white/5 border border-white/20 text-transparent group-hover:border-indigo-400"
                                                }`}
                                              >
                                                <Check size={11} />
                                              </div>
                                              <span
                                                className={`text-xs leading-tight select-none ${
                                                  task.completed ? "line-through text-gray-400" : "text-white"
                                                }`}
                                              >
                                                {task.text}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                                        <span>Nenhum check detalhado cadastrado ainda.</span>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenMilestoneModal(m)}
                                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1 hover:underline"
                                        >
                                          <Plus size={12} />
                                          <span>Adicionar campos de check</span>
                                        </button>
                                      </div>
                                    )}
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
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                  {editingProject ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProjectModalOpen(false);
                        handleDeleteProject(editingProject.id);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Excluir Projeto</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
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
                    <div className="mt-3 p-3.5 rounded-xl bg-black/60 font-mono text-xs space-y-2 text-white border border-white/10">
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">Nome:</span>
                        <strong className="text-white">{createdClientInfo.name}</strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">E-mail de Login:</span>
                        <strong className="text-purple-300">{createdClientInfo.email}</strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-gray-400">Senha Provisória:</span>
                        <strong className="text-emerald-400">{createdClientInfo.pass}</strong>
                      </p>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-gray-400">Link de Login:</span>
                        <a
                          href={getClientLoginUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
                        >
                          <span>{getClientLoginUrl()}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Primary WhatsApp Access Send Button */}
                  <button
                    type="button"
                    onClick={handleOpenWhatsAppDirect}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <Send size={16} className="text-white" />
                    <span>Enviar Acesso no WhatsApp</span>
                    <ArrowUpRight size={16} />
                  </button>

                  {/* Secondary Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleOpenWhatsAppChatDirect}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 hover:text-emerald-200 font-semibold text-xs flex items-center justify-center gap-2 border border-emerald-500/25 transition-all cursor-pointer"
                    >
                      <MessageCircle size={14} className="text-emerald-400" />
                      <span>Conversar no WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={copyWhatsAppMessage}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? "Acesso Copiado!" : "Copiar Acesso"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedClientInfo(null);
                      setClientModalOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
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
                        value={cEmail}
                        onChange={(e) => setCEmail(e.target.value)}
                        placeholder="cliente@empresa.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500"
                      />
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

                  {/* Senha de Acesso */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        {editingClient ? "Senha de Acesso (Padrão ou Atualizada) *" : "Senha Inicial de Acesso *"}
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Sparkles size={12} />
                        <span>Gerar Aleatória</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      placeholder="Ex: Cliente@123"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-purple-500 font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Esta senha padrão será enviada nas mensagens do WhatsApp e usada pelo cliente para login no portal.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                    {editingClient ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(editingClient.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Trash2 size={14} />
                        <span>Excluir Cliente</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      E-mail de Acesso
                    </span>
                    <p className="text-xs font-bold text-white break-all">{selectedClientDetails.email}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Senha Padrão / Acesso
                    </span>
                    <p className="text-xs font-mono font-bold text-emerald-400 break-all">
                      {getClientMetaLocal(selectedClientDetails.id, selectedClientDetails.email)?.initial_password || DEFAULT_CLIENT_PASSWORD}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      WhatsApp / Telefone
                    </span>
                    {selectedClientDetails.phone ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-emerald-400">{selectedClientDetails.phone}</p>
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(selectedClientDetails.phone)}`}
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
                    type="button"
                    onClick={() => handleOpenWhatsAppChatOnly(selectedClientDetails)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Abrir conversa direta no WhatsApp"
                  >
                    <MessageCircle size={13} className="text-emerald-400" />
                    <span>Conversar no WhatsApp</span>
                    <ArrowUpRight size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendClientAccess(selectedClientDetails)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Enviar link, e-mail e senha padrão para o cliente no WhatsApp"
                  >
                    <Send size={13} className="text-indigo-400" />
                    <span>Enviar Acesso</span>
                  </button>

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
                    <span>Novo Projeto</span>
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
                        <span>Desbloquear</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Bloquear</span>
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
                    const clientProjects = projects.filter((p) => matchProjectToClient(p, selectedClientDetails));

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
                                  {p.progress > 0 && (
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
                                  )}
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

      {/* Modal: Etapa Add/Edit with Checklist and Progress Percentage */}
      <AnimatePresence>
        {milestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ListTodo size={20} className="text-emerald-400" />
                    <span>{editingMilestone ? "Editar Etapa & Checklist" : "Nova Etapa do Projeto"}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Defina o título da etapa, adicione os checks do que será feito e acompanhe a porcentagem de conclusão.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMilestoneModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMilestone} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Título da Etapa *
                  </label>
                  <input
                    type="text"
                    required
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Ex: Fase 02: Design de Interface & Protótipo Visual"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Status & Prazo em Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Status da Etapa
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMStatus("pendente")}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          mStatus === "pendente"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md"
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Clock size={12} />
                        <span>Pendente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMStatus("em_andamento")}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          mStatus === "em_andamento"
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-md"
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Zap size={12} />
                        <span>Andamento</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMStatus("concluido")}
                        className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          mStatus === "concluido"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md"
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        <span>Concluído</span>
                      </button>
                    </div>
                  </div>

                  {/* Data Prevista */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                      Prazo Previsto de Entrega
                    </label>
                    <input
                      type="date"
                      value={mDueDate}
                      onChange={(e) => setMDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Checklist & Barra de Porcentagem de Conclusão */}
                {(() => {
                  const completedChecks = mTasks.filter((t) => t.completed).length;
                  const modalProg =
                    mTasks.length > 0
                      ? Math.round((completedChecks / mTasks.length) * 100)
                      : mStatus === "concluido"
                      ? 100
                      : 0;

                  return (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
                      {/* Section Title & Progress Stat */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <CheckSquare size={16} className="text-emerald-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Campos de Checks (O que será feito)
                          </span>
                        </div>

                        <span className={`text-xs font-mono font-bold ${modalProg === 100 ? "text-emerald-400" : "text-indigo-300"}`}>
                          {modalProg}% Concluído {mTasks.length > 0 && `(${completedChecks}/${mTasks.length} checks)`}
                        </span>
                      </div>

                      {/* Live Progress Bar */}
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            modalProg === 100
                              ? "bg-gradient-to-r from-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/40"
                              : modalProg > 0
                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${modalProg}%` }}
                        />
                      </div>

                      {/* Add new check input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={mNewTaskText}
                          onChange={(e) => setMNewTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (mNewTaskText.trim()) {
                                setMTasks((prev) => [
                                  ...prev,
                                  {
                                    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                    text: mNewTaskText.trim(),
                                    completed: false,
                                  },
                                ]);
                                setMNewTaskText("");
                              }
                            }
                          }}
                          placeholder="Adicione um item do que será feito nesta etapa (ex: Criar tela de login)..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (mNewTaskText.trim()) {
                              setMTasks((prev) => [
                                ...prev,
                                {
                                  id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                  text: mNewTaskText.trim(),
                                  completed: false,
                                },
                              ]);
                              setMNewTaskText("");
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                        >
                          <Plus size={14} />
                          <span>Adicionar Check</span>
                        </button>
                      </div>

                      {/* Quick Suggestion Chips */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Sugestões rápidas de itens:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Wireframe & Fluxo UX",
                            "Design UI de Alta Fidelidade",
                            "Configuração do Supabase/Banco",
                            "Implementação Front-end Mobile",
                            "Integração de APIs & Endpoints",
                            "Testes no Celular (QA)",
                            "Publicação / Homologação",
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                if (!mTasks.some((t) => t.text.toLowerCase() === suggestion.toLowerCase())) {
                                  setMTasks((prev) => [
                                    ...prev,
                                    {
                                      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                      text: suggestion,
                                      completed: false,
                                    },
                                  ]);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[10px] font-medium transition-colors cursor-pointer"
                            >
                              + {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tasks List */}
                      {mTasks.length > 0 ? (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                          {mTasks.map((task, index) => (
                            <div
                              key={task.id}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                task.completed
                                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                                  : "bg-slate-900/80 border-white/10 text-gray-200"
                              }`}
                            >
                              <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setMTasks((prev) =>
                                      prev.map((t) =>
                                        t.id === task.id ? { ...t, completed: checked } : t
                                      )
                                    );
                                  }}
                                  className="w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className={`text-xs ${task.completed ? "line-through text-gray-400" : "text-white"}`}>
                                  {index + 1}. {task.text}
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setMTasks((prev) => prev.filter((t) => t.id !== task.id));
                                }}
                                className="text-gray-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                title="Remover este item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 italic py-1">
                          Nenhum check adicionado ainda. Adicione itens acima ou clique nas sugestões rápidas para montar o escopo desta etapa.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Descrição Adicional */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Observações / Descrição da Etapa (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    placeholder="Ex: Esta etapa compreende a aprovação do design de alta fidelidade antes de iniciar a codificação..."
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setMilestoneModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 cursor-pointer"
                  >
                    {editingMilestone ? "Salvar Alterações da Etapa" : "Cadastrar Etapa com Checks"}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative my-6"
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

                {/* Number of Installments - Dropdown (1x to 12x) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5 flex items-center justify-between">
                    <span>Número de Parcelas (1x até 12x)</span>
                    <span className="text-purple-400 font-mono font-bold text-xs">{splitCount}x</span>
                  </label>
                  
                  <select
                    value={splitCount}
                    onChange={(e) => handleSplitCountChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold outline-none focus:border-purple-500 cursor-pointer mb-2"
                  >
                    <option value={1}>1x (À Vista - Pagamento Único)</option>
                    <option value={2}>2x Meses (Entrada + 1 Parcela)</option>
                    <option value={3}>3x Meses (Trimestral - 3 Parcelas)</option>
                    <option value={4}>4x Meses (4 Parcelas)</option>
                    <option value={5}>5x Meses (5 Parcelas)</option>
                    <option value={6}>6x Meses (Semestral - 6 Parcelas)</option>
                    <option value={7}>7x Meses (7 Parcelas)</option>
                    <option value={8}>8x Meses (8 Parcelas)</option>
                    <option value={9}>9x Meses (9 Parcelas)</option>
                    <option value={10}>10x Meses (10 Parcelas)</option>
                    <option value={11}>11x Meses (11 Parcelas)</option>
                    <option value={12}>12x Meses (Anual - 12 Parcelas)</option>
                  </select>

                  {/* Fast Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 2, 3, 4, 6, 10, 12].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => handleSplitCountChange(n)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          splitCount === n
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30"
                            : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {n === 1 ? "1x (À Vista)" : `${n}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Values Inputs: Installment Amount & Total Contract */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-purple-500/20">
                  <div>
                    <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                      Valor por Parcela (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="Ex: 500.00"
                        value={splitInstallmentAmount}
                        onChange={(e) => handleInstallmentAmountChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/30 text-emerald-400 font-mono font-bold text-xs outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Valor Total do Contrato (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 6000.00"
                        value={splitTotalContractAmount}
                        onChange={(e) => handleTotalContractAmountChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white font-mono font-bold text-xs outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5 flex items-center justify-between">
                    <span>Data de Início / 1ª Parcela *</span>
                    <span className="text-[10px] text-gray-400 font-normal">Vencimento inicial</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={splitStartDate}
                    onChange={(e) => setSplitStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                {/* Default Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Método de Pagamento Padrão
                  </label>
                  <select
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="pix">Pix Instantâneo</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="transferencia">Transferência / TED</option>
                    <option value="cripto">Cripto / USDT</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                  </select>
                </div>

                {/* First Installment Status Toggle */}
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={splitFirstPaid}
                    onChange={(e) => setSplitFirstPaid(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-purple-600 accent-purple-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-semibold block">Marcar 1ª parcela como Paga (Entrada / Sinal)</span>
                    <span className="text-gray-400 text-[11px]">
                      {splitCount === 1
                        ? "O pagamento único será registrado como quitado na data de início."
                        : `A 1ª parcela será quitada na data de início e as demais (${splitCount - 1} parcelas) geradas a cada 30 dias com status Em Aberto.`}
                    </span>
                  </div>
                </label>

                {/* Dynamic Summary / Simulation */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total a faturar:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold block">
                      {splitCount}x de {formatBRL(Number(splitInstallmentAmount) || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Total: {formatBRL(Number(splitTotalContractAmount) || (Number(splitInstallmentAmount) || 0) * splitCount)}
                    </span>
                  </div>
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

                      {/* Main Grid: Left 8 cols, Right 4 cols for desktop; stacked flex for tablet and mobile */}
                      <div className={previewDevice === "desktop" ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "flex flex-col gap-6"}>
                        {/* Left Column */}
                        <div className={previewDevice === "desktop" ? "lg:col-span-8 flex flex-col gap-6" : "flex flex-col gap-6"}>
                          {/* Card 1: Project Overview Hero */}
                          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
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

                            {/* Dual Progress Bars: 1. Progresso Geral (Cronograma/Meses) + 2. Progresso da Sprint Mensal (Checks) */}
                            {(() => {
                              const timelineProg = calculateTimelineProgress(previewProject.start_date, previewProject.deadline);
                              const sprintProg = calculateSprintProgress(clientMilestones);

                              return (
                                <div className="space-y-3.5 mb-6">
                                  {/* 1. Progresso Geral (Cronograma & Meses) */}
                                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                          <Calendar size={13} className="text-indigo-400" />
                                          <span>1. Progresso Geral do Cronograma</span>
                                        </span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">
                                          {timelineProg.detail}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        {timelineProg.percent}% Decorrido
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50"
                                        style={{ width: `${timelineProg.percent}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* 2. Progresso da Sprint Mensal (Checks & Entregas) */}
                                  <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/25 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                          <CheckSquare size={13} className="text-purple-400" />
                                          <span>2. Progresso da Sprint Mensal</span>
                                        </span>
                                        <span className="text-[10px] text-gray-400 block mt-0.5">
                                          {sprintProg.detail}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {sprintProg.percent}% Concluído
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-purple-500/50"
                                        style={{ width: `${sprintProg.percent}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Key Stats Row */}
                            <div className={`pt-4 border-t border-white/5 ${
                              previewDevice === "desktop"
                                ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
                                : previewDevice === "tablet"
                                ? "grid grid-cols-3 gap-3"
                                : "grid grid-cols-1 gap-2"
                            }`}>
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

                              <div className={`${previewDevice === "desktop" ? "col-span-2 sm:col-span-1" : ""} p-3 rounded-2xl bg-white/[0.02] border border-white/5`}>
                                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                                  <ShieldCheck size={11} className="text-emerald-400" /> Garantia
                                </span>
                                <p className="text-xs font-semibold text-emerald-300 mt-1">
                                  Inclusa (30 dias)
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card: Módulo Financeiro do Cliente */}
                          {(() => {
                            const pFin = projectFinances[previewProject.id] || generateDefaultProjectFinances(previewProject);
                            const finSummary = calculateFinancialSummary(pFin);
                            const installments = pFin.installments || [];

                            return (
                              <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                      <DollarSign size={16} className="text-emerald-400" />
                                      <span>Extrato & Quitação do Contrato (Somente Leitura)</span>
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      Visão de quitação consolidada disponibilizada para o cliente.
                                    </p>
                                  </div>
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold w-fit">
                                    {finSummary.percentPaid}% Quitado
                                  </span>
                                </div>

                                {/* 3 KPI Cards */}
                                <div className={`grid gap-3 ${
                                  previewDevice === "desktop"
                                    ? "grid-cols-1 sm:grid-cols-3"
                                    : previewDevice === "tablet"
                                    ? "grid-cols-3"
                                    : "grid-cols-1"
                                }`}>
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
                          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>Entregas & Marcos Concluídos</span>
                              </h3>
                              <span className="text-xs text-gray-400">
                                {clientMilestones.filter((m) => m.completed || getMilestoneStatus(m) === "concluido").length} de{" "}
                                {clientMilestones.length} concluídos
                              </span>
                            </div>

                            {/* Month Filter Bar */}
                            {clientMilestones.length > 0 && (() => {
                              const monthMap = new Map<string, { key: string; label: string; count: number; completed: number }>();
                              clientMilestones.forEach((m) => {
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

                              if (monthList.length <= 1 && monthList[0]?.key === "sem_data") return null;

                              return (
                                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                      <Calendar size={13} className="text-indigo-400" />
                                      <span>Filtrar por Mês (Prazo):</span>
                                    </span>
                                    {previewMilestoneMonthFilter !== "all" && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewMilestoneMonthFilter("all")}
                                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                                      >
                                        Ver todos
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewMilestoneMonthFilter("all")}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                        previewMilestoneMonthFilter === "all"
                                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400"
                                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                                      }`}
                                    >
                                      <ListTodo size={12} />
                                      <span>Todas</span>
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-gray-300 font-mono">
                                        {clientMilestones.length}
                                      </span>
                                    </button>

                                    {monthList.map((mMonth) => {
                                      const isSelected = previewMilestoneMonthFilter === mMonth.key;
                                      return (
                                        <button
                                          key={mMonth.key}
                                          type="button"
                                          onClick={() => setPreviewMilestoneMonthFilter(mMonth.key)}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                            isSelected
                                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400"
                                              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                                          }`}
                                        >
                                          <Calendar size={12} className={isSelected ? "text-white" : "text-emerald-400"} />
                                          <span>{mMonth.label}</span>
                                          <span
                                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                              isSelected ? "bg-black/30 text-white" : "bg-black/40 text-emerald-400"
                                            }`}
                                          >
                                            {mMonth.completed}/{mMonth.count}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {clientMilestones.length === 0 ? (
                              <p className="text-xs text-gray-400 py-3 text-center">
                                Marcos em processo de definição pela equipe.
                              </p>
                            ) : (() => {
                              const displayedClientMilestones = previewMilestoneMonthFilter === "all"
                                ? clientMilestones
                                : clientMilestones.filter((m) => getMilestoneMonthKey(m.due_date) === previewMilestoneMonthFilter);

                              if (displayedClientMilestones.length === 0) {
                                return (
                                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-1.5">
                                    <Calendar size={24} className="mx-auto text-gray-500" />
                                    <p className="text-xs text-gray-300 font-semibold">
                                      Nenhum marco cadastrado com prazo para este mês.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewMilestoneMonthFilter("all")}
                                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                                    >
                                      Ver todos os marcos
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-3">
                                  {displayedClientMilestones.map((m) => {
                                  const status = getMilestoneStatus(m);
                                  const cleanDesc = getMilestoneCleanDescription(m);
                                  const tasks = parseMilestoneTasks(m);
                                  const milestoneProg = getMilestoneProgress(m);
                                  const isDone = status === "concluido" || milestoneProg === 100;
                                  const isActive = status === "em_andamento" || (milestoneProg > 0 && !isDone);
                                  const completedTasksCount = tasks.filter((t) => t.completed).length;

                                  return (
                                    <div
                                      key={m.id}
                                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                        isDone
                                          ? "bg-emerald-500/[0.04] border-emerald-500/20"
                                          : isActive
                                          ? "bg-blue-500/[0.04] border-blue-500/20"
                                          : "bg-white/[0.02] border-white/5"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2.5">
                                          <div
                                            className={`w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                                              isDone
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : isActive
                                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                : "bg-white/5 text-gray-500 border border-white/10"
                                            }`}
                                          >
                                            {isDone ? <Check size={12} /> : isActive ? <Zap size={10} /> : <Clock size={10} />}
                                          </div>
                                          <div>
                                            <p
                                              className={`text-xs font-semibold ${
                                                isDone ? "text-gray-300 line-through" : "text-gray-200"
                                              }`}
                                            >
                                              {m.title}
                                            </p>
                                            {cleanDesc && (
                                              <p className="text-[11px] text-gray-400 mt-0.5">
                                                {cleanDesc}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                            isDone ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                            : isActive ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                            : "bg-white/5 text-gray-400 border-white/10"
                                          }`}>
                                            {isDone ? "Concluído" : isActive ? "Em Andamento" : "Pendente"}
                                          </span>
                                          {m.due_date && (
                                            <span className="text-[10px] text-gray-400 shrink-0">
                                              {new Date(m.due_date).toLocaleDateString("pt-BR")}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Milestone Progress Bar */}
                                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="text-gray-400 font-semibold">Progresso da Etapa</span>
                                          <span className={`font-mono font-bold ${isDone ? "text-emerald-400" : "text-indigo-300"}`}>
                                            {milestoneProg}% Concluído {tasks.length > 0 && `(${completedTasksCount}/${tasks.length} checks)`}
                                          </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                              isDone
                                                ? "bg-emerald-400"
                                                : milestoneProg > 0
                                                ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                                                : "bg-transparent"
                                            }`}
                                            style={{ width: `${milestoneProg}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Checklist Items */}
                                      {tasks.length > 0 && (
                                        <div className="space-y-1 pt-0.5">
                                          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">
                                            Itens de Execução:
                                          </span>
                                          <div className={`grid gap-1.5 ${previewDevice === "desktop" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                                            {tasks.map((task) => (
                                              <div
                                                key={task.id}
                                                className={`px-2 py-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                                                  task.completed
                                                    ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                                                    : "bg-black/20 border-white/5 text-gray-400"
                                                }`}
                                              >
                                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] shrink-0 ${
                                                  task.completed ? "bg-emerald-500 text-white" : "bg-white/5 border border-white/20 text-transparent"
                                                }`}>
                                                  <Check size={9} />
                                                </div>
                                                <span className={`truncate ${task.completed ? "line-through text-gray-400" : "text-white"}`}>
                                                  {task.text}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                          {/* Card 4: Timeline de Updates e Notas */}
                          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
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
                          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
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
                              <div className={`grid gap-3 ${previewDevice === "desktop" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
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
                        <div className={previewDevice === "desktop" ? "lg:col-span-4 flex flex-col gap-6" : "flex flex-col gap-6"}>
                          {/* Deliverables Card */}
                          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                              <ExternalLink size={14} className="text-indigo-400" />
                              <span>Entregáveis & Acessos</span>
                            </h3>

                            <div className="space-y-2.5">
                              {(() => {
                                const customLinks = (projectQuickLinks[previewProject.id] || []).filter(
                                  (l) => l.is_active && l.url && l.url.trim() !== "" &&
                                  l.url !== previewProject.figma_url &&
                                  l.url !== previewProject.preview_url &&
                                  l.url !== previewProject.repo_url
                                );
                                const hasFigma = Boolean(previewProject.figma_url && previewProject.figma_url.trim() !== "");
                                const hasPreview = Boolean(previewProject.preview_url && previewProject.preview_url.trim() !== "");
                                const hasRepo = Boolean(previewProject.repo_url && previewProject.repo_url.trim() !== "");
                                const hasAny = hasFigma || hasPreview || hasRepo || customLinks.length > 0;

                                if (!hasAny) {
                                  return (
                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-500">
                                      Nenhum link ou entregável disponível no momento.
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    {hasFigma && (
                                      <a
                                        href={previewProject.figma_url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-[#1e1b2e]/80 border border-purple-500/30 flex items-center justify-between text-white transition-all hover:border-purple-400 hover:bg-[#1e1b2e]"
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
                                    )}

                                    {hasPreview && (
                                      <a
                                        href={previewProject.preview_url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-[#11262d]/80 border border-cyan-500/30 flex items-center justify-between text-white transition-all hover:border-cyan-400 hover:bg-[#11262d]"
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
                                    )}

                                    {hasRepo && (
                                      <a
                                        href={previewProject.repo_url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-[#1a1c29]/80 border border-white/10 flex items-center justify-between text-white transition-all hover:border-white/20 hover:bg-[#1a1c29]"
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

                                    {customLinks.map((link) => (
                                      <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-white transition-all hover:border-indigo-400 hover:bg-indigo-900/30"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                                            <ExternalLink size={16} />
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold">{link.label}</p>
                                            <p className="text-[10px] text-gray-400">{link.description || "Link de acesso"}</p>
                                          </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400" />
                                      </a>
                                    ))}
                                  </>
                                );
                              })()}
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

      {/* Instant WhatsApp Update Notification Modal */}
      <AnimatePresence>
        {waNotifyModal && waNotifyModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Notificar Cliente no WhatsApp</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Instantâneo
                      </span>
                    </h3>
                    <p className="text-xs text-gray-300">
                      Atualização salva e sincronizada com o Portal em tempo real!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWaNotifyModal(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-gray-300 space-y-2">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Cliente: <strong className="text-white">{waNotifyModal.clientName}</strong></span>
                    <span>Projeto: <strong className="text-white">{waNotifyModal.projectTitle}</strong></span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-300">
                    📌 {waNotifyModal.updateTitle}
                  </div>
                </div>

                {/* Pre-formatted Message Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-gray-300 space-y-2 select-text">
                  <p className="text-[11px] text-gray-400 uppercase font-sans font-bold">Mensagem que será enviada:</p>
                  <p className="text-white font-sans whitespace-pre-line text-xs leading-relaxed">
                    {`Olá, ${waNotifyModal.clientName}! 👋\n\n` +
                     `🚀 *Nova Atualização no seu Projeto!* \n` +
                     `📁 *Projeto:* ${waNotifyModal.projectTitle}\n` +
                     `📌 *Resumo:* ${waNotifyModal.updateTitle}\n\n` +
                     `As alterações já estão disponíveis no seu Portal do Cliente:\n` +
                     `🔗 https://www.mairareis.com.br/portal`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 bg-black/40 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    const msg =
                      `Olá, ${waNotifyModal.clientName}! 👋\n\n` +
                      `🚀 *Nova Atualização no seu Projeto!* \n` +
                      `📁 *Projeto:* ${waNotifyModal.projectTitle}\n` +
                      `📌 *Resumo:* ${waNotifyModal.updateTitle}\n\n` +
                      `As alterações já estão disponíveis no seu Portal do Cliente:\n` +
                      `🔗 https://www.mairareis.com.br/portal`;
                    navigator.clipboard.writeText(msg);
                    setCopiedWaNotify(true);
                    setTimeout(() => setCopiedWaNotify(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {copiedWaNotify ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedWaNotify ? "Copiado!" : "Copiar Texto"}</span>
                </button>

                <button
                  onClick={() => {
                    const phone = (waNotifyModal.clientPhone || "553598030543").replace(/\D/g, "");
                    const msg = encodeURIComponent(
                      `Olá, ${waNotifyModal.clientName}! 👋\n\n` +
                      `🚀 *Nova Atualização no seu Projeto!* \n` +
                      `📁 *Projeto:* ${waNotifyModal.projectTitle}\n` +
                      `📌 *Resumo:* ${waNotifyModal.updateTitle}\n\n` +
                      `As alterações já estão disponíveis no seu Portal do Cliente:\n` +
                      `🔗 https://www.mairareis.com.br/portal`
                    );
                    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                    setWaNotifyModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
