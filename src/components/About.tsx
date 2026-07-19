"use client";

import React from "react";
import { User, Rocket, HeartHandshake, Lightbulb, CheckCircle2 } from "lucide-react";

export default function About() {
  const highlights = [
    {
      icon: <Rocket className="text-indigo-400" size={24} />,
      title: "Performance & Usabilidade",
      description: "Desenvolvimento focado na melhor experiência do usuário e tempo de resposta ágil.",
    },
    {
      icon: <HeartHandshake className="text-purple-400" size={24} />,
      title: "Trabalho em Equipe",
      description: "Colaboração eficaz, comunicação clara e boas práticas de controle de versão com Git.",
    },
    {
      icon: <Lightbulb className="text-pink-400" size={24} />,
      title: "Aprendizado Contínuo",
      description: "Constante atualização com as últimas tendências e frameworks do mercado.",
    },
  ];

  return (
    <section id="sobre" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm mb-3">
          <User size={18} />
          <span>SOBRE MIM</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
          Criando produtos digitais funcionais com <span className="text-gradient">paixão e precisão</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-gray-300 leading-relaxed font-normal text-base md:text-lg">
            <p>
              Olá! Sou uma desenvolvedora apaixonada por transformar problemas complexos em soluçõess simples e elegantes através da tecnologia.
            </p>
            <p>
              Meu trabalho abrange desde o planejamento da arquitetura front-end até a integração de APIs e deploy automatizado na nuvem. Acredito na força de um código bem estruturado, limpo e testável.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Desenvolvimento Responsivo",
                "Arquitetura Modular",
                "Clean Code & Boas Práticas",
                "Integrações REST e GraphQL",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 gap-4">
            {highlights.map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-4 hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-white/5 shrink-0">{card.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-100 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-400 leading-normal">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
