"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Smartphone, Layers, Database, Shield, Zap, Sparkles, Server } from "lucide-react";

export default function TechStack() {
  const technologies = [
    {
      category: "Mobile & Apps",
      items: [
        { name: "React Native", tag: "iOS & Android Nativo" },
        { name: "TypeScript", tag: "Código Seguro e Tipado" },
        { name: "Expo & Bare", tag: "Builds & Lojas App Store / Play Store" },
      ],
      icon: <Smartphone size={22} className="text-indigo-400" />,
      color: "border-indigo-500/30 bg-indigo-950/20",
    },
    {
      category: "Plataformas Web & Performance",
      items: [
        { name: "Next.js 16 & React 19", tag: "Alta Velocidade e SEO" },
        { name: "Tailwind CSS", tag: "Design Fluido e Responsivo" },
        { name: "Framer Motion", tag: "Micro-interações de Luxo" },
      ],
      icon: <Zap size={22} className="text-purple-400" />,
      color: "border-purple-500/30 bg-purple-950/20",
    },
    {
      category: "Backend & Segurança",
      items: [
        { name: "Supabase & PostgreSQL", tag: "Banco de Dados em Nuvem" },
        { name: "Row Level Security (RLS)", tag: "Privacidade de Dados" },
        { name: "APIs RESTful & Node.js", tag: "Integrações Estáveis" },
      ],
      icon: <Database size={22} className="text-pink-400" />,
      color: "border-pink-500/30 bg-pink-950/20",
    },
    {
      category: "Design UX/UI & Prototipagem",
      items: [
        { name: "Figma Professional", tag: "Design Systems & Componentes" },
        { name: "Protótipos Clicáveis", tag: "Navegação no Celular" },
        { name: "Arquitetura da Informação", tag: "Usabilidade & Conversão" },
      ],
      icon: <Layers size={22} className="text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-950/20",
    },
  ];

  return (
    <section className="py-2 md:py-4 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <Cpu size={16} />
          <span>Arquitetura de Alto Padrão</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white"
        >
          Tecnologias de <span className="text-gradient">Nível Corporativo</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
        >
          Utilizo as ferramentas e frameworks líderes do mercado global para garantir que seu aplicativo e site sejam rápidos, seguros e fáceis de escalar conforme sua empresa cresce.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {technologies.map((stack, idx) => (
          <motion.div
            key={stack.category}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.12, duration: 0.5 }}
            className={`p-6 rounded-3xl glass-panel border ${stack.color} flex flex-col justify-between hover:-translate-y-1 transition-all`}
          >
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                  {stack.icon}
                </div>
                <h3 className="font-bold text-base text-white">{stack.category}</h3>
              </div>

              <div className="space-y-3.5">
                {stack.items.map((tech) => (
                  <div key={tech.name} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="font-bold text-sm text-white mb-0.5">{tech.name}</div>
                    <div className="text-[11px] text-gray-400 font-medium">{tech.tag}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-gray-400">
              <span>Padrão de Mercado</span>
              <span className="text-emerald-400 font-bold">100% Testado</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
