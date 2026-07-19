"use client";

import React, { useState } from "react";
import { FolderGit2, ExternalLink, Sparkles } from "lucide-react";
import { GithubIcon } from "./Icons";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  color: string;
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const projects: Project[] = [
    {
      id: "celeste-app",
      title: "Celeste App",
      category: "Fullstack / Mobile",
      description: "Plataforma interativa desenvolvida com React Native e Node.js para gerenciamento e planos de assinaturas.",
      tags: ["React Native", "TypeScript", "Node.js", "Tailwind"],
      githubUrl: "https://github.com/",
      demoUrl: "https://vercel.com/",
      featured: true,
      color: "from-indigo-600 to-purple-600",
    },
    {
      id: "portfolio-next",
      title: "Portfólio Pessoal",
      category: "Front-end",
      description: "Site de portfólio moderno e de alto impacto visual construído com Next.js 15, TypeScript e Glassmorphism UI.",
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      githubUrl: "https://github.com/",
      demoUrl: "https://vercel.com/",
      featured: true,
      color: "from-purple-600 to-pink-600",
    },
    {
      id: "dash-analytics",
      title: "Dashboard de Métricas",
      category: "Front-end",
      description: "Painel administrativo intuitivo com gráficos dinâmicos, estatísticas em tempo real e alternador de temas.",
      tags: ["React", "Chart.js", "Tailwind", "REST API"],
      githubUrl: "https://github.com/",
      demoUrl: "https://vercel.com/",
      featured: false,
      color: "from-pink-600 to-rose-600",
    },
  ];

  const categories = ["Todos", "Front-end", "Fullstack / Mobile"];

  const filteredProjects =
    activeFilter === "Todos"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projetos" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-3">
          <FolderGit2 size={18} />
          <span>PORTFÓLIO DE TRABALHOS</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Meus <span className="text-gradient">Projetos em Destaque</span>
        </h2>
        <p className="text-gray-400 max-w-xl text-base">
          Conheça alguns dos principais projetos que desenvolvi, com código fonte disponível no GitHub e hospedagem na Vercel.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "glass-panel text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="glass-panel rounded-3xl overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col hover:-translate-y-1.5 shadow-lg"
          >
            {/* Project Header Banner */}
            <div className={`h-48 bg-gradient-to-tr ${project.color} p-6 flex flex-col justify-between relative overflow-hidden`}>
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-300 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
                    <Sparkles size={12} /> Destaque
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-white drop-shadow-md z-10">
                {project.title}
              </h3>

              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <GithubIcon size={16} /> Ver Repositório
                </a>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Deploy Vercel <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
