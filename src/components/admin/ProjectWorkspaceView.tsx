"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Clock,
  Eye,
  Edit2,
  Trash2,
  MessageCircle,
  FileText,
  Check,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Rocket,
  CheckSquare,
  Palette,
  Globe,
  FolderGit2,
  Link2,
  Plus,
  TrendingUp,
  ExternalLink,
  Layers,
  ListTodo,
  Zap,
  ShieldCheck,
  DollarSign,
  Send,
  LayoutDashboard,
  ArrowRight,
  Receipt,
  Download,
  FileUp,
} from "lucide-react";
import { Profile } from "@/context/AuthContext";
import {
  Project,
  ProjectStatus,
  Milestone,
  MilestoneStatus,
  UpdateItem,
  ProjectQuickLink,
  ProjectFinancialData,
  ProjectInstallment,
  ProjectDocument,
  ProjectUpdate,
  matchProjectToClient,
  getStatusConfig,
  calculateTimelineProgress,
  calculateSprintProgress,
  parseMilestoneTasks,
  getMilestoneStatus,
  getMilestoneCleanDescription,
  getMilestoneProgress,
  getMilestoneStatusConfig,
  getMilestoneMonthKey,
  formatMonthKeyLabel,
  calculateFinancialSummary,
  generateDefaultProjectFinances,
  generateDefaultProjectQuickLinks,
  generateDefaultProjectDocuments,
  generateDefaultProjectUpdates,
  getUpdateTypeInfo,
  renderRichMarkdown,
  formatBRL,
} from "@/app/admin/page";

type WorkspaceTab = "overview" | "milestones" | "finances" | "documents" | "updates";

interface ProjectWorkspaceViewProps {
  selectedProject: Project;
  clients: Profile[];
  milestones: Milestone[];
  updates: UpdateItem[];
  projectQuickLinks: Record<string, ProjectQuickLink[]>;
  projectFinances: Record<string, ProjectFinancialData>;
  projectDocuments: Record<string, ProjectDocument[]>;
  projectUpdates: Record<string, ProjectUpdate[]>;
  milestoneMonthFilter: string;
  setMilestoneMonthFilter: (val: string) => void;
  onBack: () => void;
  onOpenClientPreview: (proj: Project) => void;
  onOpenProjectModal: (proj: Project) => void;
  onDeleteProject: (projId: string) => void;
  onOpenClientDetails: (client: Profile) => void;
  onQuickUpdateStatus: (projId: string, status: ProjectStatus) => void;
  onQuickUpdateNextUpdateAt: (projId: string, dateStr: string) => void;
  onToggleCountdownReleased: (projId: string, released: boolean) => void;
  onOpenQuickLinkModal: (projId: string) => void;
  onToggleQuickLinkActive: (projId: string, linkId: string) => void;
  onDeleteQuickLink: (projId: string, linkId: string) => void;
  onSaveQuickLinksToStorage: (links: Record<string, ProjectQuickLink[]>) => void;
  onOpenMilestoneModal: (m?: Milestone) => void;
  onQuickUpdateMilestoneStatus: (m: Milestone, status: MilestoneStatus) => void;
  onDeleteMilestone: (id: string) => void;
  onToggleMilestoneTask: (m: Milestone, taskId: string) => void;
  onOpenSplitGenerator: (projId: string) => void;
  onOpenInstallmentModal: (projId: string, inst?: ProjectInstallment) => void;
  onOpenContractValueModal: (projId: string) => void;
  onQuickPayInstallment: (projId: string, instId: string) => void;
  onDeleteInstallment: (projId: string, instId: string) => void;
  onOpenDocGenerator: (projId: string) => void;
  onOpenDocumentModal: (projId: string, doc?: ProjectDocument) => void;
  onOpenPdfViewer: (doc: ProjectDocument) => void;
  onDeleteDocument: (projId: string, docId: string) => void;
  onOpenUpdateModal: (projId: string, update?: ProjectUpdate) => void;
  onDeleteUpdate: (projId: string, updateId: string) => void;
}

export const ProjectWorkspaceView: React.FC<ProjectWorkspaceViewProps> = ({
  selectedProject,
  clients,
  milestones,
  updates,
  projectQuickLinks,
  projectFinances,
  projectDocuments,
  projectUpdates,
  milestoneMonthFilter,
  setMilestoneMonthFilter,
  onBack,
  onOpenClientPreview,
  onOpenProjectModal,
  onDeleteProject,
  onOpenClientDetails,
  onQuickUpdateStatus,
  onQuickUpdateNextUpdateAt,
  onToggleCountdownReleased,
  onOpenQuickLinkModal,
  onToggleQuickLinkActive,
  onDeleteQuickLink,
  onSaveQuickLinksToStorage,
  onOpenMilestoneModal,
  onQuickUpdateMilestoneStatus,
  onDeleteMilestone,
  onToggleMilestoneTask,
  onOpenSplitGenerator,
  onOpenInstallmentModal,
  onOpenContractValueModal,
  onQuickPayInstallment,
  onDeleteInstallment,
  onOpenDocGenerator,
  onOpenDocumentModal,
  onOpenPdfViewer,
  onDeleteDocument,
  onOpenUpdateModal,
  onDeleteUpdate,
}) => {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>("overview");
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  const toggleMilestoneExpanded = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedClient = clients.find((c) => matchProjectToClient(selectedProject, c));
  const statusCfg = getStatusConfig(selectedProject.status);

  // Computations for Tab Badges and Summaries
  const currentFin = projectFinances[selectedProject.id] || generateDefaultProjectFinances(selectedProject);
  const finSummary = calculateFinancialSummary(currentFin);
  const currentDocs = projectDocuments[selectedProject.id] || generateDefaultProjectDocuments(selectedProject);
  const currentProjUpdates = projectUpdates[selectedProject.id] || generateDefaultProjectUpdates(selectedProject);
  const completedMilestonesCount = milestones.filter((m) => getMilestoneStatus(m) === "concluido" || getMilestoneProgress(m) === 100).length;

  const timelineInfo = calculateTimelineProgress(selectedProject.start_date, selectedProject.deadline);
  const sprintInfo = calculateSprintProgress(milestones);

  const tabsConfig: {
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: <LayoutDashboard size={15} />,
      badge: null,
    },
    {
      id: "milestones",
      label: "Etapas & Tarefas",
      icon: <ListTodo size={15} />,
      badge: milestones.length > 0 ? `${completedMilestonesCount}/${milestones.length}` : null,
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "finances",
      label: "Financeiro & Parcelas",
      icon: <DollarSign size={15} />,
      badge: finSummary.installmentsCount > 0 ? `${finSummary.paidCount}/${finSummary.installmentsCount}` : null,
      badgeColor: finSummary.totalOverdue > 0 ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "documents",
      label: "Documentos & Anexos",
      icon: <FileText size={15} />,
      badge: currentDocs.length > 0 ? currentDocs.length : null,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "updates",
      label: "Histórico & Releases",
      icon: <Rocket size={15} />,
      badge: currentProjUpdates.length > 0 ? currentProjUpdates.length : null,
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ================= TOP HEADER BAR ================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4 min-w-0 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shrink-0 border border-white/10 shadow-sm"
            title="Voltar para a lista de projetos"
          >
            <ChevronLeft size={16} />
            <span>Voltar para Lista</span>
          </button>

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <FolderKanban size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Projetos
              </button>
              <span className="text-gray-600">/</span>
              <h3 className="text-base sm:text-xl font-black text-white truncate">
                {selectedProject.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="text-indigo-300 font-medium">{selectedProject.category || "Software"}</span>
              <span>•</span>
              <span>Criado em {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}</span>
              {selectedProject.next_update_at && (
                <>
                  <span>•</span>
                  <span className="text-purple-300 font-mono flex items-center gap-1">
                    <Clock size={11} className="text-purple-400" />
                    Release: {new Date(selectedProject.next_update_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenClientPreview(selectedProject)}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-900/20 flex"
            title="Simular visualização do cliente no Portal"
          >
            <Eye size={14} />
            <span>Ver como Cliente</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenProjectModal(selectedProject)}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 size={14} />
            <span>Editar Escopo</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteProject(selectedProject.id)}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
            title="Excluir projeto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ================= WORKSPACE SUB-TABS NAVIGATION ================= */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto no-scrollbar shadow-lg backdrop-blur-xl">
        {tabsConfig.map((tab) => {
          const isActive = activeWorkspaceTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveWorkspaceTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className={isActive ? "text-white" : "text-gray-400"}>
                {tab.icon}
              </div>
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                    isActive ? "bg-white/20 text-white border-white/20" : tab.badgeColor || "bg-white/10 text-gray-300 border-white/10"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENT 1: VISÃO GERAL (OVERVIEW) ================= */}
      {activeWorkspaceTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                  type="button"
                  onClick={() => onOpenClientDetails(selectedClient)}
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
                Descrição &amp; Escopo do Projeto
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              {selectedProject.description ? (
                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2">
                  {renderRichMarkdown(selectedProject.description)}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Nenhum escopo detalhado foi inserido. Clique em &quot;Editar Escopo&quot; para cadastrar os requisitos e entregáveis.
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
                    type="button"
                    key={st.key}
                    onClick={() => onQuickUpdateStatus(selectedProject.id, st.key as ProjectStatus)}
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

          {/* Dates and Countdown Timer */}
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

            {/* Next Publication / Release Countdown Timer Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-indigo-950/20 to-transparent border border-purple-500/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock size={14} className="text-purple-400" />
                  Data &amp; Hora da Próxima Publicação (Timer no Portal)
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 w-fit ${
                    selectedProject.countdown_released !== false
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedProject.countdown_released !== false
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  {selectedProject.countdown_released !== false ? "Liberada no Portal" : "Pausada/Oculta"}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Defina o dia e horário previstos para a próxima entrega/release e clique em{" "}
                <strong className="text-white font-semibold">Liberar Contagem</strong> para sincronizar instantaneamente com a tela do cliente.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="datetime-local"
                  defaultValue={
                    selectedProject.next_update_at
                      ? new Date(new Date(selectedProject.next_update_at).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      onQuickUpdateNextUpdateAt(selectedProject.id, "");
                    } else {
                      const iso = new Date(val).toISOString();
                      onQuickUpdateNextUpdateAt(selectedProject.id, iso);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white outline-none focus:border-purple-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const isReleased = selectedProject.countdown_released !== false;
                      onToggleCountdownReleased(selectedProject.id, !isReleased);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedProject.countdown_released !== false
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40"
                        : "bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-900/30"
                    }`}
                    title={
                      selectedProject.countdown_released !== false
                        ? "Clique para ocultar o timer do portal do cliente"
                        : "Clique para exibir e ativar a contagem regressiva no portal"
                    }
                  >
                    <CheckCircle2 size={13} />
                    <span>
                      {selectedProject.countdown_released !== false ? "Liberada (Pausar)" : "Liberar Contagem"}
                    </span>
                  </button>

                  {selectedProject.next_update_at && (
                    <button
                      type="button"
                      onClick={() => onQuickUpdateNextUpdateAt(selectedProject.id, "")}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/5"
                      title="Remover data de publicação"
                    >
                      Limpar Data
                    </button>
                  )}
                </div>
              </div>

              {selectedProject.next_update_at && (
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300 font-mono">
                    <Sparkles size={13} className="text-purple-400" />
                    <span>
                      {(() => {
                        const target = new Date(selectedProject.next_update_at).getTime();
                        const diff = target - Date.now();
                        if (diff <= 0) return "⚠️ Horário de entrega atingido ou em fase de deploy!";
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const mins = Math.floor((diff / (1000 * 60)) % 60);
                        return `Faltam: ${days}d ${hours}h ${mins}m para a publicação.`;
                      })()}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Visível para o cliente no Portal
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Progress Bars */}
          <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-400" />
                Indicadores de Progresso
              </span>
            </div>

            <div className="space-y-4">
              {/* 1. Timeline progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">1. Cronograma Geral (Estimativa Temporal)</span>
                  <span className="font-bold text-indigo-300">
                    {timelineInfo.percent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${timelineInfo.percent}%`,
                    }}
                  />
                </div>
              </div>

              {/* 2. Tasks Sprint progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">2. Entregas &amp; Tarefas Concluídas</span>
                  <span className="font-bold text-emerald-300">
                    {sprintInfo.percent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${sprintInfo.percent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Environments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 size={13} className="text-indigo-400" />
                Links Rápidos &amp; Ambientes
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickLinkModal(selectedProject.id)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Adicionar Link</span>
              </button>
            </div>

            {(() => {
              const links = projectQuickLinks[selectedProject.id] || generateDefaultProjectQuickLinks(selectedProject);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe size={14} className="text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white truncate">{link.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {link.url && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white transition-colors"
                            title="Abrir link externo"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteQuickLink(selectedProject.id, link.id)}
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Excluir link"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Quick Jump Summary Cards to Other Tabs */}
          <div className="pt-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
              Navegação Rápida nos Módulos do Projeto:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Milestones */}
              <div
                onClick={() => setActiveWorkspaceTab("milestones")}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-slate-900/50 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group space-y-2 shadow-lg shadow-indigo-950/20"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center">
                    <ListTodo size={16} />
                  </div>
                  <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Ver Etapas <ArrowRight size={13} />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Entregas &amp; Tarefas</h4>
                <p className="text-xs text-gray-400">
                  {milestones.length} marcos cadastrados • {completedMilestonesCount} concluídos
                </p>
              </div>

              {/* Card 2: Finances */}
              <div
                onClick={() => setActiveWorkspaceTab("finances")}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-slate-900/50 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-2 shadow-lg shadow-emerald-950/20"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Financeiro <ArrowRight size={13} />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Financeiro &amp; Parcelas</h4>
                <p className="text-xs text-gray-400">
                  {formatBRL(finSummary.totalPaid)} pagos de {formatBRL(finSummary.contractValue)}
                </p>
              </div>

              {/* Card 3: Documents */}
              <div
                onClick={() => setActiveWorkspaceTab("documents")}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 to-slate-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group space-y-2 shadow-lg shadow-purple-950/20"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <span className="text-xs font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Documentos <ArrowRight size={13} />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">Contratos &amp; Anexos</h4>
                <p className="text-xs text-gray-400">
                  {currentDocs.length} documentos salvos na nuvem
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB CONTENT 2: ENTREGAS & TAREFAS (MILESTONES) ================= */}
      {activeWorkspaceTab === "milestones" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ListTodo size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Etapas, Milestones &amp; Checklist</h4>
                <p className="text-xs text-gray-400">Gerencie entregas, tarefas e percentual de progresso</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Month filter select */}
              {(() => {
                const uniqueMonthKeys = Array.from(
                  new Set(milestones.map((m) => getMilestoneMonthKey(m.due_date)).filter(Boolean))
                ).sort();

                return (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 hidden sm:inline">Mês:</span>
                    <select
                      value={milestoneMonthFilter}
                      onChange={(e) => setMilestoneMonthFilter(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all">Todos os Meses ({milestones.length})</option>
                      {uniqueMonthKeys.map((key) => {
                        const count = milestones.filter((m) => getMilestoneMonthKey(m.due_date) === key).length;
                        return (
                          <option key={key} value={key}>
                            {formatMonthKeyLabel(key)} ({count})
                          </option>
                        );
                      })}
                      {milestones.some((m) => !m.due_date) && (
                        <option value="sem_data">
                          Sem prazo ({milestones.filter((m) => !m.due_date).length})
                        </option>
                      )}
                    </select>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => onOpenMilestoneModal()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 border border-indigo-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus size={14} />
                <span>+ Adicionar Etapa</span>
              </button>
            </div>
          </div>

          {/* Checklist Items List */}
          {milestones.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
              <ListTodo size={28} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400">
                Nenhuma etapa cadastrada para este projeto.
              </p>
              <button
                onClick={() => onOpenMilestoneModal()}
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
                  const statusConfig = getMilestoneStatusConfig(status);
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
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="pt-0.5">
                            {isDone ? (
                              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            ) : isActive ? (
                              <Clock size={18} className="text-blue-400 shrink-0 animate-pulse" />
                            ) : (
                              <AlertCircle size={18} className="text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-white">{m.title}</h5>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  statusConfig.color === "emerald"
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : statusConfig.color === "blue"
                                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>

                            {m.due_date && (
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar size={11} className="text-indigo-400" />
                                <span>Prazo: {new Date(m.due_date).toLocaleDateString("pt-BR")}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Status Select + Edit / Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <select
                            value={status}
                            onChange={(e) => onQuickUpdateMilestoneStatus(m, e.target.value as MilestoneStatus)}
                            className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-semibold text-white outline-none cursor-pointer"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="concluido">Concluído</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => onOpenMilestoneModal(m)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar Etapa"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMilestone(m.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Excluir Etapa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {cleanDesc && (
                        <p className="text-xs text-gray-400 pl-7 leading-relaxed">{cleanDesc}</p>
                      )}

                      {/* Progress Bar for Milestone */}
                      <div className="pl-7 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Progresso desta Etapa:</span>
                          <span className="font-mono font-bold text-indigo-300">
                            {tasks.length > 0 ? `${completedTasksCount}/${tasks.length} tarefas (${milestoneProg}%)` : `${milestoneProg}%`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                            }`}
                            style={{ width: `${milestoneProg}%` }}
                          />
                        </div>
                      </div>

                      {/* Accordion Toggle Trigger for Tasks */}
                      {tasks.length > 0 && (
                        <div className="pl-7 pt-1">
                          <button
                            type="button"
                            onClick={() => toggleMilestoneExpanded(m.id)}
                            className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-between transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <CheckSquare size={13} className="text-indigo-400" />
                              <span>
                                {expandedMilestones[m.id]
                                  ? `Ocultar checklist (${completedTasksCount}/${tasks.length} tarefas)`
                                  : `Ver checklist de tarefas (${completedTasksCount}/${tasks.length} concluídas)`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                              <span>{expandedMilestones[m.id] ? "Fechar" : "Abrir"}</span>
                              {expandedMilestones[m.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Interactive Checklist Tasks (rendered only when expanded) */}
                      {expandedMilestones[m.id] && tasks.length > 0 && (
                        <div className="pl-7 pt-1 space-y-1.5 animate-in fade-in duration-200">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                            Tarefas &amp; Requisitos ({completedTasksCount}/${tasks.length}):
                          </span>
                          <div className="space-y-1">
                            {tasks.map((t) => (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => onToggleMilestoneTask(m, t.id)}
                                className={`w-full p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                                  t.completed
                                    ? "bg-emerald-950/25 text-emerald-300 line-through opacity-85 border border-emerald-500/20"
                                    : "bg-black/40 hover:bg-black/60 text-gray-200 border border-white/5"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                                    t.completed
                                      ? "bg-emerald-500 border-emerald-400 text-white"
                                      : "border-white/20 bg-white/5"
                                  }`}
                                >
                                  {t.completed && <Check size={11} />}
                                </div>
                                <span className="flex-1 leading-snug">{t.text}</span>
                              </button>
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
      )}

      {/* ================= TAB CONTENT 3: FINANCEIRO & PARCELAS ================= */}
      {activeWorkspaceTab === "finances" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Indicators Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                Valor Total do Contrato
              </span>
              <p className="text-lg font-black text-white font-mono">
                {formatBRL(finSummary.contractValue)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                Total Recebido / Pago
              </span>
              <p className="text-lg font-black text-emerald-300 font-mono">
                {formatBRL(finSummary.totalPaid)}
              </p>
              <span className="text-[10px] text-emerald-400/80 font-bold">
                {finSummary.percentPaid}% quitado
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
              <span className="text-[10px] text-blue-400 uppercase font-bold block mb-1">
                Saldo Restante a Receber
              </span>
              <p className="text-lg font-black text-blue-300 font-mono">
                {formatBRL(finSummary.remainingBalance)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
              <span className="text-[10px] text-purple-400 uppercase font-bold block mb-1">
                Status das Parcelas
              </span>
              <p className="text-lg font-black text-purple-300 font-mono">
                {finSummary.paidCount} de {finSummary.installmentsCount}
              </p>
              {finSummary.totalOverdue > 0 ? (
                <span className="text-[10px] text-rose-400 font-bold">
                  {formatBRL(finSummary.totalOverdue)} vencidos
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold">
                  Nenhuma em atraso
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              Gestão de Parcelas &amp; Pagamentos
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenSplitGenerator(selectedProject.id)}
                className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Dividir valor do contrato em até 12 parcelas mensais automaticamente"
              >
                <Zap size={13} />
                <span>⚡ Divisão Rápida (Split)</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenContractValueModal(selectedProject.id)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                ✏️ Ajustar Valor Contrato
              </button>

              <button
                type="button"
                onClick={() => onOpenInstallmentModal(selectedProject.id)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>+ Nova Parcela</span>
              </button>
            </div>
          </div>

          {/* Installments Table / List */}
          {currentFin.installments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
              <DollarSign size={28} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400">
                Nenhuma parcela cadastrada para este projeto.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenSplitGenerator(selectedProject.id)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  ⚡ Gerar divisão em parcelas
                </button>
                <span className="text-gray-600">•</span>
                <button
                  type="button"
                  onClick={() => onOpenInstallmentModal(selectedProject.id)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  + Adicionar parcela avulsa
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentFin.installments.map((inst) => {
                const isPaid = Boolean(inst.paid_at);
                const isOverdue = !isPaid && inst.due_date && new Date(inst.due_date) < new Date();

                return (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isPaid
                        ? "bg-emerald-950/15 border-emerald-500/25"
                        : isOverdue
                        ? "bg-rose-950/15 border-rose-500/25"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPaid
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isOverdue
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-white/5 text-gray-300 border border-white/10"
                        }`}
                      >
                        #{inst.installment_number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{inst.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              isPaid
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : isOverdue
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {isPaid ? "Pago" : isOverdue ? "Vencido" : "Pendente"}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>Vencimento: {inst.due_date ? new Date(inst.due_date).toLocaleDateString("pt-BR") : "Não definido"}</span>
                          {isPaid && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">Pago em: {new Date(inst.paid_at!).toLocaleDateString("pt-BR")}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-base font-black text-white font-mono">
                        {formatBRL(inst.amount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => onQuickPayInstallment(selectedProject.id, inst.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isPaid
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40"
                        }`}
                      >
                        <Check size={12} />
                        <span>{isPaid ? "Quitação Confirmada" : "Confirmar Pagamento"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenInstallmentModal(selectedProject.id, inst)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar Parcela"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteInstallment(selectedProject.id, inst.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Excluir Parcela"
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
      )}

      {/* ================= TAB CONTENT 4: DOCUMENTOS & ANEXOS ================= */}
      {activeWorkspaceTab === "documents" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Central de Documentos &amp; Contratos</h4>
                <p className="text-xs text-gray-400">Contratos, propostas comerciais, briefings e especificações técnicas</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenDocGenerator(selectedProject.id)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 border border-purple-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Zap size={14} />
                <span>⚡ Gerar Documento IA / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDocumentModal(selectedProject.id)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus size={14} />
                <span>+ Novo Arquivo</span>
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          {currentDocs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
              <FileText size={28} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400">
                Nenhum documento anexado ou gerado para este projeto.
              </p>
              <button
                type="button"
                onClick={() => onOpenDocGenerator(selectedProject.id)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
              >
                <Zap size={13} />
                <span>Gerar proposta ou contrato automático</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(doc.uploaded_at || Date.now()).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h5>

                    {doc.notes && (
                      <p className="text-xs text-gray-400 line-clamp-2">{doc.notes}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPdfViewer(doc)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye size={12} />
                      <span>Visualizar PDF</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDocumentModal(selectedProject.id, doc)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDocument(selectedProject.id, doc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB CONTENT 5: HISTÓRICO & RELEASES ================= */}
      {activeWorkspaceTab === "updates" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Rocket size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Histórico de Entregas &amp; Timeline de Releases</h4>
                <p className="text-xs text-gray-400">Publicações, novas funcionalidades, correções e notas de reunião</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenUpdateModal(selectedProject.id)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 border border-blue-400/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <Plus size={14} />
              <span>+ Nova Atualização / Release</span>
            </button>
          </div>

          {/* Timeline List */}
          {currentProjUpdates.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-2">
              <Rocket size={28} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400">
                Nenhuma atualização ou release registrada para este projeto.
              </p>
              <button
                type="button"
                onClick={() => onOpenUpdateModal(selectedProject.id)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer inline-flex items-center gap-1 pt-1"
              >
                <Plus size={13} />
                <span>Publicar primeira entrega</span>
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 via-indigo-500 to-blue-500">
              {currentProjUpdates.map((u) => {
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
                            onClick={() => onOpenUpdateModal(selectedProject.id, u)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            title="Editar Update"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUpdate(selectedProject.id, u.id)}
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
      )}
    </div>
  );
};
