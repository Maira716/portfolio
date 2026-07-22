"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Layout, Zap, CheckCircle2, Shield, Layers } from "lucide-react";

export default function Skills() {
  const deliverables = [
    {
      title: "Aplicativos Mobile (iOS & Android)",
      icon: <Smartphone className="text-indigo-400" size={24} />,
      tag: "Mais Solicitado",
      description: "Criação de aplicativos nativos leves, responsivos e instaláveis diretamente nos celulares dos seus clientes.",
      highlights: ["Agendamentos & Reservas", "Acompanhamento de Alunos/Clientes", "Notificações no Celular", "Área de Membros e Login"],
      techs: ["React Native", "TypeScript", "Node.js"]
    },
    {
      title: "Sites & Plataformas Web",
      icon: <Layout className="text-purple-400" size={24} />,
      tag: "Alta Conversão",
      description: "Páginas institucionais, Landing Pages de alta conversão e sistemas administrativos simples de gerenciar.",
      highlights: ["Design 100% Personalizado", "Otimizado para Carregamento Rápido", "Adaptação Total a Celulares e Computadores"],
      techs: ["Next.js", "React 19", "Tailwind CSS"]
    },
    {
      title: "Design UX/UI & Experiência",
      icon: <Zap className="text-pink-400" size={24} />,
      tag: "Foco no Usuário",
      description: "Interfaces desenhadas para que qualquer pessoa consiga navegar e usar sem dificuldades ou suporte.",
      highlights: ["Protótipos Interativos Clicáveis", "Estética Moderna & Dark Mode", "Fluxo de Venda Sem Atrito"],
      techs: ["Figma", "Design Systems", "Glassmorphism"]
    }
  ];

  return (
    <section id="habilidades" className="py-6 md:py-10 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <Layers size={16} />
          <span>O Que Entrego Para o Seu Negócio</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white"
        >
          Soluções Sob Medida para <span className="text-gradient">Sua Empresa</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-base md:text-lg leading-relaxed"
        >
          Seja para criar um aplicativo novo ou atualizar a presença digital da sua marca, você recebe uma solução completa e pronta para uso.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {deliverables.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="glass-panel rounded-3xl p-8 border border-white/10 glass-card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">{item.icon}</div>
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {item.description}
              </p>

              <div className="space-y-2.5 mb-6">
                {item.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2.5 text-xs text-gray-200 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
              {item.techs.map((t) => (
                <span key={t} className="text-[11px] font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
