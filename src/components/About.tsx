"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Globe,
  Database,
  Zap,
  Code2,
  HeartHandshake,
  ArrowUpRight,
  MessageSquare,
  Cpu,
  Layers,
  Award,
  Lock,
  Compass,
} from "lucide-react";
import Link from "next/link";

export default function About() {
  const trustStats = [
    {
      value: "iOS & Android",
      label: "Apps Nativos",
      description: "React Native & Expo",
      icon: <Smartphone size={20} className="text-indigo-400" />,
    },
    {
      value: "App Store & Play",
      label: "Publicação Oficial",
      description: "Homologação completa",
      icon: <Award size={20} className="text-purple-400" />,
    },
    {
      value: "Nuvem & SQL",
      label: "Segurança de Dados",
      description: "Supabase & PostgreSQL",
      icon: <Database size={20} className="text-pink-400" />,
    },
    {
      value: "1 a 1",
      label: "Atendimento Direto",
      description: "Sem intermediários",
      icon: <HeartHandshake size={20} className="text-emerald-400" />,
    },
  ];

  const pillars = [
    {
      icon: <Zap className="text-amber-400" size={24} />,
      title: "Performance & Fluidez (60/120 FPS)",
      description:
        "Aplicativos desenvolvidos do zero em código limpo com React Native e TypeScript. Sem lentidão, com inicialização instantânea e animações nativas fluidas.",
      badge: "Código Otimizado",
    },
    {
      icon: <Sparkles className="text-purple-400" size={24} />,
      title: "Design Visual com Foco em Usabilidade",
      description:
        "Interfaces com estética dark moderna, contraste refinado e navegação intuitiva para que seus clientes e usuários usem com facilidade e prazer.",
      badge: "UI/UX de Alto Padrão",
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      title: "Segurança, Nuvem & LGPD",
      description:
        "Arquitetura moderna com banco de dados em nuvem criptografado, autenticação segura, proteção de dados e infraestrutura pronta para escalar.",
      badge: "Proteção de Dados",
    },
    {
      icon: <Compass className="text-indigo-400" size={24} />,
      title: "Transparência & Pontualidade",
      description:
        "Cronogramas organizados em sprints claras com acompanhamento constante. Você sabe exatamente em que etapa o projeto está e o que será entregue.",
      badge: "Sem Surpresas",
    },
  ];

  const techCategories = [
    {
      category: "Desenvolvimento Mobile",
      icon: <Smartphone size={20} className="text-indigo-400" />,
      skills: ["React Native", "Expo", "TypeScript", "iOS (App Store)", "Android (Google Play)", "Push Notifications", "GPS & Mapas", "Offline First"],
    },
    {
      category: "Web & Plataformas Digitais",
      icon: <Globe size={20} className="text-purple-400" />,
      skills: ["Next.js 16", "React 19", "Tailwind CSS", "TypeScript", "APIs REST", "SEO de Alta Performance", "Framer Motion"],
    },
    {
      category: "Backend & Banco de Dados",
      icon: <Database size={20} className="text-pink-400" />,
      skills: ["Supabase", "PostgreSQL", "Prisma ORM", "Autenticação Segura (JWT/Auth)", "Storage na Nuvem", "Webhooks & Integrações"],
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Hero Bio Section */}
      <section id="sobre-bio" className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto relative">
        {/* Ambient Glow */}
        <div className="hidden sm:block absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-900/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden"
        >
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <User size={15} />
            <span>DESENVOLVEDORA MOBILE & WEB</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Bio Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Construindo Soluções Digitais que Unem{" "}
                <span className="text-gradient">Engenharia Sólida & Design de Alto Nível</span>
              </h1>

              <div className="space-y-3.5 text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal">
                <p>
                  Olá! Sou <strong className="text-white font-bold">Maira Reis</strong>, desenvolvedora especialista em transformar ideias e necessidades de negócio em aplicativos móveis e plataformas web elegantes, rápidas e fáceis de usar.
                </p>
                <p>
                  Minha atuação une o melhor de dois mundos: <span className="text-indigo-300 font-medium">arquitetura de código moderna e confiável</span> (React Native, TypeScript, Next.js, Supabase) com <span className="text-purple-300 font-medium">design visual refinado e intuitivo</span>.
                </p>
                <p>
                  Sei que contratar o desenvolvimento de um aplicativo é uma decisão estratégica importante. Por isso, conduzo cada projeto com comunicação direta, metodologia transparente e compromisso total com a pontualidade e o resultado do seu negócio.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                {[
                  "Aplicativos Nativos iOS & Android",
                  "Sistemas Web & Plataformas Digitais",
                  "Opção de Código-Fonte ou Hospedagem Dedicada",
                  "Suporte Técnico e Garantia Pós-Lançamento",
                ].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-200"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Trust Stats Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 w-full">
              {trustStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-2 hover:border-indigo-500/30 transition-all shadow-inner"
                >
                  <div className="p-2 rounded-xl bg-white/5 w-fit border border-white/10">{stat.icon}</div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-white tracking-tight">{stat.value}</h4>
                    <p className="text-xs font-bold text-indigo-300 mt-0.5">{stat.label}</p>
                    <p className="text-[11px] text-gray-400 leading-snug">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Engineering & Work Philosophy Pillars */}
      <section id="pilares" className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Cpu size={15} />
            <span>MÉTODO & QUALIDADE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Como Penso e Desenvolvo <span className="text-gradient">Seu Projeto</span>
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Quatro princípios fundamentais que guiam cada linha de código e cada decisão de interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Tech Stack Ecosystem */}
      <section id="tecnologias" className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Layers size={15} />
            <span>TECNOLOGIAS MODERNAS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Especialidades & <span className="text-gradient">Stack Tecnológica</span>
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Utilizo as melhores tecnologias do mercado para garantir que seu produto nasça rápido, seguro e escalável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {techCategories.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">{cat.icon}</div>
                  <h3 className="font-bold text-sm sm:text-base text-white">{cat.category}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Commitment Card & CTA Bar */}
      <section id="compromisso" className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-slate-900/50 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 hidden sm:flex">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Pronto para transformar sua ideia em um produto real?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                Você fala diretamente comigo. Sem intermediários, sem termos técnicos complicados e com compromisso total com o sucesso do seu projeto.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/contato"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <span>Solicitar Orçamento</span>
              <ArrowUpRight size={15} />
            </Link>

            <a
              href="https://wa.me/553598030543?text=Ol%C3%A1%20Maira,%20gostaria%20de%20conversar%20sobre%20o%20desenvolvimento%20de%20um%20projeto."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <MessageSquare size={15} className="text-emerald-400" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
