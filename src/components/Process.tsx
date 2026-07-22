"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Layout, Code2, Rocket, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Process() {
  const steps = [
    {
      number: "01",
      icon: <Search className="text-indigo-400" size={26} />,
      title: "Diagnóstico & Estratégia",
      badge: "Entendimento do Negócio",
      description:
        "Conversamos sobre suas ideias e objetivos. Mapeamos quem são seus clientes e definimos as funcionalidades essenciais para gerar resultados rápidos.",
      detail: "Alinhamento transparente de prazos e investimento",
    },
    {
      number: "02",
      icon: <Layout className="text-purple-400" size={26} />,
      title: "Protótipo Visual Interativo",
      badge: "Você aprova o Design",
      description:
        "Desenhamos o aplicativo em um modelo de alta fidelidade. Você navega pelas telas no celular antes mesmo do início da programação.",
      detail: "Visual moderno, intuitivo e com foco no usuário",
    },
    {
      number: "03",
      icon: <Code2 className="text-pink-400" size={26} />,
      title: "Desenvolvimento & Testes",
      badge: "Construção com Qualidade",
      description:
        "Transformamos os protótipos aprovados em código real, leve e seguro. Realizamos testes em múltiplos dispositivos para garantir experiência impecável.",
      detail: "Desempenho ágil sem travamentos",
    },
    {
      number: "04",
      icon: <Rocket className="text-emerald-400" size={26} />,
      title: "Lançamento & Suporte",
      badge: "Seu Projeto no Ar",
      description:
        "Colocamos seu aplicativo ou site no ar com toda a segurança. Você recebe orientações didáticas para gerenciar a plataforma com tranquilidade.",
      detail: "Acompanhamento pós-lançamento garantido",
    },
  ];

  return (
    <section id="como-trabalho" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <ShieldCheck size={16} />
          <span>Processo Simples & Transparente</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white"
        >
          Como Funciona o <span className="text-gradient">Desenvolvimento</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-base md:text-lg leading-relaxed"
        >
          Um método passo a passo pensado para quem valoriza design e tranquilidade. Você acompanha a evolução do seu projeto sem complicações técnicas.
        </motion.p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between glass-card-hover relative overflow-hidden group"
          >
            {/* Step Number Backdrop */}
            <span className="absolute -top-3 -right-2 text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors pointer-events-none select-none">
              {step.number}
            </span>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {step.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {step.title}
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {step.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-indigo-300 font-medium">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>{step.detail}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Banner for Clients */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-6 md:p-8 rounded-3xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">
              Nunca contratou desenvolvimento antes?
            </h4>
            <p className="text-sm text-gray-300">
              Não se preocupe. Explico tudo em linguagem acessível, com acompanhamento em videochamadas e relatórios visuais demonstrativos.
            </p>
          </div>
        </div>

        <a
          href="#contato"
          className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all whitespace-nowrap shadow-lg shadow-indigo-600/30"
        >
          Tirar Dúvidas sem Compromisso
        </a>
      </motion.div>
    </section>
  );
}
