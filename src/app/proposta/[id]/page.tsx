"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Receipt,
  Printer,
  Share2,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  FileText,
  Lock,
  Download,
  Building,
  Mail,
  Phone,
  Sparkles,
  Repeat,
  CheckSquare,
  Code2,
  Smartphone,
  Server,
  Zap,
  Globe,
  Award,
  ChevronRight,
  Shield,
  HelpCircle,
  BadgeCheck,
  Cpu,
  User,
  Star
} from "lucide-react";
import Link from "next/link";
import { CommercialProposal, BillingFrequency, ProposalOption } from "@/components/admin/ProposalsModule";
import { DEFAULT_AGENCY_DATA } from "@/lib/receiptGenerator";

export default function PublicProposalPage() {
  const params = useParams();
  const idOrDocNumber = params?.id as string;

  const [proposal, setProposal] = useState<CommercialProposal | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!idOrDocNumber) return;

    // 1. Fetch from server API
    fetch(`/api/proposals?id=${encodeURIComponent(idOrDocNumber)}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.proposal) {
          const prop = data.proposal;
          setProposal(prop);
          if (prop.options && prop.options.length > 0) {
            const rec = prop.options.find((o: ProposalOption) => o.isRecommended) || prop.options[0];
            setSelectedOptionId(rec.id);
          }
          setLoading(false);
          return;
        }

        // 2. Fallback to localStorage
        try {
          const rawProposals = localStorage.getItem("portfolio_commercial_proposals_v1");
          if (rawProposals) {
            const list: CommercialProposal[] = JSON.parse(rawProposals);
            const normalized = idOrDocNumber.toLowerCase();
            const found = list.find(
              (p) =>
                p.id.toLowerCase() === normalized ||
                p.docNumber.toLowerCase() === normalized
            );
            if (found) {
              setProposal(found);
              if (found.options && found.options.length > 0) {
                const rec = found.options.find((o) => o.isRecommended) || found.options[0];
                setSelectedOptionId(rec.id);
              }
              setLoading(false);
              return;
            }
          }
        } catch (e) {}

        // 3. Fallback demo data
        const defaultProp: CommercialProposal = {
          id: idOrDocNumber,
          docNumber: idOrDocNumber.toUpperCase().startsWith("PROP") ? idOrDocNumber.toUpperCase() : "PROP-2026-001",
          title: "Proposta Comercial - Parceria Estratégica",
          clientName: "Cliente Parceiro",
          clientCompany: "Empresa Parceira",
          clientEmail: "contato@empresa.com.br",
          clientPhone: "11999999999",
          projectTitle: "Aplicativo Mobile & Plataforma Web",
          category: "Parceria Estratégica • App as a Service",
          billingFrequency: "monthly",
          scopeItems: [
            "Desenvolvimento completo da solução mobile (iOS e Android)",
            "Publicação e homologação nas lojas Google Play Store & Apple App Store",
            "Hospedagem segura em nuvem, backend e banco de dados de alto desempenho",
            "Ciclo contínuo de atualizações, melhorias e correções a cada 30 dias",
            "Monitoramento ativo de segurança, estabilidade e suporte técnico operacional"
          ],
          timelineWeeks: "30 a 60 dias (Versão Operacional)",
          totalValue: 350,
          paymentTerms: "Mensalidade recorrente contínua (todo dia 15)",
          validityDays: 15,
          warrantyDays: 0,
          notes: "Modelo inteligente de assinatura contínua com opção de cessão de código após 12 meses.",
          status: "sent",
          createdAt: new Date().toISOString()
        };

        setProposal(defaultProp);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading proposal:", err);
        setLoading(false);
      });
  }, [idOrDocNumber]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "portfolio_commercial_proposals_v1" && e.newValue) {
        try {
          const list: CommercialProposal[] = JSON.parse(e.newValue);
          const normalized = idOrDocNumber.toLowerCase();
          const found = list.find(
            (p) =>
              p.id.toLowerCase() === normalized ||
              p.docNumber.toLowerCase() === normalized
          );
          if (found) {
            setProposal(found);
            if (found.options && found.options.length > 0) {
              const rec = found.options.find((o) => o.isRecommended) || found.options[0];
              setSelectedOptionId(rec.id);
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [idOrDocNumber]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center animate-pulse">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur-lg opacity-30 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white tracking-wide">Carregando Proposta Executiva...</p>
          <p className="text-xs text-slate-400">Verificando autenticidade do documento digital</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 text-slate-400 shadow-2xl">
          <Receipt className="h-10 w-10 mx-auto text-slate-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Proposta Não Encontrada</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            O link acessado pode ter expirado ou o código de referência não está disponível no sistema.
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
        >
          Voltar à Página Inicial
        </Link>
      </div>
    );
  }

  const hasMultipleOptions = Boolean(proposal.options && proposal.options.length > 1);
  const activeOption: ProposalOption | null = hasMultipleOptions && selectedOptionId
    ? proposal.options?.find((o) => o.id === selectedOptionId) || proposal.options?.[0] || null
    : proposal.options && proposal.options.length === 1
    ? proposal.options[0]
    : null;

  // Check matching catalog product to enrich description or scope if missing
  const catalogProduct = typeof window !== "undefined" ? (() => {
    try {
      const rawProducts = localStorage.getItem("portfolio_commercial_products_v1");
      if (rawProducts) {
        const prodList = JSON.parse(rawProducts);
        return prodList.find((item: any) => 
          (activeOption?.productId && item.id === activeOption.productId) ||
          (activeOption?.name && item.name?.trim().toLowerCase() === activeOption.name.trim().toLowerCase()) ||
          (proposal.projectTitle && item.name?.trim().toLowerCase() === proposal.projectTitle.trim().toLowerCase()) ||
          (proposal.title && proposal.title.toLowerCase().includes(item.name?.trim().toLowerCase()))
        );
      }
    } catch (e) {}
    return null;
  })() : null;

  const effectivePrice = activeOption ? activeOption.price : proposal.totalValue;
  const effectiveFrequency = activeOption ? activeOption.billingFrequency : proposal.billingFrequency;
  const effectiveTimeline = activeOption?.timelineWeeks || proposal.timelineWeeks;
  const effectivePaymentTerms = activeOption?.paymentTerms || proposal.paymentTerms;
  const effectiveDescription =
    (activeOption?.description && activeOption.description.trim().length > 0 ? activeOption.description : "") ||
    (catalogProduct?.description && catalogProduct.description.trim().length > 0 ? catalogProduct.description : "") ||
    (proposal.notes && proposal.notes.trim().length > 0 ? proposal.notes : "");

  const initialScope = activeOption && activeOption.scopeItems && activeOption.scopeItems.filter((s) => s && s.trim().length > 0 && !s.toLowerCase().includes("a definir")).length > 0
    ? activeOption.scopeItems.filter((s) => s && s.trim().length > 0)
    : (proposal.scopeItems || []).filter((s) => s && s.trim().length > 0 && !s.toLowerCase().includes("a definir"));

  const effectiveScope = initialScope.length > 0
    ? initialScope
    : (catalogProduct?.scope && catalogProduct.scope.length > 0 ? catalogProduct.scope : (proposal.scopeItems || []));

  const isRecurring = Boolean(effectiveFrequency && effectiveFrequency !== "one_time");
  const isSoftwareDev = proposal.templateType === "software_dev" || (!isRecurring && proposal.templateType !== "partnership_recurring");
  const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(effectivePrice);

  const buyoutPrice = !isSoftwareDev && isRecurring
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.max(effectivePrice * 4.28, 1500))
    : null;

  const validScope = effectiveScope;
  const formattedDate = new Date(proposal.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const optionAcceptanceSuffix = activeOption
    ? ` optando pelo plano/pacote *${activeOption.name}* no valor de *${formattedPrice}${isRecurring ? "/mês" : ""}*`
    : "";

  const whatsappMessage = encodeURIComponent(
    `Olá Maira! Gostaria de confirmar o aceite da Proposta Comercial Oficial Ref: ${proposal.docNumber} (${proposal.title})${optionAcceptanceSuffix} para darmos início ao projeto!`
  );
  const whatsappUrl = `https://wa.me/553598030543?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans antialiased pb-28 selection:bg-blue-500 selection:text-white relative overflow-x-hidden print:bg-white print:text-[#0a0f1d] print:p-0 print:pb-0">
      
      {/* Subtle Ambient Background Lighting (Screen only) */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] print:hidden" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_85%_35%,rgba(16,185,129,0.12),rgba(255,255,255,0))] print:hidden" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_15%_75%,rgba(99,102,241,0.10),rgba(255,255,255,0))] print:hidden" />

      {/* ========================================================================= */}
      {/* TOP FLOATING EXECUTIVE ACTION BAR                                         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#060913]/85 border-b border-white/10 px-4 py-3 sm:py-3.5 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Document Reference Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-500/10 shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-blue-400 tracking-wider">
                  {proposal.docNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isSoftwareDev ? "Projeto de Desenvolvimento" : "Parceria Ativa"}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[280px] sm:max-w-md block mt-0.5">
                {proposal.title}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 hover:border-white/25 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Copiar Link Único de Compartilhamento"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-slate-400" />}
              <span>{copied ? "Link Copiado!" : "Copiar Link"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 hover:border-white/25 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Imprimir ou Salvar PDF"
            >
              <Printer className="h-4 w-4 text-slate-400" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Premium WhatsApp Approval CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-500 text-white text-xs font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] border border-emerald-400/50 hover:border-emerald-300 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
            >
              {/* Animated Light Sweep Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

              <div className="relative flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white fill-white/20 shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-200 animate-ping pointer-events-none" />
              </div>
              <span className="relative font-black">Aprovar Proposta</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN EXECUTIVE DOCUMENT CONTAINER                                         */}
      {/* ========================================================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-10 relative z-10 print:p-0 print:m-0 print:max-w-none print:space-y-6">

        {/* ------------------------------------------------------------------------- */}
        {/* HERO SECTION: EXECUTIVE BRANDING & PRESENTATION                           */}
        {/* ------------------------------------------------------------------------- */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden print:bg-white print:border-b-2 print:border-slate-300 print:p-6 print:shadow-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

          {/* Top Reference & Metadata Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5 print:border-slate-200">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Proposta Comercial Oficial
              </span>
            </div>

            {/* Reference Details */}
            <div className="flex items-center gap-2 sm:text-right flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                Ref: <strong className="text-white font-bold">{proposal.docNumber}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                Data: <strong className="text-white font-bold">{formattedDate}</strong>
              </div>
            </div>
          </div>

          {/* Main Title & Client Presentation Card */}
          <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{proposal.category || (isSoftwareDev ? "Desenvolvimento de Software sob Medida" : "Parceria Estratégica • App as a Service")}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {proposal.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {proposal.notes && proposal.notes.trim().length > 0
                  ? proposal.notes
                  : isSoftwareDev
                  ? "Desenvolvimento completo com arquitetura moderna de ponta a ponta, design UI/UX exclusivo focado em alta performance e infraestrutura escalável em nuvem."
                  : "Modelo inteligente de desenvolvimento e operação contínua de aplicativos. Eliminamos o custo de investimento inicial pesado, integrando engenharia de ponta, infraestrutura em nuvem e atualizações regulares em uma mensalidade previsível."}
              </p>
            </div>

            {/* Client Presentation Box */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-5 space-y-3.5 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Apresentado Exclusivamente Para:
              </span>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>{proposal.clientName || "Cliente Parceiro"}</span>
                </h3>
                {proposal.clientCompany && (
                  <p className="text-xs text-slate-300 flex items-center gap-2 pl-6 font-medium">
                    <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{proposal.clientCompany}</span>
                  </p>
                )}
              </div>

              {/* Status and Validity Row */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Validade da Proposta:</span>
                <span className="font-bold text-emerald-400">
                  {proposal.validityDays > 0 ? `${proposal.validityDays} dias corridos` : "15 dias"}
                </span>
              </div>

              {isSoftwareDev && (effectiveTimeline || proposal.timelineWeeks) && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Prazo Estimado:</span>
                  <span className="font-bold text-white">{effectiveTimeline || proposal.timelineWeeks}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 1: WHAT'S INCLUDED / PILLARS OF EXCELLENCE                        */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                {isSoftwareDev ? "Pilares & Entregáveis do Projeto" : "Pilares Inclusos na Parceria Estratégica"}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Padrão de Engenharia Sênior</span>
          </div>

          {/* Description of Partnership / Solution Scope Overview */}
          {effectiveDescription && effectiveDescription.trim().length > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-blue-950/40 border border-emerald-500/30 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden space-y-2.5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                    {isSoftwareDev ? "Visão Geral & Descrição do Projeto" : "Descrição da Parceria & Propósito da Solução"}
                  </span>
                </div>
                {activeOption && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {activeOption.badge || activeOption.name}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {effectiveDescription}
              </p>
            </div>
          )}

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2.5 backdrop-blur-md hover:border-blue-500/40 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  {isSoftwareDev ? <Code2 className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {isSoftwareDev ? "Design UI/UX & Protótipo Figma" : "Desenvolvimento & Publicação Oficial"}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isSoftwareDev
                  ? "Criação de interface visual moderna, intuitiva e protótipo interativo navegável de alta fidelidade antes de iniciar o código."
                  : "Criação completa da solução mobile e homologação oficial nas lojas Google Play Store (Android) e Apple App Store (iOS)."}
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2.5 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Server className="h-4 w-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {isSoftwareDev ? "Engenharia Fullstack & Arquitetura" : "Nuvem & Infraestrutura Escalável"}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isSoftwareDev
                  ? "Frontend e Backend desenvolvidos com tecnologias de ponta (Next.js / Node / Supabase), código limpo, componentizado e seguro."
                  : "Hospedagem segura do backend, banco de dados em nuvem e certificados SSL de alto desempenho já inclusos sem custos adicionais."}
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2.5 backdrop-blur-md hover:border-indigo-500/40 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Repeat className="h-4 w-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {isSoftwareDev ? "Deploy em Produção & Homologação" : "Ciclo de Atualizações a Cada 30 Dias"}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isSoftwareDev
                  ? "Configuração completa de servidores em nuvem, testes rigorosos de usabilidade e entrega da versão operacional pronta."
                  : "Concluído o lançamento inicial, execução de ciclos de melhorias, correções preventivas e subida de novas compilações mensais."}
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2.5 backdrop-blur-md hover:border-teal-500/40 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {isSoftwareDev ? `Garantia Técnica (${proposal.warrantyDays || 30} dias)` : "Suporte Técnico Ativo & Segurança"}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isSoftwareDev
                  ? `Suporte técnico dedicado pós-entrega com garantia para correções de eventuais bugs sem custos e treinamento operacional.`
                  : "Monitoramento constante de estabilidade, suporte operacional ágil e adequação contínua aos novos padrões dos sistemas operacionais."}
              </p>
            </div>

          </div>

          {/* Scope Deliverables Checklist (if present) */}
          {validScope.length > 0 && (
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider">
                  Checklist Técnico de Entregas ({validScope.length} {validScope.length === 1 ? "item" : "itens"} listados):
                </span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Escopo Contratual
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {validScope.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-200 bg-white/[0.03] border border-white/5 rounded-xl p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 2: INVESTMENT STRUCTURE & PRICING                                */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Estrutura de Investimento
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Condições Transparentes</span>
          </div>

          {hasMultipleOptions ? (
            /* MULTI-OPTION PACKAGES SELECTOR CARDS */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Compare as Opções e Selecione a Melhor para o Seu Negócio
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Clique no pacote desejado para selecioná-lo e confirmar o aceite oficial.
                    </p>
                  </div>
                </div>
                {activeOption && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 shrink-0">
                    <Check className="h-3.5 w-3.5" /> Selecionado: {activeOption.name}
                  </span>
                )}
              </div>

              <div className={`grid grid-cols-1 ${proposal.options!.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"} gap-5`}>
                {proposal.options!.map((opt) => {
                  const isSelected = opt.id === (activeOption?.id || selectedOptionId);
                  const isOptRecurring = opt.billingFrequency && opt.billingFrequency !== "one_time";
                  const optFormattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(opt.price);
                  const optScope = opt.scopeItems && opt.scopeItems.length > 0 ? opt.scopeItems.filter((s) => s && s.trim().length > 0) : [];

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6 transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-gradient-to-b from-slate-900 via-slate-900/95 to-emerald-950/50 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/30 scale-[1.01]"
                          : "bg-slate-900/60 border border-white/10 hover:border-white/30 hover:bg-slate-900/80"
                      }`}
                    >
                      {/* Ambient Glow */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                      )}

                      <div className="space-y-4">
                        {/* Header Badge & Selected State */}
                        <div className="flex items-center justify-between gap-2">
                          {opt.badge ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isSelected
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                                : "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                            }`}>
                              <Sparkles className="h-3 w-3" />
                              {opt.badge}
                            </span>
                          ) : opt.isRecommended ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                              Recomendado
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              Opção de Pacote
                            </span>
                          )}

                          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/5 text-slate-400 border border-white/10 group-hover:text-white"
                          }`}>
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Selecionado</span>
                              </>
                            ) : (
                              <span>Selecionar</span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {opt.name}
                          </h3>
                          {opt.description && (
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {opt.description}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                            {optFormattedPrice}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {isOptRecurring ? " / mês" : " (pagamento único)"}
                          </span>
                          {opt.paymentTerms && (
                            <p className="text-xs text-slate-300 font-medium mt-1">
                              💳 {opt.paymentTerms}
                            </p>
                          )}
                          {(isSoftwareDev || !isOptRecurring) && opt.timelineWeeks && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              ⏱️ Prazo: {opt.timelineWeeks}
                            </p>
                          )}
                        </div>

                        {/* Scope Checklist for this option */}
                        {optScope.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-slate-300">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                              Incluso nesta opção:
                            </span>
                            {optScope.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-tight text-slate-200">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Select Button CTA */}
                      <div className="pt-4 border-t border-white/10">
                        {isSelected ? (
                          <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                            <Check className="h-4 w-4" />
                            <span>Opção Escolhida</span>
                          </div>
                        ) : (
                          <div className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 group-hover:border-white/30 transition-all">
                            <span>Escolher Este Pacote</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isSoftwareDev ? (
            /* SOFTWARE DEV PRICING CARD */
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Investimento Total do Projeto
                  </span>
                  <h3 className="text-lg font-bold text-white">{proposal.title}</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {proposal.paymentTerms || "Condições: 50% de entrada no início + 50% na aprovação final"}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Pagamento único / parcelamento por marcos
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-6 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Transferência integral do código-fonte e repositórios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Homologação e testes completos antes da entrega</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Garantia técnica de {proposal.warrantyDays || 30} dias inclusa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Treinamento operacional e documentação técnica</span>
                </div>
              </div>
            </div>
          ) : (
            /* PARTNERSHIP RECURRING PRICING CARDS */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Card 1: Recommended Monthly Subscription */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      Plano Recomendado
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Vigência: 12 meses</span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    Assinatura Mensal Contínua (App as a Service)
                  </h3>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold"> / mês</span>
                  </div>

                  <p className="text-xs text-emerald-300 font-medium">
                    {proposal.paymentTerms || "Mensalidade recorrente contínua (todo dia 15)"}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Desenvolvimento completo da solução</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Publicação nas lojas Play Store & Apple Store inclusa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Updates e melhorias a cada 30 dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Infraestrutura em nuvem e suporte técnico ativos</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Buyout / Code Ownership Option */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/15 p-6 sm:p-7 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                      <Lock className="h-3 w-3" />
                      Disponível Após 12 Meses
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Opcional</span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    Cessão Definitiva do Código (Buyout)
                  </h3>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {buyoutPrice}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Taxa única para transferência completa de repositórios e titularidade do código.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Entrega de 100% dos arquivos de código-fonte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Transferência dos repositórios Git</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>Transferência de propriedade intelectual</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <span>✓ Habilitada exclusivamente após a conclusão de 1 ano de plano</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 3: ROADMAP & EXECUTION TIMELINE                                   */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Metodologia & Etapas de Execução
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Processo Estruturado</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider bg-blue-500/15 px-2.5 py-0.5 rounded-md border border-blue-500/25">
                  FASE 01
                </span>
                <span className="text-xs font-mono text-slate-400">Briefing & Design</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white pt-1">
                Arquitetura & Protótipo
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mapeamento dos fluxos de navegação, arquitetura de dados e aprovação do design de telas de alta fidelidade.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/15 px-2.5 py-0.5 rounded-md border border-indigo-500/25">
                  FASE 02
                </span>
                <span className="text-xs font-mono text-slate-400">Engenharia Fullstack</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white pt-1">
                Desenvolvimento & QA
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Codificação frontend/backend, integração de banco de dados, APIs e bateria de testes de estabilidade.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 space-y-2 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/25">
                  FASE 03
                </span>
                <span className="text-xs font-mono text-slate-400">Go-Live & Suporte</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white pt-1">
                {isSoftwareDev ? "Deploy & Homologação" : "Lançamento & Ciclos Mensais"}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isSoftwareDev
                  ? "Publicação em ambiente oficial de produção, homologação final com o cliente e entrega das chaves."
                  : "Publicação oficial nas lojas Play Store e App Store, seguido por melhorias contínuas a cada 30 dias."}
              </p>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 4: LEGAL PREMISES, SLA & GOVERNANCE CLAUSES                       */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                {isSoftwareDev ? "Premissas Técnicas, Homologação & Garantia" : "Governança Operacional & Regras Jurídicas"}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Segurança Contratual</span>
          </div>

          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 space-y-4 backdrop-blur-xl">
            <p className="text-xs text-slate-300 leading-relaxed pb-2 border-b border-white/10">
              {isSoftwareDev
                ? "Para garantir a máxima transparência, qualidade e alinhamento na execução do projeto, o desenvolvimento rege-se pelas seguintes premissas técnicas:"
                : "Para viabilizar este modelo de assinatura contínua e acessível com infraestrutura de ponta, a relação rege-se pelas seguintes premissas de governança:"}
            </p>

            <div className="grid grid-cols-1 gap-3 text-xs text-slate-300">
              
              {isSoftwareDev ? (
                <>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">01</span>
                      Entregáveis e Escopo Fechado:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      O escopo compreende estritamente todos os itens listados no checklist técnico aprovado. Novas funcionalidades ou alterações solicitadas após o início poderão ser orçadas separadamente como sprints complementares.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">02</span>
                      Homologação e Aprovação:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Concluído o desenvolvimento, o cliente terá até 7 (sete) dias úteis para testar, validar e apontar eventuais inconformidades com o briefing aprovado antes da liberação final.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">03</span>
                      Direitos de Propriedade do Código-Fonte:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Após a liquidação integral dos valores previstos nesta proposta, todos os direitos de propriedade intelectual, repositórios Git e credenciais de acesso serão transferidos em definitivo para o cliente.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">04</span>
                      Garantia Técnica Pós-Entrega ({proposal.warrantyDays || 30} dias):
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Disponibilizamos prazo de garantia técnica de {proposal.warrantyDays || 30} dias corridos após a entrega para correção prioritária de eventuais bugs ou inconsistências operacionais sem qualquer custo extra.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">05</span>
                      Proteção de Dados e Confidencialidade (LGPD):
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Todas as informações comerciais, bases de dados e regras de negócio do cliente são resguardadas por sigilo estrito e conformidade total com a Lei Geral de Proteção de Dados.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">01</span>
                      Funcionamento Contínuo do Aplicativo:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      O aplicativo permanecerá em plena atividade, operacional e acessível aos usuários nas lojas e servidores enquanto a assinatura mensal estiver devidamente adimplida.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">02</span>
                      Vencimento Fixo & Inadimplência:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      O vencimento da mensalidade ocorre sempre no <strong>dia 15 de cada mês</strong>. Em caso de atraso injustificado superior a 10 (dez) dias corridos, os endpoints e painel administrativo poderão ser suspensos temporariamente até a regularização.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">03</span>
                      Liberação do Código-Fonte Exclusiva após 12 Meses:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      O código-fonte e repositórios são de titularidade da contratada durante o primeiro ano. A opção de aquisição e liberação definitiva ocorrerá exclusivamente após a conclusão do ciclo de 12 meses, mediante taxa fixa de {buyoutPrice || "R$ 1.500,00"}.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">04</span>
                      Ciclo Contínuo de Atualizações a Cada 30 Dias:
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Concluída a entrega inicial do aplicativo, a equipe técnica realizará revisões de desempenho, correções preventivas e subida de novas compilações para as lojas a cada 30 dias durante a vigência do plano.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <strong className="text-white flex items-center gap-2 font-bold">
                      <span className="h-5 w-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">05</span>
                      Resguardo dos Dados Cadastrais (LGPD):
                    </strong>
                    <p className="text-slate-300 pl-7 text-[11px] leading-relaxed">
                      Caso o cliente encerre o plano sem a compra do código-fonte após o período contratual, seus dados brutos e cadastrais serão integralmente exportados e entregues (formato CSV/JSON), preservando sua integridade.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 5: FINANCIAL SUMMARY TABLE                                        */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Resumo Financeiro & Condições do Contrato
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Tabela de Parâmetros</span>
          </div>

          <div className="overflow-hidden rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.05] border-b border-white/10 text-slate-300 font-bold text-[11px]">
                  <th className="p-4">Item / Parâmetro</th>
                  <th className="p-4">Especificação Técnica</th>
                  <th className="p-4 text-right">Condição / Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">
                    {hasMultipleOptions && activeOption
                      ? `Plano Selecionado: ${activeOption.name}`
                      : isSoftwareDev
                      ? "Investimento do Projeto"
                      : "Assinatura Recorrente"}
                  </td>
                  <td className="p-4 text-slate-400">
                    {hasMultipleOptions && activeOption
                      ? `Pacote escolhido pelo cliente com escopo e valores configurados`
                      : isSoftwareDev
                      ? "Desenvolvimento completo da solução com entrega e homologação"
                      : "Desenvolvimento, hospedagem, infraestrutura e suporte contínuo"}
                  </td>
                  <td className="p-4 text-right font-black font-mono text-emerald-400 text-sm sm:text-base">
                    {formattedPrice} {isRecurring ? "/ mês" : ""}
                  </td>
                </tr>

                {isSoftwareDev ? (
                  <>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Condições de Pagamento</td>
                      <td className="p-4 text-slate-400">{effectivePaymentTerms || "50% Entrada + 50% na Entrega Final"}</td>
                      <td className="p-4 text-right font-bold text-slate-200">Por Marcos</td>
                    </tr>

                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Propriedade do Código</td>
                      <td className="p-4 text-slate-400">Transferência dos repositórios Git e direitos intelectuais</td>
                      <td className="p-4 text-right font-bold text-emerald-400">100% do Cliente</td>
                    </tr>

                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Garantia Técnica</td>
                      <td className="p-4 text-slate-400">Suporte dedicado pós-deploy para ajustes e correções</td>
                      <td className="p-4 text-right font-bold text-slate-200">{(activeOption?.warrantyDays !== undefined ? activeOption.warrantyDays : proposal.warrantyDays) || 30} Dias</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Data de Vencimento</td>
                      <td className="p-4 text-slate-400">Vencimento mensal padronizado das faturas</td>
                      <td className="p-4 text-right font-bold text-emerald-400">Todo dia 15</td>
                    </tr>

                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Vigência Mínima</td>
                      <td className="p-4 text-slate-400">Período de fidelidade contratual com garantia de estabilidade</td>
                      <td className="p-4 text-right font-bold text-slate-200">12 Meses</td>
                    </tr>

                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Publicação Oficial</td>
                      <td className="p-4 text-slate-400">Homologação e publicação nas lojas Google Play e App Store</td>
                      <td className="p-4 text-right font-bold text-emerald-400">Inclusa no plano</td>
                    </tr>

                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">Ciclo de Atualizações</td>
                      <td className="p-4 text-slate-400">Envio de melhorias e novas compilações às lojas</td>
                      <td className="p-4 text-right font-bold text-slate-200">A cada 30 dias</td>
                    </tr>

                    {buyoutPrice && (
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white">Taxa de Liberação (Buyout)</td>
                        <td className="p-4 text-slate-400">Cessão definitiva de código-fonte (habilitada após 12 meses)</td>
                        <td className="p-4 text-right font-bold text-slate-200">{buyoutPrice} (única)</td>
                      </tr>
                    )}
                  </>
                )}

                {effectiveTimeline && (
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">Prazo de Lançamento</td>
                    <td className="p-4 text-slate-400">
                      {isSoftwareDev ? "Versão final pronta para produção e homologação" : "Versão funcional operacional publicada nas lojas oficiais"}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-200">{effectiveTimeline}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION 6: NEXT STEPS & ACCEPTANCE CALL TO ACTION                         */}
        {/* ------------------------------------------------------------------------- */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden print:hidden space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Próximos Passos Para Início Imediato do Projeto
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Ao confirmar o aceite desta proposta comercial, daremos início à elaboração da minuta formal do <strong>Contrato de Prestação de Serviços</strong> com os anexos de escopo funcional e cronograma de entregas para assinatura jurídica.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <div className="text-xs text-slate-400">
              Dúvidas ou personalizações de escopo? Fale diretamente com a desenvolvedora responsável.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-white/20 active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>Salvar PDF</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group overflow-hidden flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black tracking-wide shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] border border-emerald-400/50 hover:border-emerald-300 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                {/* Light Sweep Sheen Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                <div className="relative flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white fill-white/20 shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-200 animate-ping pointer-events-none" />
                </div>
                <span className="relative">Aprovar & Iniciar Projeto</span>
                <ArrowRight className="h-4 w-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Executive Footer */}
        <footer className="text-center pt-4 pb-8 space-y-1 text-xs text-slate-400 font-mono print:border-t print:border-slate-200 print:pt-4">
          <p className="font-semibold text-slate-400">
            Maira Reis • Studio Digital • Proposta Oficial Ref: {proposal.docNumber}
          </p>
          <p className="text-[10px]">
            Documento digital oficial gerado com segurança e integridade de dados.
          </p>
        </footer>

      </main>
    </div>
  );
}
