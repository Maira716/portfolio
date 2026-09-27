"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Layout,
  Code2,
  Rocket,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  Lock,
  FolderLock,
  Smartphone,
  Check,
} from "lucide-react";

export default function Process() {
  const steps = [
    {
      number: "01",
      phaseBadge: "Fase 01 • Alinhamento & Estratégia",
      title: "Imersão & Arquitetura do Produto",
      icon: <Search className="text-indigo-400" size={24} />,
      accentColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
      glowColor: "from-indigo-600/20 to-purple-600/10",
      description:
        "Conversamos sobre suas ideias, metas de negócio e público-alvo. Mapeamos as funcionalidades essenciais para criar um produto enxuto, rápido de lançar e com alto valor percebido.",
      deliverables: [
        "Documento de Escopo & Requisitos Essenciais",
        "Mapeamento completo dos Fluxos de Navegação",
        "Cronograma fechado e investimento transparente",
      ],
      guarantee: "Clareza absoluta do que será construído antes de investir em desenvolvimento.",
    },
    {
      number: "02",
      phaseBadge: "Fase 02 • Design Visual & Validação",
      title: "Design de Interface & Experiência Visual (UI/UX)",
      icon: <Layout className="text-purple-400" size={24} />,
      accentColor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      glowColor: "from-purple-600/20 to-pink-600/10",
      description:
        "Criamos todas as telas em alta fidelidade com visual dark moderno, tipografia premium, microinterações e foco na melhor usabilidade para seus usuários.",
      deliverables: [
        "Design completo de todas as telas em alta fidelidade",
        "Design System exclusivo (paleta de cores, tipografia e componentes)",
        "Revisões e ajustes finos até sua aprovação total",
      ],
      guarantee: "Você só autoriza a programação após validar e aprovar 100% o design visual.",
    },
    {
      number: "03",
      phaseBadge: "Fase 03 • Engenharia & Código Limpo",
      title: "Desenvolvimento Ágil & Testes Contínuos",
      icon: <Code2 className="text-pink-400" size={24} />,
      accentColor: "border-pink-500/30 bg-pink-500/10 text-pink-400",
      glowColor: "from-pink-600/20 to-rose-600/10",
      description:
        "Transformamos o design aprovado em código nativo, seguro e de alta performance. Realizamos testes em múltiplos dispositivos físicos para assegurar carregamento rápido e sem travamentos.",
      deliverables: [
        "Versões de teste instaláveis no seu celular (APK / TestFlight)",
        "Banco de dados em nuvem criptografado (Supabase / PostgreSQL)",
        "Atualizações regulares com relatórios do progresso",
      ],
      guarantee: "Acompanhamento transparente do código nascendo, sem surpresas técnicas.",
    },
    {
      number: "04",
      phaseBadge: "Fase 04 • Homologação & Suporte",
      title: "Publicação nas Lojas & Entrega Oficial",
      icon: <Rocket className="text-emerald-400" size={24} />,
      accentColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      glowColor: "from-emerald-600/20 to-teal-600/10",
      description:
        "Cuidamos de todo o processo de aprovação e publicação na Apple App Store e Google Play Store. Você pode publicar na sua conta ou utilizar minha estrutura de hospedagem.",
      deliverables: [
        "Aplicativo homologado e publicado nas lojas oficiais",
        "Opção de subir na sua conta ou plano de hospedagem dedicado",
        "30 dias de garantia técnica, treinamento e opção de suporte mensal contínuo",
      ],
      guarantee: "Seu produto no ar, operando com segurança e pronto para faturar.",
    },
  ];

  return (
    <section id="como-trabalho" className="py-4 md:py-8 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto scroll-mt-24 relative">
      {/* Ambient Glow */}
      <div className="hidden sm:block absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3"
        >
          <Sparkles size={15} className="text-amber-400" />
          <span>MÉTODO EXECUTIVO & TRANSPARENTE</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2.5 text-white"
        >
          Como Funciona o <span className="text-gradient">Desenvolvimento</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto"
        >
          Um processo estruturado em 4 etapas claras para você acompanhar a evolução do seu aplicativo ou software com total tranquilidade, previsibilidade e sem jargões difíceis.
        </motion.p>
      </div>

      {/* Timeline Steps Stack */}
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        {steps.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={`p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-900/70 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all`}
          >
            {/* Background Step Watermark */}
            <div className="absolute top-4 right-6 text-6xl sm:text-8xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-white/[0.06] transition-colors">
              {step.number}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
              {/* Left Column: Phase badge, icon, title, description */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-2xl border ${step.accentColor} shadow-md`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {step.phaseBadge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mb-3">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Guarantee Pill */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-indigo-300 font-medium">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>{step.guarantee}</span>
                </div>
              </div>

              {/* Right Column: Tangible Deliverables Box */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 shadow-inner space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      O Que Você Recebe Nesta Etapa:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Entregáveis
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {step.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                        <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                          <Check size={12} />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3 Value & Security Guarantees Banner */}
      <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 flex items-start gap-3.5 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">Aprovação por Etapa</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Você só autoriza e paga a fase seguinte após aprovar e testar a etapa anterior.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 flex items-start gap-3.5 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <FolderLock size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">Flexibilidade de Hospedagem</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Você escolhe entre publicar na sua conta ou manter hospedado na minha infraestrutura, com código-fonte opcional.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 flex items-start gap-3.5 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">Acompanhamento Fácil</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Comunicação direta pelo WhatsApp e relatórios simples sem termos técnicos difíceis.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/40 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 hidden sm:flex">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              Tem uma ideia e quer saber por onde começar?
            </h4>
            <p className="text-xs sm:text-sm text-gray-300">
              Conversamos sem compromisso para estruturar seu escopo e tirar todas as suas dúvidas.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <Link
            href="/contato"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <span>Solicitar Orçamento</span>
            <ArrowUpRight size={15} />
          </Link>

          <a
            href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20entender%20melhor%20o%20processo%20de%20desenvolvimento%20para%20minha%20ideia."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 active:scale-95 text-center"
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
