"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  PieChart,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  AlertCircle,
  BarChart3,
  Calendar,
  Users,
  Search,
  ExternalLink,
  MessageCircle,
  FileText,
  Target,
  Zap,
  Activity,
  ChevronRight,
  Printer,
  LayoutGrid,
  TrendingDown,
  Info,
  Flame,
  Globe,
  Award,
  ArrowRight,
  Check,
  RotateCcw,
  Package,
  Share2,
  Eye,
  Percent,
  Plus
} from "lucide-react";

export type ReportSubTab = "overview" | "finance" | "projects" | "proposals" | "leads";

interface ReportsModuleProps {
  projects: any[];
  clients: any[];
  projectFinances?: Record<string, any>;
  milestones?: any[];
  onNavigateTab?: (tab: string) => void;
  onOpenDocGenerator?: (projectId?: string) => void;
}

const DEFAULT_PROPOSALS_FALLBACK = [
  {
    id: "prop-sample-1",
    docNumber: "PROP-2026-001",
    title: "Consultoria UX/UI & Redesign Completo",
    clientName: "Dra. Camila Nogueira",
    clientCompany: "Clínica Camila Estética",
    totalValue: 3500,
    status: "approved",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split("T")[0]
  },
  {
    id: "prop-sample-2",
    docNumber: "PROP-2026-002",
    title: "Plataforma Web SaaS & Gestão de Frotas",
    clientName: "Rodrigo Silveira",
    clientCompany: "TransLog Express",
    totalValue: 12000,
    status: "sent",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split("T")[0]
  },
  {
    id: "prop-sample-3",
    docNumber: "PROP-2026-003",
    title: "Landing Page de Alta Conversão & Tráfego",
    clientName: "Dr. Marcelo Ramos",
    clientCompany: "Ramos Advocacia",
    totalValue: 1500,
    status: "approved",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0]
  }
];

export function ReportsModule({
  projects = [],
  clients = [],
  projectFinances = {},
  milestones = [],
  onNavigateTab,
  onOpenDocGenerator
}: ReportsModuleProps) {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>("overview");

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "in_progress" | "concluido">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [chartViewMode, setChartViewMode] = useState<"chart" | "cards">("chart");
  const [hoveredMonth, setHoveredMonth] = useState<any | null>(null);
  const [hoveredCategoryName, setHoveredCategoryName] = useState<string | null>(null);

  // Live Proposals and Leads Data from localStorage
  const [storedProposals, setStoredProposals] = useState<any[]>(DEFAULT_PROPOSALS_FALLBACK);
  const [storedKanban, setStoredKanban] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const propRaw = localStorage.getItem("portfolio_commercial_proposals_v1");
      if (propRaw) {
        const parsed = JSON.parse(propRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStoredProposals(parsed);
        }
      }
    } catch (e) {}

    try {
      const kanbanRaw =
        localStorage.getItem("portfolio_trello_kanban_crm_v3") ||
        localStorage.getItem("portfolio_trello_kanban_v2");
      if (kanbanRaw) {
        setStoredKanban(JSON.parse(kanbanRaw));
      }
    } catch (e) {}
  }, []);

  const CATEGORY_COLORS = [
    { hex: "#2dd4bf", gradient: "from-teal-400 to-emerald-400", text: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-500/30", dot: "bg-teal-400" },
    { hex: "#a855f7", gradient: "from-purple-400 to-indigo-400", text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/30", dot: "bg-purple-400" },
    { hex: "#38bdf8", gradient: "from-sky-400 to-cyan-400", text: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-500/30", dot: "bg-sky-400" },
    { hex: "#fbbf24", gradient: "from-amber-400 to-orange-400", text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/30", dot: "bg-amber-400" },
    { hex: "#f43f5e", gradient: "from-rose-400 to-pink-400", text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-500/30", dot: "bg-rose-400" },
    { hex: "#34d399", gradient: "from-emerald-400 to-teal-400", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  ];

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const getShortMonthLabel = (key: string) => {
    const [yearStr, monthStr] = key.split("-");
    const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mIdx = parseInt(monthStr, 10) - 1;
    const shortYear = yearStr ? yearStr.slice(2) : "26";
    if (mIdx >= 0 && mIdx < 12) {
      return `${shortMonths[mIdx]}/${shortYear}`;
    }
    return key;
  };

  // Helpers
  const getProjectContractVal = (pFin?: any): number => {
    if (!pFin || !Array.isArray(pFin.installments) || pFin.installments.length === 0) return 0;
    return pFin.installments.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
  };

  const getProjectPaidVal = (pFin?: any): number => {
    if (!pFin || !Array.isArray(pFin.installments) || pFin.installments.length === 0) return 0;
    return pFin.installments.reduce((acc: number, curr: any) => {
      if (curr.paid_at || curr.is_paid) return acc + (Number(curr.amount) || 0);
      return acc;
    }, 0);
  };

  const parseMilestoneTasks = (m: any): { id: string; text: string; completed: boolean }[] => {
    if (!m || !m.description) return [];
    const jsonMatch = m.description.match(/\[TASKS_JSON\]([\s\S]*?)\[\/TASKS_JSON\]/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any, idx: number) => ({
              id: item.id || `task-${idx}`,
              text: typeof item === "string" ? item : (item.text || ""),
              completed: Boolean(item.completed),
            }))
            .filter((t: any) => t.text.trim().length > 0);
        }
      } catch (e) {}
    }
    return [];
  };

  const getOverallProjectProgress = (proj: any, milestonesList: any[] = []): { percent: number; label: string; detail?: string } => {
    if (proj.status === "concluido" || proj.status === "completed") {
      return { percent: 100, label: "100%", detail: "Projeto concluído" };
    }

    const directProgress = typeof proj.progress === "number" && !isNaN(proj.progress) ? Math.min(Math.max(proj.progress, 0), 100) : null;
    let stageDetail = "Desenvolvimento ativo";
    if (proj.status === "homologacao") stageDetail = "Em homologação";
    else if (proj.status === "planejamento") stageDetail = "Planejamento inicial";
    else if (proj.status === "design") stageDetail = "Design e prototipagem";

    if (directProgress !== null && directProgress > 0) {
      return {
        percent: directProgress,
        label: `${directProgress}%`,
        detail: stageDetail,
      };
    }

    const projMilestones = milestonesList.filter(
      (m) => m.project_id === proj.id || m.projectId === proj.id
    );

    if (projMilestones.length > 0) {
      const allTasks = projMilestones.flatMap((m) => parseMilestoneTasks(m));
      const completedMilestones = projMilestones.filter(
        (m) => m.completed || (m.description && m.description.includes("[STATUS: concluido]"))
      ).length;

      if (allTasks.length > 0) {
        const completedTasks = allTasks.filter((t) => t.completed).length;
        const percent = Math.round((completedTasks / allTasks.length) * 100);
        return {
          percent,
          label: `${percent}%`,
          detail: `${completedTasks} de ${allTasks.length} tarefas globais finalizadas`,
        };
      }

      if (completedMilestones > 0) {
        const percent = Math.round((completedMilestones / projMilestones.length) * 100);
        return {
          percent,
          label: `${percent}%`,
          detail: `${completedMilestones} de ${projMilestones.length} etapas globais concluídas`,
        };
      }
    }

    if (directProgress !== null) {
      return { percent: directProgress, label: `${directProgress}%`, detail: stageDetail };
    }

    if (proj.status === "homologacao") return { percent: 85, label: "85%", detail: "Homologação final" };
    if (proj.status === "planejamento") return { percent: 15, label: "15%", detail: "Planejamento" };
    return { percent: 0, label: "0%", detail: stageDetail };
  };

  // =========================================================================
  // 1. FINANCIAL METRICS
  // =========================================================================
  const financialMetrics = useMemo(() => {
    let totalContracted = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalInstallmentsCount = 0;
    let paidInstallmentsCount = 0;
    let overdueInstallmentsCount = 0;
    let contractedProjectsCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    projects.forEach((p) => {
      const pFin = projectFinances[p.id];
      const installments = pFin?.installments || [];
      const contractVal = getProjectContractVal(pFin);

      if (contractVal > 0) {
        contractedProjectsCount++;
        totalContracted += contractVal;
      }

      if (installments.length > 0) {
        installments.forEach((inst: any) => {
          totalInstallmentsCount++;
          const val = Number(inst.amount) || 0;
          if (inst.paid_at || inst.is_paid) {
            totalReceived += val;
            paidInstallmentsCount++;
          } else {
            totalPending += val;
            if (inst.due_date && inst.due_date < todayStr) {
              totalOverdue += val;
              overdueInstallmentsCount++;
            }
          }
        });
      }
    });

    const liquidationRate = totalContracted > 0 ? Math.min(100, Math.round((totalReceived / totalContracted) * 100)) : 0;
    const avgTicket = contractedProjectsCount > 0 ? totalContracted / contractedProjectsCount : (projects.length > 0 ? totalContracted / projects.length : 0);

    const activeCount = projects.filter(
      (p) =>
        p.status === "em_andamento" ||
        p.status === "in_progress" ||
        p.status === "desenvolvimento" ||
        p.status === "design" ||
        p.status === "homologacao" ||
        p.status === "planejamento"
    ).length;

    const completedCount = projects.filter(
      (p) => p.status === "concluido" || p.status === "completed"
    ).length;

    return {
      totalContracted,
      totalReceived,
      totalPending,
      totalOverdue,
      totalInstallmentsCount,
      paidInstallmentsCount,
      overdueInstallmentsCount,
      contractedProjectsCount,
      liquidationRate,
      avgTicket,
      activeCount,
      completedCount,
      totalCount: projects.length
    };
  }, [projects, projectFinances]);

  // Monthly Cashflow Timeline
  const monthlyCashflow = useMemo(() => {
    const monthMap: Record<string, { monthKey: string; label: string; received: number; pending: number; overdue: number; total: number; count: number }> = {};
    const todayStr = new Date().toISOString().split("T")[0];

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    projects.forEach((p) => {
      const pFin = projectFinances[p.id];
      const installments = pFin?.installments || [];

      installments.forEach((inst: any) => {
        const dueDate = inst.due_date || inst.created_at || todayStr;
        const key = dueDate.slice(0, 7);
        const [yearStr, monthStr] = key.split("-");
        const mIdx = parseInt(monthStr, 10) - 1;
        const label = mIdx >= 0 && mIdx < 12 ? `${monthNames[mIdx]} ${yearStr}` : key;

        if (!monthMap[key]) {
          monthMap[key] = {
            monthKey: key,
            label,
            received: 0,
            pending: 0,
            overdue: 0,
            total: 0,
            count: 0
          };
        }

        const amount = Number(inst.amount) || 0;
        monthMap[key].total += amount;
        monthMap[key].count += 1;

        if (inst.paid_at || inst.is_paid) {
          monthMap[key].received += amount;
        } else {
          monthMap[key].pending += amount;
          if (inst.due_date && inst.due_date < todayStr) {
            monthMap[key].overdue += amount;
          }
        }
      });
    });

    return Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [projects, projectFinances]);

  // Chart geometry
  const lineChartData = useMemo(() => {
    if (monthlyCashflow.length === 0) return null;
    const width = 1000;
    const height = 240;
    const padLeft = 80;
    const padRight = 50;
    const padTop = 40;
    const padBottom = 45;

    const maxVal = Math.max(...monthlyCashflow.map((m) => m.total), 100);
    const yMax = Math.max(Math.ceil((maxVal * 1.35) / 50) * 50, 200);

    const points = monthlyCashflow.map((m, idx) => {
      const x = padLeft + (idx / Math.max(monthlyCashflow.length - 1, 1)) * (width - padLeft - padRight);
      const ratio = m.total / yMax;
      const y = padTop + (1 - ratio) * (height - padTop - padBottom);
      return {
        x,
        y,
        data: m,
        val: m.total,
        ratio
      };
    });

    let linePath = "";
    if (points.length === 1) {
      linePath = `M ${points[0].x - 50} ${points[0].y} L ${points[0].x + 50} ${points[0].y}`;
    } else {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) / 2;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) / 2;
        const cy2 = p1.y;
        linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      }
    }

    const baselineY = height - padBottom;
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    const yGridSteps = [0, 0.33, 0.66, 1].map((frac) => ({
      val: Math.round(yMax * frac),
      y: padTop + (1 - frac) * (height - padTop - padBottom)
    }));

    return {
      width,
      height,
      points,
      linePath,
      areaPath,
      yGridSteps,
      baselineY,
      yMax
    };
  }, [monthlyCashflow]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const cats: Record<string, { count: number; totalBudget: number; completed: number }> = {};
    
    projects.forEach((p) => {
      const cat = p.category || "Outros";
      if (!cats[cat]) {
        cats[cat] = { count: 0, totalBudget: 0, completed: 0 };
      }
      cats[cat].count += 1;
      if (p.status === "concluido" || p.status === "completed") {
        cats[cat].completed += 1;
      }
      const fin = projectFinances[p.id];
      const val = getProjectContractVal(fin);
      cats[cat].totalBudget += val;
    });

    return Object.entries(cats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        completed: data.completed,
        budget: data.totalBudget,
        percentage: financialMetrics.totalContracted > 0 ? (data.totalBudget / financialMetrics.totalContracted) * 100 : 0
      }))
      .sort((a, b) => b.budget - a.budget);
  }, [projects, projectFinances, financialMetrics.totalContracted]);

  // =========================================================================
  // 2. PROPOSALS METRICS
  // =========================================================================
  const proposalsMetrics = useMemo(() => {
    const list = storedProposals || [];
    const totalCount = list.length;
    const approvedList = list.filter((p) => p.status === "approved" || p.status === "aprovada");
    const sentList = list.filter((p) => p.status === "sent" || p.status === "enviada");
    const rejectedList = list.filter((p) => p.status === "rejected" || p.status === "recusada");
    const draftList = list.filter((p) => p.status === "draft" || p.status === "rascunho");

    const totalProposedVal = list.reduce((acc, p) => acc + (Number(p.totalValue || p.value) || 0), 0);
    const approvedVal = approvedList.reduce((acc, p) => acc + (Number(p.totalValue || p.value) || 0), 0);
    const pendingVal = sentList.reduce((acc, p) => acc + (Number(p.totalValue || p.value) || 0), 0);

    const winRate = totalCount > 0 ? Math.round((approvedList.length / totalCount) * 100) : 0;
    const avgProposalTicket = totalCount > 0 ? Math.round(totalProposedVal / totalCount) : 0;

    return {
      totalCount,
      approvedCount: approvedList.length,
      sentCount: sentList.length,
      rejectedCount: rejectedList.length,
      draftCount: draftList.length,
      totalProposedVal,
      approvedVal,
      pendingVal,
      winRate,
      avgProposalTicket,
      list
    };
  }, [storedProposals]);

  // =========================================================================
  // 3. LEADS & PROSPECTION CRM METRICS
  // =========================================================================
  const leadsMetrics = useMemo(() => {
    const cols = storedKanban?.columns || [];
    const allCards: any[] = [];
    cols.forEach((col: any) => {
      (col.cards || []).forEach((c: any) => {
        allCards.push({ ...c, columnId: col.id, columnTitle: col.title });
      });
    });

    const totalDeals = allCards.length;
    const hotDeals = allCards.filter((c) => c.temperature === "hot" || c.temperature === "closing");
    const warmDeals = allCards.filter((c) => c.temperature === "warm");
    const coldDeals = allCards.filter((c) => c.temperature === "cold");
    const wonDeals = allCards.filter((c) => c.temperature === "won" || c.columnId === "col-ganho");
    const lostDeals = allCards.filter((c) => c.temperature === "lost" || c.columnId === "col-perdido");

    const activePipelineCards = allCards.filter((c) => c.temperature !== "won" && c.temperature !== "lost" && c.columnId !== "col-ganho" && c.columnId !== "col-perdido");
    const totalPipelineValue = activePipelineCards.reduce((acc, c) => acc + (Number(c.dealValue) || 0), 0);
    const wonValue = wonDeals.reduce((acc, c) => acc + (Number(c.dealValue) || 0), 0);

    // Group by Stage
    const stageBreakdown = cols.map((col: any) => ({
      id: col.id,
      title: col.title,
      count: (col.cards || []).length,
      value: (col.cards || []).reduce((acc: number, c: any) => acc + (Number(c.dealValue) || 0), 0)
    }));

    // Group by Origin
    const originCounts: Record<string, { count: number; value: number }> = {};
    allCards.forEach((c) => {
      const orig = c.leadOrigin || "other";
      if (!originCounts[orig]) originCounts[orig] = { count: 0, value: 0 };
      originCounts[orig].count++;
      originCounts[orig].value += Number(c.dealValue) || 0;
    });

    return {
      totalDeals,
      hotCount: hotDeals.length,
      warmCount: warmDeals.length,
      coldCount: coldDeals.length,
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      totalPipelineValue,
      wonValue,
      stageBreakdown,
      originCounts,
      cards: allCards
    };
  }, [storedKanban]);

  // Filtered Projects for Projects Tab
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedPeriod === "in_progress") {
        const isNotDone = p.status !== "concluido" && p.status !== "completed";
        if (!isNotDone) return false;
      }
      if (selectedPeriod === "concluido") {
        const isDone = p.status === "concluido" || p.status === "completed";
        if (!isDone) return false;
      }
      if (selectedCategoryFilter !== "all" && p.category !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const client = clients.find((c) => c.id === p.client_id || c.id === p.clientId);
        const titleMatch = p.title.toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const clientMatch = (client?.full_name || client?.company || "").toLowerCase().includes(q);
        if (!titleMatch && !catMatch && !clientMatch) return false;
      }
      return true;
    });
  }, [projects, selectedPeriod, selectedCategoryFilter, searchQuery, clients]);

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER BANNER                                                */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-[#10141d] to-slate-950 p-4 sm:p-5 backdrop-blur-2xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Hub de Inteligência & Relatórios Executivos
              </span>
              <span className="text-[11px] text-neutral-400">• Visão 360° do Negócio</span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Performance do Negócio & <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">BI Estratégico</span>
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Acompanhe a jornada completa da sua operação: da prospecção de leads à geração de propostas, execução de projetos e liquidação financeira.
            </p>
          </div>

          {/* Quick Global Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Exportar ou Imprimir Relatório"
            >
              <Printer className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("kanban")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Target className="h-3.5 w-3.5" />
                <span>Ir para o Funil</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUB-TABS NAVIGATION BAR (Categorias Solicitadas)                       */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveSubTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "overview"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>🌟 Visão Geral (End-to-End)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("finance")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "finance"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>💰 Financeiro & Caixa</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono font-bold">
              {formatCurrency(financialMetrics.totalContracted)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("projects")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "projects"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-sky-400" />
            <span>🚀 Projetos & Entregas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono font-bold">
              {financialMetrics.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("proposals")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "proposals"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>📄 Propostas Comerciais</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono font-bold">
              {proposalsMetrics.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("leads")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "leads"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
            }`}
          >
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span>🎯 Leads & Prospecção</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/30 font-mono font-bold">
              {leadsMetrics.totalDeals}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT: 1. OVERVIEW (END-TO-END PIPELINE)                            */}
      {/* ========================================================================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-4 animate-fadeIn">
          {/* End-to-End Visual Journey Funnel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Jornada de Ponta a Ponta: Da Prospecção à Entrega
                </h3>
              </div>
              <span className="text-xs text-neutral-400">Fluxo Integrado em Tempo Real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {/* Step 1: Leads */}
              <div
                onClick={() => setActiveSubTab("leads")}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">1. Prospecção (Leads)</span>
                  <Target className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
                <p className="text-lg sm:text-xl font-black text-white font-mono">
                  {leadsMetrics.totalDeals} <span className="text-xs font-normal text-neutral-400 font-sans">leads</span>
                </p>
                <p className="text-xs text-amber-300 font-bold font-mono mt-1">
                  {formatCurrency(leadsMetrics.totalPipelineValue)} em negociação
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>🔥 {leadsMetrics.hotCount} quentes</span>
                  <span className="text-amber-400 group-hover:underline flex items-center gap-0.5 font-bold">Ver leads →</span>
                </div>
              </div>

              {/* Step 2: Proposals */}
              <div
                onClick={() => setActiveSubTab("proposals")}
                className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">2. Propostas Comerciais</span>
                  <FileText className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                </div>
                <p className="text-lg sm:text-xl font-black text-white font-mono">
                  {proposalsMetrics.totalCount} <span className="text-xs font-normal text-neutral-400 font-sans">enviadas</span>
                </p>
                <p className="text-xs text-indigo-300 font-bold font-mono mt-1">
                  {formatCurrency(proposalsMetrics.totalProposedVal)} cotados
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>🏆 {proposalsMetrics.winRate}% aprovadas</span>
                  <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5 font-bold">Ver propostas →</span>
                </div>
              </div>

              {/* Step 3: Projects */}
              <div
                onClick={() => setActiveSubTab("projects")}
                className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">3. Projetos & Execução</span>
                  <Briefcase className="h-4 w-4 text-sky-400 group-hover:rotate-12 transition-transform" />
                </div>
                <p className="text-lg sm:text-xl font-black text-white font-mono">
                  {financialMetrics.activeCount} <span className="text-xs font-normal text-neutral-400 font-sans">ativos</span>
                </p>
                <p className="text-xs text-sky-300 font-bold font-mono mt-1">
                  {financialMetrics.completedCount} entregas finalizadas
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>⚡ Saúde Operacional 100%</span>
                  <span className="text-sky-400 group-hover:underline flex items-center gap-0.5 font-bold">Ver projetos →</span>
                </div>
              </div>

              {/* Step 4: Finances */}
              <div
                onClick={() => setActiveSubTab("finance")}
                className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">4. Faturamento & Caixa</span>
                  <DollarSign className="h-4 w-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
                <p className="text-lg sm:text-xl font-black text-white font-mono">
                  {formatCurrency(financialMetrics.totalReceived)}
                </p>
                <p className="text-xs text-emerald-300 font-bold font-mono mt-1">
                  {financialMetrics.liquidationRate}% liquidado do total
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>💰 {formatCurrency(financialMetrics.totalPending)} a receber</span>
                  <span className="text-emerald-400 group-hover:underline flex items-center gap-0.5 font-bold">Ver financeiro →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Volume Contratado</span>
                <strong className="text-sm font-bold font-mono text-white">
                  {formatCurrency(financialMetrics.totalContracted)}
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Realizado em Caixa</span>
                <strong className="text-sm font-bold font-mono text-emerald-400">
                  {formatCurrency(financialMetrics.totalReceived)}
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Pipeline Quente</span>
                <strong className="text-sm font-bold text-amber-400">
                  {leadsMetrics.hotCount} oportunidades
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Base de Clientes</span>
                <strong className="text-sm font-bold text-white">
                  {clients.length} cadastrados
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 2. FINANCEIRO & FLUXO DE CAIXA                               */}
      {/* ========================================================================= */}
      {activeSubTab === "finance" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Financial KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Volume Total</span>
              <p className="text-sm sm:text-base font-bold font-mono text-white">
                {formatCurrency(financialMetrics.totalContracted)}
              </p>
              <span className="text-[10px] text-neutral-500 mt-1 block">{financialMetrics.contractedProjectsCount} contratos</span>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Realizado (Caixa)</span>
              <p className="text-sm sm:text-base font-bold font-mono text-emerald-300">
                {formatCurrency(financialMetrics.totalReceived)}
              </p>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">{financialMetrics.liquidationRate}% liquidado</span>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
              <span className="text-[10px] font-bold text-sky-400 uppercase block mb-1">A Receber (Futuro)</span>
              <p className="text-sm sm:text-base font-bold font-mono text-sky-300">
                {formatCurrency(financialMetrics.totalPending)}
              </p>
              <span className="text-[10px] text-sky-400/80 mt-1 block">Em aberto</span>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Inadimplência</span>
              <p className="text-sm sm:text-base font-bold font-mono text-rose-300">
                {formatCurrency(financialMetrics.totalOverdue)}
              </p>
              <span className="text-[10px] text-rose-400/80 mt-1 block">{financialMetrics.overdueInstallmentsCount} pendentes</span>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Ticket Médio</span>
              <p className="text-sm sm:text-base font-bold font-mono text-purple-300">
                {formatCurrency(financialMetrics.avgTicket)}
              </p>
              <span className="text-[10px] text-purple-400/80 mt-1 block">Por projeto</span>
            </div>
          </div>

          {/* Projection Chart Container */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Gráfico de Projeção & Fluxo de Caixa Mensal</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setChartViewMode("chart")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartViewMode === "chart" ? "bg-emerald-500 text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Gráfico
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode("cards")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    chartViewMode === "cards" ? "bg-emerald-500 text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>

            {/* SVG Interactive Line Chart */}
            {chartViewMode === "chart" && lineChartData && (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`} className="w-full h-56 select-none">
                  <defs>
                    <linearGradient id="finGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  {lineChartData.yGridSteps.map((step, idx) => (
                    <g key={idx}>
                      <line x1="80" y1={step.y} x2="950" y2={step.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                      <text x="70" y={step.y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                        R$ {step.val}
                      </text>
                    </g>
                  ))}
                  {/* Area & Line */}
                  <path d={lineChartData.areaPath} fill="url(#finGradient)" />
                  <path d={lineChartData.linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                  {/* Points */}
                  {lineChartData.points.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer group">
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                      <text x={pt.x} y={lineChartData.baselineY + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">
                        {getShortMonthLabel(pt.data.monthKey)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}

            {/* Cards View */}
            {chartViewMode === "cards" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                {monthlyCashflow.map((m) => (
                  <div key={m.monthKey} className="p-2.5 rounded-xl bg-neutral-900 border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 block truncate">{m.label}</span>
                    <p className="text-xs font-bold font-mono text-emerald-400">{formatCurrency(m.total)}</p>
                    <span className="text-[9px] text-neutral-500 block">{m.count} parcela(s)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 3. PROJETOS & ENTREGAS OPERACIONAIS                           */}
      {/* ========================================================================= */}
      {activeSubTab === "projects" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Projects Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <span className="text-[10px] font-bold text-sky-400 uppercase block mb-1">Total de Projetos</span>
              <p className="text-lg font-black text-white font-mono">{projects.length}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <span className="text-[10px] font-bold text-teal-400 uppercase block mb-1">Em Andamento</span>
              <p className="text-lg font-black text-teal-300 font-mono">{financialMetrics.activeCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Concluídos</span>
              <p className="text-lg font-black text-emerald-300 font-mono">{financialMetrics.completedCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Taxa de Sucesso</span>
              <p className="text-lg font-black text-purple-300 font-mono">100%</p>
            </div>
          </div>

          {/* Project Cards List */}
          <div className="space-y-2.5">
            {filteredProjects.map((p) => {
              const client = clients.find((c) => c.id === p.client_id || c.id === p.clientId);
              const pFin = projectFinances[p.id];
              const contractVal = getProjectContractVal(pFin);
              const paidVal = getProjectPaidVal(pFin);
              const overallProg = getOverallProjectProgress(p, milestones);

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-sky-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">{p.title}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-neutral-300">
                        {p.category || "Projeto"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Cliente: <strong className="text-neutral-200">{client?.full_name || "Cliente"}</strong>
                      {p.deadline && ` • Prazo: ${p.deadline}`}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1 max-w-md">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-neutral-400">Progresso de Entrega</span>
                        <strong className="text-sky-400 font-mono">{overallProg.percent}%</strong>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                          style={{ width: `${overallProg.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t md:border-t-0 border-white/5 pt-2 md:pt-0 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">Contrato</span>
                      <strong className="text-xs font-mono font-bold text-white block">{formatCurrency(contractVal)}</strong>
                      <span className="text-[10px] font-mono text-emerald-400">Pago: {formatCurrency(paidVal)}</span>
                    </div>

                    {onOpenDocGenerator && (
                      <button
                        type="button"
                        onClick={() => onOpenDocGenerator(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Gerar Termo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 4. PROPOSTAS COMERCIAIS                                      */}
      {/* ========================================================================= */}
      {activeSubTab === "proposals" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Proposals Metric Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Total Propostas</span>
              <p className="text-lg font-black text-white font-mono">{proposalsMetrics.totalCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Aprovadas / Fechadas</span>
              <p className="text-lg font-black text-emerald-300 font-mono">{proposalsMetrics.approvedCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Taxa de Conversão</span>
              <p className="text-lg font-black text-purple-300 font-mono">{proposalsMetrics.winRate}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Volume Proposto</span>
              <p className="text-lg font-black text-amber-300 font-mono">{formatCurrency(proposalsMetrics.totalProposedVal)}</p>
            </div>
          </div>

          {/* Proposals List Table */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 sm:p-5 backdrop-blur-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Lista de Propostas Registradas</h3>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("proposals")}
                  className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Gerenciar Propostas →
                </button>
              )}
            </div>

            <div className="space-y-2">
              {proposalsMetrics.list.map((prop) => (
                <div
                  key={prop.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-400">[{prop.docNumber || "PROP"}]</span>
                      <h4 className="text-xs font-bold text-white">{prop.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          prop.status === "approved" || prop.status === "aprovada"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : prop.status === "sent" || prop.status === "enviada"
                            ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                            : "bg-white/5 text-neutral-400"
                        }`}
                      >
                        {prop.status === "approved" || prop.status === "aprovada" ? "Aprovada" : prop.status === "sent" || prop.status === "enviada" ? "Enviada" : "Rascunho"}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Cliente: <strong className="text-neutral-300">{prop.clientName || prop.clientCompany || "Cliente"}</strong>
                      {prop.validUntil && ` • Validade: ${prop.validUntil}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <strong className="text-xs sm:text-sm font-mono font-bold text-white">
                      {formatCurrency(Number(prop.totalValue || prop.value) || 0)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: 5. LEADS & PROSPECÇÃO (CRM)                                  */}
      {/* ========================================================================= */}
      {activeSubTab === "leads" && (
        <div className="space-y-4 animate-fadeIn">
          {/* CRM KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Oportunidades Totais</span>
              <p className="text-lg font-black text-white font-mono">{leadsMetrics.totalDeals}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Volume em Pipeline</span>
              <p className="text-lg font-black text-emerald-300 font-mono">{formatCurrency(leadsMetrics.totalPipelineValue)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Oportunidades Quentes</span>
              <p className="text-lg font-black text-rose-300 font-mono">🔥 {leadsMetrics.hotCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Fechados / Ganhos</span>
              <p className="text-lg font-black text-purple-300 font-mono">🎉 {leadsMetrics.wonCount}</p>
            </div>
          </div>

          {/* Kanban Funnel Stages Summary */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 sm:p-5 backdrop-blur-xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Etapas do Pipeline de Prospecção</h3>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("kanban")}
                  className="text-xs text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  Abrir Kanban CRM →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {leadsMetrics.stageBreakdown.map((stage: any) => (
                <div key={stage.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{stage.title}</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{stage.count}</span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-400">{formatCurrency(stage.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leads Details List */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 sm:p-5 backdrop-blur-xl space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5">
              Oportunidades em Acompanhamento Ativo
            </h3>
            <div className="space-y-2">
              {leadsMetrics.cards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">{card.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-neutral-300">
                        {card.columnTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Contato: <strong className="text-neutral-200">{card.contactName || "Decisor"}</strong>
                      {card.companyName && ` (${card.companyName})`}
                      {card.nextAction && (
                        <span className="text-purple-400 block sm:inline sm:ml-2 font-medium">
                          • Próxima ação: {card.nextAction}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <strong className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                      {formatCurrency(Number(card.dealValue) || 0)}
                    </strong>
                    {card.contactPhone && (
                      <button
                        type="button"
                        onClick={() => {
                          const clean = card.contactPhone.replace(/\D/g, "");
                          window.open(`https://wa.me/55${clean.replace(/^55/, "")}`, "_blank");
                        }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsModule;
