"use client";

import React, { useState } from "react";
import { Mail, Send, MapPin, CheckCircle2, MessageSquare } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./Icons";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 5000);
    }
  };

  return (
    <section id="contato" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-3">
                <MessageSquare size={18} />
                <span>VAMOS CONVERSAR</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Entre em <span className="text-gradient">Contato</span>
              </h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Estou disponível para novas oportunidades, projetos freelance ou parcerias de desenvolvimento. Envie uma mensagem!
              </p>
            </div>

            <div className="space-y-5">
              <a
                href="mailto:contato@exemplo.com"
                className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-indigo-500/40 transition-all group"
              >
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">E-mail Direto</span>
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-indigo-400">
                    contato@mairareis.dev
                  </span>
                </div>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-purple-500/40 transition-all group"
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <GithubIcon size={22} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Repositórios</span>
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-purple-400">
                    github.com
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Localização</span>
                  <span className="text-sm font-semibold text-gray-200">Brasil (Remoto)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative">
            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-100">Mensagem Enviada!</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Obrigado pelo contato! Responderei o mais breve possível.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Como gosta de ser chamado(a)?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Seu E-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Conte sobre seu projeto ou ideia..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Enviar Mensagem</span>
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
