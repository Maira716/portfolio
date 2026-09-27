"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, MessageSquare, DollarSign, CalendarCheck } from "lucide-react";

export default function ExecutiveCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto w-full py-3 pb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-slate-900/80 shadow-[0_20px_80px_rgba(79,70,229,0.15)] text-center flex flex-col items-center"
      >
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-5">
          <CalendarCheck size={16} />
          <span>Próximos Projetos & Disponibilidade</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white max-w-3xl leading-[1.2]">
          Pronto para Criar uma Plataforma que <span className="text-gradient">Impressione Seus Clientes?</span>
        </h2>

        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
          Vamos conversar sobre as necessidades da sua empresa. Você recebe um diagnóstico técnico transparente, cronograma detalhado e orçamento sem compromisso.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <Link
            href="/contato"
            className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-base shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
          >
            <span>Solicitar Diagnóstico Técnico</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/valores"
            className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl glass-panel text-white font-bold text-base hover:bg-white/10 transition-all border border-white/15 flex items-center justify-center gap-2.5"
          >
            <DollarSign size={18} className="text-emerald-400" />
            <span>Consultar Valores & Planos</span>
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Contrato Formal & Sigilo (NDA)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span>Design Visual Pré-Aprovado</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-400" />
            <span>Código Opcional ou Hospedagem Dedicada</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
