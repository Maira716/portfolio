"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2, Award, Clock } from "lucide-react";

export default function About() {
  const guarantees = [
    {
      icon: <ShieldCheck className="text-indigo-400" size={24} />,
      title: "Compromisso com Prazos",
      description: "Entregas organizadas em cronogramas claros, com atualização semanal sobre cada etapa concluída.",
    },
    {
      icon: <HeartHandshake className="text-purple-400" size={24} />,
      title: "Parceria Próxima & Suporte",
      description: "Você fala diretamente comigo. Atendimento dedicado e esclarecimento de todas as dúvidas.",
    },
    {
      icon: <Sparkles className="text-pink-400" size={24} />,
      title: "Design de Alto Nível",
      description: "Visual moderno que eleva a percepção de valor da sua marca aos olhos dos seus clientes.",
    },
  ];

  return (
    <section id="sobre" className="py-10 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-6 sm:p-8 md:p-14 relative overflow-hidden border border-white/10"
      >
        {/* Glow Orb inside About panel */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-4">
          <User size={16} />
          <span>SOBRE MIM & PARCERIA</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8 text-white">
          Foco no Seu Sucesso com <span className="text-gradient">Design & Usabilidade</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 text-gray-300 leading-relaxed font-normal text-base md:text-lg">
            <p>
              Olá! Sou desenvolvedora especialista em transformar necessidades reais em aplicativos e sites elegantes, rápidos e intuitivos.
            </p>
            <p>
              Sei que contratar um projeto digital pode parecer desafiador para quem não entende de programação. Por isso, meu foco é simplificar o processo: gerencio a tecnologia do início ao fim para que você se concentre apenas no seu negócio.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Projetos 100% Responsivos",
                "Protótipos Interativos no Celular",
                "Comunicação Clara & Sem Jargões",
                "Treinamento Didático Pós-Entrega",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-200 font-medium">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {guarantees.map((card, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl glass-panel border border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-4 hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-white/5 shrink-0">{card.icon}</div>
                <div>
                  <h3 className="font-bold text-base text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-300 leading-normal">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
