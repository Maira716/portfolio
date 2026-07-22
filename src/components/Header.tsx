"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Menu,
  X,
  MessageSquare,
  Smartphone,
  ChevronRight,
  Home,
  Workflow,
  User,
  Mail
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Início", href: "#", icon: <Home size={18} className="text-indigo-400" /> },
    { label: "Projetos Mobile", href: "#projetos", icon: <Smartphone size={18} className="text-purple-400" /> },
    { label: "Como Eu Trabalho", href: "#como-trabalho", icon: <Workflow size={18} className="text-pink-400" /> },
    { label: "Sobre Mim", href: "#sobre", icon: <User size={18} className="text-amber-400" /> },
    { label: "Contato", href: "#contato", icon: <Mail size={18} className="text-emerald-400" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-nav rounded-2xl px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/10 relative z-50">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Smartphone size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight text-white flex items-center gap-1.5 truncate">
              Maira Reis <span className="text-gradient">UX/UI</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">Desenvolvimento Mobile & Web</span>
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
            className="p-2.5 rounded-xl bg-slate-900 border border-white/15 text-white active:scale-95 transition-transform"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dark Overlay & Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40"
            />

            {/* Menu Card Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden absolute top-20 left-3 right-3 z-50 bg-[#090d16] rounded-3xl p-5 border border-indigo-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Navegação Rápida
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Maira Reis UX/UI</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/40 text-gray-200 hover:text-white flex items-center justify-between transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-sm font-bold text-white">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>

              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-center py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <MessageSquare size={18} />
                <span>Solicitar Orçamento</span>
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
