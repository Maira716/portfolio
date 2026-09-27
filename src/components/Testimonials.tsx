"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle, MessageSquare } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Drª. Camila Vasconcelos",
      role: "Diretora Clínica",
      company: "Lumina Aesthetic",
      initials: "CV",
      rating: 5,
      content:
        "O protótipo interativo fez toda a diferença. Conseguimos ver e testar todas as telas do aplicativo de agendamento antes de escrever uma linha de código. Nossas pacientes adoraram a facilidade.",
      badge: "App Mobile iOS & Android",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Marcos Vinícius",
      role: "Gestor Geral",
      company: "CFC Autoescola DriveFlow",
      initials: "MV",
      rating: 5,
      content:
        "Profissionalismo impecável com cumprimento rigoroso dos prazos contratuais. O sistema reduziu em mais de 70% as dúvidas de alunos no WhatsApp sobre aulas práticas e simulação de provas.",
      badge: "Plataforma Web & Mobile",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "Thiago Prado",
      role: "Fundador & Master Barber",
      company: "BarberPro Studio",
      initials: "TP",
      rating: 5,
      content:
        "O design escuro com efeitos de vidro combinou perfeitamente com o padrão premium da nossa barbearia. Suporte dedicado e explicações didáticas em todas as fases do projeto.",
      badge: "Design UX/UI & Sistema",
      gradient: "from-pink-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-6 md:py-10 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <Quote size={16} />
          <span>Feedback de Clientes & Parceiros</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white"
        >
          Resultados que Geram <span className="text-gradient">Credibilidade Real</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-base md:text-lg leading-relaxed"
        >
          Veja como a combinação de estética de alto padrão e engenharia robusta transforma a percepção de valor dos negócios dos meus clientes.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="p-6 sm:p-7 rounded-3xl glass-panel border border-white/10 hover:border-purple-500/30 flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Rating Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-indigo-300">
                  {item.badge}
                </span>
              </div>

              {/* Quote Content */}
              <p className="text-sm text-gray-300 leading-relaxed italic mb-6">
                &ldquo;{item.content}&rdquo;
              </p>
            </div>

            {/* Author Info */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center font-bold text-sm text-white shadow-lg shrink-0`}
              >
                {item.initials}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white leading-tight truncate">{item.name}</h4>
                <p className="text-xs text-gray-400 truncate">
                  {item.role} • <span className="text-gray-300 font-medium">{item.company}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
