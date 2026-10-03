"use client";

import React from "react";
import { X, Headphones, Save, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export interface TicketFormData {
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectTitle: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminNotes: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any | null;
  form: TicketFormData;
  setForm: React.Dispatch<React.SetStateAction<TicketFormData>>;
  onSave: () => void;
  clients: any[];
  projects: any[];
}

export function TicketModal({
  isOpen,
  onClose,
  ticket,
  form,
  setForm,
  onSave,
  clients,
  projects
}: TicketModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const client = clients.find((c) => c.id === proj.clientId);
    setForm((prev: any) => ({
      ...prev,
      projectTitle: proj.title,
      clientName: proj.clientName || client?.name || prev.clientName,
      clientEmail: client?.email || prev.clientEmail,
      clientPhone: client?.phone || prev.clientPhone
    }));
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    setForm((prev: any) => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email || prev.clientEmail,
      clientPhone: client.phone || prev.clientPhone
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-rose-400">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {ticket ? "Gerenciar Chamado de Suporte" : "Abrir Novo Chamado"}
            </h3>
            <p className="text-xs text-neutral-400">
              {ticket ? `Atualize o status, anote a resolução e responda o cliente` : `Registre uma solicitação, bug ou ajuste solicitado`}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Título do Chamado *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Ajuste no layout mobile da página de checkout"
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Vincular a Projeto</label>
              <select
                onChange={(e) => handleSelectProject(e.target.value)}
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-neutral-800/70 px-3 py-2 text-xs text-neutral-200 focus:border-rose-500 focus:outline-none"
              >
                <option value="" disabled>Selecione um projeto...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Vincular a Cliente</label>
              <select
                onChange={(e) => handleSelectClient(e.target.value)}
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-neutral-800/70 px-3 py-2 text-xs text-neutral-200 focus:border-rose-500 focus:outline-none"
              >
                <option value="" disabled>Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Solicitante</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="Nome do cliente"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail</label>
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="cliente@email.com"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">WhatsApp</label>
              <input
                type="text"
                value={form.clientPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="Dúvida">Dúvida Técnica</option>
                <option value="Bug / Correção">Bug / Correção</option>
                <option value="Melhoria / Ajuste">Melhoria / Ajuste</option>
                <option value="Acesso / Configuração">Acesso / Configuração</option>
                <option value="Solicitação de Escopo">Solicitação de Escopo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as any }))}
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="open">Aberto (Novo)</option>
                <option value="in_progress">Em Análise / Atendimento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Descrição Detalhada do Problema / Solicitação</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhadamente o ocorrido ou passos para reproduzir..."
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Notas Internas & Solução Aplicada</label>
            <textarea
              rows={2}
              value={form.adminNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="Anote o que foi corrigido, commits ou detalhes para feedback ao cliente..."
              className="w-full rounded-xl border border-emerald-500/30 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!form.title}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Salvar Chamado
          </button>
        </div>
      </div>
    </div>
  );
}
