"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Globe,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Package,
  Sliders,
  Activity,
  Target,
  Lightbulb,
  Award,
  Clock,
  Layers,
  Code2,
  Rocket,
  ExternalLink,
  Lock,
} from "lucide-react";
import Link from "next/link";

export type ProjectType = "app" | "software" | "site";

export interface ProjectItem {
  id: string;
  type: ProjectType;
  title: string;
  shortName: string;
  category: string;
  tagline: string;
  liveUrl?: string;
  platforms: string[];
  challenge: string;
  solution: string;
  businessImpact: string;
  highlightMetric: string;
  techs: string[];
  featureCards: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  mockupScreens: {
    tabName: string;
    screenTitle: string;
    screenSubtitle: string;
    image?: string;
  }[];
}

const allProjects: ProjectItem[] = [
  // ==========================================
  // --- APPS MOBILE (ESTUDOS DE CASO REAIS) ---
  // ==========================================
  {
    id: "celeste-exoticos",
    type: "app",
    title: "Celeste Exóticos",
    shortName: "Celeste Exóticos",
    category: "App Mobile • Automação IoT & Manejo",
    tagline: "Controle Inteligente de Terrários, Monitoramento Biológico e Saúde para Animais Exóticos",
    platforms: ["iOS (App Store)", "Android (Google Play)", "Supabase Cloud"],
    challenge:
      "Tutores e criadores de répteis enfrentavam riscos constantes de perda de animais devido à dificuldade de controlar temperatura, umidade, ciclos UVB e rotinas alimentares rigorosas sem automação centralizada.",
    solution:
      "Desenvolvemos um ecossistema mobile nativo com conexão a sensores de terrário, alertas preditivos de temperatura fora do padrão, registros detalhados de alimentação e ecdise (troca de pele), além de um guia climático por espécie.",
    businessImpact:
      "Zero mortalidade por oscilação térmica em usuários monitorados, 90% de pontualidade no manejo alimentar e taxa de engajamento diário (DAU) superior a 82%.",
    highlightMetric: "100% Automação e Controle",
    techs: ["React Native", "TypeScript", "Supabase", "Tailwind CSS", "Push Notifications"],
    featureCards: [
      {
        icon: <Zap className="text-amber-400" size={20} />,
        title: "Automação de Terrários",
        description: "Controle e telemetria de temperatura, umidade, iluminação UVB e aquecedores em tempo real.",
      },
      {
        icon: <Activity className="text-purple-400" size={20} />,
        title: "Manejo & Saúde Biológica",
        description: "Histórico completo de alimentação, taxa de aceitação, pesagens e acompanhamento de ecdise.",
      },
      {
        icon: <Package className="text-pink-400" size={20} />,
        title: "Estoque & Alertas Críticos",
        description: "Avisos proativos de insumos em nível baixo e fichas técnicas completas com parâmetros ideais.",
      },
    ],
    mockupScreens: [
      {
        tabName: "Dashboard",
        screenTitle: "Painel Geral do Terrário",
        screenSubtitle: "Telemetria Climática e Rotina",
        image: "/images/celeste/celeste-1.jpg",
      },
      {
        tabName: "Alertas",
        screenTitle: "Alertas Críticos & Manejo",
        screenSubtitle: "Notificações em Tempo Real",
        image: "/images/celeste/celeste-2.jpg",
      },
      {
        tabName: "Ficha Pet",
        screenTitle: "Prontuário do Animal",
        screenSubtitle: "Idade, Convivência e Ações Rápidas",
        image: "/images/celeste/celeste-3.jpg",
      },
      {
        tabName: "Meus Pets",
        screenTitle: "Galeria de Animais",
        screenSubtitle: "Répteis, Mamíferos e Aves",
        image: "/images/celeste/celeste-4.jpg",
      },
      {
        tabName: "Relatórios",
        screenTitle: "Evolução e Pesagem",
        screenSubtitle: "Gráficos de Crescimento e Saúde",
        image: "/images/celeste/celeste-6.jpg",
      },
    ],
  },
  {
    id: "rotavip",
    type: "app",
    title: "RotaVip Logística",
    shortName: "RotaVip Logística",
    category: "App Mobile • Otimização de Frotas & GPS",
    tagline: "Roteirização Inteligente Multiparadas em Tempo Real por Proximidade e Menor Distância",
    platforms: ["Android (Google Play)", "iOS (App Store)", "Google Maps API"],
    challenge:
      "Entregadores e pequenas transportadoras perdiam horas diárias e desperdiçavam combustível calculando rotas manuais e enfrentando desorganização na ordem sequencial de paradas.",
    solution:
      "Criamos um aplicativo com algoritmo proprietário de ordenação inteligente que calcula o trajeto mais eficiente entre múltiplas entregas com navegação GPS em tempo real e check-in de comprovante.",
    businessImpact:
      "Redução comprovada de até 35% nos custos com combustível e economia de mais de 2 horas diárias no tempo total de rotas urbanas.",
    highlightMetric: "Rotas 35% Mais Rápidas",
    techs: ["React Native", "Expo", "Google Maps API", "TypeScript", "Node.js"],
    featureCards: [
      {
        icon: <MapPin className="text-blue-400" size={20} />,
        title: "Otimização por Proximidade",
        description: "Reordena a sequência de entregas instantaneamente para o menor trajeto viável.",
      },
      {
        icon: <Zap className="text-indigo-400" size={20} />,
        title: "Navegação GPS em Tempo Real",
        description: "Mapa interativo com estimativa de chegada (ETA) e visualização de cada ponto de entrega.",
      },
      {
        icon: <CheckCircle2 className="text-emerald-400" size={20} />,
        title: "Check-in & Comprovante",
        description: "Confirmação de entrega com registro de horário, observações e status atualizado.",
      },
    ],
    mockupScreens: [
      {
        tabName: "Dashboard",
        screenTitle: "Resumo de Rotas",
        screenSubtitle: "Status de Entregas e Produtividade",
        image: "/images/rotavip/rotavip-1.jpg",
      },
      {
        tabName: "Minhas Rotas",
        screenTitle: "Lista de Rotas do Dia",
        screenSubtitle: "Rascunhos, Ativas e Concluídas",
        image: "/images/rotavip/rotavip-2.jpg",
      },
      {
        tabName: "Mapa GPS",
        screenTitle: "Navegação em Tempo Real",
        screenSubtitle: "Trajeto Otimizado no Mapa",
        image: "/images/rotavip/rotavip-3.jpg",
      },
      {
        tabName: "Paradas",
        screenTitle: "Sequência de Entregas",
        screenSubtitle: "Check-in Rápido de Destinos",
        image: "/images/rotavip/rotavip-4.jpg",
      },
    ],
  },
  {
    id: "prontuario-gearhead",
    type: "app",
    title: "Prontuário Gearhead",
    shortName: "Prontuário Gearhead",
    category: "App Mobile • Gestão Automotiva & Dyno",
    tagline: "Garagem Virtual, Dinamômetro Digital de Potência e Histórico Completo de Manutenções",
    platforms: ["iOS (App Store)", "Android (Google Play)", "PostgreSQL"],
    challenge:
      "Donos de projetos automotivos e entusiastas não tinham como documentar manutenções, calcular ganhos reais de torque/potência após modificações e comprovar a valorização do veículo.",
    solution:
      "Desenvolvemos a plataforma móvel definitiva com Garagem Virtual, Virtual Dyno para estimativa precisa de potência na roda (WHP) e motor (cv), diário de bordo e exportação de laudo em PDF.",
    businessImpact:
      "Valorização média de 20% na revenda comprovada por histórico técnico e 100% de controle sobre despesas de revisões e upgrades.",
    highlightMetric: "Virtual Dyno & Gestão Total",
    techs: ["React Native", "TypeScript", "Supabase", "Tailwind CSS", "PDF Generation"],
    featureCards: [
      {
        icon: <Zap className="text-amber-400" size={20} />,
        title: "Virtual Dyno & Stages",
        description: "Estimativa de torque (kgfm), potência (cv/whp) e aceleração de 0 a 100 km/h.",
      },
      {
        icon: <Activity className="text-rose-400" size={20} />,
        title: "Histórico & Almoxarifado",
        description: "Registros de peças instaladas, notas fiscais, revisões e emissão de laudo em PDF.",
      },
      {
        icon: <Sliders className="text-emerald-400" size={20} />,
        title: "Análise Financeira & Flex",
        description: "Controle de despesas categorizadas e cálculo de rendimento de combustível.",
      },
    ],
    mockupScreens: [
      {
        tabName: "Garagem",
        screenTitle: "Garagem Virtual",
        screenSubtitle: "Máquinas Cadastradas & Status",
        image: "/images/gearhead/gearhead-1.jpg",
      },
      {
        tabName: "Serviços",
        screenTitle: "Histórico de Serviços",
        screenSubtitle: "Manutenções e Upgrades de Performance",
        image: "/images/gearhead/gearhead-2.jpg",
      },
      {
        tabName: "Estatísticas",
        screenTitle: "Divisão de Custos",
        screenSubtitle: "Gráficos Financeiros e Combustível",
        image: "/images/gearhead/gearhead-3.jpg",
      },
      {
        tabName: "Dinamômetro",
        screenTitle: "Virtual Dyno",
        screenSubtitle: "Estimativas de Curva de Torque e CV",
        image: "/images/gearhead/gearhead-4.jpg",
      },
    ],
  },
  // ==========================================
  // --- SITES & LANDING PAGES (PROJETOS REAIS) ---
  // ==========================================
  {
    id: "celeste-exoticos-site",
    type: "site",
    title: "Celeste Exóticos • Website & Portal",
    shortName: "Celeste Exóticos Web",
    category: "Landing Page • Conversão & Aquisição",
    tagline: "Engenharia de Frontend & UX/UI de Alta Performance para o Ecossistema de Animais Exóticos",
    liveUrl: "https://www.celesteexoticos.com.br/",
    platforms: ["Web Desktop", "Mobile Responsive", "Vercel Cloud", "SEO 100%"],
    challenge:
      "Apresentar uma solução tecnológica pioneira para tutores e criadores de animais exóticos, comunicando credibilidade veterinária e convertendo visitantes casuais em usuários ativos do aplicativo.",
    solution:
      "Desenvolvimento de landing page de alta conversão com design dark sofisticado, apresentação estruturada dos módulos de telemetria, tabela comparativa de planos e integração direta com canais de atendimento.",
    businessImpact:
      "Carregamento sub-segundo (< 0.8s), taxa de conversão superior a 14% e experiência visual imersiva e responsiva.",
    highlightMetric: "Sub-segundo & 14% Conversão",
    techs: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "SEO & Core Web Vitals"],
    featureCards: [
      {
        icon: <Globe className="text-emerald-400" size={20} />,
        title: "Alta Performance & SEO",
        description: "Estrutura otimizada para motores de busca com pontuação máxima no Google PageSpeed.",
      },
      {
        icon: <Sparkles className="text-teal-400" size={20} />,
        title: "Design Dark & Glassmorphism",
        description: "Identidade visual sofisticada com acabamento moderno, legibilidade e micro-interações fluidas.",
      },
      {
        icon: <Rocket className="text-indigo-400" size={20} />,
        title: "Conversão & Captação Direta",
        description: "Gatilhos estratégicos de conversão para download do app e canais comerciais no WhatsApp.",
      },
    ],
    mockupScreens: [],
  },
  {
    id: "nb-assessoria-site",
    type: "site",
    title: "NB Assessoria • Regulatória & ANVISA",
    shortName: "NB Assessoria Web",
    category: "Website Corporativo • B2B & Conversão",
    tagline: "Consultoria e Suporte Técnico Especializado em Vigilância Sanitária, AFE e Regularização",
    liveUrl: "https://www.nb-assessoria.com/",
    platforms: ["Web Desktop", "Mobile Responsive", "Vercel Cloud", "SEO 100%"],
    challenge:
      "Construir uma presença digital institucional de alta autoridade para uma consultoria regulatória, desmistificando trâmites complexos da ANVISA e convertendo empresários e indústrias em clientes recorrentes.",
    solution:
      "Desenvolvimento de website institucional moderno com arquitetura de informação clara sobre serviços (AFE, LTA, Cosméticos, Saneantes), diagnósticos regulatórios, gatilhos de confiança B2B e botão de contato rápido via WhatsApp.",
    businessImpact:
      "Aumento expressivo no volume de pedidos de orçamentos qualificados via WhatsApp, carregamento instantâneo (< 0.7s) e indexação de destaque no Google para termos regulatórios regionais e nacionais.",
    highlightMetric: "< 0.7s & Conversão B2B",
    techs: ["React", "TypeScript", "Tailwind CSS", "Vite", "SEO & Performance", "Vercel"],
    featureCards: [
      {
        icon: <ShieldCheck className="text-emerald-400" size={20} />,
        title: "Autoridade Regulatória & B2B",
        description: "Design corporativo refinado focado em transmitir credibilidade técnica imediata junto à ANVISA.",
      },
      {
        icon: <Zap className="text-teal-400" size={20} />,
        title: "Carregamento Ultrarrápido",
        description: "Arquitetura frontend enxuta com tempo de resposta sub-segundo e 100% no PageSpeed.",
      },
      {
        icon: <Target className="text-indigo-400" size={20} />,
        title: "Captação Direta de Leads",
        description: "Fluxos de conversão rápida e formulários integrados ao canal de atendimento dos consultores.",
      },
    ],
    mockupScreens: [],
  },
];

// Single Case Study Card rendered in a vertical stack
function ProjectCaseCard({ project, index }: { project: ProjectItem; index: number }) {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const activeScreen = project.mockupScreens[activeScreenIndex] || project.mockupScreens[0];
  const isSite = project.type === "site" || project.type === "software";
  const domain = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "projeto-online.com";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.05 * index }}
      className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-900/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Decorative Index Watermark */}
      <div className="absolute top-4 right-6 text-5xl sm:text-7xl font-black text-white/[0.03] select-none pointer-events-none">
        0{index + 1}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Hardware / Device Frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl -z-10" />

          {isSite ? (
            /* DESKTOP BROWSER / ARCHITECTURE SHOWCASE CARD (SEM IMAGENS EXTERNAS) */
            <div className="w-full max-w-lg lg:max-w-none flex flex-col bg-slate-950/90 rounded-3xl overflow-hidden border border-emerald-500/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.15)]">
              {/* Browser Bar */}
              <div className="bg-slate-900/95 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 max-w-[260px] bg-slate-950/90 border border-white/10 rounded-lg px-3 py-1 flex items-center justify-center gap-2 text-[11px] text-gray-300">
                  <Lock size={11} className="text-emerald-400 shrink-0" />
                  <span className="truncate font-mono">{domain}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Project Summary & Technical Delivery Panel */}
              <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-gradient-to-b from-slate-900/60 to-slate-950/90 text-left">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                    <Globe size={13} className="text-emerald-400" />
                    <span>{project.category}</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {project.title}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {project.tagline}
                  </p>
                </div>

                {/* 4 Feature Highlights */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Zap size={13} />
                      <span>Performance &lt; 0.8s</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">Carregamento instantâneo e PageSpeed otimizado.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                      <Target size={13} />
                      <span>Foco em Conversão</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">Gatilhos estratégicos de contato e captação.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                      <Sparkles size={13} />
                      <span>Design de Autoridade</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">Visual refinado e comunicação institucional de impacto.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-pink-400 text-xs font-bold">
                      <ShieldCheck size={13} />
                      <span>100% Responsivo</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">Experiência perfeita em desktop, tablet e celular.</p>
                  </div>
                </div>

                {/* Main Direct Action Button */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 group text-center mt-2"
                  >
                    <span>Visitar Site Oficial ({domain})</span>
                    <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* SMARTPHONE FRAME */
            <div className="phone-frame relative flex flex-col bg-slate-950 rounded-[44px] sm:rounded-[48px] overflow-hidden border-[10px] sm:border-[11px] border-[#1a2234] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(99,102,241,0.2)]">
              {/* Dynamic Island */}
              <div className="phone-island flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500/60 animate-pulse" />
              </div>

              {/* Screen Content */}
              <div className="w-full h-full flex-1 relative overflow-hidden bg-slate-950 flex flex-col justify-between">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${project.id}-${activeScreenIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full flex flex-col justify-between"
                  >
                    {activeScreen?.image ? (
                      <div className="w-full h-full relative overflow-hidden bg-[#070a09] flex items-center justify-center pt-8 pb-1 px-1">
                        <img
                          src={activeScreen.image}
                          alt={activeScreen.screenTitle || "Screen Mockup"}
                          decoding="async"
                          loading="eager"
                          className="w-full h-full object-contain rounded-b-[24px]"
                        />
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Screen Selector Tabs for this specific project */}
          {project.mockupScreens.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {project.mockupScreens.map((screen, sIdx) => (
                <button
                  key={screen.tabName}
                  onClick={() => setActiveScreenIndex(sIdx)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeScreenIndex === sIdx
                      ? isSite ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40" : "bg-indigo-500 text-white shadow-md shadow-indigo-500/40"
                      : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {screen.tabName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Case Information */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-5 lg:pl-4">
          {/* Badges & Platforms */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 max-w-full">
            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm text-center ${
              isSite
                ? "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30"
                : "text-indigo-300 bg-indigo-500/15 border border-indigo-500/30"
            }`}>
              {project.category}
            </span>

            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm text-center">
              <TrendingUp size={14} />
              {project.highlightMetric}
            </span>

            {project.platforms.map((plat) => (
              <span key={plat} className="text-[11px] font-semibold text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {plat}
              </span>
            ))}
          </div>

          {/* Title & Tagline & Live Link Button */}
          <div className="space-y-2 text-center lg:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {project.title}
              </h3>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 group shrink-0"
                >
                  <span>Acessar Site Ao Vivo</span>
                  <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
            <p className="text-indigo-300 font-semibold text-xs sm:text-sm leading-snug">
              {project.tagline}
            </p>
          </div>

          {/* 3 Executive Breakdown Cards: Desafio, Solução, Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-1">
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1.5">
                  <Target size={14} />
                  <span>O Desafio</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{project.challenge}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs mb-1.5">
                  <Lightbulb size={14} />
                  <span>A Solução</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{project.solution}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1.5">
                  <Award size={14} />
                  <span>Impacto Real</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{project.businessImpact}</p>
              </div>
            </div>
          </div>

          {/* 3 Core Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 w-full">
            {project.featureCards.map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col items-center lg:items-start text-center lg:text-left justify-between space-y-2 h-full"
              >
                <div className="p-2 rounded-xl bg-white/5 w-fit border border-white/10 mx-auto lg:mx-0">
                  {card.icon}
                </div>
                <div className="flex-1 flex flex-col justify-start w-full">
                  <h4 className="font-bold text-xs text-white mb-1">{card.title}</h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1">
            {project.techs.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// "Em Breve" Section Component for Softwares & Sistemas
function SoftwareComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-slate-900/70 border border-indigo-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl text-center relative overflow-hidden max-w-4xl mx-auto"
    >
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Clock size={15} className="text-amber-400 animate-pulse" />
          <span>PROJETOS EM DESENVOLVIMENTO & NDA</span>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 shadow-inner">
          <Laptop size={44} className="text-indigo-400" />
        </div>

        <div className="space-y-2 max-w-2xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Softwares Web & Sistemas SaaS
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Nossos novos cases de painéis administrativos corporativos, plataformas SaaS e sistemas de gestão integrada estão em fase final de homologação e produção sob acordos de confidencialidade (NDA).
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Code2 size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Sistemas Sob Medida</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Automação de rotinas operacionais, gestão de turmas, frotas e financeiro.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
              <ShieldCheck size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Segurança & LGPD</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Bancos em nuvem criptografados, autenticação robusta e alta disponibilidade.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 w-fit">
              <Layers size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Dashboards em Tempo Real</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Métricas executivas, relatórios financeiros e controle de equipes.</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/contato"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <span>Solicitar Orçamento de Software</span>
            <ArrowUpRight size={15} />
          </Link>

          <a
            href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20conversar%20sobre%20um%20projeto%20de%20Software/Sistema."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// "Em Breve" Section Component for Sites & Landing Pages
function SiteComingSoon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-slate-900/70 border border-emerald-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl text-center relative overflow-hidden max-w-4xl mx-auto"
    >
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Clock size={15} className="text-amber-400 animate-pulse" />
          <span>PROJETOS EM DESENVOLVIMENTO & LANÇAMENTO</span>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-white/10 shadow-inner">
          <Globe size={44} className="text-emerald-400" />
        </div>

        <div className="space-y-2 max-w-2xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Websites Institucionais & Landing Pages
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Nossos novos cases de sites institucionais de alto padrão, landing pages focadas em conversão máxima e portais corporativos estão em fase final de lançamento e produção.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Sparkles size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Design Dark de Luxo</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Visual refinado com glassmorphism que eleva a percepção de autoridade da marca.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
              <Rocket size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">SEO & Performance &lt; 1s</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Pontuação máxima no Google PageSpeed e indexação rápida nos buscadores.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Target size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white">Alta Conversão</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">Formulários integrados ao WhatsApp e gatilhos para transformar visitantes em clientes.</p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <Link
            href="/contato"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <span>Solicitar Orçamento de Website</span>
            <ArrowUpRight size={15} />
          </Link>

          <a
            href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20conversar%20sobre%20um%20projeto%20de%20Website/Landing%20Page."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectType>("app");

  // Preload images
  useEffect(() => {
    if (typeof window !== "undefined") {
      allProjects.forEach((proj) => {
        proj.mockupScreens.forEach((screen) => {
          if (screen.image) {
            const img = new Image();
            img.src = screen.image;
          }
        });
      });
    }
  }, []);

  return (
    <section id="projetos" className="py-4 md:py-6 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto scroll-mt-24 relative">
      {/* Ambient Glow */}
      <div className="hidden sm:block absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2.5"
        >
          <Sparkles size={15} className="text-amber-400" />
          <span>PORTFÓLIO & ESTUDOS DE CASO</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white"
        >
          Meus Projetos: <span className="text-gradient">Apps, Softwares & Sites</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 max-w-2xl text-xs sm:text-sm leading-relaxed mx-auto mb-6"
        >
          Selecione a categoria para conhecer as soluções entregues, seus desafios técnicos e impacto de negócio.
        </motion.p>

        {/* 3 Categories Selector: Apps Mobile / Softwares & Sistemas / Sites & Landing Pages */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("app")}
            className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              selectedCategory === "app"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 font-bold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Smartphone size={14} />
            <span>Apps Mobile</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === "app" ? "bg-white/20 text-white font-bold" : "bg-white/5 text-gray-400"}`}>
              {allProjects.filter((p) => p.type === "app").length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory("software")}
            className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              selectedCategory === "software"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 font-bold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Laptop size={14} />
            <span>Softwares & Sistemas</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategory === "software" ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
              Em breve
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory("site")}
            className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
              selectedCategory === "site"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-500/30 font-bold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={14} />
            <span>Sites & Landing Pages</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === "site" ? "bg-white/20 text-white font-bold" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
              {allProjects.filter((p) => p.type === "site").length}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {selectedCategory === "software" ? (
        <SoftwareComingSoon />
      ) : selectedCategory === "site" ? (
        allProjects.filter((p) => p.type === "site").length > 0 ? (
          <div className="space-y-10 md:space-y-12">
            {allProjects
              .filter((p) => p.type === "site")
              .map((project, index) => (
                <ProjectCaseCard key={project.id} project={project} index={index} />
              ))}
          </div>
        ) : (
          <SiteComingSoon />
        )
      ) : (
        <div className="space-y-10 md:space-y-12">
          {allProjects
            .filter((p) => p.type === "app")
            .map((project, index) => (
              <ProjectCaseCard key={project.id} project={project} index={index} />
            ))}
        </div>
      )}
    </section>
  );
}
