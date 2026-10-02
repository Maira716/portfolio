"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Printer,
  Send,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  DollarSign,
  Calendar,
  CheckCircle2,
  Trash2,
  Clock,
  Layers,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Sliders,
  Receipt,
  Download,
  Package,
  Edit,
  Tag,
  CheckSquare,
  AlertCircle,
  LayoutGrid,
  List,
  Repeat,
  ChevronDown,
  Link2,
  ExternalLink,
  Share2,
  Star,
  PlusCircle
} from "lucide-react";
import { Project } from "@/app/admin/page";
import { Profile } from "@/context/AuthContext";
import { GeneratedDocData, openGeneratedDocument } from "@/lib/documentGenerator";
import { DEFAULT_AGENCY_DATA } from "@/lib/receiptGenerator";

export type BillingFrequency = "one_time" | "monthly" | "quarterly" | "yearly" | "hourly";
export type ProposalTemplateType = "software_dev" | "partnership_recurring" | string;

export interface ProposalPillar {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface ProposalClause {
  id: string;
  title: string;
  content: string;
}

export interface ProposalTemplateItem {
  id: string;
  key: string;
  name: string;
  subtitle: string;
  category: string;
  badge?: string;
  description: string;
  defaultNotes: string;
  pillars: ProposalPillar[];
  clauses: ProposalClause[];
  defaultScope: string[];
  isBuiltIn?: boolean;
  isActive: boolean;
  updatedAt: string;
  // Optional backward compatibility
  billingFrequency?: BillingFrequency;
  defaultPrice?: number;
  deliveryTimeline?: string;
  paymentTerms?: string;
  validityDays?: number;
  warrantyDays?: number;
  buyoutFormula?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  billingFrequency: BillingFrequency;
  deliveryTimeline: string;
  paymentTerms: string;
  warrantyDays: number;
  validityDays: number;
  scope: string[];
  badge?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProposalOption {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  price: number;
  billingFrequency: BillingFrequency;
  timelineWeeks?: string;
  paymentTerms?: string;
  warrantyDays?: number;
  badge?: string;
  isRecommended?: boolean;
  scopeItems: string[];
}

export interface CommercialProposal {
  id: string;
  docNumber: string;
  title: string;
  templateType?: ProposalTemplateType;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  projectId?: string;
  projectTitle: string;
  category: string;
  billingFrequency: BillingFrequency;
  scopeItems: string[];
  timelineWeeks: string;
  totalValue: number;
  paymentTerms: string;
  validityDays: number;
  warrantyDays: number;
  notes?: string;
  status: "draft" | "sent" | "in_negotiation" | "approved" | "rejected";
  options?: ProposalOption[];
  createdAt: string;
}

interface ProposalsModuleProps {
  projects: Project[];
  clients: Profile[];
  initialSubTab?: "proposals" | "products" | "templates";
  onSubTabChange?: (tab: "proposals" | "products" | "templates") => void;
  onSaveToProjectDocuments?: (doc: any, projectId: string) => void;
}

export const DEFAULT_PROPOSAL_TEMPLATES: ProposalTemplateItem[] = [
  {
    id: "tpl-software-dev",
    key: "software_dev",
    name: "Desenvolvimento de Software sob Medida",
    subtitle: "Para Landing Pages, Apps Mobile, Plataformas Web, SaaS e UI/UX exclusivos com entrega de código e garantia.",
    category: "Desenvolvimento Web & Mobile",
    billingFrequency: "one_time",
    defaultPrice: 1500,
    deliveryTimeline: "2 a 3 semanas",
    paymentTerms: "50% de entrada + 50% na aprovação final ou 3x sem juros",
    validityDays: 10,
    warrantyDays: 30,
    badge: "Mais Vendido",
    description: "Modelo padrão para criação de soluções digitais completas com propriedade integral de código, design exclusivo e garantia.",
    defaultNotes: "Desenvolvimento completo de ponta a ponta com design exclusivo no Figma, arquitetura moderna e garantia de entrega.",
    buyoutFormula: "Propriedade intelectual integral inclusa após quitação",
    pillars: [
      { id: "pil-1", title: "Design Exclusivo e Moderno", desc: "Identidade visual personalizada e moderna pensada no comportamento do seu usuário final no Figma." },
      { id: "pil-2", title: "Arquitetura Escalável & Alta Performance", desc: "Desenvolvimento em Next.js e TypeScript com tempo de carregamento ultra-rápido e SEO nativo." },
      { id: "pil-3", title: "Código Limpo & Handoff Técnico", desc: "Entrega de documentação completa e repositório organizado para fácil manutenção futura." },
      { id: "pil-4", title: "Garantia de 30 Dias Inclusa", desc: "Acompanhamento técnico pós-lançamento com correção imediata de qualquer inconsistência sem custo extra." }
    ],
    clauses: [
      { id: "cl-1", title: "1. Propriedade Intelectual & Código-Fonte", content: "Todos os direitos patrimoniais do código desenvolvido são transferidos integralmente ao Contratante após a liquidação do valor acordado." },
      { id: "cl-2", title: "2. Suporte & Garantia de Entrega", content: "Garantia de conformidade técnica por 30 dias a partir da homologação final, cobrindo eventuais correções e ajustes de estabilidade." },
      { id: "cl-3", title: "3. Homologação & Aprovações", content: "O cliente terá até 5 dias úteis para validar entregas parciais antes do go-live oficial." }
    ],
    defaultScope: [
      "Levantamento de Requisitos e Arquitetura de Software",
      "UI/UX Design Exclusivo no Figma (Desktop e Mobile)",
      "Desenvolvimento Fullstack com Next.js e Tailwind CSS",
      "Otimização de SEO, Meta Tags e Performance",
      "Deploy e Configuração de Domínio e Servidor na Vercel",
      "30 dias de Suporte Técnico e Correções Inclusas pós-publicação"
    ],
    isBuiltIn: true,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-partnership-recurring",
    key: "partnership_recurring",
    name: "Parceria Estratégica & App as a Service",
    subtitle: "Solução completa contínua com desenvolvimento, hospedagem, suporte técnico ativo e opção de Buyout.",
    category: "Parceria Estratégica (Recorrente)",
    billingFrequency: "monthly",
    defaultPrice: 350,
    deliveryTimeline: "30 a 60 dias (Versão Operacional)",
    paymentTerms: "Mensalidade recorrente contínua (todo dia 15)",
    validityDays: 15,
    warrantyDays: 0,
    badge: "Recorrente & Parceria",
    description: "Modelo inteligente de assinatura contínua com baixo custo de entrada, suporte integral, servidor em nuvem e evolução constante.",
    defaultNotes: "Modelo inteligente de assinatura contínua com opção de cessão de código após 12 meses.",
    buyoutFormula: "10x o valor da mensalidade contratada (mínimo de R$ 1.500)",
    pillars: [
      { id: "pil-1", title: "Baixo Custo de Entrada", desc: "Seu aplicativo ou sistema no ar sem necessidade de alto investimento inicial de desenvolvimento." },
      { id: "pil-2", title: "Hospedagem & Infraestrutura Inclusas", desc: "Servidores em nuvem, banco de dados e APIs gerenciados com monitoramento ativo 24/7." },
      { id: "pil-3", title: "Ciclo Contínuo de Atualizações", desc: "Evolução constante da sua plataforma com novas melhorias e recursos a cada 30 dias." },
      { id: "pil-4", title: "Opção de Compra de Código (Buyout)", desc: "Liberdade para adquirir a propriedade definitiva do código-fonte a qualquer momento." }
    ],
    clauses: [
      { id: "cl-1", title: "1. Manutenção Contínua & Hospedagem", content: "Enquanto a assinatura estiver ativa, todos os custos de servidor, suporte prioritário e correções de segurança estão 100% inclusos." },
      { id: "cl-2", title: "2. Faturamento & Vencimento", content: "A mensalidade será faturada mensalmente com vencimento todo dia 15 via Pix ou Cartão de Crédito." },
      { id: "cl-3", title: "3. Rescisão sem Multa Abusiva", content: "O contrato pode ser cancelado a qualquer momento com aviso prévio de 30 dias sem penalidades." },
      { id: "cl-4", title: "4. Cláusula de Aquisição do Código (Buyout)", content: "O cliente pode adquirir a propriedade integral do código-fonte pagando taxa calculada em 10x a mensalidade vigente (mínimo R$ 1.500)." }
    ],
    defaultScope: [
      "Desenvolvimento completo da solução mobile (iOS e Android)",
      "Publicação e homologação nas lojas Google Play Store & Apple App Store",
      "Hospedagem segura em nuvem, backend e banco de dados de alto desempenho",
      "Ciclo contínuo de atualizações, melhorias e correções a cada 30 dias",
      "Monitoramento ativo de segurança, estabilidade e suporte técnico operacional"
    ],
    isBuiltIn: true,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-ai-automation",
    key: "ai_automation",
    name: "Automação & Agentes de IA Conversacional",
    subtitle: "Implementação, integração ao WhatsApp/CRM e monitoramento contínuo de inteligência artificial.",
    category: "Automação & IA",
    billingFrequency: "monthly",
    defaultPrice: 1200,
    deliveryTimeline: "Setup em 7 dias + Gestão Contínua",
    paymentTerms: "Mensalidade recorrente no cartão ou Pix (todo dia 15)",
    validityDays: 15,
    warrantyDays: 0,
    badge: "IA & Automação",
    description: "Atendimento 24/7 inteligente com qualificação de leads, agendamento de reuniões e sincronização em tempo real.",
    defaultNotes: "Implementação de agente inteligente treinado na base de conhecimento da sua empresa com refinamento contínuo.",
    buyoutFormula: "Configurações e prompts transferíveis ao término do contrato",
    pillars: [
      { id: "pil-1", title: "Atendimento 24/7 sem Espera", desc: "Respostas instantâneas e humanizadas para clientes a qualquer hora do dia ou da noite." },
      { id: "pil-2", title: "Qualificação Automática de Leads", desc: "Filtro inteligente de oportunidades e encaminhamento direto para o time de vendas." },
      { id: "pil-3", title: "Integração Multicanal", desc: "Conexão oficial com WhatsApp, Instagram Direct, CRM e planilhas em nuvem." },
      { id: "pil-4", title: "Refinamento & Curadoria Contínua", desc: "Ajuste fino semanal dos prompts com base nos atendimentos reais para máxima taxa de conversão." }
    ],
    clauses: [
      { id: "cl-1", title: "1. Setup & Treinamento", content: "Configuração completa da base de conhecimento da empresa em até 7 dias úteis após envio do material." },
      { id: "cl-2", title: "2. Cobrança de Tokens / APIs", content: "Custos diretos de consumo de tokens (OpenAI/Anthropic) são faturados diretamente na conta do cliente ou com limite acordado." },
      { id: "cl-3", title: "3. Privacidade & Proteção de Dados", content: "Todos os dados de conversas e clientes são protegidos conforme as diretrizes da LGPD." }
    ],
    defaultScope: [
      "Criação e Treinamento do Agente de IA com a Base de Conhecimento",
      "Integração com WhatsApp Oficial e CRM",
      "Disparo Automático de Leads e Notificações no Painel",
      "Ajustes de Prompts e Melhorias Contínuas de Conversão",
      "Relatórios Mensais de Atendimentos e Leads Qualificados"
    ],
    isBuiltIn: false,
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_CATEGORIES: string[] = [
  "Landing Page (Next.js & Figma)",
  "Software Web & App Mobile",
  "Consultoria UX/UI Design",
  "E-commerce & Lojas Virtuais",
  "Otimização & Performance",
  "Suporte & Manutenção Recorrente",
  "Automação & IA",
  "Consultoria & Horas Técnicas"
];

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "prod-landing-page",
    name: "Landing Page Express & Conversão",
    category: "Landing Page (Next.js & Figma)",
    description: "Página institucional de alto impacto visual e copywriting estratégico orientada a conversão de leads.",
    deliveryTimeline: "2 a 3 semanas",
    basePrice: 1500,
    billingFrequency: "one_time",
    paymentTerms: "50% de entrada + 50% na aprovação final ou 3x sem juros",
    validityDays: 10,
    warrantyDays: 30,
    badge: "Mais Vendido",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Design de Interface Exclusivo e Moderno no Figma (Desktop e Mobile)",
      "Desenvolvimento em Next.js com Tailwind CSS e Framer Motion",
      "Otimização Completa de SEO, Meta Tags e OpenGraph para Redes Sociais",
      "Integração com Botão Direto de WhatsApp e Formulário de Contato",
      "Deploy e Configuração de Domínio e Servidor na Vercel",
      "30 dias de Suporte Técnico e Correções Inclusas pós-publicação"
    ]
  },
  {
    id: "prod-software-app",
    name: "Plataforma Web SaaS / App Mobile",
    category: "Software Web & App Mobile",
    description: "Desenvolvimento fullstack de plataforma web personalizada com painel administrativo e autenticação.",
    deliveryTimeline: "6 a 8 semanas",
    basePrice: 5500,
    billingFrequency: "one_time",
    paymentTerms: "Entrada de R$ 1.500 + 4x de R$ 1.000 ou 12x no cartão",
    validityDays: 15,
    warrantyDays: 60,
    badge: "Completo",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Levantamento de Requisitos e Arquitetura de Software",
      "UI/UX Design completo no Figma com Protótipo Navegável",
      "Desenvolvimento Fullstack (Next.js / React Native + Supabase)",
      "Autenticação Segura com Perfis de Acesso e Permissões",
      "Painel Administrativo para Gestão de Dados e Métricas",
      "Integração de Gateway de Pagamento e Notificações",
      "60 dias de Garantia e Acompanhamento pós-Go-Live"
    ]
  },
  {
    id: "prod-ux-redesign",
    name: "Redesign UI/UX & Consultoria",
    category: "Consultoria UX/UI Design",
    description: "Reformulação completa da experiência do usuário, design system escalável e protótipos de alta fidelidade.",
    deliveryTimeline: "3 a 4 semanas",
    basePrice: 3500,
    billingFrequency: "one_time",
    paymentTerms: "50% de entrada + 50% na entrega dos arquivos Figma",
    validityDays: 10,
    warrantyDays: 30,
    badge: "Design Pro",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Auditoria Heurística e Mapeamento de Pontos de Fricção",
      "Novo Fluxo de Usuário e Arquitetura de Informação",
      "Design System Completo (Tipografia, Cores, Componentes e Tokens)",
      "Wireframes de Alta Fidelidade no Figma (Design Responsivo)",
      "Entrega do Protótipo Interativo Navegável para Validação",
      "Guia de Especificação e Handoff Técnico para Desenvolvedores"
    ]
  },
  {
    id: "prod-ecommerce",
    name: "E-commerce & Checkout de Alta Performance",
    category: "E-commerce & Lojas Virtuais",
    description: "Loja virtual moderna com catálogo de produtos, cálculo de frete e checkout transparente.",
    deliveryTimeline: "4 a 5 semanas",
    basePrice: 4200,
    billingFrequency: "one_time",
    paymentTerms: "3x de R$ 1.400 ou 50% / 50% via Pix",
    validityDays: 10,
    warrantyDays: 45,
    badge: "E-commerce",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Catálogo de Produtos com Variações e Filtros Inteligentes",
      "Carrinho de Compras e Checkout Transparente (Pix, Cartão e Boleto)",
      "Cálculo Automático de Frete e Rastreamento de Encomendas",
      "Painel de Controle de Pedidos, Clientes e Estoque",
      "Otimização de Carregamento Ultra-rápido para Celulares",
      "Treinamento para Cadastro de Produtos e Gestão de Vendas"
    ]
  },
  {
    id: "prod-maintenance-plan",
    name: "Contrato de Suporte & Manutenção Mensal",
    category: "Suporte & Manutenção Recorrente",
    description: "Acompanhamento técnico mensal, atualizações de segurança, backups automáticos e horas de melhorias.",
    deliveryTimeline: "Recorrência Mensal contínua",
    basePrice: 800,
    billingFrequency: "monthly",
    paymentTerms: "Cobrança mensal recorrente todo dia 15 via Pix/Cartão",
    validityDays: 30,
    warrantyDays: 30,
    badge: "Recorrente",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Monitoramento 24/7 de Uptime e Disponibilidade do Site",
      "Backups Semanais de Código e Banco de Dados",
      "Atualizações de Dependências e Patches de Segurança",
      "Até 5 horas mensais dedicadas para alterações e novos recursos",
      "Suporte Prioritário via WhatsApp com SLA de resposta rápida"
    ]
  },
  {
    id: "prod-ai-automation",
    name: "Automação IA & Chatbot Inteligente",
    category: "Automação & IA",
    description: "Implementação e gestão contínua de agentes de IA integrados ao WhatsApp para atendimento e vendas.",
    deliveryTimeline: "Setup em 7 dias + Gestão Contínua",
    basePrice: 1200,
    billingFrequency: "monthly",
    paymentTerms: "Mensalidade recorrente no cartão ou boleto",
    validityDays: 15,
    warrantyDays: 30,
    badge: "IA & Recorrência",
    isActive: true,
    createdAt: new Date().toISOString(),
    scope: [
      "Criação e Treinamento do Agente de IA com a Base de Conhecimento",
      "Integração com WhatsApp Oficial e CRM",
      "Disparo Automático de Leads e Notificações no Painel",
      "Ajustes de Prompts e Melhorias Contínuas de Conversão",
      "Relatórios Mensais de Atendimentos e Leads Qualificados"
    ]
  }
];

export function ProposalsModule({
  projects,
  clients,
  initialSubTab = "proposals",
  onSubTabChange,
  onSaveToProjectDocuments
}: ProposalsModuleProps) {
  // Sub-tabs: "proposals" | "products" | "templates"
  const [activeSubTab, setActiveSubTab] = useState<"proposals" | "products" | "templates">(initialSubTab);

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSwitchSubTab = (tab: "proposals" | "products" | "templates") => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Products State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for the filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const [productViewMode, setProductViewMode] = useState<"grid" | "list">("grid");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // New Category Inline Form State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Landing Page (Next.js & Figma)");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState<number | string>(1500);
  const [prodBillingFrequency, setProdBillingFrequency] = useState<BillingFrequency>("one_time");
  const [prodTimeline, setProdTimeline] = useState("2 a 3 semanas");
  const [prodPaymentTerms, setProdPaymentTerms] = useState("50% de entrada + 50% na aprovação final");
  const [prodWarranty, setProdWarranty] = useState<number>(30);
  const [prodValidity, setProdValidity] = useState<number>(10);
  const [prodBadge, setProdBadge] = useState("");
  const [prodScopeText, setProdScopeText] = useState("");

  // Proposals State
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProposal, setEditingProposal] = useState<CommercialProposal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Templates Management State
  const [templates, setTemplates] = useState<ProposalTemplateItem[]>(DEFAULT_PROPOSAL_TEMPLATES);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");
  const [templateViewMode, setTemplateViewMode] = useState<"grid" | "list">("grid");
  const [isTemplateFilterDropdownOpen, setIsTemplateFilterDropdownOpen] = useState(false);
  const templateFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplateItem | null>(null);

  // Click outside listener for the template filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        templateFilterDropdownRef.current &&
        !templateFilterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateFilterDropdownOpen(false);
      }
    };

    if (isTemplateFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTemplateFilterDropdownOpen]);

  // Template Form State
  const [tplKey, setTplKey] = useState("");
  const [tplName, setTplName] = useState("");
  const [tplSubtitle, setTplSubtitle] = useState("");
  const [tplCategory, setTplCategory] = useState("Desenvolvimento Web & Mobile");
  const [tplBadge, setTplBadge] = useState("");
  const [tplDescription, setTplDescription] = useState("");
  const [tplNotes, setTplNotes] = useState("");
  const [tplScopeText, setTplScopeText] = useState("");
  const [tplPillars, setTplPillars] = useState<ProposalPillar[]>([]);
  const [tplClauses, setTplClauses] = useState<ProposalClause[]>([]);
  const [tplActiveSection, setTplActiveSection] = useState<"general" | "pillars" | "clauses" | "scope">("general");

  // Proposal Form State
  const [proposalTemplateType, setProposalTemplateType] = useState<ProposalTemplateType>("software_dev");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [cName, setCName] = useState("");
  const [cCompany, setCCompany] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState("Desenvolvimento Web & Mobile");
  const [proposalBillingFrequency, setProposalBillingFrequency] = useState<BillingFrequency>("one_time");
  const [proposalTitle, setProposalTitle] = useState("Proposta Comercial - Desenvolvimento sob Medida");
  const [scopeText, setScopeText] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("2 a 3 semanas");
  const [totalValue, setTotalValue] = useState<number | string>(1500);
  const [paymentTerms, setPaymentTerms] = useState("50% de entrada + 50% na aprovação final ou 3x sem juros");
  const [validityDays, setValidityDays] = useState<number>(10);
  const [warrantyDays, setWarrantyDays] = useState<number>(30);
  const [notes, setNotes] = useState("");
  const [proposalOptions, setProposalOptions] = useState<ProposalOption[]>([]);

  // Load products, categories, templates & proposals from localStorage on mount
  useEffect(() => {
    try {
      const rawCategories = localStorage.getItem("portfolio_product_categories_v1");
      if (rawCategories) {
        const loadedCats = JSON.parse(rawCategories);
        setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...loadedCats])));
      }

      const rawProducts = localStorage.getItem("portfolio_products_catalog_v1");
      if (rawProducts) {
        const parsedProds: ProductItem[] = JSON.parse(rawProducts);
        const normalized = parsedProds.map((p) => ({
          ...p,
          billingFrequency: p.billingFrequency || (p.deliveryTimeline?.toLowerCase().includes("mês") || p.name?.toLowerCase().includes("mensal") ? "monthly" : "one_time")
        }));
        setProducts(normalized);
      } else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem("portfolio_products_catalog_v1", JSON.stringify(DEFAULT_PRODUCTS));
      }

      // Load Proposal Templates
      const rawTemplates = localStorage.getItem("portfolio_proposal_templates_v1");
      if (rawTemplates) {
        try {
          const parsedTemplates: ProposalTemplateItem[] = JSON.parse(rawTemplates);
          if (Array.isArray(parsedTemplates) && parsedTemplates.length > 0) {
            setTemplates(parsedTemplates);
          } else {
            setTemplates(DEFAULT_PROPOSAL_TEMPLATES);
            localStorage.setItem("portfolio_proposal_templates_v1", JSON.stringify(DEFAULT_PROPOSAL_TEMPLATES));
          }
        } catch (e) {
          setTemplates(DEFAULT_PROPOSAL_TEMPLATES);
        }
      } else {
        setTemplates(DEFAULT_PROPOSAL_TEMPLATES);
        localStorage.setItem("portfolio_proposal_templates_v1", JSON.stringify(DEFAULT_PROPOSAL_TEMPLATES));
      }

      const rawProposals = localStorage.getItem("portfolio_commercial_proposals_v1");
      if (rawProposals) {
        setProposals(JSON.parse(rawProposals));
      } else {
        const initial: CommercialProposal[] = [
          {
            id: "prop-demo-1",
            docNumber: "PROP-2026-001",
            title: "Proposta Comercial - Landing Page de Alta Conversão",
            clientName: "Carlos Ferreira",
            clientCompany: "Prime Tech Soluções",
            clientEmail: "carlos@primetech.com.br",
            clientPhone: "11999998888",
            projectTitle: "Landing Page Institucional & Captação",
            category: "Landing Page",
            billingFrequency: "one_time",
            scopeItems: DEFAULT_PRODUCTS[0].scope,
            timelineWeeks: "2 a 3 semanas",
            totalValue: 1500,
            paymentTerms: "50% de entrada + 50% na aprovação final",
            validityDays: 10,
            warrantyDays: 30,
            notes: "Incluso deploy oficial na Vercel e suporte prioritário pós-lançamento.",
            status: "approved",
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ];
        setProposals(initial);
        localStorage.setItem("portfolio_commercial_proposals_v1", JSON.stringify(initial));
      }

      const rawViewMode = localStorage.getItem("portfolio_products_view_mode");
      if (rawViewMode === "grid" || rawViewMode === "list") {
        setProductViewMode(rawViewMode);
      }

      const rawTplViewMode = localStorage.getItem("portfolio_templates_view_mode");
      if (rawTplViewMode === "grid" || rawTplViewMode === "list") {
        setTemplateViewMode(rawTplViewMode);
      }
    } catch (e) {
      console.warn("Could not load data from storage:", e);
    }
  }, []);

  const handleToggleViewMode = (mode: "grid" | "list") => {
    setProductViewMode(mode);
    try {
      localStorage.setItem("portfolio_products_view_mode", mode);
    } catch (e) {}
  };

  const handleToggleTemplateViewMode = (mode: "grid" | "list") => {
    setTemplateViewMode(mode);
    try {
      localStorage.setItem("portfolio_templates_view_mode", mode);
    } catch (e) {}
  };

  const saveProductsToStorage = (updated: ProductItem[]) => {
    setProducts(updated);
    try {
      localStorage.setItem("portfolio_products_catalog_v1", JSON.stringify(updated));
    } catch (e) {}
  };

  const saveCategoriesToStorage = (updated: string[]) => {
    setCategories(updated);
    try {
      localStorage.setItem("portfolio_product_categories_v1", JSON.stringify(updated));
    } catch (e) {}
  };

  const saveTemplatesToStorage = (updated: ProposalTemplateItem[]) => {
    setTemplates(updated);
    try {
      localStorage.setItem("portfolio_proposal_templates_v1", JSON.stringify(updated));
    } catch (e) {}
  };

  const saveProposalsToStorage = (updated: CommercialProposal[]) => {
    setProposals(updated);
    try {
      localStorage.setItem("portfolio_commercial_proposals_v1", JSON.stringify(updated));
      fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch((e) => console.warn("Could not sync proposals to server:", e));
    } catch (e) {}
  };

  // Add a new custom category on the fly
  const handleAddCustomCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      alert("Por favor, digite o nome da categoria.");
      return;
    }

    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      saveCategoriesToStorage(updated);
    }

    setProdCategory(trimmed);
    setNewCategoryInput("");
    setIsCreatingNewCategory(false);
  };

  // Product CRUD
  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory(categories[0] || "Landing Page (Next.js & Figma)");
    setIsCreatingNewCategory(false);
    setNewCategoryInput("");
    setProdDesc("");
    setProdPrice(1500);
    setProdBillingFrequency("one_time");
    setProdTimeline("2 a 3 semanas");
    setProdPaymentTerms("50% de entrada + 50% na aprovação final");
    setProdWarranty(30);
    setProdValidity(10);
    setProdBadge("");
    setProdScopeText("");
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setIsCreatingNewCategory(false);
    setNewCategoryInput("");
    setProdDesc(prod.description);
    setProdPrice(prod.basePrice);
    setProdBillingFrequency(prod.billingFrequency || "one_time");
    setProdTimeline(prod.deliveryTimeline);
    setProdPaymentTerms(prod.paymentTerms);
    setProdWarranty(prod.warrantyDays);
    setProdValidity(prod.validityDays);
    setProdBadge(prod.badge || "");
    setProdScopeText((prod.scope || []).join("\n"));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert("Informe o nome do produto ou serviço.");
      return;
    }

    let effectiveCategory = prodCategory;
    if (isCreatingNewCategory && newCategoryInput.trim()) {
      effectiveCategory = newCategoryInput.trim();
      if (!categories.includes(effectiveCategory)) {
        saveCategoriesToStorage([...categories, effectiveCategory]);
      }
    }

    const scopeArr = prodScopeText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingProduct) {
      const updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: prodName.trim(),
              category: effectiveCategory,
              description: prodDesc.trim(),
              basePrice: Number(prodPrice) || 0,
              billingFrequency: prodBillingFrequency,
              deliveryTimeline: prodTimeline.trim(),
              paymentTerms: prodPaymentTerms.trim(),
              warrantyDays: Number(prodWarranty) >= 0 ? Number(prodWarranty) : 0,
              validityDays: Number(prodValidity) >= 0 ? Number(prodValidity) : 0,
              badge: prodBadge.trim() || undefined,
              scope: scopeArr
            }
          : p
      );
      saveProductsToStorage(updatedList);
    } else {
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        name: prodName.trim(),
        category: effectiveCategory,
        description: prodDesc.trim(),
        basePrice: Number(prodPrice) || 0,
        billingFrequency: prodBillingFrequency,
        deliveryTimeline: prodTimeline.trim(),
        paymentTerms: prodPaymentTerms.trim(),
        warrantyDays: Number(prodWarranty) >= 0 ? Number(prodWarranty) : 0,
        validityDays: Number(prodValidity) >= 0 ? Number(prodValidity) : 0,
        badge: prodBadge.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        scope: scopeArr
      };
      saveProductsToStorage([newProd, ...products]);
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Deseja realmente excluir este produto/serviço do catálogo?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProductsToStorage(updated);
  };

  // Template CRUD & Actions
  const handleOpenNewTemplateModal = () => {
    setEditingTemplate(null);
    setTplKey(`tpl_custom_${Date.now()}`);
    setTplName("");
    setTplSubtitle("");
    setTplCategory(categories[0] || "Desenvolvimento Web & Mobile");
    setTplBadge("");
    setTplDescription("");
    setTplNotes("");
    setTplScopeText("");
    setTplPillars([
      { id: `pil-${Date.now()}-1`, title: "Design & UX Estratégico", desc: "Interface exclusiva e intuitiva projetada sob medida para o seu público." },
      { id: `pil-${Date.now()}-2`, title: "Engenharia de Alto Desempenho", desc: "Código limpo, moderno, responsivo e com arquitetura escalável." }
    ]);
    setTplClauses([
      { id: `cl-${Date.now()}-1`, title: "1. Condições de Homologação", content: "O cliente terá até 5 dias úteis para validação e testes das entregas parciais." },
      { id: `cl-${Date.now()}-2`, title: "2. Suporte e Garantia", content: "Suporte técnico para correções e estabilidade operacional conforme acordado." }
    ]);
    setTplActiveSection("general");
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplateModal = (tpl: ProposalTemplateItem) => {
    setEditingTemplate(tpl);
    setTplKey(tpl.key);
    setTplName(tpl.name);
    setTplSubtitle(tpl.subtitle || "");
    setTplCategory(tpl.category || "Desenvolvimento Web & Mobile");
    setTplBadge(tpl.badge || "");
    setTplDescription(tpl.description || "");
    setTplNotes(tpl.defaultNotes || "");
    setTplScopeText((tpl.defaultScope || []).join("\n"));
    setTplPillars(tpl.pillars && tpl.pillars.length > 0 ? [...tpl.pillars] : []);
    setTplClauses(tpl.clauses && tpl.clauses.length > 0 ? [...tpl.clauses] : []);
    setTplActiveSection("general");
    setIsTemplateModalOpen(true);
  };

  const handleDuplicateTemplate = (tpl: ProposalTemplateItem) => {
    const duplicated: ProposalTemplateItem = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      key: `${tpl.key}_copy_${Date.now().toString(36).substr(2, 4)}`,
      name: `${tpl.name} (Cópia)`,
      isBuiltIn: false,
      updatedAt: new Date().toISOString()
    };
    saveTemplatesToStorage([duplicated, ...templates]);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      alert("Por favor, preencha o nome do modelo de proposta.");
      return;
    }

    const scopeArr = tplScopeText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const validPillars = tplPillars.filter((p) => p.title.trim().length > 0);
    const validClauses = tplClauses.filter((c) => c.title.trim().length > 0);

    if (editingTemplate) {
      const updatedList = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: tplName.trim(),
              subtitle: tplSubtitle.trim(),
              category: tplCategory.trim(),
              badge: tplBadge.trim() || undefined,
              description: tplDescription.trim(),
              defaultNotes: tplNotes.trim(),
              pillars: validPillars,
              clauses: validClauses,
              defaultScope: scopeArr,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      saveTemplatesToStorage(updatedList);
    } else {
      const newTemplate: ProposalTemplateItem = {
        id: `tpl-${Date.now()}`,
        key: tplKey.trim() || `tpl_custom_${Date.now()}`,
        name: tplName.trim(),
        subtitle: tplSubtitle.trim(),
        category: tplCategory.trim(),
        badge: tplBadge.trim() || undefined,
        description: tplDescription.trim(),
        defaultNotes: tplNotes.trim(),
        pillars: validPillars,
        clauses: validClauses,
        defaultScope: scopeArr,
        isBuiltIn: false,
        isActive: true,
        updatedAt: new Date().toISOString()
      };
      saveTemplatesToStorage([newTemplate, ...templates]);
    }

    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    if (target.isBuiltIn) {
      if (!confirm(`O modelo "${target.name}" é um modelo de sistema padrão. Tem certeza que deseja removê-lo? (Você poderá restaurar os padrões a qualquer momento).`)) return;
    } else {
      if (!confirm(`Deseja realmente remover o modelo "${target.name}"?`)) return;
    }
    const updated = templates.filter((t) => t.id !== id);
    saveTemplatesToStorage(updated);
  };

  const handleResetTemplatesToDefault = () => {
    if (!confirm("Deseja restaurar os modelos de proposta originais de fábrica? Isso atualizará os modelos predefinidos de desenvolvimento sob medida e parceria estratégica.")) return;
    saveTemplatesToStorage(DEFAULT_PROPOSAL_TEMPLATES);
  };

  // Helper Pillar Handlers for Template Modal
  const handleAddPillarToTemplate = () => {
    setTplPillars((prev) => [
      ...prev,
      {
        id: `pil-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: "",
        desc: ""
      }
    ]);
  };

  const handleUpdatePillar = (id: string, field: "title" | "desc", value: string) => {
    setTplPillars((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePillar = (id: string) => {
    setTplPillars((prev) => prev.filter((p) => p.id !== id));
  };

  // Helper Clause Handlers for Template Modal
  const handleAddClauseToTemplate = () => {
    setTplClauses((prev) => [
      ...prev,
      {
        id: `cl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: `${prev.length + 1}. Nova Cláusula`,
        content: ""
      }
    ]);
  };

  const handleUpdateClause = (id: string, field: "title" | "content", value: string) => {
    setTplClauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveClause = (id: string) => {
    setTplClauses((prev) => prev.filter((c) => c.id !== id));
  };

  // Apply a selected template to proposal form
  const handleSelectTemplate = (template: ProposalTemplateItem) => {
    setProposalTemplateType(template.key || template.id);
    setProposalTitle(`Proposta Comercial - ${template.name}`);
    setPCategory(template.category);
    if (template.billingFrequency) {
      setProposalBillingFrequency(template.billingFrequency);
    }
    setNotes(template.defaultNotes || template.description);
    if ((!scopeText || scopeText.trim().length === 0) && template.defaultScope && template.defaultScope.length > 0) {
      setScopeText(template.defaultScope.join("\n"));
    }
  };

  const handleSelectTemplateType = (type: ProposalTemplateType) => {
    const matched = templates.find((t) => t.key === type || t.id === type);
    if (matched) {
      handleSelectTemplate(matched);
      return;
    }
    setProposalTemplateType(type);
    if (type === "partnership_recurring") {
      setProposalBillingFrequency("monthly");
      setProposalTitle("Proposta Comercial - Parceria Estratégica & App as a Service");
      setPCategory("Parceria Estratégica (Recorrente)");
      setTimelineWeeks("30 a 60 dias (Versão Operacional)");
      setPaymentTerms("Mensalidade recorrente contínua (todo dia 15)");
      setWarrantyDays(0);
      setValidityDays(15);
      setNotes("Modelo inteligente de assinatura contínua com opção de cessão de código após 12 meses.");
    } else {
      setProposalBillingFrequency("one_time");
      setProposalTitle("Proposta Comercial - Desenvolvimento sob Medida");
      setPCategory("Desenvolvimento Web & Mobile");
      setTimelineWeeks("2 a 3 semanas");
      setPaymentTerms("50% de entrada + 50% na aprovação final");
      setWarrantyDays(30);
      setValidityDays(10);
      setNotes("Desenvolvimento completo de ponta a ponta com design exclusivo, arquitetura moderna e garantia de entrega.");
    }
  };

  const handleCreateProposalFromTemplate = (template: ProposalTemplateItem) => {
    handleOpenCreateNewProposal();
    handleSelectTemplate(template);
  };

  // Helper handlers for proposal multi-options (Package options for client selection)
  const handleAddProductToOptions = (prod: ProductItem) => {
    let terms = prod.paymentTerms || "";
    if (terms.includes("dia 05") || terms.includes("dia 5")) {
      terms = terms.replace(/dia 0?5/g, "dia 15");
    } else if (!terms && (prod.billingFrequency === "monthly" || proposalTemplateType === "partnership_recurring")) {
      terms = "Mensalidade recorrente contínua (todo dia 15)";
    }

    const newOption: ProposalOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      name: prod.name,
      description: prod.description || "",
      price: prod.basePrice,
      billingFrequency: prod.billingFrequency || "one_time",
      timelineWeeks: prod.deliveryTimeline || "2 a 3 semanas",
      paymentTerms: terms,
      warrantyDays: prod.warrantyDays,
      badge: prod.badge || (proposalOptions.length === 0 ? "Recomendado" : undefined),
      isRecommended: proposalOptions.length === 0,
      scopeItems: [...(prod.scope || [])]
    };

    setProposalOptions((prev) => [...prev, newOption]);
  };

  const handleAddCustomOption = () => {
    const isMonthly = proposalTemplateType === "partnership_recurring";
    const newOption: ProposalOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Opção ${proposalOptions.length + 1}`,
      description: "",
      price: 1500,
      billingFrequency: isMonthly ? "monthly" : "one_time",
      timelineWeeks: isMonthly ? "Recorrência Mensal contínua" : "2 a 3 semanas",
      paymentTerms: isMonthly ? "Mensalidade recorrente contínua (todo dia 15)" : "50% de entrada + 50% na aprovação final",
      warrantyDays: isMonthly ? 0 : 30,
      badge: proposalOptions.length === 0 ? "Recomendado" : undefined,
      isRecommended: proposalOptions.length === 0,
      scopeItems: []
    };

    setProposalOptions((prev) => [...prev, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    const updated = proposalOptions.filter((o) => o.id !== optionId);
    if (updated.length > 0 && !updated.some((o) => o.isRecommended)) {
      updated[0].isRecommended = true;
    }
    setProposalOptions(updated);
  };

  const handleSetRecommendedOption = (optionId: string) => {
    setProposalOptions((prev) =>
      prev.map((o) => ({
        ...o,
        isRecommended: o.id === optionId
      }))
    );
  };

  const handleUpdateOption = (optionId: string, updates: Partial<ProposalOption>) => {
    setProposalOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, ...updates } : o))
    );
  };

  // 1-Click: Create Proposal from Product
  const handleCreateProposalFromProduct = (prod: ProductItem) => {
    const isParceria =
      prod.category?.toLowerCase().includes("parcer") ||
      prod.name?.toLowerCase().includes("parcer") ||
      prod.name?.toLowerCase().includes("celeste") ||
      (prod.billingFrequency && prod.billingFrequency !== "one_time");

    const templateType: ProposalTemplateType = isParceria ? "partnership_recurring" : "software_dev";
    setProposalTemplateType(templateType);
    setProposalTitle(`Proposta Comercial - ${prod.name}`);
    setPCategory(prod.category);
    setProposalBillingFrequency(prod.billingFrequency || (isParceria ? "monthly" : "one_time"));
    setTimelineWeeks(prod.deliveryTimeline);
    setTotalValue(prod.basePrice);

    // Strictly follow product payment terms, standardizing recurring payment day to 15
    let terms = prod.paymentTerms || "";
    if (terms.includes("dia 05") || terms.includes("dia 5")) {
      terms = terms.replace(/dia 0?5/g, "dia 15");
    } else if (!terms && (prod.billingFrequency === "monthly" || isParceria)) {
      terms = "Mensalidade recorrente contínua (todo dia 15)";
    }
    setPaymentTerms(terms);

    setValidityDays(prod.validityDays);
    setWarrantyDays(prod.warrantyDays);
    setScopeText(prod.scope.join("\n"));
    setPTitle(prod.name);
    setNotes(prod.description || "");

    // Also populate as primary option in proposalOptions
    const initialOption: ProposalOption = {
      id: `opt-${Date.now()}`,
      productId: prod.id,
      name: prod.name,
      description: prod.description || "",
      price: prod.basePrice,
      billingFrequency: prod.billingFrequency || (isParceria ? "monthly" : "one_time"),
      timelineWeeks: prod.deliveryTimeline,
      paymentTerms: terms,
      warrantyDays: prod.warrantyDays,
      badge: prod.badge || "Recomendado",
      isRecommended: true,
      scopeItems: [...(prod.scope || [])]
    };
    setProposalOptions([initialOption]);

    setActiveSubTab("proposals");
    if (onSubTabChange) onSubTabChange("proposals");
    setIsCreating(true);
  };

  // Handle template selection in Proposal Modal
  const handleApplyProductTemplate = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const isParceria =
      prod.category?.toLowerCase().includes("parcer") ||
      prod.name?.toLowerCase().includes("parcer") ||
      prod.name?.toLowerCase().includes("celeste") ||
      (prod.billingFrequency && prod.billingFrequency !== "one_time");

    const templateType: ProposalTemplateType = isParceria ? "partnership_recurring" : "software_dev";
    setProposalTemplateType(templateType);
    setProposalTitle(`Proposta Comercial - ${prod.name}`);
    setPCategory(prod.category);
    setProposalBillingFrequency(prod.billingFrequency || (isParceria ? "monthly" : "one_time"));
    setTimelineWeeks(prod.deliveryTimeline);
    setTotalValue(prod.basePrice);

    // Strictly follow product payment terms, standardizing recurring payment day to 15
    let terms = prod.paymentTerms || "";
    if (terms.includes("dia 05") || terms.includes("dia 5")) {
      terms = terms.replace(/dia 0?5/g, "dia 15");
    } else if (!terms && (prod.billingFrequency === "monthly" || isParceria)) {
      terms = "Mensalidade recorrente contínua (todo dia 15)";
    }
    setPaymentTerms(terms);

    setValidityDays(prod.validityDays);
    setWarrantyDays(prod.warrantyDays);
    setScopeText(prod.scope.join("\n"));
    if (!pTitle) setPTitle(prod.name);
    if (prod.description) {
      setNotes(prod.description);
    }

    const newOption: ProposalOption = {
      id: `opt-${Date.now()}`,
      productId: prod.id,
      name: prod.name,
      description: prod.description || "",
      price: prod.basePrice,
      billingFrequency: prod.billingFrequency || (isParceria ? "monthly" : "one_time"),
      timelineWeeks: prod.deliveryTimeline || "2 a 3 semanas",
      paymentTerms: terms,
      warrantyDays: prod.warrantyDays,
      badge: prod.badge || (proposalOptions.length === 0 ? "Recomendado" : undefined),
      isRecommended: proposalOptions.length === 0,
      scopeItems: [...(prod.scope || [])]
    };

    setProposalOptions((prev) => {
      const exists = prev.some((o) => o.productId === prod.id || o.name === prod.name);
      if (exists) return prev;
      return [...prev, newOption];
    });
  };

  // Auto-fill client
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setCName(client.full_name || "");
      setCCompany(client.company || "");
      setCEmail(client.email || "");
      setCPhone(client.phone || "");
    }
  };

  // Auto-fill project
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setPTitle(proj.title);
      setPCategory(proj.category || pCategory);
      if ((proj as any).budget) setTotalValue((proj as any).budget);
      if (proj.client_id) handleSelectClient(proj.client_id);
    }
  };

  const handleOpenCreateNewProposal = (forcedType?: ProposalTemplateType) => {
    setEditingProposal(null);
    setScopeText("");
    setProposalOptions([]);
    if (forcedType) {
      handleSelectTemplateType(forcedType);
    } else {
      handleSelectTemplateType("software_dev");
    }
    setIsCreating(true);
  };

  // Open proposal modal for editing existing proposal
  const handleEditProposal = (prop: CommercialProposal) => {
    setEditingProposal(prop);
    const templateType: ProposalTemplateType =
      prop.templateType ||
      (prop.billingFrequency && prop.billingFrequency !== "one_time"
        ? "partnership_recurring"
        : "software_dev");

    setProposalTemplateType(templateType);
    setSelectedClientId(prop.projectId ? "" : "");
    setSelectedProjectId(prop.projectId || "");
    setCName(prop.clientName || "");
    setCCompany(prop.clientCompany || "");
    setCEmail(prop.clientEmail || "");
    setCPhone(prop.clientPhone || "");
    setPTitle(prop.projectTitle || "");
    setPCategory(prop.category || (templateType === "partnership_recurring" ? "Parceria Estratégica (Recorrente)" : "Desenvolvimento Web & Mobile"));
    setProposalBillingFrequency(prop.billingFrequency || "one_time");
    setProposalTitle(prop.title || `Proposta Comercial - ${prop.projectTitle}`);
    setScopeText((prop.scopeItems || []).join("\n"));
    setTimelineWeeks(prop.timelineWeeks || "");
    setTotalValue(prop.totalValue);
    setPaymentTerms(prop.paymentTerms || "");
    setValidityDays(prop.validityDays ?? 10);
    setWarrantyDays(prop.warrantyDays ?? 30);
    setNotes(prop.notes || "");
    
    if (prop.options && Array.isArray(prop.options) && prop.options.length > 0) {
      setProposalOptions(prop.options);
    } else {
      // Create fallback option from proposal direct fields if none existed
      const fallbackOption: ProposalOption = {
        id: `opt-${prop.id}`,
        name: prop.projectTitle || prop.title,
        description: prop.notes || "",
        price: prop.totalValue,
        billingFrequency: prop.billingFrequency || "one_time",
        timelineWeeks: prop.timelineWeeks || "2 a 3 semanas",
        paymentTerms: prop.paymentTerms || "",
        warrantyDays: prop.warrantyDays ?? 30,
        badge: "Recomendado",
        isRecommended: true,
        scopeItems: prop.scopeItems || []
      };
      setProposalOptions([fallbackOption]);
    }

    setIsCreating(true);
  };

  // Format Price with Billing Recurrence
  const formatPriceWithFrequency = (val: number, freq: BillingFrequency = "one_time") => {
    const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    switch (freq) {
      case "monthly":
        return `${formatted} / mês`;
      case "quarterly":
        return `${formatted} / trimestre`;
      case "yearly":
        return `${formatted} / ano`;
      case "hourly":
        return `${formatted} / hora`;
      case "one_time":
      default:
        return formatted;
    }
  };

  const getFrequencyLabel = (freq: BillingFrequency = "one_time") => {
    switch (freq) {
      case "monthly":
        return "Mensalidade Recorrente";
      case "quarterly":
        return "Trimestral Recorrente";
      case "yearly":
        return "Anuidade Recorrente";
      case "hourly":
        return "Por Hora Técnica";
      case "one_time":
      default:
        return "Pagamento Único (Projeto)";
    }
  };

  // Generate PDF from proposal
  const handleGeneratePdf = (prop: CommercialProposal) => {
    const priceFormatted = formatPriceWithFrequency(prop.totalValue, prop.billingFrequency);
    
    const notesParts: string[] = [];
    if (prop.notes?.trim()) {
      notesParts.push(prop.notes.trim());
    }
    if (prop.billingFrequency && prop.billingFrequency !== "one_time") {
      notesParts.push(`• Modelo de Contratação: ${getFrequencyLabel(prop.billingFrequency)} (${priceFormatted})`);
    }
    if (prop.paymentTerms?.trim()) {
      notesParts.push(`• Condições de Pagamento: ${prop.paymentTerms.trim()}`);
    }
    if (prop.validityDays && prop.validityDays > 0) {
      notesParts.push(`• Validade da Proposta: ${prop.validityDays} dias a contar da emissão`);
    }
    if (prop.warrantyDays && prop.warrantyDays > 0) {
      notesParts.push(`• Garantia Técnica: ${prop.warrantyDays} dias pós-entrega`);
    }

    const validScope = (prop.scopeItems || []).filter((s) => s && s.trim().length > 0);

    const docData: GeneratedDocData = {
      type: "proposta",
      docNumber: prop.docNumber,
      title: prop.title,
      projectId: prop.projectId || "geral",
      projectTitle: prop.projectTitle,
      client: {
        name: prop.clientName,
        company: prop.clientCompany?.trim() || undefined,
        email: prop.clientEmail?.trim() || undefined,
        phone: prop.clientPhone?.trim() || undefined
      },
      agency: DEFAULT_AGENCY_DATA,
      scopeItems: validScope.length > 0 ? validScope : undefined,
      totalValue: prop.totalValue,
      deliveryDate: prop.timelineWeeks?.trim() || undefined,
      notes: notesParts.length > 0 ? notesParts.join("\n") : undefined,
      createdAt: prop.createdAt
    };

    openGeneratedDocument(docData);
  };

  // Save new proposal or update existing proposal
  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !pTitle.trim()) {
      alert("Por favor, preencha ao menos o nome do cliente e o título do projeto.");
      return;
    }

    const primaryOption = proposalOptions.find((o) => o.isRecommended) || proposalOptions[0];

    const effectiveTotalValue = primaryOption ? primaryOption.price : (Number(totalValue) || 1500);
    const effectiveBillingFrequency = primaryOption ? primaryOption.billingFrequency : proposalBillingFrequency;
    const effectiveTimeline = primaryOption ? (primaryOption.timelineWeeks || timelineWeeks) : timelineWeeks;
    const effectivePaymentTerms = primaryOption ? (primaryOption.paymentTerms || paymentTerms) : paymentTerms;
    const effectiveWarrantyDays = primaryOption ? (primaryOption.warrantyDays ?? warrantyDays) : warrantyDays;
    const effectiveScopeItems = primaryOption && primaryOption.scopeItems && primaryOption.scopeItems.length > 0
      ? primaryOption.scopeItems
      : scopeText
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

    if (editingProposal) {
      const updatedProp: CommercialProposal = {
        ...editingProposal,
        title: proposalTitle.trim() || `Proposta Comercial - ${pTitle}`,
        templateType: proposalTemplateType,
        clientName: cName.trim(),
        clientCompany: cCompany.trim() || undefined,
        clientEmail: cEmail.trim() || undefined,
        clientPhone: cPhone.trim() || undefined,
        projectId: selectedProjectId || undefined,
        projectTitle: pTitle.trim(),
        category: pCategory,
        billingFrequency: effectiveBillingFrequency,
        scopeItems: effectiveScopeItems,
        timelineWeeks: effectiveTimeline.trim() || "",
        totalValue: effectiveTotalValue,
        paymentTerms: effectivePaymentTerms.trim(),
        validityDays: Number(validityDays) || 10,
        warrantyDays: Number(effectiveWarrantyDays) || 0,
        notes: notes.trim() || undefined,
        options: proposalOptions.length > 0 ? proposalOptions : undefined
      };

      const updatedList = proposals.map((p) => (p.id === editingProposal.id ? updatedProp : p));
      saveProposalsToStorage(updatedList);
      setIsCreating(false);
      setEditingProposal(null);
      return;
    }

    const docNum = `PROP-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(3, "0")}`;

    const newProp: CommercialProposal = {
      id: `prop-${Date.now()}`,
      docNumber: docNum,
      title: proposalTitle.trim() || `Proposta Comercial - ${pTitle}`,
      templateType: proposalTemplateType,
      clientName: cName.trim(),
      clientCompany: cCompany.trim() || undefined,
      clientEmail: cEmail.trim() || undefined,
      clientPhone: cPhone.trim() || undefined,
      projectId: selectedProjectId || undefined,
      projectTitle: pTitle.trim(),
      category: pCategory,
      billingFrequency: effectiveBillingFrequency,
      scopeItems: effectiveScopeItems,
      timelineWeeks: effectiveTimeline.trim() || "",
      totalValue: effectiveTotalValue,
      paymentTerms: effectivePaymentTerms.trim(),
      validityDays: Number(validityDays) || 10,
      warrantyDays: Number(effectiveWarrantyDays) || 0,
      notes: notes.trim() || undefined,
      options: proposalOptions.length > 0 ? proposalOptions : undefined,
      status: "draft",
      createdAt: new Date().toISOString()
    };

    const updatedList = [newProp, ...proposals];
    saveProposalsToStorage(updatedList);

    if (selectedProjectId && onSaveToProjectDocuments) {
      onSaveToProjectDocuments(
        {
          id: `doc-${Date.now()}`,
          project_id: selectedProjectId,
          title: newProp.title,
          filename: `${newProp.title.replace(/\s+/g, "_")}.pdf`,
          category: "proposta",
          visibility: "client",
          file_url: "data:application/pdf;base64,JVBERi0xLjQKJc...",
          file_size_bytes: 48000,
          file_size_formatted: "48 KB",
          mime_type: "application/pdf",
          uploaded_at: new Date().toISOString(),
          notes: `Proposta comercial emitida: ${docNum}`
        },
        selectedProjectId
      );
    }

    setIsCreating(false);
    setEditingProposal(null);
  };

  const handleToggleStatus = (id: string, newStatus: CommercialProposal["status"]) => {
    const updated = proposals.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
    saveProposalsToStorage(updated);
  };

  const handleDeleteProposal = (id: string) => {
    if (!confirm("Deseja realmente remover esta proposta?")) return;
    const updated = proposals.filter((p) => p.id !== id);
    saveProposalsToStorage(updated);
  };

  const getProposalPublicUrl = (id: string) => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return `${envUrl.replace(/\/$/, "")}/proposta/${id}`;
    }
    if (typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost") && !window.location.origin.includes("127.0.0.1")) {
      return `${window.location.origin}/proposta/${id}`;
    }
    return `https://www.mairareis.com.br/proposta/${id}`;
  };

  const handleSendWhatsApp = (prop: CommercialProposal) => {
    const valStr = formatPriceWithFrequency(prop.totalValue, prop.billingFrequency);
    const freqInfo = prop.billingFrequency && prop.billingFrequency !== "one_time" ? ` (${getFrequencyLabel(prop.billingFrequency)})` : "";
    const publicUrl = getProposalPublicUrl(prop.id);
    const clientTitle = prop.clientCompany ? `${prop.clientName} (${prop.clientCompany})` : prop.clientName;
    const projectRef = prop.projectTitle || prop.title;

    const lines: string[] = [
      `Olá, ${clientTitle}!`,
      "",
      `Aqui é a *Maira Reis*. Conforme conversamos, elaborei a *Proposta Comercial Oficial* (Ref: *${prop.docNumber}*) para o projeto *${projectRef}*:`,
      ""
    ];

    // If proposal has multiple package options
    if (prop.options && prop.options.length > 1) {
      lines.push(`*Opções de Contratação Disponíveis:*`);
      prop.options.forEach((opt, idx) => {
        const optValStr = formatPriceWithFrequency(opt.price, opt.billingFrequency);
        const optBadge = opt.isRecommended ? " ⭐ [Recomendada]" : opt.badge ? ` [${opt.badge}]` : "";
        lines.push(`\n*Opção ${idx + 1}: ${opt.name}*${optBadge}`);
        lines.push(`• Investimento: *${optValStr}*`);
        if (opt.timelineWeeks?.trim()) {
          lines.push(`• Prazo: ${opt.timelineWeeks.trim()}`);
        }
        if (opt.paymentTerms?.trim()) {
          lines.push(`• Condições: ${opt.paymentTerms.trim()}`);
        }
        if (opt.scopeItems && opt.scopeItems.length > 0) {
          const optScope = opt.scopeItems.filter((s) => s && s.trim().length > 0);
          if (optScope.length > 0) {
            lines.push(`• Escopo principal: ${optScope.slice(0, 3).join(", ")}${optScope.length > 3 ? ` (+${optScope.length - 3} itens)` : ""}`);
          }
        }
      });
      lines.push("");
    } else {
      // Single package / standard proposal
      const validScope = (prop.scopeItems || []).filter((s) => s && s.trim().length > 0);
      if (validScope.length > 0) {
        lines.push(`*Escopo / Entregáveis Contemplados:*`);
        validScope.forEach((s) => lines.push(`• ${s}`));
        lines.push("");
      }
      if (prop.timelineWeeks?.trim()) {
        lines.push(`*Prazo / Disponibilidade:* ${prop.timelineWeeks.trim()}`);
      }
      lines.push(`*Investimento:* ${valStr}${freqInfo}`);
      if (prop.paymentTerms?.trim()) {
        lines.push(`*Condições de Pagamento:* ${prop.paymentTerms.trim()}`);
      }
    }

    if (prop.warrantyDays && prop.warrantyDays > 0) {
      lines.push(`*Garantia:* ${prop.warrantyDays} dias de suporte técnico após a entrega`);
    }
    if (prop.validityDays && prop.validityDays > 0) {
      lines.push(`*Validade da Proposta:* ${prop.validityDays} dias corridos`);
    }
    if (prop.notes?.trim()) {
      lines.push(`*Observações:* ${prop.notes.trim()}`);
    }

    if (publicUrl) {
      lines.push("");
      lines.push(`*Acesse a Proposta Completa e Interativa online:*`);
      lines.push(publicUrl);
    }
    lines.push("");
    lines.push(`Fico à disposição para esclarecer qualquer ponto e darmos o pontapé inicial!`);

    const msg = lines.join("\n");
    const phone = (prop.clientPhone || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(msg);
    if (phone && phone.length >= 10) {
      window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }
  };

  const handleCopyProposalLink = (prop: CommercialProposal) => {
    const publicUrl = getProposalPublicUrl(prop.id);
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(`link-${prop.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySummary = (prop: CommercialProposal) => {
    const valStr = formatPriceWithFrequency(prop.totalValue, prop.billingFrequency);
    const publicUrl = getProposalPublicUrl(prop.id);

    const lines: string[] = [
      `${prop.title} (${prop.docNumber})`,
      `Cliente: ${prop.clientName}${prop.clientCompany ? ` (${prop.clientCompany})` : ""}`,
      `Investimento: ${valStr}${prop.timelineWeeks?.trim() ? ` | Prazo: ${prop.timelineWeeks.trim()}` : ""}`
    ];
    if (prop.paymentTerms?.trim()) lines.push(`Condições: ${prop.paymentTerms.trim()}`);
    if (prop.warrantyDays && prop.warrantyDays > 0) lines.push(`Garantia: ${prop.warrantyDays} dias`);
    if (prop.validityDays && prop.validityDays > 0) lines.push(`Validade: ${prop.validityDays} dias`);

    if (prop.options && prop.options.length > 1) {
      lines.push("");
      lines.push("Opções / Pacotes:");
      prop.options.forEach((opt, idx) => {
        lines.push(`  ${idx + 1}. ${opt.name}: ${formatPriceWithFrequency(opt.price, opt.billingFrequency)}${opt.timelineWeeks ? ` (${opt.timelineWeeks})` : ""}`);
      });
    } else {
      const validScope = (prop.scopeItems || []).filter((s) => s && s.trim().length > 0);
      if (validScope.length > 0) {
        lines.push("");
        lines.push("Escopo:");
        validScope.forEach((s) => lines.push(`- ${s}`));
      }
    }

    if (prop.notes?.trim()) {
      lines.push("");
      lines.push(`Observações: ${prop.notes.trim()}`);
    }

    if (publicUrl) {
      lines.push("");
      lines.push(`Link Oficial: ${publicUrl}`);
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedId(prop.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter products by category, recurrence type or search query
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter === "recurring") {
      if (p.billingFrequency === "one_time") return false;
    } else if (productCategoryFilter === "one_time") {
      if (p.billingFrequency !== "one_time") return false;
    } else if (productCategoryFilter !== "all" && p.category !== productCategoryFilter) {
      return false;
    }

    if (productSearch) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.paymentTerms.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.projectTitle.toLowerCase().includes(q) ||
        p.docNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique categories list with counts
  const activeProductCategories = Array.from(
    new Set([...products.map((p) => p.category), ...categories])
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-3 backdrop-blur-md">
              {activeSubTab === "products" ? (
                <>
                  <Package className="h-3.5 w-3.5" />
                  Catálogo de Produtos & Serviços
                </>
              ) : activeSubTab === "templates" ? (
                <>
                  <Sliders className="h-3.5 w-3.5" />
                  Gerenciador de Modelos de Proposta
                </>
              ) : (
                <>
                  <Receipt className="h-3.5 w-3.5" />
                  Central de Propostas Comerciais
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {activeSubTab === "products" ? (
                <>
                  Gestão de <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Produtos & Recorrência</span>
                </>
              ) : activeSubTab === "templates" ? (
                <>
                  Modelos de <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Propostas & Estruturas</span>
                </>
              ) : (
                <>
                  Histórico de <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Propostas Comerciais</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {activeSubTab === "products"
                ? "Gerencie seus projetos sob demanda, serviços e planos recorrentes com modelos e escopos pré-definidos."
                : activeSubTab === "templates"
                ? "Personalize e crie novos modelos de propostas comerciais, pilares de valor, cláusulas contratuais e regras de buyout."
                : "Acompanhe aprovações, reimprima propostas em PDF oficial e envie mensagens personalizadas para clientes."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeSubTab === "products" ? (
              <button
                type="button"
                onClick={handleOpenNewProductModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Produto / Serviço</span>
              </button>
            ) : activeSubTab === "templates" ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetTemplatesToDefault}
                  className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  title="Restaurar modelos de fábrica"
                >
                  Restaurar Padrões
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTemplateModal}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Modelo de Proposta</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreateNewProposal()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Proposta Comercial</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: PRODUTOS & SERVIÇOS                                             */}
      {/* ========================================================================= */}
      {activeSubTab === "products" && (
        <div className="space-y-6">
          {/* Products Filter & Search Bar */}
          <div className="relative z-30 p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Consolidated Dropdown Filter Button */}
            <div ref={filterDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border shadow-sm ${
                  productCategoryFilter !== "all"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                    : "bg-neutral-800/90 text-neutral-200 border-white/10 hover:bg-neutral-700/80 hover:text-white"
                }`}
              >
                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {productCategoryFilter === "all"
                    ? `Todos (${products.length})`
                    : productCategoryFilter === "recurring"
                    ? `🔁 Recorrentes (${products.filter((p) => p.billingFrequency !== "one_time").length})`
                    : productCategoryFilter === "one_time"
                    ? `⚡ Projetos Únicos (${products.filter((p) => p.billingFrequency === "one_time").length})`
                    : `🏷️ ${productCategoryFilter} (${products.filter((p) => p.category === productCategoryFilter).length})`}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fadeIn space-y-1 text-left">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5 flex items-center justify-between">
                      <span>Filtrar por Categoria ou Tipo</span>
                      {productCategoryFilter !== "all" && (
                        <button
                          type="button"
                          onClick={() => {
                            setProductCategoryFilter("all");
                            setIsFilterDropdownOpen(false);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold cursor-pointer"
                        >
                          Limpar filtro
                        </button>
                      )}
                    </div>

                    {/* All Products */}
                    <button
                      type="button"
                      onClick={() => {
                        setProductCategoryFilter("all");
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        productCategoryFilter === "all"
                          ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Todos os Produtos / Serviços</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10">
                        {products.length}
                      </span>
                    </button>

                    {/* Recurrence Types */}
                    <div className="pt-1.5 mt-1 border-t border-white/5 space-y-0.5">
                      <span className="px-3 text-[9px] font-extrabold uppercase text-neutral-500 tracking-wider block mb-1">
                        Por Modelo de Cobrança
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductCategoryFilter("recurring");
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          productCategoryFilter === "recurring"
                            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Repeat className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Assinaturas / Recorrentes</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10">
                          {products.filter((p) => p.billingFrequency !== "one_time").length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProductCategoryFilter("one_time");
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          productCategoryFilter === "one_time"
                            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Pagamento Único / Projetos</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10">
                          {products.filter((p) => p.billingFrequency === "one_time").length}
                        </span>
                      </button>
                    </div>

                    {/* Specific Categories */}
                    {activeProductCategories.length > 0 && (
                      <div className="pt-1.5 mt-1 border-t border-white/5 max-h-48 overflow-y-auto pr-1 space-y-0.5">
                        <span className="px-3 text-[9px] font-extrabold uppercase text-neutral-500 tracking-wider block mb-1">
                          Por Categoria Específica
                        </span>
                        {activeProductCategories.map((cat) => {
                          const count = products.filter((p) => p.category === cat).length;
                          const isSelected = productCategoryFilter === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setProductCategoryFilter(cat);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Tag className="h-3 w-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{cat}</span>
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 shrink-0">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative min-w-[200px] sm:min-w-[240px] flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar produto ou escopo..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-800/90 border border-white/10 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* View Mode Toggle: Bloco vs Lista Resumida */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-800/90 border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productViewMode === "grid"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Visualização em Bloco (Detalhada)"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Blocos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    productViewMode === "list"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                  title="Visualização em Lista (Resumida por Nome)"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Lista</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900/50 border border-white/10 space-y-3">
              <Package className="h-10 w-10 text-neutral-600 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum produto encontrado</p>
              <p className="text-xs text-neutral-400">Clique em &quot;Novo Produto / Serviço&quot; para cadastrar itens no seu catálogo.</p>
            </div>
          ) : productViewMode === "grid" ? (
            /* ================= VIEW MODE 1: GRID / BLOCOS ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => {
                const isRecurring = prod.billingFrequency && prod.billingFrequency !== "one_time";

                return (
                  <div
                    key={prod.id}
                    className={`rounded-3xl border p-6 backdrop-blur-xl transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1 ${
                      isRecurring
                        ? "border-indigo-500/30 bg-neutral-900/85 hover:border-indigo-500/60 hover:shadow-indigo-500/10"
                        : "border-white/10 bg-neutral-900/80 hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Category & Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          {prod.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isRecurring && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              {prod.billingFrequency === "monthly" ? "Mensal" : prod.billingFrequency === "yearly" ? "Anual" : "Recorrente"}
                            </span>
                          )}
                          {prod.badge && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                              ⭐ {prod.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {prod.name}
                        </h3>
                        {prod.description && prod.description.trim().length > 0 && (
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      {/* Price & Timeline Info */}
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-semibold text-neutral-400">
                            {isRecurring ? "Valor da Assinatura" : "Valor Base"}
                          </span>
                          <span className="text-lg font-black text-white font-mono">
                            {formatPriceWithFrequency(prod.basePrice, prod.billingFrequency)}
                          </span>
                        </div>
                        {((prod.deliveryTimeline && prod.deliveryTimeline.trim().length > 0) || (prod.warrantyDays && prod.warrantyDays > 0)) && (
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/5">
                            {prod.deliveryTimeline && prod.deliveryTimeline.trim().length > 0 ? (
                              <span>⏱️ Prazo: <strong className="text-neutral-200">{prod.deliveryTimeline}</strong></span>
                            ) : <span />}
                            {prod.warrantyDays && prod.warrantyDays > 0 ? (
                              <span>🛡️ Garantia: <strong className="text-neutral-200">{prod.warrantyDays}d</strong></span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Scope Checklist Items */}
                      {prod.scope && prod.scope.filter((s) => s && s.trim().length > 0).length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">
                            Escopo Incluso ({prod.scope.filter((s) => s && s.trim().length > 0).length} itens):
                          </span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {prod.scope
                              .filter((item) => item && item.trim().length > 0)
                              .map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-snug">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Bottom Bar */}
                    <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProductModal(prod)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCreateProposalFromProduct(prod)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Criar Proposta</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= VIEW MODE 2: LISTA RESUMIDA (POR NOME) ================= */
            <div className="space-y-2.5">
              {filteredProducts.map((prod) => {
                const isRecurring = prod.billingFrequency && prod.billingFrequency !== "one_time";

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-white/10 bg-neutral-900/80 hover:bg-neutral-900/95 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group backdrop-blur-xl shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-neutral-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                            {prod.category}
                          </span>
                          {isRecurring && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              {prod.billingFrequency === "monthly" ? "Mensal" : "Recorrente"}
                            </span>
                          )}
                          {prod.badge && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                              ⭐ {prod.badge}
                            </span>
                          )}
                        </div>
                        {prod.description && prod.description.trim().length > 0 && (
                          <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-white font-mono block">
                          {formatPriceWithFrequency(prod.basePrice, prod.billingFrequency)}
                        </span>
                        {prod.deliveryTimeline && prod.deliveryTimeline.trim().length > 0 && (
                          <span className="text-[10px] text-neutral-400">
                            Prazo: {prod.deliveryTimeline}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCreateProposalFromProduct(prod)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          title="Criar Proposta com este Produto"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Criar Proposta</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditProductModal(prod)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: PROPOSTAS EMITIDAS & GERADOR                                    */}
      {/* ========================================================================= */}
      {activeSubTab === "proposals" && (
        <div className="space-y-6">
          {/* Proposals History & Pipeline */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-7 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-400" />
                  Histórico de Propostas Emitidas
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Acompanhe status de aprovação, reimprima em PDF ou reenvie propostas com 1 clique.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Status Filter */}
                <div className="flex items-center gap-1 rounded-xl bg-neutral-800/80 p-1 border border-white/5">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "draft", label: "Rascunhos" },
                    { id: "sent", label: "Enviadas" },
                    { id: "approved", label: "Aprovadas" }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatusFilter(st.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === st.id ? "bg-emerald-500 text-white shadow-sm" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por cliente ou projeto..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-800/90 border border-white/10 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Proposals List */}
            {filteredProposals.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Receipt className="mx-auto h-10 w-10 text-neutral-600" />
                <p className="text-sm font-semibold text-neutral-300">Nenhuma proposta encontrada</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Clique no botão &quot;Nova Proposta Comercial&quot; para gerar sua primeira proposta personalizada.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((prop) => {
                  const validScopeItems = (prop.scopeItems || []).filter((item) => item && item.trim().length > 0);

                  return (
                    <div
                      key={prop.id}
                      className="group relative rounded-2xl border border-white/5 bg-neutral-950/40 p-5 hover:border-emerald-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      {/* Proposal Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                            {prop.docNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate">{prop.title}</h4>

                          {/* Recurrence & Status Badges */}
                          {prop.billingFrequency && prop.billingFrequency !== "one_time" && (
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              {prop.billingFrequency === "monthly" ? "Mensal" : "Recorrente"}
                            </span>
                          )}

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              prop.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : prop.status === "sent"
                                ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                : prop.status === "in_negotiation"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {prop.status === "approved"
                              ? "Aprovada"
                              : prop.status === "sent"
                              ? "Enviada"
                              : prop.status === "in_negotiation"
                              ? "Em Negociação"
                              : "Rascunho"}
                          </span>

                          {prop.options && prop.options.length > 1 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                              <Sparkles className="h-3 w-3 text-purple-400" />
                              {prop.options.length} Pacotes / Opções
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-400">
                          <span>
                            Cliente: <strong className="text-neutral-200">{prop.clientName}</strong>
                            {prop.clientCompany && prop.clientCompany.trim().length > 0 && ` (${prop.clientCompany})`}
                          </span>
                          {prop.projectTitle && prop.projectTitle.trim().length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                Projeto: <strong className="text-neutral-200">{prop.projectTitle}</strong>
                              </span>
                            </>
                          )}
                          {prop.timelineWeeks && prop.timelineWeeks.trim().length > 0 && (
                            <>
                              <span>•</span>
                              <span>⏱️ {prop.timelineWeeks}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Emitida em: {new Date(prop.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {/* Scope items chips */}
                        {validScopeItems.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {validScopeItems.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium text-neutral-300 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded-md truncate max-w-[260px]"
                              >
                                ✓ {item}
                              </span>
                            ))}
                            {validScopeItems.length > 3 && (
                              <span className="text-[10px] text-neutral-500 font-semibold">
                                +{validScopeItems.length - 3} itens
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                    {/* Financial Value & Action Buttons */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0 gap-4 shrink-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                          Investimento
                        </span>
                        <span className="text-lg font-black text-white font-mono">
                          {formatPriceWithFrequency(prop.totalValue, prop.billingFrequency)}
                        </span>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Open Public Page */}
                        <a
                          href={`/proposta/${prop.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1"
                          title="Abrir Página Pública Oficial da Proposta"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* Copy Direct Public Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyProposalLink(prop)}
                          className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all cursor-pointer"
                          title="Copiar Link Único de Redirecionamento da Proposta"
                        >
                          {copiedId === `link-${prop.id}` ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGeneratePdf(prop)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                          title="Imprimir / Salvar PDF Oficial"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(prop)}
                          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                          title="Enviar Proposta no WhatsApp com Link"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySummary(prop)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all cursor-pointer"
                          title="Copiar Resumo Comercial"
                        >
                          {copiedId === prop.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>

                        {/* Edit Proposal Button */}
                        <button
                          type="button"
                          onClick={() => handleEditProposal(prop)}
                          className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
                          title="Editar Proposta Comercial"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <select
                          value={prop.status}
                          onChange={(e) => handleToggleStatus(prop.id, e.target.value as any)}
                          className="rounded-xl border border-white/10 bg-neutral-800 px-2 py-1.5 text-[11px] font-semibold text-neutral-300 outline-none focus:border-emerald-500 cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                          <option className="bg-slate-900 text-white" value="draft">Rascunho</option>
                          <option className="bg-slate-900 text-white" value="sent">Enviada</option>
                          <option className="bg-slate-900 text-white" value="in_negotiation">Em Negociação</option>
                          <option className="bg-slate-900 text-white" value="approved">Aprovada 🎉</option>
                          <option className="bg-slate-900 text-white" value="rejected">Recusada</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteProposal(prop.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Remover Proposta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: MODELOS DE PROPOSTAS COMERCIAIS                                 */}
      {/* ========================================================================= */}
      {activeSubTab === "templates" && (() => {
        const activeTemplateCategories = Array.from(
          new Set([...templates.map((t) => t.category), ...categories])
        );

        const filteredTemplates = templates.filter((tpl) => {
          if (templateCategoryFilter === "recurring") {
            if (tpl.billingFrequency === "one_time") return false;
          } else if (templateCategoryFilter === "one_time") {
            if (tpl.billingFrequency !== "one_time") return false;
          } else if (templateCategoryFilter !== "all" && tpl.category !== templateCategoryFilter) {
            return false;
          }

          if (templateSearch.trim()) {
            const q = templateSearch.toLowerCase();
            return (
              tpl.name.toLowerCase().includes(q) ||
              (tpl.subtitle && tpl.subtitle.toLowerCase().includes(q)) ||
              (tpl.category && tpl.category.toLowerCase().includes(q)) ||
              (tpl.description && tpl.description.toLowerCase().includes(q)) ||
              (tpl.pillars && tpl.pillars.some((p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))) ||
              (tpl.clauses && tpl.clauses.some((c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q)))
            );
          }
          return true;
        });

        return (
          <div className="space-y-6">
            {/* Templates Filter & Search Bar */}
            <div className="relative z-30 p-5 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Consolidated Dropdown Filter Button */}
              <div ref={templateFilterDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsTemplateFilterDropdownOpen(!isTemplateFilterDropdownOpen)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border shadow-sm ${
                    templateCategoryFilter !== "all"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                      : "bg-neutral-800/90 text-neutral-200 border-white/10 hover:bg-neutral-700/80 hover:text-white"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {templateCategoryFilter === "all"
                      ? `Todos os Modelos (${templates.length})`
                      : `🏷️ ${templateCategoryFilter} (${templates.filter((t) => t.category === templateCategoryFilter).length})`}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${isTemplateFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isTemplateFilterDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsTemplateFilterDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fadeIn space-y-1 text-left">
                      <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                          Filtrar Modelos
                        </span>
                        {templateCategoryFilter !== "all" && (
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateCategoryFilter("all");
                              setIsTemplateFilterDropdownOpen(false);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold cursor-pointer"
                          >
                            Limpar filtro
                          </button>
                        )}
                      </div>

                      {/* All Templates */}
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateCategoryFilter("all");
                          setIsTemplateFilterDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          templateCategoryFilter === "all"
                            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Todos os Modelos de Proposta</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10">
                          {templates.length}
                        </span>
                      </button>

                      {/* Specific Categories */}
                      {activeTemplateCategories.length > 0 && (
                        <div className="pt-1.5 mt-1 border-t border-white/5 max-h-56 overflow-y-auto pr-1 space-y-0.5">
                          <span className="px-3 text-[9px] font-extrabold uppercase text-neutral-500 tracking-wider block mb-1">
                            Por Categoria de Serviço
                          </span>
                          {activeTemplateCategories.map((cat) => {
                            const count = templates.filter((t) => t.category === cat).length;
                            const isSelected = templateCategoryFilter === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setTemplateCategoryFilter(cat);
                                  setIsTemplateFilterDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Tag className="h-3 w-3 text-neutral-400 shrink-0" />
                                  <span className="truncate">{cat}</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 shrink-0">
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                {/* Search Bar */}
                <div className="relative min-w-[200px] sm:min-w-[240px] flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Buscar modelo, cláusula ou pilar..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-800/90 border border-white/10 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* View Mode Toggle: Bloco vs Lista */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-800/90 border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleTemplateViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      templateViewMode === "grid"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                    title="Visualização em Bloco / Quadro"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Blocos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTemplateViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      templateViewMode === "list"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                    title="Visualização em Lista Resumida"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-dashed border-white/10 space-y-3">
                <Sliders className="h-10 w-10 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-300">Nenhum modelo encontrado</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Tente ajustar a busca ou os filtros para localizar os modelos de proposta.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSearch("");
                    setTemplateCategoryFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : templateViewMode === "grid" ? (
              /* ================= VIEW MODE 1: BLOCOS / QUADRO ================= */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map((tpl) => {
                  return (
                    <div
                      key={tpl.id}
                      className="group relative rounded-3xl border border-white/10 bg-neutral-900/80 hover:bg-neutral-900/95 hover:border-emerald-500/40 p-6 backdrop-blur-xl shadow-xl transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-4">
                        {/* Top Badges & Actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {tpl.category}
                            </span>
                            {tpl.badge && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                ⭐ {tpl.badge}
                              </span>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleDuplicateTemplate(tpl)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                              title="Duplicar Modelo"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditTemplateModal(tpl)}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                              title="Editar Modelo"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                              title="Excluir Modelo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                            {tpl.name}
                          </h3>
                          {tpl.subtitle && (
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                              {tpl.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Description / Overview Box */}
                        {tpl.description && (
                          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-neutral-300 leading-relaxed">
                            <p className="line-clamp-3">{tpl.description}</p>
                          </div>
                        )}

                        {/* Strategic Pillars Preview */}
                        {tpl.pillars && tpl.pillars.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                              <span>Pilares de Valor Inclusos ({tpl.pillars.length}):</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {tpl.pillars.map((pil) => (
                                <div
                                  key={pil.id}
                                  className="p-2.5 rounded-xl bg-neutral-800/60 border border-white/5 text-xs text-neutral-300 space-y-0.5"
                                >
                                  <p className="font-bold text-white text-[11px] flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                    <span className="truncate">{pil.title}</span>
                                  </p>
                                  <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed pl-4">
                                    {pil.desc}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Badges Summary: Clauses & Scope */}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                            📜 <strong>{tpl.clauses?.length || 0}</strong> cláusulas contratuais
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                            📌 <strong>{tpl.defaultScope?.length || 0}</strong> itens de escopo
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            🏷️ Prazos, valores e condições vêm do produto
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTemplateModal(tpl)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Editar Modelo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCreateProposalFromTemplate(tpl)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Criar Proposta com este Modelo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= VIEW MODE 2: LISTA RESUMIDA ================= */
              <div className="space-y-2.5">
                {filteredTemplates.map((tpl) => {
                  return (
                    <div
                      key={tpl.id}
                      className="p-4 rounded-2xl border border-white/10 bg-neutral-900/80 hover:bg-neutral-900/95 hover:border-emerald-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group backdrop-blur-xl shadow-md"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-all shadow-md">
                          <Sliders className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {tpl.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-neutral-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                              {tpl.category}
                            </span>
                            {tpl.badge && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                ⭐ {tpl.badge}
                              </span>
                            )}
                          </div>
                          {tpl.subtitle && (
                            <p className="text-xs text-neutral-400 truncate">
                              {tpl.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 flex-wrap pt-0.5">
                            <span>📜 {tpl.clauses?.length || 0} cláusulas</span>
                            <span>•</span>
                            <span>🌟 {tpl.pillars?.length || 0} pilares</span>
                            <span>•</span>
                            <span>📌 {tpl.defaultScope?.length || 0} entregáveis</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hidden sm:inline-block">
                          Conteúdo Padrão
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDuplicateTemplate(tpl)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all cursor-pointer"
                            title="Duplicar Modelo"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditTemplateModal(tpl)}
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
                            title="Editar Modelo"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                            title="Excluir Modelo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateProposalFromTemplate(tpl)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Proposta</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: PRODUTO / SERVIÇO (CRIAR / EDITAR)                                 */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl my-auto overflow-hidden text-left">
            <div className="p-6 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between gap-4 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingProduct ? "Editar Produto / Serviço" : "Cadastrar Novo Produto no Catálogo"}
                  </h3>
                  <p className="text-xs text-neutral-400">Configure preços, modelo de recorrência, condições e escopo padrão</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Nome do Produto / Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: Landing Page de Alta Conversão"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Category with Inline New Category Creation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Categoria *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewCategory(!isCreatingNewCategory);
                        setNewCategoryInput("");
                      }}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isCreatingNewCategory ? "← Escolher da Lista" : "+ Nova Categoria"}
                    </button>
                  </div>

                  {isCreatingNewCategory ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Nome da nova categoria..."
                        className="w-full rounded-xl border border-emerald-500/50 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        if (e.target.value === "__NEW_CATEGORY__") {
                          setIsCreatingNewCategory(true);
                          setNewCategoryInput("");
                        } else {
                          setProdCategory(e.target.value);
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-white cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option className="bg-slate-900 text-white" key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option className="bg-slate-900 text-emerald-400 font-bold" value="__NEW_CATEGORY__">
                        + Cadastrar Nova Categoria...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Descrição Curta do Serviço
                </label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Explicação objetiva dos benefícios e valor agregado para o cliente..."
                  className="w-full rounded-xl border border-white/10 bg-neutral-800 p-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Pricing, Billing Frequency & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Valor (R$) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 pl-9 pr-3 py-2 text-xs text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Recurrence / Billing Model Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Modelo de Cobrança / Recorrência *
                  </label>
                  <select
                    value={prodBillingFrequency}
                    onChange={(e) => {
                      const newFreq = e.target.value as BillingFrequency;
                      setProdBillingFrequency(newFreq);
                      if (newFreq === "monthly") {
                        setProdPaymentTerms("Mensalidade recorrente (todo dia 05)");
                        setProdTimeline("Recorrência Mensal contínua");
                        setProdWarranty(0);
                        setProdValidity(0);
                      } else if (newFreq === "quarterly") {
                        setProdPaymentTerms("Trimestralidade recorrente");
                        setProdTimeline("Recorrência Trimestral contínua");
                        setProdWarranty(0);
                        setProdValidity(0);
                      } else if (newFreq === "yearly") {
                        setProdPaymentTerms("Anuidade recorrente");
                        setProdTimeline("Recorrência Anual contínua");
                        setProdWarranty(0);
                        setProdValidity(0);
                      } else if (newFreq === "hourly") {
                        setProdPaymentTerms("Faturamento de horas registradas");
                        setProdTimeline("Sob demanda");
                        setProdWarranty(0);
                        setProdValidity(0);
                      } else if (newFreq === "one_time") {
                        if (!prodPaymentTerms || prodPaymentTerms.includes("recorrente")) {
                          setProdPaymentTerms("50% de entrada + 50% na aprovação final");
                        }
                        if (!prodTimeline || prodTimeline.includes("Recorrência")) {
                          setProdTimeline("2 a 3 semanas");
                        }
                        if (prodWarranty === 0) setProdWarranty(30);
                        if (prodValidity === 0) setProdValidity(10);
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-white cursor-pointer font-semibold"
                  >
                    <option className="bg-slate-900 text-white" value="one_time">⚡ Pagamento Único (Por Projeto)</option>
                    <option className="bg-slate-900 text-emerald-400 font-bold" value="monthly">🔁 Mensal Recorrente (/mês - Assinatura)</option>
                    <option className="bg-slate-900 text-white" value="quarterly">🔁 Trimestral Recorrente (/trimestre)</option>
                    <option className="bg-slate-900 text-white" value="yearly">🔁 Anual Recorrente (/ano)</option>
                    <option className="bg-slate-900 text-white" value="hourly">⏱️ Por Hora Técnica (/hora)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Selo / Badge em Destaque
                  </label>
                  <input
                    type="text"
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                    placeholder="Ex: Mais Vendido, Recorrente"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Delivery timeline, payment terms, warranties */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Prazo Padrão / Disponibilidade
                  </label>
                  <input
                    type="text"
                    value={prodTimeline}
                    onChange={(e) => setProdTimeline(e.target.value)}
                    placeholder="Ex: 2 a 3 semanas ou Mensal contínuo"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Condições Padrão de Pagamento
                  </label>
                  <input
                    type="text"
                    value={prodPaymentTerms}
                    onChange={(e) => setProdPaymentTerms(e.target.value)}
                    placeholder="Ex: 50% entrada ou Mensal dia 05"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Garantia (Dias)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={prodWarranty}
                      onChange={(e) => setProdWarranty(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Validade (Dias)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={prodValidity}
                      onChange={(e) => setProdValidity(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Scope Checklist Items */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Itens de Escopo Inclusos (1 por linha)
                </label>
                <textarea
                  rows={4}
                  value={prodScopeText}
                  onChange={(e) => setProdScopeText(e.target.value)}
                  placeholder="Design responsivo no Figma&#10;Desenvolvimento Fullstack&#10;SEO e deploy oficial"
                  className="w-full rounded-xl border border-white/10 bg-neutral-800 p-3 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Produto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODELO DE PROPOSTA (CRIAR / EDITAR)                                 */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl my-auto overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-6 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between gap-4 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTemplate ? `Editar Modelo: ${editingTemplate.name}` : "Cadastrar Novo Modelo de Proposta"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Configure o conteúdo padrão: pilares de valor, cláusulas contratuais e escopo (valores, prazos e condições vêm do produto)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 pt-4 border-b border-white/10 bg-neutral-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: "general", label: "📌 Identificação & Geral" },
                { id: "pillars", label: `🌟 Pilares de Valor (${tplPillars.length})` },
                { id: "clauses", label: `📜 Cláusulas Contratuais (${tplClauses.length})` },
                { id: "scope", label: "📝 Escopo Padrão" }
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setTplActiveSection(sec.id as any)}
                  className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    tplActiveSection === sec.id
                      ? "border-emerald-400 text-emerald-300 font-extrabold"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 overflow-y-auto space-y-6">
              {/* SECTION 1: GENERAL INFO */}
              {tplActiveSection === "general" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Nome do Modelo *
                      </label>
                      <input
                        type="text"
                        required
                        value={tplName}
                        onChange={(e) => setTplName(e.target.value)}
                        placeholder="Ex: Parceria Estratégica & App as a Service"
                        className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Categoria do Serviço *
                      </label>
                      <select
                        value={tplCategory}
                        onChange={(e) => setTplCategory(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Subtítulo Comercial / Linha de Apoio
                    </label>
                    <input
                      type="text"
                      value={tplSubtitle}
                      onChange={(e) => setTplSubtitle(e.target.value)}
                      placeholder="Ex: Solução completa contínua com desenvolvimento, hospedagem e suporte técnico ativo"
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Selo / Badge em Destaque
                      </label>
                      <input
                        type="text"
                        value={tplBadge}
                        onChange={(e) => setTplBadge(e.target.value)}
                        placeholder="Ex: Mais Vendido, Recorrente & Parceria"
                        className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Identificador Interno (Chave)
                      </label>
                      <input
                        type="text"
                        value={tplKey}
                        onChange={(e) => setTplKey(e.target.value)}
                        placeholder="Ex: software_dev, partnership_recurring"
                        className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-neutral-300 font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Descrição Detalhada do Modelo
                    </label>
                    <textarea
                      rows={3}
                      value={tplDescription}
                      onChange={(e) => setTplDescription(e.target.value)}
                      placeholder="Explicação dos diferenciais deste modelo comercial e quando ele deve ser oferecido..."
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 p-3 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Observações / Premissas Padrão
                    </label>
                    <textarea
                      rows={2}
                      value={tplNotes}
                      onChange={(e) => setTplNotes(e.target.value)}
                      placeholder="Ex: Modelo inteligente de assinatura contínua com opção de cessão de código após 12 meses..."
                      className="w-full rounded-xl border border-white/10 bg-neutral-800 p-3 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: STRATEGIC PILLARS */}
              {tplActiveSection === "pillars" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Pilares Estratégicos de Valor
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Apresentados na proposta pública para valorizar os diferenciais da entrega
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPillarToTemplate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Adicionar Pilar</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tplPillars.map((pil, idx) => (
                      <div
                        key={pil.id}
                        className="p-4 rounded-2xl bg-neutral-800/70 border border-white/10 space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                            Pilar #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePillar(pil.id)}
                            className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remover Pilar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={pil.title}
                          onChange={(e) => handleUpdatePillar(pil.id, "title", e.target.value)}
                          placeholder="Título do Pilar (Ex: Arquitetura Escalável & Alta Performance)"
                          className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white font-bold outline-none focus:border-emerald-500"
                        />
                        <textarea
                          rows={2}
                          value={pil.desc}
                          onChange={(e) => handleUpdatePillar(pil.id, "desc", e.target.value)}
                          placeholder="Explicação do benefício para o cliente..."
                          className="w-full rounded-xl border border-white/10 bg-neutral-900 p-2.5 text-xs text-neutral-300 outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                    {tplPillars.length === 0 && (
                      <div className="p-6 rounded-2xl bg-neutral-800/40 border border-dashed border-white/10 text-center text-xs text-neutral-400">
                        Nenhum pilar cadastrado. Clique em &quot;Adicionar Pilar&quot; para definir os diferenciais do modelo.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: CONTRACTUAL CLAUSES */}
              {tplActiveSection === "clauses" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Cláusulas & Termos Contratuais
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Termos legais e regras operacionais pré-estabelecidas no modelo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddClauseToTemplate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Adicionar Cláusula</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tplClauses.map((clause, idx) => (
                      <div
                        key={clause.id}
                        className="p-4 rounded-2xl bg-neutral-800/70 border border-white/10 space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                            Cláusula #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClause(clause.id)}
                            className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remover Cláusula"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={clause.title}
                          onChange={(e) => handleUpdateClause(clause.id, "title", e.target.value)}
                          placeholder="Título da Cláusula (Ex: 1. Propriedade Intelectual & Código-Fonte)"
                          className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white font-bold outline-none focus:border-emerald-500"
                        />
                        <textarea
                          rows={3}
                          value={clause.content}
                          onChange={(e) => handleUpdateClause(clause.id, "content", e.target.value)}
                          placeholder="Texto detalhado da cláusula e regras contratuais..."
                          className="w-full rounded-xl border border-white/10 bg-neutral-900 p-2.5 text-xs text-neutral-300 outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>
                    ))}
                    {tplClauses.length === 0 && (
                      <div className="p-6 rounded-2xl bg-neutral-800/40 border border-dashed border-white/10 text-center text-xs text-neutral-400">
                        Nenhuma cláusula cadastrada. Clique em &quot;Adicionar Cláusula&quot; para incluir termos jurídicos.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: DEFAULT SCOPE */}
              {tplActiveSection === "scope" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Escopo Padrão Sugerido (1 item por linha)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Entregáveis que serão pré-carregados automaticamente ao selecionar este modelo
                    </p>
                  </div>
                  <textarea
                    rows={8}
                    value={tplScopeText}
                    onChange={(e) => setTplScopeText(e.target.value)}
                    placeholder="Levantamento de Requisitos e Arquitetura&#10;Design de Interface no Figma&#10;Desenvolvimento Fullstack em Next.js&#10;Deploy e Configuração de Servidores"
                    className="w-full rounded-2xl border border-white/10 bg-neutral-800 p-4 text-xs text-white font-mono leading-relaxed outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Modelo de Proposta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROPOSTA COMERCIAL (GERADOR PDF)                                    */}
      {/* ========================================================================= */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl my-auto overflow-hidden text-left">
            <div className="p-6 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between gap-4 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingProposal ? `Editar Proposta (${editingProposal.docNumber})` : "Criador Executivo de Propostas"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {editingProposal
                      ? "Atualize o escopo, valores e premissas contratuais desta proposta comercial"
                      : "Configure escopo, recorrência/investimento e emita o PDF oficial da proposta"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProposal(null);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProposal} className="p-6 overflow-y-auto space-y-6">
              {/* Dynamic Proposal Template Model Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Selecione o Modelo de Proposta Base *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setActiveSubTab("templates");
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Gerenciar / Editar Modelos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((tpl) => {
                    const isSelected = proposalTemplateType === tpl.key || proposalTemplateType === tpl.id;
                    const isRecurring = tpl.billingFrequency !== "one_time";

                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? isRecurring
                              ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                              : "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                            : "border-white/10 bg-neutral-850 hover:bg-neutral-800 hover:border-white/20 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected
                                ? isRecurring
                                  ? "bg-indigo-500/20 text-indigo-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            {isRecurring ? <Repeat className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                {tpl.name}
                              </h4>
                              {isSelected && (
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isRecurring ? "bg-indigo-400" : "bg-emerald-400"}`} />
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                              {tpl.subtitle || tpl.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5 font-semibold text-neutral-400">
                          <span>{tpl.category}</span>
                          <span className="text-emerald-300 font-medium">
                            ⏱️ {tpl.deliveryTimeline || "2 a 3 semanas"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Vincular Cliente Cadastrado
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-neutral-800/90 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option className="bg-slate-900 text-white" value="">Digitar dados manualmente...</option>
                    {clients.map((c) => (
                      <option className="bg-slate-900 text-white" key={c.id} value={c.id}>
                        {c.full_name || "Cliente"} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Vincular Projeto Existente
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-neutral-800/90 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option className="bg-slate-900 text-white" value="">Novo Projeto / Proposta Avulsa</option>
                    {projects.map((p) => (
                      <option className="bg-slate-900 text-white" key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Carregar Produto / Modelo
                  </label>
                  <select
                    onChange={(e) => handleApplyProductTemplate(e.target.value)}
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-neutral-800/90 px-3 py-2 text-xs text-emerald-300 outline-none focus:border-emerald-500 font-semibold [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option className="bg-slate-900 text-white" value="" disabled>
                      Selecione um produto do catálogo...
                    </option>
                    {products.map((t) => (
                      <option className="bg-slate-900 text-white" key={t.id} value={t.id}>
                        {t.name} ({formatPriceWithFrequency(t.basePrice, t.billingFrequency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client & Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Nome do Cliente / Decisor *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Empresa / Razão Social
                  </label>
                  <input
                    type="text"
                    value={cCompany}
                    onChange={(e) => setCCompany(e.target.value)}
                    placeholder="Ex: Prime Tech Soluções"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Proposal Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="Ex: Landing Page de Captação e Vendas"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Categoria do Serviço
                  </label>
                  <input
                    type="text"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    placeholder="Ex: Landing Page (Next.js & Figma)"
                    className="w-full rounded-xl border border-white/10 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* ================================================================= */}
              {/* PRODUTOS / PACOTES VINCULADOS (INFORMAÇÕES DIRETAS DO CADASTRO)   */}
              {/* ================================================================= */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-emerald-400" />
                        Produtos e Pacotes do Catálogo Vinculados à Proposta
                      </span>
                      {proposalOptions.length > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {proposalOptions.length} {proposalOptions.length === 1 ? "produto selecionado" : "produtos / opções"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Os valores, condições de pagamento, prazos e itens de escopo são exibidos diretamente do cadastro dos produtos.
                    </p>
                  </div>
                </div>

                {/* Product Selector Dropdown Field */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    Adicionar Produto do Catálogo à Proposta
                  </label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;
                        const prod = products.find((p) => p.id === selectedId);
                        if (prod) {
                          handleAddProductToOptions(prod);
                        }
                      }}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-neutral-800/90 px-4 py-2.5 pr-10 text-xs font-semibold text-emerald-300 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 cursor-pointer transition-all [&>option]:bg-slate-900 [&>option]:text-white shadow-inner"
                    >
                      <option className="bg-slate-900 text-neutral-400 font-normal" value="">
                        ➕ Clique para abrir a lista de produtos e adicionar à proposta...
                      </option>
                      {products.map((prod) => {
                        const isAlreadyAdded = proposalOptions.some((o) => o.productId === prod.id || o.name === prod.name);
                        return (
                          <option
                            key={prod.id}
                            value={prod.id}
                            className="bg-slate-900 text-white py-1.5 font-medium"
                          >
                            {isAlreadyAdded ? "✓ [Já Adicionado] " : "+ "}
                            {prod.name} — {formatPriceWithFrequency(prod.basePrice, prod.billingFrequency)} ({prod.category})
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      <ChevronDown className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Display Selected Product(s) Direct Info */}
                {proposalOptions.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {proposalOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all relative space-y-4 ${
                          opt.isRecommended
                            ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                            : "bg-neutral-850/60 border-white/10"
                        }`}
                      >
                        {/* Header: Name, Badge, Recommended Toggle, Remove */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white truncate">
                                  {opt.name}
                                </h4>
                                {opt.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              {opt.description && (
                                <p className="text-[11px] text-neutral-400 truncate max-w-lg mt-0.5">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {proposalOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleSetRecommendedOption(opt.id)}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  opt.isRecommended
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                                }`}
                                title={opt.isRecommended ? "Opção Recomendada" : "Marcar como Recomendada"}
                              >
                                <Star className={`h-3.5 w-3.5 ${opt.isRecommended ? "fill-amber-400 text-amber-400" : ""}`} />
                                <span>{opt.isRecommended ? "Recomendado" : "Marcar Recomendado"}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                              title="Remover produto da proposta"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Direct Product Details Summary Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-neutral-900/80 rounded-xl p-3.5 border border-white/5">
                          <div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                              💰 Investimento Cadastrado
                            </span>
                            <span className="text-sm font-black text-emerald-400 font-mono">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(opt.price)}
                            </span>
                            <span className="text-[11px] text-neutral-400 block mt-0.5">
                              {opt.billingFrequency === "monthly"
                                ? "Mensalidade Recorrente"
                                : opt.billingFrequency === "quarterly"
                                ? "Trimestralidade Recorrente"
                                : opt.billingFrequency === "yearly"
                                ? "Anuidade Recorrente"
                                : opt.billingFrequency === "hourly"
                                ? "Por Hora Técnica"
                                : "Pagamento Único"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                              ⏱️ Prazo de Entrega
                            </span>
                            <span className="text-xs font-bold text-white">
                              {opt.timelineWeeks || "2 a 3 semanas"}
                            </span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mt-2">
                              🛡️ Garantia / Validade
                            </span>
                            <span className="text-xs text-neutral-300">
                              {opt.warrantyDays ? `${opt.warrantyDays} dias de garantia` : "Garantia padrão"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                              💳 Condições de Pagamento
                            </span>
                            <span className="text-xs font-semibold text-neutral-200 block">
                              {opt.paymentTerms || "Conforme cadastro do produto"}
                            </span>
                          </div>
                        </div>

                        {/* Direct Scope Checklist from Product */}
                        {opt.scopeItems && opt.scopeItems.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                              📌 Escopo de Entregas Incluso ({opt.scopeItems.length} itens do produto):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {opt.scopeItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-neutral-300 bg-black/30 border border-white/5 rounded-lg px-2.5 py-1.5"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-tight">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-neutral-900/50 border border-dashed border-white/10 text-center space-y-2">
                    <Package className="h-8 w-8 text-neutral-500 mx-auto" />
                    <p className="text-xs font-bold text-white">
                      Nenhum produto selecionado para a proposta
                    </p>
                    <p className="text-[11px] text-neutral-400 max-w-md mx-auto">
                      Selecione um produto do catálogo no menu superior ou clique em um dos botões acima para vincular o produto e suas informações à proposta.
                    </p>
                  </div>
                )}
              </div>

              {/* Observations */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Observações e Informações Adicionais (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Não inclui produção de vídeos ou taxas de servidores terceirizados..."
                  className="w-full rounded-xl border border-white/10 bg-neutral-800 p-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProposal(null);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingProposal ? "Salvar Alterações" : "Salvar Proposta Comercial"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalsModule;
