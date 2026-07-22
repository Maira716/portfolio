"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Sparkles, ArrowUpRight } from "lucide-react";

export default function Contact() {
  return (
    <section id="contato" className="py-10 md:py-24 px-4 lg:px-8 max-w-5xl mx-auto scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-6 sm:p-8 md:p-14 relative overflow-hidden border border-white/10 text-center flex flex-col items-center"
      >
        {/* Glow Orb background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Section Tag & Title */}
        <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30">
          <MessageSquare size={16} />
          <span>VAMOS CRIAR JUNTOS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white max-w-2xl">
          Vamos Falar Sobre o <span className="text-gradient">Seu Projeto?</span>
        </h2>

        <p className="text-gray-300 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          Estou pronta para transformar sua ideia em um aplicativo ou plataforma impecável. Entre em contato diretamente pelos canais abaixo:
        </p>

        {/* Direct Action Redirect Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Main WhatsApp Card */}
          <a
            href="https://wa.me/553598030543"
            target="_blank"
            rel="noreferrer"
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/90 to-teal-700/90 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1 flex items-center justify-between border border-emerald-400/30 group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                <MessageSquare size={26} />
              </div>
              <div>
                <span className="block font-extrabold text-lg text-white">WhatsApp</span>
                <span className="text-xs text-emerald-100 font-medium">+55 (35) 98030-543</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowUpRight size={20} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Direct Email Card */}
          <a
            href="mailto:contato@mairareis.dev"
            className="p-6 rounded-2xl glass-panel hover:border-indigo-500/40 text-white shadow-xl transition-all hover:-translate-y-1 flex items-center justify-between border border-white/10 group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Mail size={26} />
              </div>
              <div>
                <span className="block font-extrabold text-lg text-white">E-mail Direto</span>
                <span className="text-xs text-gray-400 font-medium">contato@mairareis.dev</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl glass-panel group-hover:border-indigo-500/40 transition-colors">
              <ArrowUpRight size={20} className="text-gray-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>

        {/* Location Info Banner */}
        <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-panel border border-white/10 text-gray-300 text-xs sm:text-sm font-medium">
          <MapPin size={16} className="text-purple-400" />
          <span>Atendimento em todo o Brasil • Projetos Remotos</span>
        </div>
      </motion.div>
    </section>
  );
}
