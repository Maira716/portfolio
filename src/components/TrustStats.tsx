"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Award, Code2, CheckCircle2, Lock, Users } from "lucide-react";

export default function TrustStats() {
  const stats = [
    {
      value: "100%",
      label: "Entregas no Prazo",
      subtext: "Cronograma rigoroso com marcos semanais",
      icon: <Clock size={20} className="text-indigo-400" />,
    },
    {
      value: "Contrato & NDA",
      label: "Segurança Jurídica",
      subtext: "Sigilo absoluto e proteção intelectual",
      icon: <Lock size={20} className="text-purple-400" />,
    },
    {
      value: "30 Dias",
      label: "Suporte Pós-Entrega",
      subtext: "Garantia técnica e estabilidade assistida",
      icon: <ShieldCheck size={20} className="text-pink-400" />,
    },
    {
      value: "Flexível",
      label: "Código ou Hospedagem",
      subtext: "Código opcional ou infraestrutura dedicada",
      icon: <Award size={20} className="text-emerald-400" />,
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto w-full -mt-3 sm:-mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {item.icon}
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {item.value}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-200 mt-1">{item.label}</h4>
                <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
