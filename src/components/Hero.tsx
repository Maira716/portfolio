"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Smartphone, CheckCircle, ShieldCheck, Zap, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-2 md:pt-28 md:pb-4 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Ambient Glow Orbs - Hidden/lightweight on mobile for iOS performance */}
      <div className="hidden sm:block absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="hidden sm:block absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" />
      <div className="sm:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-xl shadow-indigo-500/10 max-w-full"
      >
        <Sparkles size={15} className="text-amber-400 animate-pulse shrink-0" />
        <span className="truncate">Desenvolvimento Mobile & Web Sob Medida</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
      </motion.div>

      {/* Main Impact Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight max-w-5xl leading-[1.2] sm:leading-[1.2] mb-4 sm:mb-5 text-white"
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
        className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl font-normal leading-relaxed mb-8"
      >
        Crio aplicativos mobile e plataformas digitais com foco absoluto na experiência do cliente, estética impecável e resultados de verdade para a sua empresa — sem complicação técnica.
      </motion.p>

      {/* Value Badges for Non-Technical Clients */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-6xl"
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
