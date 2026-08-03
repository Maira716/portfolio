"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Smartphone,
  Globe,
  Layout,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  MessageSquare,
  ChevronDown,
  Star,
  Award,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  Code2,
  Palette
} from "lucide-react";

interface ProjectPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  popular: boolean;
  icon: any;
  badgeColor: string;
  description: string;
  deliveryTime: string;
  features: string[];
  whatsappMsg: string;
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"project" | "retainer">("project");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const projectPackages: ProjectPackage[] = [
    {
      id: "landing",
      name: "Landing Page & Site Institucional",
      tagline: "Presença digital de alta conversão",
      price: "1.000",
      period: "a partir de / módulo base",
      popular: false,
      icon: Globe,
      badgeColor: "from-blue-500 to-indigo-500",
      description: "Ideal para profissionais, startups e empresas que precisam de um site moderno, rápido e otimizado.",
      deliveryTime: "10 a 20 dias",
      features: [
        "Design UX/UI exclusivo no Figma",
        "Desenvolvimento 100% responsivo (Mobile & Desktop)",
        "Otimização de alta velocidade & SEO básico",
        "Integração com WhatsApp, Formulários e Redes",
        "Animações suaves e visual premium",
        "Suporte técnico de 30 dias pós-entrega"
      ],
      whatsappMsg: "Olá Maira! Gostaria de um orçamento para o pacote Landing Page & Site (a partir de R$ 1.000,00)."
    },
    {
      id: "app",
      name: "Aplicativo Mobile",
      tagline: "Experiência completa para iOS & Android",
      price: "4.000",
      period: "a partir de / módulos essenciais",
      popular: true,
      icon: Smartphone,
      badgeColor: "from-indigo-500 via-purple-500 to-pink-500",
      description: "O pacote ideal para criar um aplicativo marcante, desde o design de telas até o desenvolvimento frontend em React Native / Flutter.",
      deliveryTime: "30 a 60 dias",
      features: [
        "Arquitetura da Informação & User Flow completo",
        "Protótipo Interativo no Figma (100% clicável)",
        "Design System dedicado com componentes reutilizáveis",
        "Interface moderna para iOS & Android",
        "Handoff detalhado e pronto para desenvolvedores",
        "Auxílio no processo de publicação nas lojas (App Store / Google Play)",
        "Suporte pós-lançamento de 45 dias"
      ],
      whatsappMsg: "Olá Maira! Tenho interesse no pacote de Aplicativo Mobile (a partir de R$ 4.000,00)."
    },
    {
      id: "saas",
      name: "Plataforma Web & SaaS",
      tagline: "Dashboards e sistemas web complexos",
      price: "2.500",
      period: "a partir de / módulos avançados",
      popular: false,
      icon: Layout,
      badgeColor: "from-purple-500 to-pink-500",
      description: "Desenvolvido para produtos digitais escaláveis com múltiplos níveis de usuário, dashboards e fluxos avançados.",
      deliveryTime: "30 a 60 dias",
      features: [
        "Mapeamento de jornada do usuário e testes de usabilidade",
        "Design de Dashboards, Painéis e Tabelas interativas",
        "Design System completo no Figma (Tokens & Componentes)",
        "Código Frontend moderno em Next.js / React",
        "Documentação técnica e especificação de APIs",
        "Suporte estendido de 60 dias pós-entrega"
      ],
      whatsappMsg: "Olá Maira! Quero saber mais sobre o pacote Plataforma Web & SaaS (a partir de R$ 2.500,00)."
    },
    {
      id: "redesign",
      name: "Consultoria & Redesign UX/UI",
      tagline: "Revitalize e aumente a conversão do seu produto",
      price: "1.500",
      period: "a partir de / projeto inicial",
      popular: false,
      icon: Layers,
      badgeColor: "from-emerald-500 to-teal-500",
      description: "Perfeito para apps ou plataformas existentes que precisam melhorar a usabilidade, estética e retenção de usuários.",
      deliveryTime: "10 a 20 dias",
      features: [
        "Auditoria heurística detalhada do produto atual",
        "Mapeamento de pontos de fricção e abandono",
        "Novo visual moderno, limpo e acessível",
        "Protótipo comparativo Antes x Depois no Figma",
        "Relatório estratégico com recomendações de produto"
      ],
      whatsappMsg: "Olá Maira! Gostaria de agendar uma Consultoria & Redesign UX/UI (a partir de R$ 1.500,00)."
    }
  ];

  const retainerPackages = [
    {
      id: "retainer-starter",
      name: "Design Partner (Essencial)",
      tagline: "Suporte contínuo de UX/UI por demanda",
      price: "2.000",
      period: "mensal",
      popular: false,
      icon: Palette,
      badgeColor: "from-blue-500 to-indigo-500",
      description: "Ideal para empresas que precisam de entregas recorrentes de telas, ajustes e melhorias contínuas sem contratar em tempo integral.",
      deliveryTime: "Até 30h de trabalho/mês",
      features: [
        "Criação e atualização constante de telas no Figma",
        "Ajustes de UX e melhorias de fluxos existentes",
        "Criação de materiais visuais de produto (banners, stores, assets)",
        "Reunião semanal de alinhamento e priorização",
        "Sem fidelidade obrigatória (cancele a qualquer momento)"
      ],
      whatsappMsg: "Olá Maira! Tenho interesse no plano mensal Design Partner Essencial."
    },
    {
      id: "retainer-pro",
      name: "Design & Dev Partner (Pro)",
      tagline: "Time dedicado de UX/UI + Frontend Mobile/Web",
      price: "4.500",
      period: "mensal",
      popular: true,
      icon: Code2,
      badgeColor: "from-indigo-500 via-purple-500 to-pink-500",
      description: "Parceria completa onde cuido de todo o ciclo: da concepção visual até a programação de novas funcionalidades.",
      deliveryTime: "Até 60h de trabalho/mês",
      features: [
        "Design de Interface + Implementação Frontend em React/Next.js/React Native",
        "Evolução contínua do Design System",
        "Testes com usuários e otimizações de performance",
        "Prioridade total no atendimento e canal direto no Slack/WhatsApp",
        "Relatório semanal de progresso com métricas de entregas"
      ],
      whatsappMsg: "Olá Maira! Gostaria de contratar o plano mensal Design & Dev Partner Pro."
    }
  ];

  const currentPackages = billingCycle === "project" ? projectPackages : retainerPackages;

  const faqs = [
    {
      question: "Como funciona a forma de pagamento?",
      answer: "O pagamento geralmente é dividido em 50% de entrada no início do projeto e 50% na entrega final (após aprovação). Também é possível parcelar no cartão de crédito em até 12x ou definir marcos conforme as entregas."
    },
    {
      question: "Qual é a garantia de satisfação e revisões?",
      answer: "Todos os pacotes incluem ciclos abertos de revisões e ajustes na etapa de prototipagem antes do fechamento final ou código. Nada é finalizado sem a sua aprovação de 100% no Figma!"
    },
    {
      question: "Como é feita a entrega do projeto (Handoff)?",
      answer: "No Figma, você recebe um arquivo totalmente organizado com Design System, componentes reutilizáveis, guia de estilo e fluxo clicável. No desenvolvimento, você recebe o código fonte limpo no GitHub com documentação para rodar localmente ou publicar na nuvem."
    },
    {
      question: "Tenho um projeto com necessidades específicas. Posso solicitar um orçamento personalizado?",
      answer: "Com certeza! Os pacotes servem como uma referência clara de investimento. Se o seu projeto tiver escopo maior, integração de banco de dados específica ou demandas exclusivas, criamos uma proposta sob medida após uma conversa inicial."
    }
  ];

  const guarantees = [
    {
      title: "Transparência de Valores",
      description: "Valores iniciais claros e sem taxas escondidas.",
      icon: ShieldCheck
    },
    {
      title: "Design System Exclusivo",
      description: "Sua marca com tipografia, cores e componentes padronizados e fáceis de escalar.",
      icon: Sparkles
    },
    {
      title: "Handoff Transparente",
      description: "Arquivos no Figma 100% organizados e código fonte limpo pronto para publicação.",
      icon: Code2
    },
    {
      title: "Suporte Pós-Entrega",
      description: "Acompanhamento após a entrega para garantir que tudo funcione perfeitamente.",
      icon: Clock
    }
  ];

  return (
    <section className="px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30"
        >
          <Award size={16} />
          <span>Tabela de Investimento Transparente</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-white"
        >
          Planos sob medida para o <span className="text-gradient">Seu Projeto</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 text-base sm:text-xl leading-relaxed"
        >
          Transforme sua ideia em um produto de alto impacto com investimento transparente, entregas pontuais e qualidade de nível internacional.
        </motion.p>

        {/* Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 inline-flex p-1.5 rounded-2xl glass-panel border border-white/10 relative"
        >
          <button
            onClick={() => setBillingCycle("project")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              billingCycle === "project"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Zap size={16} />
            <span>Projetos Fechados</span>
          </button>

          <button
            onClick={() => setBillingCycle("retainer")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              billingCycle === "retainer"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock size={16} />
            <span>Acompanhamento Mensal</span>
            <span className="text-[10px] uppercase font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">
              Recorrente
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${billingCycle === "project" ? "lg:grid-cols-4" : "lg:grid-cols-2 max-w-4xl mx-auto"} gap-6 mb-20`}>
        {currentPackages.map((pkg, idx) => {
          const IconComponent = pkg.icon;
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1.5 ${
                pkg.popular
                  ? "bg-gradient-to-b from-[#161a29] to-[#0c0f1d] border-2 border-indigo-500/80 shadow-[0_20px_60px_rgba(99,102,241,0.25)]"
                  : "glass-panel border border-white/10 hover:border-indigo-500/40"
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Star size={14} className="fill-white" />
                  <span>Mais Solicitado</span>
                </div>
              )}

              <div>
                {/* Header Package */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pkg.badgeColor} flex items-center justify-center text-white shadow-md`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Clock size={14} className="text-indigo-400" /> {pkg.deliveryTime}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                <p className="text-xs text-indigo-300 font-medium mb-4">{pkg.tagline}</p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-gray-400">A partir de</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-bold text-gray-400">R$</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight">{pkg.price}</span>
                    <span className="text-xs text-gray-400 font-medium">,00</span>
                  </div>
                  {billingCycle === "project" && (
                    <p className="text-xs font-bold text-indigo-300 mt-1.5 flex items-center gap-1">
                      + R$ 500,00 por módulo adicional
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">Parcelamento em até 12x no cartão</p>
                </div>

                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  {pkg.description}
                </p>

              </div>

              {/* Action CTA Button */}
              <a
                href={`https://wa.me/553598030543?text=${encodeURIComponent(pkg.whatsappMsg)}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  pkg.popular
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-500/25 hover:scale-[1.02]"
                    : "glass-panel border border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10"
                }`}
              >
                <MessageSquare size={18} />
                <span>Solicitar este Pacote</span>
                <ArrowUpRight size={16} />
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* Value Proposition Guarantees */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            O Padrão de Qualidade em <span className="text-gradient">Todos os Projetos</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Garantias e metodologia inclusas em qualquer escopo contratado.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, gIdx) => {
            const GIcon = item.icon;
            return (
              <div key={gIdx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <GIcon size={20} />
                </div>
                <h4 className="font-bold text-base text-white">{item.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-3 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30">
            <HelpCircle size={16} />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Perguntas Frequentes sobre <span className="text-gradient">Valores & Prazos</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white hover:text-indigo-300 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-indigo-400 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-6 sm:px-6 sm:pb-6 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Custom Proposal Banner */}
      <div className="glass-panel rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-indigo-500/30 text-center flex flex-col items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white max-w-2xl">
          Precisa de um escopo <span className="text-gradient">sob medida?</span>
        </h2>

        <p className="text-gray-300 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
          Vamos conversar sobre as necessidades específicas da sua empresa ou startup. Agende uma conversa sem compromisso!
        </p>

        <a
          href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira!%20Gostaria%20de%20conversar%20sobre%20um%20projeto%20sob%20medida."
          target="_blank"
          rel="noreferrer"
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-base shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 flex items-center gap-3"
        >
          <MessageSquare size={20} />
          <span>Falar Diretamente no WhatsApp</span>
          <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}
