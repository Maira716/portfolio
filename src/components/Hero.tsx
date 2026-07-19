"use client";

import React from "react";
import { ArrowRight, Sparkles, Code, Terminal, Layers } from "lucide-react";
import { GithubIcon } from "./Icons";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-indigo-400 text-xs sm:text-sm font-medium mb-8 shadow-sm">
        <Sparkles size={16} className="animate-pulse text-indigo-400" />
        <span>Disponível para novos projetos e oportunidades</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
        Transformando Ideias em <span className="text-gradient">Interfaces Incríveis</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed mb-10">
        Desenvolvedora de Software focada em criar aplicações web modernas, responsivas e intuitivas utilizando as melhores tecnologias do mercado.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
        <a
          href="#projetos"
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 group"
        >
          <span>Ver Projetos</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>

        <a
          href="#contato"
          className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-gray-200 hover:text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
        >
          <GithubIcon size={18} />
          <span>Meu GitHub</span>
        </a>
      </div>

      {/* Tech Stack Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
        {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Node.js", "Git & GitHub", "Vercel"].map((tech) => (
          <span
            key={tech}
            className="px-4 py-2 rounded-xl glass-panel text-xs sm:text-sm font-medium text-gray-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
