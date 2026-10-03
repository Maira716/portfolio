"use client";

import React from "react";
import { X, FileText, Printer, CheckCircle2, Sparkles } from "lucide-react";
import { DocumentType } from "@/lib/documentGenerator";

interface DocGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    type: DocumentType;
    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientCpfCnpj: string;
    projectTitle: string;
    value: string;
    date: string;
    scope: string;
    deliverableNotes: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      type: DocumentType;
      clientName: string;
      clientCompany: string;
      clientEmail: string;
      clientCpfCnpj: string;
      projectTitle: string;
      value: string;
      date: string;
      scope: string;
      deliverableNotes: string;
    }>
  >;
  onGenerate: () => void;
  clients: any[];
  projects: any[];
}

export function DocGeneratorModal({
  isOpen,
  onClose,
  form,
  setForm,
  onGenerate,
  clients,
  projects
}: DocGeneratorModalProps) {
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
    setForm((prev) => ({
      ...prev,
      projectTitle: proj.title,
      clientName: proj.clientName || client?.name || prev.clientName,
      clientCompany: client?.company || prev.clientCompany,
      clientEmail: client?.email || prev.clientEmail,
      value: proj.budget ? `R$ ${proj.budget}` : prev.value,
      scope: proj.description || prev.scope
    }));
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    setForm((prev) => ({
      ...prev,
      clientName: client.name,
      clientCompany: client.company || "",
      clientEmail: client.email || ""
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gerador Executivo de Documentos</h3>
            <p className="text-xs text-neutral-400">Crie termos de aceite, propostas, NDAs e recibos profissionais em PDF</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="mt-6 space-y-5">
          {/* Document Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">Tipo de Documento</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "termo_aceite", label: "Termo de Aceite", desc: "Entrega oficial" },
                { id: "proposta", label: "Proposta Comercial", desc: "Escopo & valores" },
                { id: "briefing", label: "Briefing de Projeto", desc: "Requisitos técnicos" },
                { id: "nda", label: "Acordo de Confidencialidade (NDA)", desc: "Sigilo contratual" },
                { id: "garantia", label: "Certificado de Garantia", desc: "Suporte pós-go-live" },
                { id: "recibo", label: "Recibo de Pagamento", desc: "Comprovante fiscal" }
              ].map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: doc.id as DocumentType }))}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    form.type === doc.id
                      ? "border-indigo-500/60 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50"
                      : "border-white/5 bg-neutral-800/40 text-neutral-400 hover:border-white/10 hover:text-neutral-200"
                  }`}
                >
                  <span className="font-semibold text-xs text-white">{doc.label}</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{doc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick autofill selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Preencher via Projeto Existente</label>
              <select
                onChange={(e) => handleSelectProject(e.target.value)}
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-neutral-800/70 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="" disabled>Selecione um projeto...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.clientName || "Cliente"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Preencher via Cliente Cadastrado</label>
              <select
                onChange={(e) => handleSelectClient(e.target.value)}
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-neutral-800/70 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome do Cliente *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="Ex: Carlos Ferreira"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Empresa / Razão Social</label>
              <input
                type="text"
                value={form.clientCompany}
                onChange={(e) => setForm((prev) => ({ ...prev, clientCompany: e.target.value }))}
                placeholder="Ex: Prime Tech Ltda"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="Ex: contato@cliente.com"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">CPF / CNPJ</label>
              <input
                type="text"
                value={form.clientCpfCnpj}
                onChange={(e) => setForm((prev) => ({ ...prev, clientCpfCnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Título do Projeto *</label>
              <input
                type="text"
                value={form.projectTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, projectTitle: e.target.value }))}
                placeholder="Ex: Plataforma Web & App Mobile"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Investimento / Valor Contratual</label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="Ex: R$ 8.500,00"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Resumo do Escopo / Objetivos</label>
            <textarea
              rows={3}
              value={form.scope}
              onChange={(e) => setForm((prev) => ({ ...prev, scope: e.target.value }))}
              placeholder="Descreva brevemente os módulos, integrações e objetivos contemplados..."
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Entregáveis / Observações Especiais</label>
            <textarea
              rows={2}
              value={form.deliverableNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, deliverableNotes: e.target.value }))}
              placeholder="Ex: Código-fonte em GitHub, acesso às contas de produção, deploy na Vercel e 30 dias de suporte."
              className="w-full rounded-xl border border-white/10 bg-neutral-800/80 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none resize-none"
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
            onClick={onGenerate}
            disabled={!form.clientName || !form.projectTitle}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4 w-4" />
            Gerar & Imprimir PDF Oficial
          </button>
        </div>
      </div>
    </div>
  );
}
