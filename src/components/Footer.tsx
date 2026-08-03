"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Heart, ArrowUp } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 py-12 px-4 lg:px-8 mt-20 bg-slate-950/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Smartphone size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white">
              Maira Reis <span className="text-gradient">UX/UI & Mobile</span>
            </span>
            <span className="text-xs text-gray-400">&copy; {currentYear} Maira Reis. Todos os direitos reservados</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 flex items-center gap-1.5 justify-center">
          Transformando ideias em experiências digitais memoráveis com <Heart size={14} className="text-pink-500 fill-pink-500" />
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <Link href="/#projetos" className="hover:text-white transition-colors">
            Projetos
          </Link>
          <Link href="/valores" className="hover:text-indigo-300 font-bold text-indigo-400 transition-colors">
            Valores & Planos
          </Link>
          <Link href="/#contato" className="hover:text-white transition-colors">
            Contato
          </Link>
        </div>

        <button
          onClick={scrollToTop}
          className="p-3 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all flex items-center gap-2 text-xs font-semibold"
        >
          <span>Voltar ao topo</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
