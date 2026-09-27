"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileCheck, ShieldAlert, Award, RefreshCw, CheckCircle2, Lock, HeartHandshake, Eye } from "lucide-react";

export default function B2BGuarantees() {
  const pillars = [
    {
      icon: <FileCheck className="text-indigo-400" size={26} />,
      title: "Contrato de Prestação de Serviços & NDA",
      subtitle: "Segurança Jurídica Completa",
      description:
        "Todo projeto é formalizado com contrato detalhando prazos, escopo, formas de pagamento e termo de sigilo para proteção total da sua ideia de negócio.",
      tag: "Segurança B2B",
    },
    {
      icon: <Eye className="text-purple-400" size={26} />,
      title: "Aprovação Visual Antes do Código",
      subtitle: "Zero Risco de Decepção",
      description:
        "Você visualiza o design de alta fidelidade e valida todo o visual e fluxo de telas antes de iniciar a programação. Sem surpresas.",
      tag: "Transparência Total",
    },
    {
      icon: <Lock className="text-pink-400" size={26} />,
      title: "Código Opcional & Hospedagem Flexível",
      subtitle: "Liberdade para o Seu Modelo de Negócio",
      description:
        "A compra do código-fonte é opcional. Você pode optar por adquirir o código definitivo para subir na sua própria conta ou contratar a hospedagem e manutenção na minha infraestrutura.",
      tag: "Flexibilidade Total",
    },
    {
      icon: <HeartHandshake className="text-emerald-400" size={26} />,
      title: "Garantia & Suporte Mensal",
      subtitle: "30 Dias Inclusos + Opção Mensal",
      description:
        "Após o lançamento, realizo o monitoramento contínuo, correções e treinamento didático. Além disso, você pode contratar suporte mensal para manter seu produto sempre atualizado e seguro.",
      tag: "Compromisso Real",
    },
  ];

  return (
    <section className="py-2 md:py-4 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <Award size={16} />
          <span>Compromisso e Garantia Corporativa</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white"
        >
          Por Que Empresas <span className="text-gradient">Confiam no Meu Trabalho?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
        >
          Elimino as incertezas comuns do desenvolvimento de software oferecendo um processo estruturado, seguro e profissional do primeiro contato até o pós-lançamento.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar, idx) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300">
                  {pillar.tag}
                </span>
              </div>

              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                {pillar.subtitle}
              </span>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {pillar.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-6 font-normal">
                {pillar.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Garantido em Cláusula Contratual</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
