"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Briefcase,
  Layers,
  Clock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type ViewMode = "login" | "forgot" | "reset";

/**
 * Reusable utility to prevent Open Redirect vulnerabilities.
 * Ensures the target starts with the expected prefix, does not start with //, and contains no protocols or backslashes.
 */
function sanitizeRedirectUrl(url: string | null | undefined, defaultFallback: "/admin" | "/portal", isAdmin = false): string {
  if (!url) return defaultFallback;
  const clean = url.trim();
  const isValidAdmin = clean.startsWith("/admin");
  const isValidPortal = clean.startsWith("/portal");
  if (
    (isAdmin ? (isValidAdmin || isValidPortal) : isValidPortal) &&
    !clean.startsWith("//") &&
    !clean.includes("://") &&
    !clean.includes("\\")
  ) {
    return clean;
  }
  return defaultFallback;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading, signIn, resetPasswordForEmail, updatePassword } = useAuth();

  // Mode based on query or state
  const [mode, setMode] = useState<ViewMode>("login");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for brute-force lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Check if recovery link opened
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "recovery") {
      setMode("reset");
    }
  }, [searchParams]);

  // Redirect if already logged in according to role strictly from database profile
  useEffect(() => {
    if (!authLoading && user && profile) {
      const redirectParam = searchParams.get("redirect");
      const isAdmin = profile.role === "admin";
      if (isAdmin) {
        window.location.href = sanitizeRedirectUrl(redirectParam, "/admin", true);
      } else {
        window.location.href = sanitizeRedirectUrl(redirectParam, "/portal", false);
      }
    }
  }, [user, profile, authLoading, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Brute force lockout check
    if (lockoutSeconds > 0) {
      setErrorMsg(`Muitas tentativas consecutivas incorretas. Por segurança, aguarde ${lockoutSeconds}s para tentar novamente.`);
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const { profile: signedInProfile, error } = await signIn(cleanEmail, cleanPassword);
      if (error) {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);

        if (nextFailed >= 5) {
          setLockoutSeconds(120);
          setErrorMsg("Limite de tentativas excedido. Acesso temporariamente bloqueado por 2 minutos por segurança.");
        } else if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_credentials") ||
          error.message.includes("invalid_grant")
        ) {
          const remaining = 5 - nextFailed;
          setErrorMsg(`E-mail ou senha incorretos. (${remaining} tentativa${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"} antes do bloqueio temporário).`);
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg("E-mail pendente de confirmação. Verifique sua caixa de entrada.");
        } else {
          setErrorMsg(error.message || "Erro ao efetuar login. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      // Success: Reset failed attempts counter
      setFailedAttempts(0);
      setLockoutSeconds(0);

      // Determine target route strictly from loaded profile role (least privilege fallback to /portal)
      const role = signedInProfile?.role === "admin" ? "admin" : "client";
      const redirectParam = searchParams.get("redirect");

      if (role === "admin") {
        window.location.href = sanitizeRedirectUrl(redirectParam, "/admin", true);
      } else {
        window.location.href = sanitizeRedirectUrl(redirectParam, "/portal", false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro inesperado.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setErrorMsg(error.message || "Não foi possível enviar o e-mail de recuperação.");
        setLoading(false);
        return;
      }
      setSuccessMsg("E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada e spam.");
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao processar solicitação.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setErrorMsg("A senha deve conter uma combinação de letras e números para maior segurança.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem. Digite novamente.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setErrorMsg(error.message || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }
      setSuccessMsg("Senha redefinida com sucesso! Você já pode entrar com sua nova senha.");
      setLoading(false);
      setTimeout(() => {
        setMode("login");
        setSuccessMsg("");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao redefinir senha.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070913] text-white flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all bg-slate-900/80 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Portfólio</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-base tracking-tight text-white hidden sm:inline-block">
            Maira Reis <span className="text-gradient">Portal & Admin</span>
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Side: Benefits & Explanations */}
          <div className="lg:col-span-6 flex flex-col gap-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold w-fit">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Controle de Acesso & Segurança RBAC</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Acompanhe seu projeto com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                transparência total.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Aqui clientes e administradora contam com ambientes segregados e seguros. Acesso em tempo real a cronogramas, entregáveis, status de publicação e relatórios.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3.5 hover:border-indigo-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Isolamento Multi-Tenant</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Seus dados e projetos visíveis exclusivamente para você.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3.5 hover:border-purple-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 border border-purple-500/20">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Timeline & Updates</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Histórico e relatórios das sprints concluídas.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3.5 hover:border-pink-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 shrink-0 border border-pink-500/20">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Links & Entregáveis</h4>
                  <p className="text-xs text-gray-400 mt-0.5">APKs de teste, builds e links de homologação.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3.5 hover:border-emerald-500/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Acesso Restrito</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Acesso protegido com credenciais individuais e criptografia.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card (Login, Forgot or Reset) */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
              {/* Card top glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              {/* Mode 1: LOGIN */}
              {mode === "login" && (
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                      <KeyRound size={13} />
                      <span>Autenticação Segura (RBAC)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Entrar no Portal
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Acesse com seu e-mail e senha cadastrados.
                    </p>
                  </div>

                  {/* Alerts */}
                  {errorMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <AlertCircle size={18} className="shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        E-mail de Acesso
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm transition-colors outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Senha
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setErrorMsg("");
                            setSuccessMsg("");
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm transition-colors outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-indigo-400/50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Acessar Painel</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
                    <p className="text-xs text-gray-400">
                      As credenciais de clientes são enviadas diretamente pela Maira na assinatura do contrato.
                    </p>
                    <a
                      href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20preciso%20de%20ajuda%20com%20minhas%20credenciais%20de%20acesso%20ao%20portal."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>Suporte direto no WhatsApp →</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Mode 2: FORGOT PASSWORD */}
              {mode === "forgot" && (
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
                      <RefreshCw size={13} />
                      <span>Recuperação de Credenciais</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Redefinir Senha
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Informe seu e-mail cadastrado para receber o link de redefinição de senha.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <AlertCircle size={18} className="shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        E-mail Cadastrado
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm transition-colors outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-indigo-400/50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Enviar Link de Recuperação</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      ← Voltar para o Login
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-400">
                      Prefere suporte direto?{" "}
                      <a
                        href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20esqueci%20minha%20senha%20do%20portal%20do%20cliente."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        Recuperar via WhatsApp →
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Mode 3: RESET PASSWORD */}
              {mode === "reset" && (
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                      <Lock size={13} />
                      <span>Nova Senha</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Cadastrar Nova Senha
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Crie uma nova senha segura para o seu acesso.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <AlertCircle size={18} className="shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm transition-colors outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-sm transition-colors outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-emerald-400/50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Salvar Nova Senha</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
