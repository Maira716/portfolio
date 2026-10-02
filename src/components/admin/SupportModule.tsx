"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  User,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Send,
  HelpCircle,
  Zap,
} from "lucide-react";
import { SupportTicket, Project } from "@/app/admin/page";
import { Profile } from "@/context/AuthContext";

interface SupportModuleProps {
  tickets: SupportTicket[];
  projects: Project[];
  clients: Profile[];
  onOpenTicketModal: (ticket?: SupportTicket) => void;
  onToggleStatus: (ticketId: string, status: "aberto" | "em_atendimento" | "resolvido") => void;
  onDeleteTicket: (ticketId: string) => void;
  onReplyWhatsApp: (ticket: SupportTicket) => void;
}

export function SupportModule({
  tickets,
  projects,
  clients,
  onOpenTicketModal,
  onToggleStatus,
  onDeleteTicket,
  onReplyWhatsApp,
}: SupportModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // KPIs
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "aberto").length;
  const inProgressCount = tickets.filter((t) => t.status === "em_atendimento").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolvido").length;

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchProject = projectFilter === "all" || ticket.project_id === projectFilter;

    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgente":
        return { label: "Urgente", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
      case "alta":
        return { label: "Alta", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "media":
        return { label: "Média", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      default:
        return { label: "Baixa", badge: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "aberto":
        return { label: "Aberto", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30", dot: "bg-rose-400" };
      case "em_atendimento":
        return { label: "Em Atendimento", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "bg-amber-400" };
      case "resolvido":
        return { label: "Resolvido", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" };
      default:
        return { label: s, badge: "bg-gray-500/15 text-gray-300 border-gray-500/30", dot: "bg-gray-400" };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900/80 border border-pink-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-3">
            <MessageSquare size={14} className="text-pink-400" />
            <span>Central de Helpdesk & Atendimento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Chamados & Suporte dos Clientes 💬
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
            Centralize as dúvidas, solicitações técnicas e feedbacks enviados pelos clientes pelo botão flutuante de suporte do Portal.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenTicketModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-pink-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Chamado Manual</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Total de Chamados</span>
            <HelpCircle size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Histórico geral acumulado</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase">Abertos / Pendentes</span>
            <AlertCircle size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-300 mt-2">{openCount}</p>
          <p className="text-[11px] text-rose-400/70 mt-0.5">Aguardando seu primeiro retorno</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">Em Atendimento</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300 mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-amber-400/70 mt-0.5">Em análise ou resolução</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Resolvidos</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300 mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-400/70 mt-0.5">Soluções finalizadas com sucesso</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, projeto, assunto ou mensagem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Todos" },
            { id: "aberto", label: "Abertos 🔴" },
            { id: "em_atendimento", label: "Em Atendimento 🟡" },
            { id: "resolvido", label: "Resolvidos 🟢" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === pill.id
                  ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/20"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Todas as Prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
          <CheckCircle2 size={40} className="text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Nenhum chamado de suporte aberto.</p>
          <p className="text-xs text-gray-500">
            Quando os clientes enviarem dúvidas ou feedbacks pelo botão de suporte do Portal, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const priorityBadge = getPriorityBadge(ticket.priority);
            const statusBadge = getStatusBadge(ticket.status);
            const isResolved = ticket.status === "resolvido";

            return (
              <div
                key={ticket.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg ${
                  isResolved
                    ? "bg-slate-900/40 border-white/10 opacity-80 hover:opacity-100"
                    : "bg-slate-900/90 border-white/10 hover:border-pink-500/40 shadow-pink-950/10"
                }`}
              >
                <div className="space-y-2 flex-1">
                  {/* Tags Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} ${!isResolved ? "animate-pulse" : ""}`} />
                      {statusBadge.label}
                    </span>

                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${priorityBadge.badge}`}>
                      {priorityBadge.label}
                    </span>

                    <span className="text-xs text-indigo-400 font-semibold">
                      📁 {ticket.project_title || "Projeto Geral"}
                    </span>

                    <span className="text-[11px] text-gray-500 ml-auto">
                      {new Date(ticket.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Subject & Author */}
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">{ticket.subject}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <User size={12} className="text-gray-500" />
                      <span className="text-gray-300 font-medium">{ticket.client_name}</span>
                      <span>•</span>
                      <span>{ticket.client_email}</span>
                    </p>
                  </div>

                  {/* Message Body */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 leading-relaxed font-mono">
                    {ticket.message}
                  </div>

                  {/* Response Notes if any */}
                  {ticket.response_notes && (
                    <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-0.5">Sua Resposta / Solução:</span>
                      {ticket.response_notes}
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 md:w-48">
                  <button
                    type="button"
                    onClick={() => onReplyWhatsApp(ticket)}
                    className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle size={14} className="text-emerald-400" />
                    <span>Responder WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenTicketModal(ticket)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={13} className="text-purple-400" />
                    <span>Solução / Editar</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {ticket.status !== "resolvido" ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(ticket.id, "resolvido")}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-xs font-medium border border-emerald-500/25 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={12} />
                        <span>Resolver</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(ticket.id, "aberto")}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={12} />
                        <span>Reabrir</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteTicket(ticket.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Excluir Chamado"
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
