"use client";

import React, { useState } from "react";
import { Sparkles, Menu, X, MessageSquare, Smartphone } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Início", href: "#" },
    { label: "Projetos Mobile", href: "#projetos" },
    { label: "Como Eu Trabalho", href: "#como-trabalho" },
    { label: "Sobre Mim", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-nav rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/10">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Smartphone size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              Maira Reis <span className="text-gradient">UX/UI</span>
            </span>
            <span className="text-[11px] text-gray-400 font-medium">Desenvolvimento Mobile & Web</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 hover:after:w-full after:transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contato"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Solicitar Orçamento</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu de Navegação"
            className="p-2 rounded-xl glass-panel text-gray-200 border border-white/10"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border border-white/10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-200 hover:text-indigo-400 py-2 border-b border-white/5 flex items-center justify-between"
            >
              <span>{item.label}</span>
              <Sparkles size={14} className="text-indigo-400 opacity-60" />
            </a>
          ))}
          <a
            href="#contato"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 text-center py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            <span>Solicitar Orçamento</span>
          </a>
        </div>
      )}
    </header>
  );
}
