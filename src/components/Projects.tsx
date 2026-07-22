"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Car,
  FileText,
  MapPin,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Package,
  BookOpen,
  Sliders,
  Layers,
  Activity
} from "lucide-react";

interface MobileProject {
  id: string;
  title: string;
  shortName: string;
  category: string;
  tagline: string;
  overview: string;
  highlightMetric: string;
  featureCards: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  images?: string[];
  mockupScreens: {
    tabName: string;
    icon: React.ReactNode;
    screenTitle: string;
    screenSubtitle: string;
    image?: string;
    previewContent: {
      headerBg: string;
      cardTitle: string;
      cardDetail: string;
      actionText: string;
      stats?: string;
    };
  }[];
}

export default function Projects() {
  const projects: MobileProject[] = [
    {
      id: "celeste-exoticos",
      title: "Celeste Exóticos",
      shortName: "Celeste Exóticos",
      category: "Gestão de Ecossistemas & Pets Exóticos",
      tagline: "Automação de Terrários, Controle de Manejo & Saúde para Herpetologia",
      overview: "O Celeste Exóticos é uma plataforma completa desenvolvida para tutores de répteis, aves e animais exóticos. Centraliza a automação de terrários (temperatura, umidade e UVB), histórico de alimentação, registros de ecdise (troca de pele), controle de estoque de insumos e um guia de parâmetros climáticos por espécie.",
      highlightMetric: "100% Automação do Terrário",
      images: [],
      featureCards: [
        {
          icon: <Zap className="text-indigo-400" size={20} />,
          title: "Controle de Terrário",
          description: "Monitoramento de temperatura, umidade, lâmpada UVB, aquecedor e nebulizador."
        },
        {
          icon: <Activity className="text-purple-400" size={20} />,
          title: "Manejo & Nutrição",
          description: "Registros de alimentação, taxa de aceitação, evolução de peso e ciclo de ecdise."
        },
        {
          icon: <Package className="text-pink-400" size={20} />,
          title: "Estoque & Espécies",
          description: "Alertas de insumos em nível crítico e guia prático com parâmetros climáticos por animal."
        }
      ],
      mockupScreens: [
        {
          tabName: "Dashboard",
          icon: <Sparkles size={14} />,
          screenTitle: "Painel Principal",
          screenSubtitle: "Resumo Geral do Ecosistema",
          image: "/images/celeste/celeste-1.jpg",
          previewContent: { headerBg: "from-indigo-600 to-purple-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Alertas",
          icon: <Bell size={14} />,
          screenTitle: "Alertas & Manejo",
          screenSubtitle: "Notificações e Rotina",
          image: "/images/celeste/celeste-2.jpg",
          previewContent: { headerBg: "from-purple-600 to-pink-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Ficha Pet",
          icon: <Smartphone size={14} />,
          screenTitle: "Ficha do Animal",
          screenSubtitle: "Idade, Convivência e Ações Rápidas",
          image: "/images/celeste/celeste-3.jpg",
          previewContent: { headerBg: "from-pink-600 to-rose-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Meus Pets",
          icon: <Layers size={14} />,
          screenTitle: "Lista de Pets",
          screenSubtitle: "Répteis, Mamíferos e Aves",
          image: "/images/celeste/celeste-4.jpg",
          previewContent: { headerBg: "from-indigo-600 to-blue-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Timeline",
          icon: <FileText size={14} />,
          screenTitle: "Linha do Tempo",
          screenSubtitle: "Histórico de Alimentação e Manejos",
          image: "/images/celeste/celeste-5.jpg",
          previewContent: { headerBg: "from-blue-600 to-cyan-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Relatórios",
          icon: <Activity size={14} />,
          screenTitle: "Crescimento & Saúde",
          screenSubtitle: "Evolução de Peso e Taxa de Aceitação",
          image: "/images/celeste/celeste-6.jpg",
          previewContent: { headerBg: "from-cyan-600 to-teal-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Terrário",
          icon: <Zap size={14} />,
          screenTitle: "Configuração do Terrário",
          screenSubtitle: "Temperatura, Umidade e UVB",
          image: "/images/celeste/celeste-7.jpg",
          previewContent: { headerBg: "from-teal-600 to-emerald-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Dispositivos",
          icon: <Sliders size={14} />,
          screenTitle: "Painel de Dispositivos",
          screenSubtitle: "Iluminação, Aquecedor e Bombas",
          image: "/images/celeste/celeste-8.jpg",
          previewContent: { headerBg: "from-emerald-600 to-green-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Estoque",
          icon: <Package size={14} />,
          screenTitle: "Estoque de Alimentos",
          screenSubtitle: "Controle de Insumos e Alerta Crítico",
          image: "/images/celeste/celeste-9.jpg",
          previewContent: { headerBg: "from-amber-600 to-orange-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Menu",
          icon: <Smartphone size={14} />,
          screenTitle: "Navegação Principal",
          screenSubtitle: "Menu de Acesso Rápido",
          image: "/images/celeste/celeste-10.jpg",
          previewContent: { headerBg: "from-purple-600 to-indigo-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Espécies",
          icon: <BookOpen size={14} />,
          screenTitle: "Catálogo de Espécies",
          screenSubtitle: "Parâmetros Recomendados por Animal",
          image: "/images/celeste/celeste-11.jpg",
          previewContent: { headerBg: "from-indigo-600 to-purple-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Notificações",
          icon: <Bell size={14} />,
          screenTitle: "Preferências de Notificações",
          screenSubtitle: "Lembretes Automáticos",
          image: "/images/celeste/celeste-12.jpg",
          previewContent: { headerBg: "from-pink-600 to-rose-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Ajustes",
          icon: <Sliders size={14} />,
          screenTitle: "Personalização & Temas",
          screenSubtitle: "Modo Escuro e Cores de Destaque",
          image: "/images/celeste/celeste-13.jpg",
          previewContent: { headerBg: "from-purple-600 to-pink-600", cardTitle: "", cardDetail: "", actionText: "" }
        }
      ]
    },
    {
      id: "rotavip",
      title: "RotaVip",
      shortName: "RotaVip",
      category: "Logística & Otimização de Entregas",
      tagline: "Otimização Inteligente de Rotas Multiparadas por Proximidade GPS",
      overview: "O RotaVip é uma plataforma logística desenvolvida para entregadores e frotas urbanas. Ele calcula automaticamente o trajeto mais rápido entre múltiplas paradas por proximidade GPS, organizando a sequência de entregas de partida a chegada para reduzir o tempo em trânsito e economizar combustível.",
      highlightMetric: "Trajetos 100% Otimizados",
      featureCards: [
        {
          icon: <MapPin className="text-blue-400" size={20} />,
          title: "Rotas por Proximidade",
          description: "Algoritmo inteligente que reordena a sequência de entregas para menor distância."
        },
        {
          icon: <Zap className="text-indigo-400" size={20} />,
          title: "Navegação GPS em Tempo Real",
          description: "Mapa interativo com visualização da rota inteira, paradas e tempo estimado."
        },
        {
          icon: <CheckCircle2 className="text-cyan-400" size={20} />,
          title: "Gestão & Check-in de Paradas",
          description: "Acompanhamento da lista de entregas com marcação de conclusão e edição rápida."
        }
      ],
      mockupScreens: [
        {
          tabName: "Início",
          icon: <Car size={14} />,
          screenTitle: "Painel Principal",
          screenSubtitle: "Resumo de Rotas & Status de Entregas",
          image: "/images/rotavip/rotavip-1.jpg",
          previewContent: { headerBg: "from-blue-600 to-indigo-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Minhas Rotas",
          icon: <MapPin size={14} />,
          screenTitle: "Minhas Rotas",
          screenSubtitle: "Rotas Rascunho, Otimizadas e em Andamento",
          image: "/images/rotavip/rotavip-2.jpg",
          previewContent: { headerBg: "from-indigo-600 to-purple-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Mapa GPS",
          icon: <MapPin size={14} />,
          screenTitle: "Detalhes da Rota & Mapa",
          screenSubtitle: "Trajeto em Tempo Real via GPS",
          image: "/images/rotavip/rotavip-3.jpg",
          previewContent: { headerBg: "from-purple-600 to-pink-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Paradas",
          icon: <FileText size={14} />,
          screenTitle: "Trajeto Otimizado",
          screenSubtitle: "Lista Sequencial de Paradas",
          image: "/images/rotavip/rotavip-4.jpg",
          previewContent: { headerBg: "from-cyan-600 to-blue-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Nova Rota",
          icon: <Sparkles size={14} />,
          screenTitle: "Criar Nova Rota",
          screenSubtitle: "Otimização Inteligente de Trajetos",
          image: "/images/rotavip/rotavip-5.jpg",
          previewContent: { headerBg: "from-blue-600 to-teal-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Perfil",
          icon: <Smartphone size={14} />,
          screenTitle: "Perfil do Usuário",
          screenSubtitle: "Personalização de Temas e Cores",
          image: "/images/rotavip/rotavip-6.jpg",
          previewContent: { headerBg: "from-indigo-600 to-purple-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Ajustes",
          icon: <Sliders size={14} />,
          screenTitle: "Filtros & Conta",
          screenSubtitle: "Localização de Rotas e Configurações",
          image: "/images/rotavip/rotavip-7.jpg",
          previewContent: { headerBg: "from-purple-600 to-pink-600", cardTitle: "", cardDetail: "", actionText: "" }
        }
      ]
    },
    {
      id: "prontuario-gearhead",
      title: "Prontuário Gearhead",
      shortName: "Prontuário Gearhead",
      category: "Gestão Automotiva & Virtual Dyno",
      tagline: "Garagem Virtual, Dinamômetro de Performance & Histórico de Manutenção",
      overview: "O Prontuário Gearhead é a plataforma definitiva para entusiastas automotivos e donos de projetos. Centraliza a Garagem Virtual com histórico de serviços e exportação em PDF, Virtual Dyno para estimativa de potência e torque, almoxarifado digital de peças, diário de bordo e análise financeira de custos por veículo.",
      highlightMetric: "Virtual Dyno & Gestão de Projetos",
      featureCards: [
        {
          icon: <Zap className="text-amber-400" size={20} />,
          title: "Virtual Dyno & Stages",
          description: "Estimativas de potência no motor e roda (WHP), torque (kgfm), 0 a 100 km/h e velocidade máxima."
        },
        {
          icon: <Activity className="text-rose-400" size={20} />,
          title: "Histórico & Almoxarifado",
          description: "Registros de serviços com comprovantes PDF, alertas de revisões/óleo e controle de peças."
        },
        {
          icon: <Sliders className="text-emerald-400" size={20} />,
          title: "Análise Financeira & Flex",
          description: "Divisão de custos entre manutenção, combustível e upgrades, além de calculadora flex de consumo."
        }
      ],
      mockupScreens: [
        {
          tabName: "Garagem",
          icon: <Car size={14} />,
          screenTitle: "Garagem Virtual",
          screenSubtitle: "Gerencie suas Máquinas e Diários de Bordo",
          image: "/images/gearhead/gearhead-1.jpg",
          previewContent: { headerBg: "from-red-600 to-amber-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Serviços",
          icon: <Sliders size={14} />,
          screenTitle: "Serviços & Upgrades",
          screenSubtitle: "Recomendações Inteligentes & Manutenção",
          image: "/images/gearhead/gearhead-2.jpg",
          previewContent: { headerBg: "from-rose-600 to-red-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Estatísticas",
          icon: <Activity size={14} />,
          screenTitle: "Análise de Despesas",
          screenSubtitle: "Resumo Financeiro & Divisão de Custos",
          image: "/images/gearhead/gearhead-3.jpg",
          previewContent: { headerBg: "from-amber-600 to-orange-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Dinamômetro",
          icon: <Zap size={14} />,
          screenTitle: "Virtual Dyno",
          screenSubtitle: "Estimativas de Potência (cv) e Torque",
          image: "/images/gearhead/gearhead-4.jpg",
          previewContent: { headerBg: "from-red-600 to-orange-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Histórico",
          icon: <FileText size={14} />,
          screenTitle: "Histórico de Serviços",
          screenSubtitle: "Registros Detalhados de Manutenção",
          image: "/images/gearhead/gearhead-5.jpg",
          previewContent: { headerBg: "from-orange-600 to-amber-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Almoxarifado",
          icon: <Package size={14} />,
          screenTitle: "Almoxarifado Digital",
          screenSubtitle: "Estoque de Peças de Reposição e Upgrades",
          image: "/images/gearhead/gearhead-6.jpg",
          previewContent: { headerBg: "from-red-600 to-rose-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Combustível",
          icon: <Activity size={14} />,
          screenTitle: "Rastreamento de Combustível",
          screenSubtitle: "Calculadora Flex & Histórico de Abastecimento",
          image: "/images/gearhead/gearhead-7.jpg",
          previewContent: { headerBg: "from-amber-600 to-red-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Diário",
          icon: <BookOpen size={14} />,
          screenTitle: "Diário de Bordo",
          screenSubtitle: "Avaliações Reais e Memórias Afetivas",
          image: "/images/gearhead/gearhead-8.jpg",
          previewContent: { headerBg: "from-rose-600 to-orange-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Menu",
          icon: <Smartphone size={14} />,
          screenTitle: "Menu da Garagem",
          screenSubtitle: "Acesso a Todos os Módulos",
          image: "/images/gearhead/gearhead-9.jpg",
          previewContent: { headerBg: "from-red-600 to-amber-600", cardTitle: "", cardDetail: "", actionText: "" }
        },
        {
          tabName: "Perfil",
          icon: <Smartphone size={14} />,
          screenTitle: "Meu Perfil",
          screenSubtitle: "Preferências e Sincronização Supabase",
          image: "/images/gearhead/gearhead-10.jpg",
          previewContent: { headerBg: "from-orange-600 to-rose-600", cardTitle: "", cardDetail: "", actionText: "" }
        }
      ]
    }
  ];

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  useEffect(() => {
    const currentProj = projects[activeProjectIndex];
    const timer = setInterval(() => {
      setActiveScreenIndex((prev) => (prev + 1) % currentProj.mockupScreens.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeProjectIndex, projects]);

  const activeProject = projects[activeProjectIndex];
  const activeScreen = activeProject.mockupScreens[activeScreenIndex] || activeProject.mockupScreens[0];

  return (
    <section id="projetos" className="py-10 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24 relative">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <Smartphone size={16} />
          <span>Experiência Mobile Interativa</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white"
        >
          Aplicativos Criados para <span className="text-gradient">Gerar Resultados</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 max-w-2xl text-base md:text-lg leading-relaxed"
        >
          Navegue abaixo para testar as telas no celular e ver como o design transforma a experiência do usuário.
        </motion.p>

        {/* Project Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProjectIndex(idx);
                setActiveScreenIndex(0);
              }}
              className={`px-6 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2.5 ${
                activeProjectIndex === idx
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                  : "glass-panel text-gray-300 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              <Smartphone size={16} />
              <span>{proj.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Interactive Smartphone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col items-center justify-center relative"
        >
          {/* Ambient Glow behind Smartphone */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />

          {/* Smartphone Hardware Frame */}
          <div className="phone-frame relative flex flex-col bg-slate-950 rounded-[44px] sm:rounded-[48px] overflow-hidden border-[10px] sm:border-[11px] border-[#1a2234] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(99,102,241,0.2)]">
            {/* iPhone Dynamic Island / Speaker Notch */}
            <div className="phone-island flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/60 animate-pulse" />
            </div>

            {/* Screen Content Animated Area */}
            <div className="w-full h-full flex-1 relative overflow-hidden bg-slate-950 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeProject.id}-${activeScreenIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  {activeScreen.image ? (
                    /* Real App Screenshot: Full Screen Display */
                    <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeScreen.image}
                        alt={activeScreen.screenTitle || "Celeste Exóticos Screen"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    /* Fallback Code Card UI for Projects without Screenshots */
                    <div className="w-full h-full p-4 pt-10 flex flex-col justify-between space-y-3">
                      {/* Phone Screen Status Bar */}
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">5G</span>
                          <div className="w-5 h-2.5 rounded-sm border border-gray-300 p-0.5 flex items-center">
                            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                          </div>
                        </div>
                      </div>

                      {/* Screen Header Banner */}
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${activeScreen.previewContent.headerBg} shadow-md`}>
                        <div className="flex items-center justify-between text-white/90 text-xs font-semibold mb-1">
                          <span>{activeScreen.screenTitle}</span>
                          <Sparkles size={14} />
                        </div>
                        <p className="text-white text-xs opacity-90 font-medium">
                          {activeScreen.screenSubtitle}
                        </p>
                      </div>

                      {/* Content Card */}
                      <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl shadow-inner space-y-3 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                          {activeScreen.icon}
                          <span>{activeScreen.previewContent.cardTitle}</span>
                        </div>

                        <p className="text-gray-300 text-xs leading-snug font-medium">
                          {activeScreen.previewContent.cardDetail}
                        </p>

                        <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
                          <span>{activeScreen.previewContent.actionText}</span>
                          <ChevronRight size={14} />
                        </div>

                        {activeScreen.previewContent.stats && (
                          <div className="text-[10px] text-gray-400 text-center font-medium">
                            {activeScreen.previewContent.stats}
                          </div>
                        )}
                      </div>

                      {/* Indicator bar */}
                      <div className="pb-1 flex justify-center">
                        <div className="w-28 h-1 bg-gray-400/50 rounded-full" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Visual & Clean Showcase */}
        <motion.div
          key={activeProject.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:pl-6"
        >
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
              {activeProject.category}
            </span>

            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <TrendingUp size={14} />
              {activeProject.highlightMetric}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {activeProject.title}
            </h3>
            <p className="text-indigo-300 font-semibold text-base sm:text-lg leading-snug">
              {activeProject.tagline}
            </p>
          </div>

          {/* Clean Overview Paragraph */}
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
            {activeProject.overview}
          </p>

          {/* 3 Modern Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {activeProject.featureCards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 glass-card-hover h-full"
              >
                <div className="p-2.5 rounded-xl bg-white/5 w-fit border border-white/10">
                  {card.icon}
                </div>
                <div className="flex-1 flex flex-col justify-start">
                  <h4 className="font-bold text-sm text-white mb-1.5">{card.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <a
              href="#contato"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Solicitar App Semelhante</span>
              <ArrowUpRight size={16} />
            </a>

            <a
              href="https://wa.me/553598030543"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-sm transition-all border border-white/10 hover:border-emerald-500/40 flex items-center gap-2 active:scale-95"
            >
              <MessageSquare size={16} className="text-emerald-400" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
