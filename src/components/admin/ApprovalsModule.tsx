"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  RotateCcw,
  Trash2,
  MessageCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
  ThumbsUp,
  Inbox,
} from "lucide-react";
import { DeliveryFeedbackItem, Project } from "@/app/admin/page";
import { Profile } from "@/context/AuthContext";

interface ApprovalsModuleProps {
  feedbacks: Record<string, DeliveryFeedbackItem[]>;
  projects: Project[];
  clients: Profile[];
  onToggleStatus: (projectId: string, feedbackId: string) => void;
  onDeleteFeedback: (projectId: string, feedbackId: string) => void;
  onAcknowledgeWhatsApp: (item: DeliveryFeedbackItem) => void;
  onOpenProjectDetails: (project: Project) => void;
}

export function ApprovalsModule({
  feedbacks,
  projects,
  clients,
  onToggleStatus,
  onDeleteFeedback,
  onAcknowledgeWhatsApp,
  onOpenProjectDetails,
}: ApprovalsModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const allItems: (DeliveryFeedbackItem & { project?: Project })[] = Object.entries(feedbacks).flatMap(
    ([projId, list]) => {
      const proj = projects.find((p) => p.id === projId);
      return list.map((item) => ({ ...item, project: proj }));
    }
  );

  // KPIs
  const totalCount = allItems.length;
  const approvalsCount = allItems.filter((i) => i.type === "approval").length;
  const changeRequestsCount = allItems.filter((i) => i.type === "change_request").length;
  const pendingCount = allItems.filter((i) => i.status === "pending_review").length;
  const resolvedCount = allItems.filter((i) => i.status === "resolved").length;
  const approvalRate = totalCount > 0 ? Math.round((approvalsCount / totalCount) * 100) : 100;

  const filteredItems = allItems.filter((item) => {
    const proj = item.project;
    const matchSearch =
      !searchQuery ||
      item.milestone_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && item.status === "pending_review") ||
      (statusFilter === "resolved" && item.status === "resolved") ||
      (statusFilter === "approval" && item.type === "approval") ||
      (statusFilter === "change_request" && item.type === "change_request");

    const matchProject = projectFilter === "all" || item.project_id === projectFilter;

    return matchSearch && matchStatus && matchProject;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/80 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <CheckCircle2 size={14} className="text-amber-400" />
            <span>Central de Validações & Entregas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Aprovações & Feedbacks dos Clientes 📋
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
            Acompanhe em tempo real todas as validações formais, aceites de etapas e solicitações de ajuste feitas pelos clientes no Portal.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase block">Taxa de Aceite</span>
            <span className="text-2xl font-black text-emerald-400">{approvalRate}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Registrado</span>
            <Inbox size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Validações submetidas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">Pendentes de Triagem</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-amber-400/70 mt-0.5">Aguardando seu checklist</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Aprovações Formais</span>
            <ThumbsUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300 mt-2">{approvalsCount}</p>
          <p className="text-[11px] text-emerald-400/70 mt-0.5">Etapas aceitas sem ressalvas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase">Solicitações de Ajuste</span>
            <AlertCircle size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-300 mt-2">{changeRequestsCount}</p>
          <p className="text-[11px] text-rose-400/70 mt-0.5">{resolvedCount} já resolvidas</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, projeto, etapa ou notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendentes" },
            { id: "approval", label: "Aprovados ✅" },
            { id: "change_request", label: "Ajustes ⚠️" },
            { id: "resolved", label: "Resolvidos 🎉" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === pill.id
                  ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Project Filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Todos os Projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Feedbacks Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
          <CheckCircle2 size={40} className="text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Nenhum registro de feedback encontrado.</p>
          <p className="text-xs text-gray-500">
            Quando seus clientes validarem entregas no portal, as notificações aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const isApproval = item.type === "approval";
            const isResolved = item.status === "resolved";
            const proj = item.project;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                  isResolved
                    ? "bg-slate-900/50 border-white/10 opacity-75 hover:opacity-100"
                    : isApproval
                    ? "bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                    : "bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-rose-950/20 border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-950/20"
                }`}
              >
                <div>
                  {/* Top Bar: Badges & Date */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          isApproval
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {isApproval ? "✅ Entrega Aprovada" : "⚠️ Solicitação de Ajuste"}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isResolved
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isResolved ? "Resolvido / Concluído" : "Pendente de Análise"}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(item.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Project & Milestone */}
                  <div className="mb-3">
                    <span className="text-xs text-indigo-400 font-bold block">{proj?.title || "Projeto"}</span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">{item.milestone_title}</h4>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 pb-2 border-b border-white/5">
                    <User size={13} className="text-gray-500" />
                    <span className="text-gray-300 font-medium">{item.author_name}</span>
                    <span>•</span>
                    <span className="truncate">{item.author_email}</span>
                  </div>

                  {/* Client Notes Quote */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 leading-relaxed font-mono">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
                      Considerações do Cliente:
                    </span>
                    {item.notes || "(O cliente não adicionou observações textuais adicionais)"}
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.project_id, item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isResolved
                        ? "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                        : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <RotateCcw size={12} />
                        <span>Reabrir</span>
                      </>
                    ) : (
                      <>
                        <Check size={12} />
                        <span>Marcar como Resolvido</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAcknowledgeWhatsApp(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Responder cliente no WhatsApp"
                    >
                      <MessageCircle size={13} className="text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

                    {proj && (
                      <button
                        type="button"
                        onClick={() => onOpenProjectDetails(proj)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                        title="Ver Projeto"
                      >
                        <ExternalLink size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteFeedback(item.project_id, item.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Excluir Registro"
                    >
                      <Trash2 size={13} />
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
}
