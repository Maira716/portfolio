"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Smartphone,
  Globe,
  Layout,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  MessageSquare,
  ChevronDown,
  Star,
  Award,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  Code2,
  Palette,
  CreditCard,
  Server,
  FileCode,
  Headphones,
} from "lucide-react";

interface ProjectPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  paymentTerms: string;
  popular: boolean;
  icon: any;
  badgeColor: string;
  description: string;
  deliveryTime: string;
  features: string[];
  whatsappMsg: string;
  optionalAddon?: string;
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"project" | "retainer">("project");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const projectPackages: ProjectPackage[] = [
    {
      id: "landing",
      name: "Landing Page & Site Institucional",
      tagline: "Presença digital de alta conversão & design exclusivo",
      price: "1.500",
      period: "valor único / projeto completo",
      paymentTerms: "Em até 3x sem juros no cartão ou 50% entrada + 50% na entrega",
      popular: false,
      icon: Globe,
      badgeColor: "from-blue-500 to-indigo-500",
      description: "Ideal para profissionais, startups e empresas que precisam de um site moderno, rápido e altamente persuasivo para converter visitantes em clientes.",
      deliveryTime: "30 dias",
      features: [
        "Design UX/UI exclusivo e sob medida de alto padrão",
        "Desenvolvimento 100% responsivo (Mobile, Tablet & Desktop)",
        "Otimização de alta velocidade & SEO avançado no Google",
        "Integração direta com WhatsApp, Formulários e Redes",
        "Animações fluidas e identidade visual premium",
        "Opção em até 3x sem juros ou 50% entrada / 50% entrega",
        "Suporte técnico de 30 dias pós-entrega"
      ],
      whatsappMsg: "Olá Maira! Gostaria de contratar o pacote Landing Page (R$ 1.500,00 - 3x sem juros ou 50% entrada / 50% entrega)."
    },
    {
      id: "software-monthly",
      name: "Software Web ou App (Plano Anual)",
      tagline: "Desenvolvimento contínuo com baixo custo inicial",
      price: "350",
      period: "/ mês (contrato de 12 meses)",
      paymentTerms: "Contrato de 12 meses • 1 atualização mensal + suporte inclusos",
      popular: true,
      icon: Smartphone,
      badgeColor: "from-indigo-500 via-purple-500 to-pink-500",
      description: "Tenha seu aplicativo mobile ou software web em produção com parcelas acessíveis, manutenção garantida e suporte contínuo durante todo o ano.",
      deliveryTime: "Desenvolvimento inicial + 12 meses de suporte",
      optionalAddon: "+ R$ 1.500,00 opcional para aquisição do código-fonte",
      features: [
        "Desenvolvimento do Software Web ou Aplicativo Mobile",
        "Contrato de 12 meses com parcelas fixas de R$ 350,00",
        "1 atualização de melhoria/funcionalidade por mês",
        "Suporte técnico contínuo durante todo o contrato",
        "Opcional: + R$ 1.500,00 para entrega definitiva do código-fonte",
        "Pós-contrato: Hospedagem por R$ 250/mês ou Manutenção por R$ 350/mês"
      ],
      whatsappMsg: "Olá Maira! Gostaria de contratar o plano de Software Web/App (Contrato de 12 meses de R$ 350,00/mês)."
    },
    {
      id: "redesign",
      name: "Consultoria & Redesign UX/UI",
      tagline: "Revitalize e aumente a conversão do seu produto",
      price: "3.500",
      period: "valor único / projeto completo",
      paymentTerms: "Em até 3x sem juros no cartão ou 50% entrada + 50% na conclusão",
      popular: false,
      icon: Layers,
      badgeColor: "from-emerald-500 to-teal-500",
      description: "Perfeito para apps ou plataformas existentes que precisam melhorar a usabilidade, estética e retenção de usuários.",
      deliveryTime: "30 a 60 dias",
      features: [
        "Auditoria heurística detalhada do produto atual",
        "Mapeamento de pontos de fricção e abandono",
        "Novo visual moderno, limpo e acessível",
        "Validação visual completa Antes x Depois",
        "Opção em até 3x sem juros ou 50% entrada / 50% conclusão",
        "Relatório estratégico com recomendações de produto"
      ],
      whatsappMsg: "Olá Maira! Gostaria de contratar a Consultoria & Redesign UX/UI (R$ 3.500,00 - 3x sem juros ou 50% entrada / 50% conclusão)."
    }
  ];

  const retainerPackages: ProjectPackage[] = [
    {
      id: "retainer-hosting",
      name: "Hospedagem & Infraestrutura Pós-Contrato",
      tagline: "Mantenha seu sistema no ar com máxima segurança",
      price: "250",
      period: "/ mês (pós-contrato de 12 meses)",
      paymentTerms: "Mensalidade pós-contrato • Cancele quando quiser",
      popular: false,
      icon: Server,
      badgeColor: "from-blue-500 to-cyan-500",
      description: "Opção para clientes que finalizaram o contrato inicial de 12 meses e desejam manter os servidores, banco de dados Supabase e domínios online.",
      deliveryTime: "Disponibilidade 24/7",
      features: [
        "Servidores de alta disponibilidade e SSL seguro",
        "Banco de dados Supabase / PostgreSQL mantido e monitorado",
        "Backups automáticos periódicos",
        "Monitoramento de estabilidade e segurança"
      ],
      whatsappMsg: "Olá Maira! Gostaria de ativar o plano de Hospedagem Pós-Contrato (R$ 250,00/mês)."
    },
    {
      id: "retainer-maintenance",
      name: "Manutenção, Atualizações & Suporte",
      tagline: "Evolução mensal do seu app ou software web",
      price: "350",
      period: "/ mês (com suporte contínuo)",
      paymentTerms: "Mensalidade com 1 atualização por mês + suporte técnico",
      popular: true,
      icon: Headphones,
      badgeColor: "from-indigo-500 via-purple-500 to-pink-500",
      description: "Plano de manutenção contínua: seu app ou software hospedado, com suporte prioritário e 1 atualização/melhoria de funcionalidade todo mês.",
      deliveryTime: "Atendimento prioritário",
      features: [
        "Tudo incluso no plano de hospedagem",
        "1 atualização/melhoria de funcionalidade por mês",
        "Suporte técnico prioritário via WhatsApp",
        "Correções preventivas e ajustes de compatibilidade",
        "Atendimento direto com a desenvolvedora Maira Reis"
      ],
      whatsappMsg: "Olá Maira! Gostaria de contratar o plano de Manutenção & Suporte (R$ 350,00/mês)."
    }
  ];

  const currentPackages = billingCycle === "project" ? projectPackages : retainerPackages;

  const faqs = [
    {
      question: "Como funciona o plano de Software/App por R$ 350,00/mês?",
      answer: "Você contrata o desenvolvimento do seu aplicativo ou sistema com um contrato de 12 meses com parcelas fixas de R$ 350,00. Durante todo o ano, você tem direito a 1 atualização/melhoria por mês e suporte técnico garantido. A entrega definitiva do código-fonte é opcional por + R$ 1.500,00."
    },
    {
      question: "Como funciona após o final do contrato de 12 meses?",
      answer: "Após os 12 meses, você tem total flexibilidade: se desejar apenas manter o projeto no ar nos servidores e banco de dados, o valor é de R$ 250,00/mês. Se quiser continuar contando com suporte técnico e 1 atualização mensal, o valor segue por R$ 350,00/mês."
    },
    {
      question: "Como funciona o pagamento da Landing Page (R$ 1.500)?",
      answer: "Para o pacote de Landing Page (R$ 1.500,00), oferecemos pagamento em até 3x sem juros no cartão de crédito, ou pagamento de 50% de entrada no início e 50% na entrega final após sua validação."
    },
    {
      question: "O código-fonte e o aplicativo nas lojas ficam no meu nome?",
      answer: "A compra do código-fonte é opcional. Você pode optar por adquirir o código definitivo e publicar o app diretamente na sua conta de desenvolvedor (Apple App Store / Google Play Store), ou escolher hospedar e manter o app na minha infraestrutura dedicada com planos mensais práticos e suporte contínuo."
    }
  ];

  const guarantees = [
    {
      title: "Transparência de Valores",
      description: "Valores claros, sem surpresas e com contratos formais detalhados.",
      icon: ShieldCheck
    },
    {
      title: "Design System Exclusivo",
      description: "Sua marca com tipografia, cores e componentes padronizados de alto padrão.",
      icon: Sparkles
    },
    {
      title: "Código Moderno & Seguro",
      description: "Desenvolvido com React, Next.js, React Native e Supabase de alta performance.",
      icon: Code2
    },
    {
      title: "Suporte Direto com Maira",
      description: "Acompanhamento pessoal e canal de comunicação direto para tirar dúvidas.",
      icon: Clock
    }
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30"
        >
          <Award size={16} />
          <span>Tabela de Investimento Transparente</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight mb-4 text-white"
        >
          Planos sob medida para o <span className="text-gradient">Seu Projeto</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
        >
          Opções flexíveis de investimento: contratação de projetos completos ou modelos de assinatura mensal com manutenção contínua.
        </motion.p>

        {/* Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row p-1.5 rounded-2xl glass-panel border border-white/10 relative max-w-full w-full sm:w-auto gap-1.5"
        >
          <button
            onClick={() => setBillingCycle("project")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              billingCycle === "project"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap size={15} />
            <span>Planos Principais</span>
          </button>

          <button
            onClick={() => setBillingCycle("retainer")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              billingCycle === "retainer"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock size={15} />
            <span>Pós-Contrato & Manutenção</span>
            <span className="text-[10px] uppercase font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">
              Mensal
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${billingCycle === "project" ? "lg:grid-cols-3 max-w-6xl mx-auto" : "lg:grid-cols-2 max-w-4xl mx-auto"} gap-6 mb-20`}>
        {currentPackages.map((pkg, idx) => {
          const IconComponent = pkg.icon;
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1.5 ${
                pkg.popular
                  ? "bg-gradient-to-b from-[#161a29] to-[#0c0f1d] border-2 border-indigo-500/80 shadow-[0_20px_60px_rgba(99,102,241,0.25)]"
                  : "glass-panel border border-white/10 hover:border-indigo-500/40"
              }`}
            >
              <div>
                {/* Header Package */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pkg.badgeColor} flex items-center justify-center text-white shadow-md`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Clock size={14} className="text-indigo-400" /> {pkg.deliveryTime}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-snug">{pkg.name}</h3>
                <p className="text-xs text-indigo-300 font-medium mb-4">{pkg.tagline}</p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-gray-400">Investimento</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-bold text-gray-400">R$</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight">{pkg.price}</span>
                    <span className="text-xs text-gray-400 font-medium">,00</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{pkg.period}</p>

                  {pkg.paymentTerms && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2">
                      <CreditCard size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-semibold text-emerald-300 leading-tight">
                        {pkg.paymentTerms}
                      </span>
                    </div>
                  )}

                  {pkg.optionalAddon && (
                    <div className="mt-2 p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2">
                      <FileCode size={14} className="text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-[10px] font-semibold text-purple-300 leading-tight">
                        {pkg.optionalAddon}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">O que está incluso:</p>
                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <div className="p-0.5 rounded-full bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/30">
                        <Check size={12} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <a
                href={`https://wa.me/553598030543?text=${encodeURIComponent(pkg.whatsappMsg)}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  pkg.popular
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-500/25 hover:scale-[1.02]"
                    : "glass-panel border border-white/20 hover:border-indigo-500/50 text-white hover:bg-white/10"
                }`}
              >
                <MessageSquare size={18} />
                <span>Solicitar este Pacote</span>
                <ArrowUpRight size={16} />
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* Value Proposition Guarantees */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            O Padrão de Qualidade em <span className="text-gradient">Todos os Projetos</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Garantias e metodologia de alto padrão inclusas em qualquer pacote contratado.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, gIdx) => {
            const GIcon = item.icon;
            return (
              <div key={gIdx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <GIcon size={20} />
                </div>
                <h4 className="font-bold text-base text-white">{item.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-3 px-3.5 py-1 rounded-full glass-panel border border-indigo-500/30">
            <HelpCircle size={14} />
            <span>Perguntas Frequentes</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dúvidas sobre Contratação e Pagamentos
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaq === fIdx;
            return (
              <div
                key={fIdx}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(fIdx)}
                  className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
