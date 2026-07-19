"use client";

import React from "react";
import { Cpu, Layout, Server, Wrench, CheckCircle } from "lucide-react";

export default function Skills() {
  const skillCategories = [
    {
      title: "Front-end & UI",
      icon: <Layout className="text-indigo-400" size={22} />,
      skills: [
        { name: "React.js / Next.js", level: "Avançado" },
        { name: "TypeScript", level: "Avançado" },
        { name: "JavaScript (ES6+)", level: "Avançado" },
        { name: "Tailwind CSS / HTML5", level: "Avançado" },
        { name: "CSS Modules & Design Systems", level: "Intermediário" },
      ],
    },
    {
      title: "Back-end & Mobile",
      icon: <Server className="text-purple-400" size={22} />,
      skills: [
        { name: "Node.js & Express", level: "Intermediário" },
        { name: "React Native", level: "Intermediário" },
        { name: "APIs RESTful & JSON", level: "Avançado" },
        { name: "Bancos de Dados SQL / NoSQL", level: "Intermediário" },
      ],
    },
    {
      title: "Ferramentas & Deploy",
      icon: <Wrench className="text-pink-400" size={22} />,
      skills: [
        { name: "Git & GitHub Workflow", level: "Avançado" },
        { name: "Hospedagem & CI/CD Vercel", level: "Avançado" },
        { name: "VS Code & Antigravity IDE", level: "Avançado" },
        { name: "npm / yarn / pnpm", level: "Avançado" },
      ],
    },
  ];

  return (
    <section id="habilidades" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-3">
          <Cpu size={18} />
          <span>TECNOLOGIAS E COMPETÊNCIAS</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Minha <span className="text-gradient">Stack de Desenvolvimento</span>
        </h2>
        <p className="text-gray-400 max-w-xl text-base">
          Tecnologias que utilizo no dia a dia para construir produtos modernos, escaláveis e de alta qualidade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {skillCategories.map((cat, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-3xl p-8 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="p-3 rounded-2xl bg-white/5">{cat.icon}</div>
                <h3 className="font-bold text-xl text-gray-100">{cat.title}</h3>
              </div>

              <ul className="space-y-4">
                {cat.skills.map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle size={16} className="text-indigo-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-md">
                      {skill.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
