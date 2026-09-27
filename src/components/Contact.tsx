"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Laptop,
  Globe,
  HelpCircle,
  Phone,
  Check,
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [projectType, setProjectType] = useState<"app" | "software" | "site" | "outro">("app");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("mairareis2017@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const typeLabels = {
      app: "Aplicativo Mobile (iOS/Android)",
      software: "Software Web / Sistema SaaS",
      site: "Website / Landing Page",
      outro: "Projeto Personalizado / Consultoria",
    };

    const text = `Olá Maira! Meu nome é *${name}*.\n\n*Tipo de Projeto:* ${typeLabels[projectType]}\n*Contato:* ${contactInfo}\n*Sobre o Projeto:* ${description}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/553598030543?text=${encodedText}`, "_blank");
  };

  const faqs = [
    {
      question: "Qual o prazo médio para desenvolver um aplicativo?",
      answer:
        "O prazo médio varia entre 3 a 6 semanas para a primeira versão (MVP), dependendo da quantidade de telas e integrações. Cada etapa possui cronograma fechado.",
    },
    {
      question: "Como funciona a forma de pagamento?",
      answer:
        "Trabalhamos com modelo seguro por etapas: você só autoriza a fase seguinte após aprovar e validar a entrega anterior (Pix, transferência ou cartão).",
    },
    {
      question: "O código-fonte e o aplicativo nas lojas ficam no meu nome?",
      answer:
        "A compra do código-fonte é opcional. Você pode escolher entre adquirir o código-fonte para publicar o aplicativo na sua própria conta de desenvolvedor (Apple App Store / Google Play Store) ou pagar por um plano de hospedagem e manutenção na minha infraestrutura, de forma prática e sem complicações técnicas.",
    },
    {
      question: "Você dá suporte após o lançamento?",
      answer:
        "Sim! Todos os projetos incluem 30 dias de garantia técnica e suporte pós-lançamento, além de treinamento didático para operar a plataforma. Após esse período, você também pode contratar planos mensais de suporte técnico, manutenção e evolução contínua para o seu projeto.",
    },
  ];

  return (
    <section id="contato" className="py-4 md:py-8 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto scroll-mt-24 relative">
      {/* Ambient Glow */}
      <div className="hidden sm:block absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3"
        >
          <Sparkles size={15} className="text-amber-400" />
          <span>VAMOS CRIAR JUNTOS</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-white leading-tight"
        >
          Vamos Falar Sobre o <span className="text-gradient">Seu Projeto?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto"
        >
          Envie os detalhes da sua ideia pelo formulário abaixo para receber uma proposta técnica sob medida ou inicie uma conversa direta pelo WhatsApp.
        </motion.p>
      </div>

      {/* 2-Column Main Contact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-6xl mx-auto">
        {/* Left Column: Direct Channels & Trust Pillars */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 flex flex-col justify-between space-y-6"
        >
          {/* WhatsApp Direct Card */}
          <a
            href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20conversar%20sobre%20um%20projeto."
            target="_blank"
            rel="noreferrer"
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600/90 via-teal-700/90 to-slate-900 border border-emerald-400/40 shadow-[0_20px_40px_rgba(16,185,129,0.25)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-1 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-white/15 border border-white/20 text-white group-hover:scale-110 transition-transform">
                <MessageSquare size={26} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Atendimento Rápido
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Conversar no WhatsApp</h3>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                Tire dúvidas imediatas, envie áudios ou agende uma videochamada de alinhamento.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white">
              <span>+55 (35) 98030-543</span>
              <div className="p-2 rounded-xl bg-white/15 group-hover:bg-white/25 transition-colors">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </a>

          {/* Email Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Mail size={22} />
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <span>Copiar E-mail</span>
                )}
              </button>
            </div>

            <div>
              <h4 className="font-bold text-base text-white">E-mail Corporativo</h4>
              <p className="text-xs text-gray-400 font-mono mt-0.5">mairareis2017@gmail.com</p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Ideal para envio de briefing detalhado, documentações técnicas e RFPs formais.
            </p>
          </div>

          {/* 3 Trust Signals */}
          <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <Clock size={16} className="text-indigo-400 shrink-0" />
              <span>Resposta em até 2 horas úteis</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Sigilo absoluto da sua ideia (Acordo NDA disponível)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <MapPin size={16} className="text-purple-400 shrink-0" />
              <span>Atendimento em todo o Brasil (100% Remoto)</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Proposal Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7"
        >
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-900/70 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
            <div className="mb-6 space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Solicitar Proposta do Meu Projeto
              </h3>
              <p className="text-xs text-gray-400">
                Preencha os campos abaixo. O formulário gera uma mensagem estruturada no WhatsApp para agilizar seu atendimento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Seu Nome / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Seu WhatsApp ou E-mail *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Ex: (35) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Project Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Qual o Tipo de Projeto? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectType("app")}
                    className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      projectType === "app"
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                        : "bg-black/30 text-gray-300 hover:text-white border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <Smartphone size={15} className={projectType === "app" ? "text-white" : "text-indigo-400"} />
                    <span>App Mobile (iOS/Android)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectType("software")}
                    className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      projectType === "software"
                        ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30"
                        : "bg-black/30 text-gray-300 hover:text-white border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <Laptop size={15} className={projectType === "software" ? "text-white" : "text-purple-400"} />
                    <span>Software Web / SaaS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectType("site")}
                    className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      projectType === "site"
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30"
                        : "bg-black/30 text-gray-300 hover:text-white border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <Globe size={15} className={projectType === "site" ? "text-white" : "text-emerald-400"} />
                    <span>Website / Landing Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectType("outro")}
                    className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      projectType === "outro"
                        ? "bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-600/30"
                        : "bg-black/30 text-gray-300 hover:text-white border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <Sparkles size={15} className={projectType === "outro" ? "text-white" : "text-pink-400"} />
                    <span>Outro / Consultoria</span>
                  </button>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Conte um Pouco Sobre Sua Ideia ou Desafio *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Preciso de um aplicativo para agendamentos e controle de clientes com notificações no celular..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 text-xs sm:text-sm outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer hover:shadow-indigo-500/40"
              >
                <Send size={16} />
                <span>Enviar e Abrir no WhatsApp</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="mt-14 sm:mt-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <HelpCircle size={15} />
            <span>DÚVIDAS FREQUENTES</span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
            Perguntas Frequentes de <span className="text-gradient">Contratação</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 backdrop-blur-md"
            >
              <h4 className="font-bold text-sm sm:text-base text-white flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-7">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
