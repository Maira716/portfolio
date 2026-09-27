"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Mail,
  DollarSign,
  LogIn,
  ShieldCheck,
  FolderKanban,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const pathname = usePathname();

  // Fecha o menu automaticamente quando a rota mudar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fecha o menu ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Previne scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Início", href: "/", icon: <Home size={18} className="text-indigo-400" /> },
    { label: "Meus Projetos", href: "/projetos", icon: <FolderKanban size={18} className="text-purple-400" /> },
    { label: "Valores & Planos", href: "/valores", icon: <DollarSign size={18} className="text-emerald-400" /> },
    { label: "Como Eu Trabalho", href: "/como-eu-trabalho", icon: <Workflow size={18} className="text-pink-400" /> },
    { label: "Sobre Mim", href: "/sobre", icon: <User size={18} className="text-amber-400" /> },
    { label: "Contato", href: "/contato", icon: <Mail size={18} className="text-emerald-400" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-6 lg:px-10 py-2.5 sm:py-4 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto glass-nav rounded-2xl px-3.5 sm:px-8 py-2 sm:py-3.5 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/10 relative z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-xl leading-tight tracking-tight text-white flex items-center gap-1.5 truncate group-hover:opacity-90 transition-opacity">
              Maira Reis <span className="text-gradient">UX/UI</span>
            </span>
            <span className="text-[9px] sm:text-[11px] text-gray-400 font-medium truncate">Desenvolvimento Mobile & Web</span>
          </div>
        </Link>

        {/* Desktop Navigation (visível apenas em telas grandes onde cabe com folga: xl >= 1280px) */}
        <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-xs xl:text-sm font-semibold transition-all px-3 py-1.5 rounded-xl border relative flex items-center gap-1.5 ${
                  active
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]"
                    : "bg-slate-900/80 border-slate-700/80 text-gray-200 hover:text-white hover:border-indigo-400 hover:bg-slate-800/90 shadow-sm"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Controls (xl >= 1280px) */}
        <div className="hidden xl:flex items-center gap-3">
          <Link
            href={user ? (profile?.role === "admin" ? "/admin" : "/portal") : "/login"}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs xl:text-sm shadow-lg shadow-indigo-500/25 border border-indigo-400/70 hover:border-pink-300 transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            <LogIn size={15} />
            <span>Login</span>
          </Link>
        </div>

        {/* Mobile & Tablet Controls (visível em todas as telas < 1280px) */}
        <div className="flex xl:hidden items-center gap-2">
          <Link
            href={user ? (profile?.role === "admin" ? "/admin" : "/portal") : "/login"}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 border border-indigo-400/60"
          >
            <LogIn size={14} />
            <span>Login</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar Menu" : "Abrir Menu de Navegação"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              mobileMenuOpen
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-slate-900 border-slate-700 text-white hover:border-indigo-400"
            }`}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dark Overlay & Mobile/Tablet Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40"
            />

            {/* Menu Card Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="xl:hidden fixed top-18 sm:top-20 inset-x-2.5 sm:inset-x-6 max-w-lg mx-auto z-50 bg-[#090d16]/98 rounded-3xl p-4 sm:p-5 border border-indigo-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col gap-2.5 max-h-[calc(100vh-5.5rem)] overflow-y-auto backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Navegação & Menu
                </span>
                <span className="text-[11px] text-gray-400 font-medium">Maira Reis UX/UI</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] group ${
                        active
                          ? "bg-indigo-600/25 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-900/90 border-slate-700/80 hover:border-indigo-400 text-gray-200 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
                          active ? "bg-indigo-500/20 border-indigo-500/40" : "bg-white/5 border-white/10"
                        }`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-bold text-white">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className={`${active ? "text-indigo-400" : "text-gray-400"} group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all`} />
                    </Link>
                  );
                })}

                {/* Login Button in Drawer */}
                <Link
                  href={user ? (profile?.role === "admin" ? "/admin" : "/portal") : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold flex items-center justify-between transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/30 border border-indigo-400/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/15 border border-white/20">
                      <LogIn size={18} />
                    </div>
                    <span className="text-sm">
                      {user ? (profile?.role === "admin" ? "Painel Admin" : "Meu Portal do Cliente") : "Login no Portal"}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </Link>

                {/* WhatsApp Quick Link */}
                <a
                  href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20conversar%20sobre%20um%20projeto."
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-900/40 transition-colors"
                >
                  <MessageSquare size={15} className="text-emerald-400" />
                  <span>Falar Direto no WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
