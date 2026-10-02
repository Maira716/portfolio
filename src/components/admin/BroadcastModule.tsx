"use client";

import React, { useMemo } from "react";
import {
  Megaphone,
  Send,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  Rocket,
  CheckCircle2,
  DollarSign,
  KeyRound,
  BarChart3,
  Mail,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { Project } from "@/app/admin/page";
import { Profile } from "@/context/AuthContext";

interface BroadcastModuleProps {
  projects: Project[];
  clients: Profile[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  customText: string;
  onChangeCustomText: (text: string) => void;
  onSendWhatsApp: () => void;
  onSendEmail: () => void;
  onCopy: () => void;
  copied: boolean;
  toastMessage?: string | null;
  getMessagePreview: (templateId: string, client?: Profile, project?: Project) => string;
}

export function BroadcastModule({
  projects,
  clients,
  selectedTemplateId,
  onSelectTemplate,
  selectedClientId,
  onSelectClient,
  selectedProjectId,
  onSelectProject,
  customText,
  onChangeCustomText,
  onSendWhatsApp,
  onSendEmail,
  onCopy,
  copied,
  toastMessage,
  getMessagePreview,
}: BroadcastModuleProps) {
  // Target client: Only find if a client is explicitly selected
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // Filter projects exclusively belonging to the selected client
  const clientProjects = useMemo(() => {
    if (!selectedClient) return [];
    return projects.filter((p) => {
      if (p.client_id && p.client_id === selectedClient.id) return true;
      if (p.client_email && selectedClient.email && p.client_email.toLowerCase() === selectedClient.email.toLowerCase()) return true;
      if (p.client_name && selectedClient.full_name && p.client_name.toLowerCase() === selectedClient.full_name.toLowerCase()) return true;
      return false;
    });
  }, [projects, selectedClient]);

  // Target project: only valid if it exists within the selected client's projects
  const selectedProject = clientProjects.find((p) => p.id === selectedProjectId) || (clientProjects.length === 1 ? clientProjects[0] : null);

  const templates = [
    {
      id: "staging",
      title: "Deploy em Homologação",
      desc: "Avisa que uma nova versão está pronta em Staging para testes do cliente.",
      icon: <Rocket size={18} className="text-cyan-400" />,
      tag: "Homologação",
      colorClass: "border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/10",
    },
    {
      id: "validation",
      title: "Solicitação de Aceite",
      desc: "Solicita ao cliente aprovação formal de marco concluído no Portal.",
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      tag: "Entregas",
      colorClass: "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/10",
    },
    {
      id: "payment",
      title: "Lembrete de Pagamento / Pix",
      desc: "Envia lembrete amigável com valor, vencimento da parcela e chave Pix.",
      icon: <DollarSign size={18} className="text-amber-400" />,
      tag: "Financeiro",
      colorClass: "border-amber-500/30 hover:border-amber-500/60 bg-amber-950/10",
    },
    {
      id: "credentials",
      title: "Credenciais do Portal",
      desc: "Envia link, e-mail e senha inicial para primeiro acesso do cliente.",
      icon: <KeyRound size={18} className="text-purple-400" />,
      tag: "Boas-vindas",
      colorClass: "border-purple-500/30 hover:border-purple-500/60 bg-purple-950/10",
    },
    {
      id: "weekly_status",
      title: "Resumo Semanal de Sprint",
      desc: "Status geral do andamento do desenvolvimento e próximos passos.",
      icon: <BarChart3 size={18} className="text-blue-400" />,
      tag: "Acompanhamento",
      colorClass: "border-blue-500/30 hover:border-blue-500/60 bg-blue-950/10",
    },
  ];

  const activeMessage = customText || getMessagePreview(selectedTemplateId, selectedClient || undefined, selectedProject || undefined);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert if present */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/80 border border-indigo-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Megaphone size={14} className="text-indigo-400" />
            <span>Central de Comunicação & Disparos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Disparos & Templates Rápidos 🚀
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
            Economize tempo no dia a dia enviando avisos de homologação, solicitações de aceite, lembretes de Pix e credenciais no WhatsApp e E-mail com variáveis automáticas.
          </p>
        </div>
      </div>

      {/* Target Selectors */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Cliente */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
            1. Selecione o Cliente de Destino
          </label>
          <select
            value={selectedClientId || ""}
            onChange={(e) => {
              const newClientId = e.target.value;
              onSelectClient(newClientId);
              const targetClient = clients.find((c) => c.id === newClientId);
              if (targetClient) {
                const projs = projects.filter((p) => {
                  if (p.client_id && p.client_id === targetClient.id) return true;
                  if (p.client_email && targetClient.email && p.client_email.toLowerCase() === targetClient.email.toLowerCase()) return true;
                  if (p.client_name && targetClient.full_name && p.client_name.toLowerCase() === targetClient.full_name.toLowerCase()) return true;
                  return false;
                });
                if (projs.length === 1) {
                  onSelectProject(projs[0].id);
                } else {
                  onSelectProject("");
                }
              } else {
                onSelectProject("");
              }
              onChangeCustomText("");
            }}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-semibold outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-gray-400">
              -- Selecione um Cliente --
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.full_name || "Sem Nome"} ({c.email}) {c.company ? `• ${c.company}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Projeto */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
            2. Selecione o Projeto Vinculado
          </label>
          <select
            value={selectedProjectId || (selectedProject ? selectedProject.id : "")}
            disabled={!selectedClientId || clientProjects.length === 0}
            onChange={(e) => {
              onSelectProject(e.target.value);
              onChangeCustomText("");
            }}
            className={`w-full px-4 py-3 rounded-2xl border text-xs font-semibold outline-none focus:border-indigo-500 transition-all ${
              !selectedClientId
                ? "bg-black/20 border-white/5 text-gray-500 cursor-not-allowed"
                : clientProjects.length === 0
                ? "bg-amber-950/20 border-amber-500/30 text-amber-300 cursor-not-allowed"
                : "bg-black/40 border-white/10 text-white cursor-pointer"
            }`}
          >
            {!selectedClientId ? (
              <option value="" className="bg-slate-900 text-gray-500">
                Selecione o cliente primeiro...
              </option>
            ) : clientProjects.length === 0 ? (
              <option value="" className="bg-slate-900 text-amber-300">
                Nenhum projeto vinculado a este cliente
              </option>
            ) : (
              <>
                <option value="" className="bg-slate-900 text-gray-400">
                  -- Selecione o Projeto ({clientProjects.length}) --
                </option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.title} ({p.category || "Software"})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Templates Selector Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>Escolha um Modelo Pré-Formatado</span>
          </h3>
          <span className="text-xs text-gray-400">Clique para carregar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {templates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  onSelectTemplate(tpl.id);
                  onChangeCustomText("");
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-b from-indigo-900/60 to-purple-900/60 border-indigo-400 shadow-lg shadow-indigo-900/30 scale-[1.02]"
                    : `bg-slate-900/70 ${tpl.colorClass}`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">{tpl.icon}</div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 px-2 py-0.5 rounded-full bg-white/5">
                      {tpl.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{tpl.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{tpl.desc}</p>
                </div>

                <div className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                  <span>{isSelected ? "✓ Selecionado" : "Usar este template"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Message Preview & Editor */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone size={16} className="text-emerald-400" />
              <span>Pré-visualização da Mensagem (WhatsApp / E-mail)</span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Você pode editar o texto abaixo antes de disparar. As variáveis são preenchidas com os dados do cliente e projeto selecionados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={9}
          value={activeMessage}
          onChange={(e) => onChangeCustomText(e.target.value)}
          className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
          placeholder="Selecione um cliente e projeto para gerar a mensagem ou digite aqui..."
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onSendEmail}
            disabled={!selectedClientId}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-40 disabled:pointer-events-none text-indigo-200 text-xs font-bold border border-indigo-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/30"
          >
            <Mail size={15} />
            <span>Disparar E-mail Transacional</span>
          </button>

          <button
            type="button"
            onClick={onSendWhatsApp}
            disabled={!selectedClientId}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Send size={15} />
            <span>Disparar WhatsApp Direto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
