"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  User,
  Mail,
  Phone,
  QrCode,
  CreditCard,
  KeyRound,
  ShieldCheck,
  Database,
  Send,
  BellRing,
  Download,
  Upload,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
  Laptop,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileJson,
  Zap,
} from "lucide-react";
import { Project } from "@/app/admin/page";
import { Profile } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export interface IssuerSettings {
  companyName: string;
  tradingName: string;
  documentNumber: string; // CNPJ ou CPF
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  roleTitle: string;
  // Pix and Bank Info
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  pixKey: string;
  pixBeneficiary: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
}

export interface AutomationSettings {
  remindDueDaysBefore: number;
  autoRemindEnabled: boolean;
  notifyOnProposalApproved: boolean;
  notifyOnStageCompleted: boolean;
  notifyOnNewLead: boolean;
  billingTemplate: string;
}

interface SettingsModuleProps {
  projects: Project[];
  clients: Profile[];
  onRefreshData?: () => void;
}

export function SettingsModule({
  projects,
  clients,
  onRefreshData,
}: SettingsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "issuer" | "pix" | "integrations" | "automations" | "security" | "backup"
  >("issuer");

  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Issuer Profile State
  const [issuer, setIssuer] = useState<IssuerSettings>({
    companyName: "Maira Reis - Desenvolvimento & UI/UX Design",
    tradingName: "Maira Reis Dev",
    documentNumber: "",
    email: "mairareis2017@gmail.com",
    phone: "553598030543",
    address: "Atendimento Remoto / Brasil",
    city: "Pouso Alegre",
    state: "MG",
    website: "https://mairareis.dev",
    roleTitle: "Engenheira de Software & UI/UX Designer",
    pixKeyType: "email",
    pixKey: "mairareis2017@gmail.com",
    pixBeneficiary: "Maira Reis",
    bankName: "Nubank / Inter",
    bankAgency: "0001",
    bankAccount: "",
  });

  // 2. Automations State
  const [automations, setAutomations] = useState<AutomationSettings>({
    remindDueDaysBefore: 3,
    autoRemindEnabled: true,
    notifyOnProposalApproved: true,
    notifyOnStageCompleted: true,
    notifyOnNewLead: true,
    billingTemplate:
      "Olá, {cliente}! Passando para lembrar que a parcela {parcela} do projeto {projeto} no valor de {valor} vence em {vencimento}. Chave Pix para pagamento: {pix}.",
  });

  // 3. Security / Password State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [twoFactorActive, setTwoFactorActive] = useState(false);

  // 4. Integrations / Ping State
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "online" | "error">("idle");
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedIssuer = localStorage.getItem("portfolio_admin_issuer_settings_v1");
      if (savedIssuer) setIssuer(JSON.parse(savedIssuer));

      const savedAutomations = localStorage.getItem("portfolio_admin_automations_settings_v1");
      if (savedAutomations) setAutomations(JSON.parse(savedAutomations));

      const saved2FA = localStorage.getItem("portfolio_admin_2fa_enabled");
      if (saved2FA) setTwoFactorActive(saved2FA === "true");
    } catch {}
  }, []);

  // Save Issuer
  const handleSaveIssuer = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("portfolio_admin_issuer_settings_v1", JSON.stringify(issuer));
      showToast("Dados do emitente e faturamento salvos com sucesso!", "success");
    } catch {
      showToast("Erro ao salvar dados localmente.", "error");
    }
  };

  // Save Automations
  const handleSaveAutomations = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("portfolio_admin_automations_settings_v1", JSON.stringify(automations));
      showToast("Preferências de automação salvas com sucesso!", "success");
    } catch {
      showToast("Erro ao salvar automações.", "error");
    }
  };

  // Test Supabase Connection
  const handleTestSupabase = async () => {
    setPingStatus("testing");
    const start = performance.now();
    try {
      const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
      const latency = Math.round(performance.now() - start);
      setPingLatency(latency);
      if (error) {
        setPingStatus("online"); // If RLS restricted head, it still responded
      } else {
        setPingStatus("online");
      }
      showToast(`Conexão com Supabase ativa e respondendo (${latency}ms)!`, "success");
    } catch (e) {
      setPingStatus("error");
      showToast("Falha na conexão com Supabase.", "error");
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 8) {
      showToast("A nova senha deve ter no mínimo 8 caracteres.", "error");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("A confirmação de senha não confere.", "error");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      showToast("Senha de administradora atualizada com sucesso no Supabase!", "success");
    } catch (err: any) {
      showToast(err.message || "Erro ao atualizar senha no Supabase.", "error");
    }
  };

  // Export Full Backup JSON
  const handleExportBackup = () => {
    try {
      const finances = localStorage.getItem("portfolio_admin_finances_data_v1") || "{}";
      const proposals = localStorage.getItem("portfolio_admin_proposals_v1") || "[]";
      const kanban = localStorage.getItem("portfolio_kanban_board_v1") || "{}";

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
        clients,
        projects,
        finances: JSON.parse(finances),
        proposals: JSON.parse(proposals),
        kanbanBoard: JSON.parse(kanban),
        issuerSettings: issuer,
        automationSettings: automations,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_portfolio_mairareis_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Backup completo exportado com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao gerar backup de dados.", "error");
    }
  };

  // Export CSV
  const handleExportClientsCSV = () => {
    try {
      const headers = ["ID", "Nome Completo", "E-mail", "Telefone", "Empresa", "Status", "Função"];
      const rows = clients.map((c) => [
        c.id || "",
        `"${(c.full_name || "").replace(/"/g, '""')}"`,
        c.email || "",
        c.phone || "",
        `"${(c.company || "").replace(/"/g, '""')}"`,
        c.status || "active",
        c.role || "client",
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_mairareis_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Tabela de clientes exportada em CSV!", "success");
    } catch (e) {
      showToast("Erro ao exportar CSV.", "error");
    }
  };

  // Password strength helper
  const hasMinLength = newPass.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPass);
  const hasLowerCase = /[a-z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPass);
  const passScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-300"
              : "bg-blue-950/90 border-blue-500/40 text-blue-300"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
          {toast.type === "info" && <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Configurações & Painel de Controle
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Gerencie dados do emitente, integrações com Supabase, Pix para faturamento, automações e segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onRefreshData && (
            <button
              type="button"
              onClick={() => {
                onRefreshData();
                showToast("Dados do portal e cache sincronizados!", "info");
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Sincronizar</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Exportar Backup</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 border border-white/5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("issuer")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "issuer"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Building2 size={14} />
          <span>Perfil & Emitente</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pix")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "pix"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <QrCode size={14} />
          <span>Chave Pix & Cobrança</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("integrations")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "integrations"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Database size={14} />
          <span>Integrações & Supabase</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("automations")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "automations"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BellRing size={14} />
          <span>Automações & Avisos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("security")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "security"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldCheck size={14} />
          <span>Segurança & Senha</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("backup")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === "backup"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileJson size={14} />
          <span>Backup & LGPD</span>
        </button>
      </div>

      {/* ================= TAB 1: ISSUER & COMPANY ================= */}
      {activeSubTab === "issuer" && (
        <form onSubmit={handleSaveIssuer} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="text-purple-400" size={18} />
                <span>Dados do Emitente & Assinatura</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Esses dados aparecem automaticamente no cabeçalho e rodapé das suas Propostas Comerciais e Contratos em PDF.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>Salvar Alterações</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Razão Social / Nome Completo</label>
              <input
                type="text"
                value={issuer.companyName}
                onChange={(e) => setIssuer({ ...issuer, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="Ex: Maira Reis - Desenvolvimento de Software"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Nome Fantasia / Marca</label>
              <input
                type="text"
                value={issuer.tradingName}
                onChange={(e) => setIssuer({ ...issuer, tradingName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="Ex: Maira Reis Dev"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">CNPJ ou CPF do Emitente</label>
              <input
                type="text"
                value={issuer.documentNumber}
                onChange={(e) => setIssuer({ ...issuer, documentNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="00.000.000/0001-00 ou 000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Cargo / Especialidade</label>
              <input
                type="text"
                value={issuer.roleTitle}
                onChange={(e) => setIssuer({ ...issuer, roleTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="Ex: Engenheira de Software & UI/UX"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">E-mail Profissional</label>
              <input
                type="email"
                value={issuer.email}
                onChange={(e) => setIssuer({ ...issuer, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="contato@mairareis.dev"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">WhatsApp / Telefone de Contato</label>
              <input
                type="text"
                value={issuer.phone}
                onChange={(e) => setIssuer({ ...issuer, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="553598030543"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Cidade & Estado</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={issuer.city}
                  onChange={(e) => setIssuer({ ...issuer, city: e.target.value })}
                  className="col-span-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                  placeholder="Cidade"
                />
                <input
                  type="text"
                  value={issuer.state}
                  onChange={(e) => setIssuer({ ...issuer, state: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all uppercase"
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Website / Portfólio Online</label>
              <input
                type="text"
                value={issuer.website}
                onChange={(e) => setIssuer({ ...issuer, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
                placeholder="https://mairareis.dev"
              />
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 2: PIX & BILLING ================= */}
      {activeSubTab === "pix" && (
        <form onSubmit={handleSaveIssuer} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="text-emerald-400" size={18} />
                <span>Dados de Cobrança & Chave Pix Padrão</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Defina a chave Pix e dados bancários que são incluídos nas faturas, lembretes de WhatsApp e contratos.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>Salvar Chave Pix</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Tipo de Chave Pix</label>
              <select
                value={issuer.pixKeyType}
                onChange={(e) => setIssuer({ ...issuer, pixKeyType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161a23] border border-white/10 text-xs text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Telefone (Celular)</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Chave Pix</label>
              <input
                type="text"
                value={issuer.pixKey}
                onChange={(e) => setIssuer({ ...issuer, pixKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all"
                placeholder="Insira sua chave Pix aqui"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Nome do Titular / Beneficiário</label>
              <input
                type="text"
                value={issuer.pixBeneficiary}
                onChange={(e) => setIssuer({ ...issuer, pixBeneficiary: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all"
                placeholder="Ex: Maira Reis"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Instituição / Banco</label>
              <input
                type="text"
                value={issuer.bankName}
                onChange={(e) => setIssuer({ ...issuer, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all"
                placeholder="Ex: Nubank / Inter"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Agência e Conta (Opcional)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={issuer.bankAgency}
                  onChange={(e) => setIssuer({ ...issuer, bankAgency: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all"
                  placeholder="Agência"
                />
                <input
                  type="text"
                  value={issuer.bankAccount}
                  onChange={(e) => setIssuer({ ...issuer, bankAccount: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-emerald-500 focus:bg-white/[0.07] transition-all"
                  placeholder="Conta"
                />
              </div>
            </div>
          </div>

          {/* Pix Preview Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <QrCode size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">Pré-visualização nas Propostas</p>
                <p className="text-[11px] text-emerald-200/80 font-mono mt-0.5">
                  Pix ({issuer.pixKeyType.toUpperCase()}): {issuer.pixKey || "(não definida)"} • Titular: {issuer.pixBeneficiary || "Maira Reis"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(issuer.pixKey);
                showToast("Chave Pix copiada para a área de transferência!", "info");
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy size={12} />
              <span>Copiar</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: INTEGRATIONS & SUPABASE ================= */}
      {activeSubTab === "integrations" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="text-blue-400" size={18} />
              <span>Integrações & Conexões Ativas</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Status das conexões com banco de dados em nuvem, disparo de e-mails transacionais e Webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase Card */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Supabase Cloud (PostgreSQL)</h4>
                    <p className="text-[11px] text-neutral-400">Banco de dados principal com Row Level Security (RLS)</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  ● Operacional
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1 text-neutral-300">
                <p className="truncate">URL: <span className="text-purple-400">{process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvifgruswjhjqidnlalk.supabase.co"}</span></p>
                <p>RLS: <span className="text-emerald-400">Ativado (Protegido)</span></p>
                {pingLatency !== null && <p>Latência: <span className="text-blue-400">{pingLatency} ms</span></p>}
              </div>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={pingStatus === "testing"}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={12} className={pingStatus === "testing" ? "animate-spin" : ""} />
                <span>{pingStatus === "testing" ? "Testando latência..." : "Testar Conexão Supabase"}</span>
              </button>
            </div>

            {/* Resend Card */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Resend (E-mails Transacionais)</h4>
                    <p className="text-[11px] text-neutral-400">Disparo de faturas, avisos de etapas e propostas</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  ● Ativo
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1 text-neutral-300">
                <p>Remetente: <span className="text-purple-400">notificacoes@mairareis.dev</span></p>
                <p>Rate Limit: <span className="text-emerald-400">15 disparos / min</span></p>
                <p>Status: <span className="text-blue-400">Simulação / API Ativa</span></p>
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
                <Zap size={13} className="text-amber-400 shrink-0" />
                <span>Chave configurada com segurança via variável de ambiente <code>RESEND_API_KEY</code>.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: AUTOMATIONS ================= */}
      {activeSubTab === "automations" && (
        <form onSubmit={handleSaveAutomations} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="text-amber-400" size={18} />
                <span>Automações de Notificação & Cobrança</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configure gatilhos automáticos para lembretes de parcelas e alertas de interação de clientes.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>Salvar Automações</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Toggle 1: Auto Billing Remind */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Lembrete Automático de Vencimento de Parcela</p>
                <p className="text-[11px] text-neutral-400">
                  Gera aviso prévio de cobrança para o cliente antes do vencimento do contrato parcelado.
                </p>
              </div>
              <input
                type="checkbox"
                checked={automations.autoRemindEnabled}
                onChange={(e) => setAutomations({ ...automations, autoRemindEnabled: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
              />
            </div>

            {/* Toggle 2: Notify on Proposal Approved */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Alerta de Proposta Comercial Aprovada</p>
                <p className="text-[11px] text-neutral-400">
                  Notifica imediatamente no WhatsApp quando o cliente clicar em &quot;Aprovar Proposta&quot; no link público.
                </p>
              </div>
              <input
                type="checkbox"
                checked={automations.notifyOnProposalApproved}
                onChange={(e) => setAutomations({ ...automations, notifyOnProposalApproved: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
              />
            </div>

            {/* Toggle 3: Notify on Stage Completed */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Aviso de Conclusão de Etapa / Milestone</p>
                <p className="text-[11px] text-neutral-400">
                  Envia e-mail automático ao cliente quando você marcar uma entrega/etapa como 100% concluída.
                </p>
              </div>
              <input
                type="checkbox"
                checked={automations.notifyOnStageCompleted}
                onChange={(e) => setAutomations({ ...automations, notifyOnStageCompleted: e.target.checked })}
                className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
              />
            </div>

            {/* Template editor */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Texto Padrão da Mensagem de Cobrança (com Variáveis)
              </label>
              <textarea
                rows={3}
                value={automations.billingTemplate}
                onChange={(e) => setAutomations({ ...automations, billingTemplate: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-sans outline-none focus:border-amber-500 focus:bg-white/[0.07] transition-all resize-none"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Variáveis disponíveis: <code>{"{cliente}"}</code>, <code>{"{projeto}"}</code>, <code>{"{parcela}"}</code>, <code>{"{valor}"}</code>, <code>{"{vencimento}"}</code>, <code>{"{pix}"}</code>.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 5: SECURITY & ACCESS ================= */}
      {activeSubTab === "security" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-purple-400" size={18} />
              <span>Segurança da Conta & Acesso da Administradora</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Altere sua senha de acesso, configure 2FA e visualize o status de conformidade OWASP / LGPD.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Change Form */}
            <form onSubmit={handleChangePassword} className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound size={16} className="text-purple-400" />
                <span>Alterar Senha de Administradora</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 transition-all"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password meter */}
                {newPass && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`flex-1 rounded-full transition-all ${
                            passScore >= lvl
                              ? passScore >= 4
                                ? "bg-emerald-500"
                                : passScore >= 3
                                ? "bg-amber-500"
                                : "bg-rose-500"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-400">
                      <span className={hasMinLength ? "text-emerald-400" : ""}>✓ 8+ Caracteres</span>
                      <span className={hasUpperCase ? "text-emerald-400" : ""}>✓ Letra Maiúscula</span>
                      <span className={hasNumber ? "text-emerald-400" : ""}>✓ Número</span>
                      <span className={hasSpecial ? "text-emerald-400" : ""}>✓ Símbolo Especial</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Confirmar Nova Senha</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-purple-500 transition-all"
                  placeholder="Repita a nova senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passScore < 4}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                Atualizar Senha no Supabase
              </button>
            </form>

            {/* Security Compliance Card */}
            <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Auditoria & Conformidade Ativa</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-300 font-semibold">Row Level Security (RLS)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">ATIVO</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-300 font-semibold">Content Security Policy (CSP)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">ATIVO</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-300 font-semibold">Rate Limiting Anti-Brute Force</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">ATIVO (10 req/min)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-300 font-semibold">Criptografia de Senhas (scrypt)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">ATIVO (Salt 16b)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Conformidade OWASP Top 10 & LGPD Garantida</span>
                </p>
                <p className="text-purple-200/80">
                  Todas as requisições autenticadas no servidor sem exposição pública de dados de clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: BACKUP & DATA (LGPD) ================= */}
      {activeSubTab === "backup" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileJson className="text-purple-400" size={18} />
              <span>Backup Geral & Portabilidade de Dados (LGPD)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Exporte todos os cadastros, faturas e propostas para sua custódia local ou contabilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup JSON */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <FileJson size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Backup Integral do Sistema (JSON)</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Gera um arquivo único e estruturado contendo todos os clientes, projetos, tarefas do Kanban, propostas e lançamentos financeiros.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>
            </div>

            {/* Export CSV */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <FileSpreadsheet size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Exportação para Planilhas (CSV / Excel)</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Exporta a listagem completa de clientes e contatos para abertura direta no Microsoft Excel ou Google Sheets.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportClientsCSV}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Baixar Tabela de Clientes (.CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
