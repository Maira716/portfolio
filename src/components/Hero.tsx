"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Smartphone, CheckCircle, ShieldCheck, Zap, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-44 md:pb-32 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-pink-600/15 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-8 shadow-xl shadow-indigo-500/10"
      >
        <Sparkles size={16} className="text-amber-400 animate-pulse" />
        <span>Desenvolvimento Mobile & Web Sob Medida</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </motion.div>

      {/* Main Impact Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.15] mb-6 text-white"
      >
        Transformando Ideias em{" "}
        <span className="text-gradient drop-shadow-sm">Experiências Digitais</span>{" "}
        Memoráveis
      </motion.h1>

      {/* Client-centric Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-base sm:text-xl text-gray-300 max-w-3xl font-normal leading-relaxed mb-10"
      >
        Crio aplicativos mobile e plataformas digitais com foco absoluto na experiência do cliente, estética impecável e resultados de verdade para a sua empresa — sem complicação técnica.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
      >
        <a
          href="#projetos"
          className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
        >
          <Smartphone size={20} />
          <span>Ver Projetos Mobile</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>

        <a
          href="#contato"
          className="w-full sm:w-auto px-9 py-4 rounded-2xl glass-panel text-gray-100 hover:text-white font-semibold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-white/15 hover:border-indigo-400/40"
        >
          <MessageSquare size={18} className="text-indigo-400" />
          <span>Iniciar Orçamento</span>
        </a>
      </motion.div>

      {/* Value Badges for Non-Technical Clients */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl"
      >
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 text-left hover:border-indigo-500/30 transition-all">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Interface Rápida & Fluida</h4>
            <p className="text-xs text-gray-400">Navegação sem travamentos</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 text-left hover:border-purple-500/30 transition-all">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
            <Smartphone size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Mockups Interativos</h4>
            <p className="text-xs text-gray-400">Você aprova tudo antes de codificar</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 text-left hover:border-pink-500/30 transition-all">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Transparência Total</h4>
            <p className="text-xs text-gray-400">Comunicação clara sem jargões</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
