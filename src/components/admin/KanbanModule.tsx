"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  MoreHorizontal,
  X,
  Check,
  Calendar,
  MessageSquare,
  CheckSquare,
  Edit2,
  Trash2,
  MessageCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronDown,
  Tag,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Package,
  User,
  UserCheck,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Link2,
  TrendingUp,
  Flame,
  Snowflake,
  SunMedium,
  AlertCircle,
  FileText,
  Briefcase,
  Zap,
  Target,
  BarChart3,
  Users,
  Copy,
  PlusCircle,
  Send,
  PhoneCall,
  Video,
  Award,
  Globe
} from "lucide-react";
import { Profile } from "@/context/AuthContext";
import { ProductItem, CommercialProposal } from "@/components/admin/ProposalsModule";

export type LeadTemperature = "cold" | "warm" | "hot" | "closing" | "won" | "lost";

export type LeadOrigin =
  | "whatsapp"
  | "instagram"
  | "referral"
  | "website"
  | "linkedin"
  | "outbound"
  | "events"
  | "other";

export interface KanbanLabel {
  id: string;
  name?: string;
  color: string; // Tailwind color class or hex
}

export interface KanbanChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanActivityItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  type?: "comment" | "call" | "meeting" | "whatsapp" | "proposal";
}

export interface KanbanCardItem {
  id: string;
  title: string; // Título da oportunidade / Projeto
  description?: string; // Briefing / Notas da reunião
  // Lead info
  contactName?: string; // Decisor / Contato
  companyName?: string; // Empresa
  contactPhone?: string; // WhatsApp / Celular
  contactEmail?: string; // E-mail
  leadOrigin?: LeadOrigin; // Canal de Aquisição
  temperature?: LeadTemperature; // Temperatura comercial
  // Product info
  productId?: string; // ID do produto do catálogo
  productName?: string; // Nome do produto/serviço
  productCategory?: string; // Categoria
  billingFrequency?: "one_time" | "monthly" | "quarterly" | "yearly" | "hourly";
  // Commercial control
  dealValue?: number; // Valor da negociação (R$)
  closeProbability?: number; // Probabilidade (%)
  nextAction?: string; // Próximo passo comercial
  dueDate?: string; // Previsão de fechamento / data limite
  lossReason?: string; // Motivo de perda se aplicável
  // Linked Client & Linked Proposal
  clientId?: string; // ID do Profile do cliente vinculado
  clientName?: string; // Nome do cliente
  clientEmail?: string; // Email do cliente
  proposalId?: string; // ID da proposta comercial vinculada
  proposalNumber?: string; // Ex: PROP-2026-001
  proposalTitle?: string;
  proposalStatus?: "draft" | "sent" | "in_negotiation" | "approved" | "rejected";
  proposalValue?: number;
  // Metadata & Checklist
  labels?: KanbanLabel[];
  checklist?: KanbanChecklistItem[];
  commentsCount?: number;
  comments?: KanbanActivityItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface KanbanColumnItem {
  id: string;
  title: string;
  colorTheme?: string;
  cards: KanbanCardItem[];
}

export interface KanbanBoardData {
  id: string;
  title: string;
  columns: KanbanColumnItem[];
}

interface KanbanModuleProps {
  clients?: Profile[];
  onOpenProposalModal?: () => void;
  onNavigateTab?: (tab: any) => void;
}

const DEFAULT_BUILTIN_PRODUCTS = [
  {
    id: "prod-landing-page",
    name: "Landing Page Express & Conversão",
    category: "Landing Page (Next.js & Figma)",
    basePrice: 1500,
    billingFrequency: "one_time" as const,
    deliveryTimeline: "2 a 3 semanas"
  },
  {
    id: "prod-software-app",
    name: "Plataforma Web SaaS / App Mobile",
    category: "Software Web & App Mobile",
    basePrice: 5500,
    billingFrequency: "one_time" as const,
    deliveryTimeline: "6 a 8 semanas"
  },
  {
    id: "prod-ux-redesign",
    name: "Redesign UI/UX & Consultoria",
    category: "Consultoria UX/UI Design",
    basePrice: 3500,
    billingFrequency: "one_time" as const,
    deliveryTimeline: "3 a 4 semanas"
  },
  {
    id: "prod-ecommerce",
    name: "E-commerce & Checkout de Alta Performance",
    category: "E-commerce & Lojas Virtuais",
    basePrice: 4200,
    billingFrequency: "one_time" as const,
    deliveryTimeline: "4 a 5 semanas"
  },
  {
    id: "prod-maintenance-plan",
    name: "Contrato de Suporte & Manutenção Mensal",
    category: "Suporte & Manutenção Recorrente",
    basePrice: 800,
    billingFrequency: "monthly" as const,
    deliveryTimeline: "Recorrência Mensal contínua"
  },
  {
    id: "prod-ai-automation",
    name: "Automação IA & Chatbot Inteligente",
    category: "Automação & IA",
    basePrice: 1200,
    billingFrequency: "monthly" as const,
    deliveryTimeline: "Setup em 7 dias + Gestão Contínua"
  },
  {
    id: "prod-partnership-recurring",
    name: "Parceria Estratégica & App as a Service",
    category: "Parceria Estratégica (Recorrente)",
    basePrice: 350,
    billingFrequency: "monthly" as const,
    deliveryTimeline: "Desenvolvimento Contínuo"
  }
];

const INITIAL_BOARD: KanbanBoardData = {
  id: "board-crm-prospeccao-v3",
  title: "Pipeline Comercial & Prospecção de Vendas",
  columns: [
    {
      id: "col-prospeccao",
      title: "Novos Leads & Prospecção",
      colorTheme: "emerald",
      cards: [
        {
          id: "card-1",
          title: "Rodrigo Silveira — Logística & Rastreamento",
          companyName: "TransLog Express",
          contactName: "Rodrigo Silveira",
          contactPhone: "11912345678",
          contactEmail: "rodrigo@translogexpress.com.br",
          leadOrigin: "website",
          temperature: "warm",
          productId: "prod-software-app",
          productName: "Plataforma Web SaaS / App Mobile",
          productCategory: "Software Web & App Mobile",
          billingFrequency: "one_time",
          dealValue: 12000,
          closeProbability: 60,
          nextAction: "Apresentar demonstração de arquitetura e protótipo",
          description: "Lead preencheu formulário no site solicitando orçamento para app mobile em React Native com painel de rastreamento de frotas.",
          labels: [
            { id: "l1", name: "Prospecção", color: "bg-emerald-500" },
            { id: "l2", name: "App Mobile", color: "bg-purple-500" }
          ],
          checklist: [
            { id: "chk-1", text: "Mapear requisitos técnicos essenciais", completed: true },
            { id: "chk-2", text: "Call de alinhamento com sócio diretor", completed: false },
            { id: "chk-3", text: "Elaborar proposta comercial com 2 opções de escopo", completed: false }
          ],
          commentsCount: 1,
          comments: [
            {
              id: "c1",
              author: "Maira Reis",
              type: "call",
              text: "Primeiro contato realizado via WhatsApp. Demonstrou interesse alto para início ainda este mês.",
              createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
            }
          ],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "col-qualificacao",
      title: "Diagnóstico & Briefing",
      colorTheme: "amber",
      cards: [
        {
          id: "card-2",
          title: "Dra. Juliana Mendes — Odonto Prime",
          companyName: "Clínica Odonto Prime",
          contactName: "Dra. Juliana Mendes",
          contactPhone: "35999887766",
          contactEmail: "juliana@odontoprime.com.br",
          leadOrigin: "instagram",
          temperature: "hot",
          productId: "prod-landing-page",
          productName: "Landing Page Express & Conversão",
          productCategory: "Landing Page (Next.js & Figma)",
          billingFrequency: "one_time",
          dealValue: 2200,
          closeProbability: 80,
          nextAction: "Enviar rascunho de proposta com cronograma de 15 dias",
          description: "Reformulação da presença digital da clínica com landing page focada em implantes e agendamento direto pelo WhatsApp.",
          labels: [
            { id: "l3", name: "Landing Page", color: "bg-blue-500" },
            { id: "l4", name: "Quente 🔥", color: "bg-amber-500" }
          ],
          checklist: [
            { id: "chk-4", text: "Coletar manual da marca e fotos da clínica", completed: true },
            { id: "chk-5", text: "Definir seções da landing page e depoimentos", completed: true },
            { id: "chk-6", text: "Apresentar proposta de pagamento em 2x", completed: false }
          ],
          commentsCount: 2,
          comments: [
            {
              id: "c2",
              author: "Maira Reis",
              type: "meeting",
              text: "Reunião de briefing de 30min realizada. Escopo 100% alinhado.",
              createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
            }
          ],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "col-proposta",
      title: "Proposta Enviada",
      colorTheme: "purple",
      cards: [
        {
          id: "card-3",
          title: "Danilo Buess — Parceria Celeste",
          companyName: "Celeste Soluções",
          contactName: "Danilo Buess",
          contactPhone: "16974007791",
          contactEmail: "danilo@celeste.com.br",
          leadOrigin: "referral",
          temperature: "hot",
          productId: "prod-partnership-recurring",
          productName: "Parceria Estratégica & App as a Service",
          productCategory: "Parceria Estratégica (Recorrente)",
          billingFrequency: "monthly",
          dealValue: 4500,
          closeProbability: 90,
          nextAction: "Follow-up da proposta e envio do link de aprovação",
          proposalNumber: "PROP-2026-003",
          proposalTitle: "Parceria Estratégica & Desenvolvimento Contínuo",
          proposalStatus: "sent",
          proposalValue: 4500,
          description: "Proposta comercial enviada com modelo recorrente de App as a Service e suporte mensal contínuo.",
          labels: [
            { id: "l5", name: "Quente 🔥", color: "bg-amber-500" },
            { id: "l6", name: "App Mobile", color: "bg-purple-500" }
          ],
          commentsCount: 2,
          comments: [
            {
              id: "c3",
              author: "Maira Reis",
              type: "whatsapp",
              text: "Link oficial da proposta gerada enviado no WhatsApp do Danilo.",
              createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
            }
          ],
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "col-negociacao",
      title: "Em Negociação & Ajustes",
      colorTheme: "blue",
      cards: [
        {
          id: "card-4",
          title: "Gabriel Ramos — Plataforma SaaS Avantt",
          companyName: "Avantt Tecnologia",
          contactName: "Gabriel Ramos",
          contactPhone: "11987654321",
          contactEmail: "gabriel@avantt.io",
          leadOrigin: "linkedin",
          temperature: "closing",
          productId: "prod-software-app",
          productName: "Plataforma Web SaaS / App Mobile",
          productCategory: "Software Web & App Mobile",
          billingFrequency: "one_time",
          dealValue: 7500,
          closeProbability: 85,
          nextAction: "Ajustar forma de pagamento em 3x e emitir contrato",
          proposalNumber: "PROP-2026-002",
          proposalTitle: "Desenvolvimento Fullstack Avantt SaaS",
          proposalStatus: "in_negotiation",
          proposalValue: 7500,
          description: "Ajustando condições de pagamento em 3 parcelas e cronograma de entrega de 6 semanas.",
          labels: [
            { id: "l7", name: "SaaS / Painel", color: "bg-cyan-500" },
            { id: "l8", name: "Quente 🔥", color: "bg-amber-500" }
          ],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "col-ganho",
      title: "Fechado / Ganho 🎉",
      colorTheme: "emerald",
      cards: [
        {
          id: "card-5",
          title: "Redesign UX/UI e Portal Web — Dra. Camila",
          companyName: "Clínica Camila Estética",
          contactName: "Dra. Camila Nogueira",
          contactPhone: "11977665544",
          contactEmail: "camila@camilaestetica.com.br",
          leadOrigin: "referral",
          temperature: "won",
          productId: "prod-ux-redesign",
          productName: "Redesign UI/UX & Consultoria",
          productCategory: "Consultoria UX/UI Design",
          billingFrequency: "one_time",
          dealValue: 3500,
          closeProbability: 100,
          nextAction: "Onboarding realizado e projeto iniciado no cronograma",
          proposalNumber: "PROP-2026-001",
          proposalTitle: "Consultoria UX/UI & Redesign Completo",
          proposalStatus: "approved",
          proposalValue: 3500,
          description: "Contrato assinado e primeira parcela confirmada via Pix. Passado para a etapa de planejamento de projeto.",
          labels: [
            { id: "l9", name: "Prospecção", color: "bg-emerald-500" },
            { id: "l10", name: "Fechado", color: "bg-blue-500" }
          ],
          commentsCount: 1,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "col-perdido",
      title: "Arquivado / Perdido",
      colorTheme: "rose",
      cards: []
    }
  ]
};

// --- Searchable Client Combobox Component ---
interface ClientSearchComboboxProps {
  clients: Profile[];
  selectedClientId?: string;
  onSelectClient: (clientId: string) => void;
  placeholder?: string;
}

const ClientSearchCombobox: React.FC<ClientSearchComboboxProps> = ({
  clients = [],
  selectedClientId,
  onSelectClient,
  placeholder = "Digite o nome ou e-mail..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter((c) => {
      const name = (c.full_name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [clients, query]);

  const handleSelect = (id: string) => {
    onSelectClient(id);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={containerRef}>
      {selectedClient ? (
        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
              {selectedClient.full_name ? selectedClient.full_name.charAt(0).toUpperCase() : "👤"}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {selectedClient.full_name || selectedClient.email || "Cliente"}
              </p>
              {selectedClient.email && selectedClient.full_name && (
                <p className="text-[10px] text-neutral-400 truncate leading-tight">{selectedClient.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                onSelectClient("");
                setQuery("");
                setTimeout(() => {
                  setIsOpen(true);
                  inputRef.current?.focus();
                }, 50);
              }}
              title="Desvincular ou trocar cliente"
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center rounded-xl bg-neutral-900 border border-white/10 px-2.5 py-1.5 focus-within:border-purple-500 transition-colors">
            <Search className="h-3.5 w-3.5 text-neutral-400 mr-1.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-0.5 rounded text-neutral-400 hover:text-white mr-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 text-neutral-400 transition-transform cursor-pointer shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl bg-[#161a23] border border-white/15 shadow-2xl shadow-black/90 py-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full text-left px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/5 hover:text-white flex items-center gap-2 cursor-pointer transition-colors border-b border-white/5"
              >
                <span className="text-neutral-500 font-mono text-[11px]">—</span>
                <span>Nenhum (Lead Avulso)</span>
              </button>

              {filteredClients.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-neutral-500">
                  Nenhum cliente encontrado para &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelect(client.id)}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-purple-600/20 hover:text-purple-200 flex items-center justify-between gap-2 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px] flex items-center justify-center shrink-0">
                        {client.full_name ? client.full_name.charAt(0).toUpperCase() : "👤"}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-white truncate text-[11px]">
                          {client.full_name || client.email}
                        </p>
                        {client.full_name && client.email && (
                          <p className="text-[10px] text-neutral-400 truncate">{client.email}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const KanbanModule: React.FC<KanbanModuleProps> = ({
  clients = [],
  onOpenProposalModal,
  onNavigateTab
}) => {
  const [board, setBoard] = useState<KanbanBoardData>(INITIAL_BOARD);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("all");
  const [selectedTempFilter, setSelectedTempFilter] = useState<string>("all");
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>("all");

  // Single Filter Button & Popover State
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilterCount =
    (selectedProductFilter !== "all" ? 1 : 0) +
    (selectedTempFilter !== "all" ? 1 : 0) +
    (selectedOriginFilter !== "all" ? 1 : 0);

  // Available Products & Proposals from localStorage
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>(DEFAULT_BUILTIN_PRODUCTS as any);
  const [savedProposals, setSavedProposals] = useState<CommercialProposal[]>([]);

  // Editable Board / Pipeline Title State
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [tempBoardTitle, setTempBoardTitle] = useState("");

  // Column 3-dots Menu & Rename State
  const [openColumnMenuId, setOpenColumnMenuId] = useState<string | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColTitle, setEditingColTitle] = useState("");

  // Inline Quick Card Creation State
  const [addingCardColId, setAddingCardColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // New Column State
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Card Modal Detailed Editor State
  const [activeCardModal, setActiveCardModal] = useState<{
    card: KanbanCardItem;
    columnId: string;
  } | null>(null);

  // New Lead Fast Modal State
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<{
    title: string;
    contactName: string;
    companyName: string;
    contactPhone: string;
    contactEmail: string;
    leadOrigin: LeadOrigin;
    temperature: LeadTemperature;
    productId: string;
    dealValue: number | string;
    billingFrequency: "one_time" | "monthly";
    nextAction: string;
    description: string;
    targetColumnId: string;
    clientId: string;
  }>({
    title: "",
    contactName: "",
    companyName: "",
    contactPhone: "",
    contactEmail: "",
    leadOrigin: "whatsapp",
    temperature: "warm",
    productId: DEFAULT_BUILTIN_PRODUCTS[0].id,
    dealValue: DEFAULT_BUILTIN_PRODUCTS[0].basePrice,
    billingFrequency: DEFAULT_BUILTIN_PRODUCTS[0].billingFrequency,
    nextAction: "Realizar primeiro contato e diagnóstico",
    description: "",
    targetColumnId: "col-prospeccao",
    clientId: ""
  });

  // New Activity State inside Modal
  const [modalCommentText, setModalCommentText] = useState("");
  const [modalCommentType, setModalCommentType] = useState<"comment" | "call" | "meeting" | "whatsapp">("whatsapp");
  const [newChecklistText, setNewChecklistText] = useState("");

  // Drag & Drop State
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedFromColId, setDraggedFromColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Copy feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load from localStorage & sync catalog products/proposals
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Board
    try {
      const raw = localStorage.getItem("portfolio_trello_kanban_crm_v3");
      if (raw) {
        setBoard(JSON.parse(raw));
      } else {
        // Check older key fallback
        const legacyRaw = localStorage.getItem("portfolio_trello_kanban_v2");
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw);
          if (parsed && Array.isArray(parsed.columns) && parsed.columns.length > 0) {
            setBoard(parsed);
          } else {
            setBoard(INITIAL_BOARD);
            localStorage.setItem("portfolio_trello_kanban_crm_v3", JSON.stringify(INITIAL_BOARD));
          }
        } else {
          setBoard(INITIAL_BOARD);
          localStorage.setItem("portfolio_trello_kanban_crm_v3", JSON.stringify(INITIAL_BOARD));
        }
      }
    } catch (e) {
      setBoard(INITIAL_BOARD);
    }

    // Load Catalog Products
    try {
      const rawProducts = localStorage.getItem("portfolio_products_catalog_v1");
      if (rawProducts) {
        const prods = JSON.parse(rawProducts);
        if (Array.isArray(prods) && prods.length > 0) {
          setCatalogProducts(prods);
        }
      }
    } catch (e) {}

    // Load Proposals
    try {
      const rawProposals = localStorage.getItem("portfolio_commercial_proposals_v1");
      if (rawProposals) {
        const props = JSON.parse(rawProposals);
        if (Array.isArray(props)) {
          setSavedProposals(props);
        }
      }
    } catch (e) {}
  }, []);

  const saveBoard = (newBoard: KanbanBoardData) => {
    setBoard(newBoard);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("portfolio_trello_kanban_crm_v3", JSON.stringify(newBoard));
      } catch (e) {}
    }
  };

  // Pipeline Metrics Calculation
  const pipelineMetrics = useMemo(() => {
    let totalDeals = 0;
    let totalPipelineValue = 0;
    let wonValue = 0;
    let hotDealsCount = 0;

    board.columns.forEach((col) => {
      col.cards.forEach((card) => {
        totalDeals += 1;
        const val = Number(card.dealValue) || 0;
        if (col.id === "col-ganho" || card.temperature === "won") {
          wonValue += val;
        } else if (col.id !== "col-perdido" && card.temperature !== "lost") {
          totalPipelineValue += val;
        }

        if (card.temperature === "hot" || card.temperature === "closing") {
          hotDealsCount += 1;
        }
      });
    });

    const avgTicket = totalDeals > 0 ? (totalPipelineValue + wonValue) / totalDeals : 0;

    return {
      totalDeals,
      totalPipelineValue,
      wonValue,
      hotDealsCount,
      avgTicket
    };
  }, [board]);

  const handleSaveBoardTitle = () => {
    if (!tempBoardTitle.trim()) {
      setIsEditingBoardTitle(false);
      return;
    }
    saveBoard({ ...board, title: tempBoardTitle.trim() });
    setIsEditingBoardTitle(false);
  };

  // Start Rename Column
  const handleStartRenameColumn = (col: KanbanColumnItem) => {
    setEditingColId(col.id);
    setEditingColTitle(col.title);
    setOpenColumnMenuId(null);
  };

  const handleSaveRenameColumn = (colId: string) => {
    if (!editingColTitle.trim()) {
      setEditingColId(null);
      return;
    }
    const updatedCols = board.columns.map((col) =>
      col.id === colId ? { ...col, title: editingColTitle.trim() } : col
    );
    saveBoard({ ...board, columns: updatedCols });
    setEditingColId(null);
  };

  // Add Card (Inline quick - Clean empty card)
  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) {
      setAddingCardColId(null);
      return;
    }

    const newCard: KanbanCardItem = {
      id: `card-${Date.now()}`,
      title: newCardTitle.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedCols = board.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: [newCard, ...col.cards]
        };
      }
      return col;
    });

    saveBoard({ ...board, columns: updatedCols });
    setNewCardTitle("");
    setAddingCardColId(null);
  };

  // Add Complete Lead from Modal
  const handleCreateNewLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.title.trim()) return;

    const selectedProduct = newLeadForm.productId ? catalogProducts.find((p) => p.id === newLeadForm.productId) : undefined;
    const selectedClient = newLeadForm.clientId ? clients.find((c) => c.id === newLeadForm.clientId) : undefined;

    const newCard: KanbanCardItem = {
      id: `card-${Date.now()}`,
      title: newLeadForm.title.trim(),
      contactName: newLeadForm.contactName.trim() || (selectedClient ? selectedClient.full_name || "" : undefined),
      companyName: newLeadForm.companyName.trim() || undefined,
      contactPhone: newLeadForm.contactPhone.trim() || undefined,
      contactEmail: newLeadForm.contactEmail.trim() || (selectedClient ? selectedClient.email || "" : undefined),
      leadOrigin: newLeadForm.leadOrigin || undefined,
      temperature: newLeadForm.temperature || undefined,
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      productCategory: selectedProduct?.category,
      dealValue: newLeadForm.dealValue ? Number(newLeadForm.dealValue) : (selectedProduct?.basePrice || undefined),
      billingFrequency: newLeadForm.billingFrequency || "one_time",
      nextAction: newLeadForm.nextAction.trim() || undefined,
      description: newLeadForm.description.trim() || undefined,
      clientId: selectedClient?.id,
      clientName: selectedClient?.full_name || undefined,
      clientEmail: selectedClient?.email || undefined,
      createdAt: new Date().toISOString()
    };

    const updatedCols = board.columns.map((col) => {
      if (col.id === newLeadForm.targetColumnId) {
        return {
          ...col,
          cards: [newCard, ...col.cards]
        };
      }
      return col;
    });

    saveBoard({ ...board, columns: updatedCols });
    setIsNewLeadModalOpen(false);

    // Reset form to completely empty
    setNewLeadForm({
      title: "",
      contactName: "",
      companyName: "",
      contactPhone: "",
      contactEmail: "",
      leadOrigin: "whatsapp",
      temperature: "" as any,
      productId: "",
      dealValue: "",
      billingFrequency: "one_time",
      nextAction: "",
      description: "",
      targetColumnId: "col-prospeccao",
      clientId: ""
    });
  };

  // Add Column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      setAddingColumn(false);
      return;
    }

    const newCol: KanbanColumnItem = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      cards: []
    };

    saveBoard({
      ...board,
      columns: [...board.columns, newCol]
    });
    setNewColumnTitle("");
    setAddingColumn(false);
  };

  // Delete Column
  const handleDeleteColumn = (colId: string) => {
    if (!confirm("Deseja realmente remover esta etapa do pipeline e todos os seus cartões?")) return;
    const updated = board.columns.filter((c) => c.id !== colId);
    saveBoard({ ...board, columns: updated });
  };

  // Drag & Drop
  const handleDragStartCard = (e: React.DragEvent, cardId: string, colId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ cardId, colId }));
    setDraggedCardId(cardId);
    setDraggedFromColId(colId);
  };

  const handleDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleMoveCard = (cardId: string, fromColId: string, targetColId: string) => {
    if (!cardId || !fromColId || !targetColId || fromColId === targetColId) return;

    const sourceCol = board.columns.find((col) => col.id === fromColId);
    const movingCard = sourceCol?.cards.find((c) => c.id === cardId);
    if (!movingCard) return;

    // Remove from source
    const updatedCols = board.columns.map((col) => {
      if (col.id === fromColId) {
        return {
          ...col,
          cards: col.cards.filter((c) => c.id !== cardId)
        };
      }
      return col;
    });

    // If moving to won/lost column, update temperature
    let cardToInsert: KanbanCardItem = { ...movingCard };
    if (targetColId === "col-ganho") {
      cardToInsert.temperature = "won";
      cardToInsert.closeProbability = 100;
    } else if (targetColId === "col-perdido") {
      cardToInsert.temperature = "lost";
      cardToInsert.closeProbability = 0;
    }

    // Add to target
    const finalCols = updatedCols.map((col) => {
      if (col.id === targetColId) {
        return {
          ...col,
          cards: [cardToInsert, ...col.cards]
        };
      }
      return col;
    });

    saveBoard({ ...board, columns: finalCols });
    if (activeCardModal && activeCardModal.card.id === cardId) {
      setActiveCardModal({ card: cardToInsert, columnId: targetColId });
    }
  };

  const handleDropCard = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColId(null);

    let cardId = draggedCardId;
    let fromColId = draggedFromColId;

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data?.cardId) cardId = data.cardId;
      if (data?.colId) fromColId = data.colId;
    } catch (err) {}

    if (!cardId || !fromColId || fromColId === targetColId) {
      setDraggedCardId(null);
      setDraggedFromColId(null);
      return;
    }

    handleMoveCard(cardId, fromColId, targetColId);
    setDraggedCardId(null);
    setDraggedFromColId(null);
  };

  // Update Card inside Modal
  const handleSaveModalCard = (updatedCard: KanbanCardItem) => {
    const updatedCols = board.columns.map((col) => {
      if (col.id === activeCardModal?.columnId) {
        return {
          ...col,
          cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
        };
      }
      return col;
    });

    saveBoard({ ...board, columns: updatedCols });
    setActiveCardModal({ card: updatedCard, columnId: activeCardModal!.columnId });
  };

  // Delete Card
  const handleDeleteCard = (cardId: string, colId: string) => {
    if (!confirm("Deseja excluir este lead/cartão comercial?")) return;
    const updatedCols = board.columns.map((col) => {
      if (col.id === colId) {
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      }
      return col;
    });
    saveBoard({ ...board, columns: updatedCols });
    setActiveCardModal(null);
  };

  // Add Activity / Follow-up Comment
  const handleAddComment = () => {
    if (!modalCommentText.trim() || !activeCardModal) return;
    const newComment: KanbanActivityItem = {
      id: `comm-${Date.now()}`,
      author: "Maira Reis",
      type: modalCommentType,
      text: modalCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const currentComments = activeCardModal.card.comments || [];
    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      comments: [newComment, ...currentComments],
      commentsCount: (activeCardModal.card.commentsCount || 0) + 1
    };

    handleSaveModalCard(updatedCard);
    setModalCommentText("");
  };

  // Add Checklist Item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim() || !activeCardModal) return;
    const newItem: KanbanChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };

    const currentList = activeCardModal.card.checklist || [];
    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      checklist: [...currentList, newItem]
    };

    handleSaveModalCard(updatedCard);
    setNewChecklistText("");
  };

  // Toggle Checklist
  const handleToggleChecklist = (chkId: string) => {
    if (!activeCardModal) return;
    const currentList = activeCardModal.card.checklist || [];
    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      checklist: currentList.map((c) => (c.id === chkId ? { ...c, completed: !c.completed } : c))
    };
    handleSaveModalCard(updatedCard);
  };

  // WhatsApp quick approach message
  const handleOpenWhatsApp = (phone?: string, contactName?: string, productName?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const name = contactName ? contactName.split(" ")[0] : "tudo bem";
    const prod = productName ? ` sobre a solução de *${productName}*` : "";
    const greeting = `Olá ${name}! Aqui é a Maira Reis. Estou entrando em contato para dar sequência na nossa conversa${prod}. Como está a sua disponibilidade para alinharmos os detalhes?`;
    window.open(`https://wa.me/55${cleanPhone.replace(/^55/, "")}?text=${encodeURIComponent(greeting)}`, "_blank");
  };

  // Select Product & auto-fill product details
  const handleSelectProductInModal = (prodId: string) => {
    if (!activeCardModal) return;
    if (!prodId) {
      const updatedCard: KanbanCardItem = {
        ...activeCardModal.card,
        productId: undefined,
        productName: undefined,
        productCategory: undefined
      };
      handleSaveModalCard(updatedCard);
      return;
    }

    const selected = catalogProducts.find((p) => p.id === prodId);
    if (!selected) return;

    // Detect billing frequency from product
    let detectedFreq: "one_time" | "monthly" | "quarterly" | "yearly" | "hourly" = selected.billingFrequency || "one_time";
    const nameLower = (selected.name || "").toLowerCase();
    const catLower = (selected.category || "").toLowerCase();
    const timelineLower = (selected.deliveryTimeline || "").toLowerCase();
    if (
      nameLower.includes("mês") ||
      nameLower.includes("mensal") ||
      catLower.includes("recorrente") ||
      timelineLower.includes("mês") ||
      timelineLower.includes("mensal")
    ) {
      detectedFreq = "monthly";
    } else if (nameLower.includes("ano") || nameLower.includes("anual")) {
      detectedFreq = "yearly";
    } else if (nameLower.includes("trimestral")) {
      detectedFreq = "quarterly";
    }

    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      productId: selected.id,
      productName: selected.name,
      productCategory: selected.category,
      billingFrequency: detectedFreq,
      dealValue: Number(selected.basePrice) || 0
    };
    handleSaveModalCard(updatedCard);
  };

  // Select Client & auto-fill client details
  const handleSelectClientInModal = (clientId: string) => {
    if (!activeCardModal) return;
    if (!clientId) {
      const updatedCard: KanbanCardItem = {
        ...activeCardModal.card,
        clientId: undefined,
        clientName: undefined,
        clientEmail: undefined
      };
      handleSaveModalCard(updatedCard);
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      clientId: client.id,
      clientName: client.full_name || client.email || "Cliente",
      clientEmail: client.email || activeCardModal.card.contactEmail,
      contactName: activeCardModal.card.contactName || client.full_name || ""
    };
    handleSaveModalCard(updatedCard);
  };

  // Select Proposal & link
  const handleSelectProposalInModal = (propId: string) => {
    if (!activeCardModal) return;
    if (!propId) {
      const updatedCard: KanbanCardItem = {
        ...activeCardModal.card,
        proposalId: undefined,
        proposalNumber: undefined,
        proposalTitle: undefined,
        proposalStatus: undefined,
        proposalValue: undefined
      };
      handleSaveModalCard(updatedCard);
      return;
    }

    const proposal = savedProposals.find((p) => p.id === propId);
    if (!proposal) return;

    const updatedCard: KanbanCardItem = {
      ...activeCardModal.card,
      proposalId: proposal.id,
      proposalNumber: proposal.docNumber,
      proposalTitle: proposal.title,
      proposalStatus: proposal.status,
      proposalValue: proposal.totalValue,
      dealValue: activeCardModal.card.dealValue || proposal.totalValue
    };
    handleSaveModalCard(updatedCard);
  };

  // Helper badge for temperature
  const getTemperatureBadge = (temp?: LeadTemperature) => {
    if (!temp) return null;
    switch (temp) {
      case "hot":
        return { label: "Quente 🔥", bg: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Flame };
      case "closing":
        return { label: "Fechamento 🚀", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30", icon: Target };
      case "won":
        return { label: "Ganho 🎉", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: Award };
      case "lost":
        return { label: "Perdido ❌", bg: "bg-rose-500/15 text-rose-400 border-rose-500/30", icon: AlertCircle };
      case "warm":
        return { label: "Morno 🌤️", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: SunMedium };
      case "cold":
        return { label: "Frio ❄️", bg: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30", icon: Snowflake };
      default:
        return null;
    }
  };

  // Helper badge for origin
  const getOriginLabel = (origin?: LeadOrigin) => {
    switch (origin) {
      case "whatsapp":
        return { label: "WhatsApp", icon: MessageCircle };
      case "instagram":
        return { label: "Instagram", icon: Sparkles };
      case "referral":
        return { label: "Indicação", icon: Users };
      case "website":
        return { label: "Site / Formulário", icon: ExternalLink };
      case "linkedin":
        return { label: "LinkedIn", icon: Briefcase };
      case "outbound":
        return { label: "Prospecção Ativa", icon: Send };
      default:
        return { label: "Outro Canal", icon: Tag };
    }
  };

  return (
    <div
      onClick={() => setOpenColumnMenuId(null)}
      style={{ minHeight: "calc(100vh - 110px)", height: "calc(100vh - 110px)" }}
      className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col bg-[#0b0f19]"
    >
      {/* Ambient Backdrop Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_40%,rgba(59,130,246,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & COMMERCIAL PIPELINE METRICS                               */}
      {/* ========================================================================= */}
      <header className="relative z-10 shrink-0 px-4 sm:px-6 py-3.5 bg-black/40 backdrop-blur-2xl border-b border-white/10 flex flex-col gap-3">
        {/* Top Row: Pipeline Title + Quick Action Buttons + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Left: Pipeline Title & Badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-300 shadow-md shadow-purple-600/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>

            {isEditingBoardTitle ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  autoFocus
                  value={tempBoardTitle}
                  onChange={(e) => setTempBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBoardTitle();
                    if (e.key === "Escape") setIsEditingBoardTitle(false);
                  }}
                  onBlur={handleSaveBoardTitle}
                  className="w-full sm:w-80 px-3 py-1.5 text-sm font-bold text-white bg-[#1c2127] border border-purple-500 rounded-xl outline-none shadow-lg"
                />
                <button
                  type="button"
                  onClick={handleSaveBoardTitle}
                  className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer shrink-0"
                  title="Salvar Nome"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 group min-w-0">
                <div
                  onClick={() => {
                    setTempBoardTitle(board.title);
                    setIsEditingBoardTitle(true);
                  }}
                  className="cursor-pointer flex items-center gap-2 min-w-0 group"
                  title="Clique para editar o título do funil"
                >
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-purple-300 transition-colors truncate">
                    {board.title}
                  </h2>
                  <Edit2 className="h-3.5 w-3.5 text-neutral-500 group-hover:text-purple-300 transition-colors shrink-0" />
                </div>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  CRM Prospecção
                </span>
              </div>
            )}
          </div>

          {/* Right: Search Box + Filter Button + Quick Links + Primary CTA */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Search Box (Responsive & Expandable) */}
            <div className="relative min-w-[140px] w-36 sm:w-48 md:w-56 lg:w-64 focus-within:w-48 sm:focus-within:w-60 md:focus-within:w-72 transition-all duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lead..."
                className="w-full pl-9 pr-7 py-2 rounded-xl bg-neutral-900/90 border border-white/10 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 focus:bg-black/90 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Single Unified Filter Button with Popover */}
            <div className="relative" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFilterCount > 0 || isFilterMenuOpen
                    ? "bg-purple-600/25 border-purple-500/50 text-purple-200 shadow-md shadow-purple-600/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white"
                }`}
                title="Filtrar oportunidades por produto, temperatura ou origem"
              >
                <Filter className="h-3.5 w-3.5 text-purple-400" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={`h-3 w-3 text-neutral-400 transition-transform ${
                    isFilterMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Filter Popover Dropdown */}
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#161a23] border border-white/15 shadow-2xl shadow-black/90 p-4 z-50 backdrop-blur-xl space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Filter className="h-3.5 w-3.5 text-purple-400" />
                      <span>Filtros do Funil</span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductFilter("all");
                          setSelectedTempFilter("all");
                          setSelectedOriginFilter("all");
                        }}
                        className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Limpar tudo
                      </button>
                    )}
                  </div>

                  {/* Filter 1: Product */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Package className="h-3 w-3 text-cyan-400" />
                      <span>Produto / Solução</span>
                    </label>
                    <select
                      value={selectedProductFilter}
                      onChange={(e) => setSelectedProductFilter(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-neutral-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="all">📦 Todos os Produtos</option>
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter 2: Temperature */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-400" />
                      <span>Temperatura Comercial</span>
                    </label>
                    <select
                      value={selectedTempFilter}
                      onChange={(e) => setSelectedTempFilter(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-neutral-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="all">🔥 Todas as Temperaturas</option>
                      <option value="hot">🔥 Quentes / Fechamento Iminente</option>
                      <option value="warm">🌤️ Mornos (Interesse)</option>
                      <option value="cold">❄️ Frios (Primeiro Contato)</option>
                      <option value="won">🎉 Fechados / Ganhos</option>
                      <option value="lost">❌ Perdidos / Arquivados</option>
                    </select>
                  </div>

                  {/* Filter 3: Origin */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="h-3 w-3 text-blue-400" />
                      <span>Canal de Origem</span>
                    </label>
                    <select
                      value={selectedOriginFilter}
                      onChange={(e) => setSelectedOriginFilter(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-neutral-200 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="all">🌐 Todas as Origens</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="instagram">📸 Instagram</option>
                      <option value="website">🌐 Site / Formulário</option>
                      <option value="referral">🤝 Indicação</option>
                      <option value="linkedin">💼 LinkedIn</option>
                      <option value="outbound">🎯 Outbound / Prospecção Ativa</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {activeFilterCount === 0 ? "Nenhum filtro ativo" : `${activeFilterCount} filtro(s) ativo(s)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Link: Proposals */}
            {onOpenProposalModal && (
              <button
                type="button"
                onClick={onOpenProposalModal}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Acessar Módulo de Propostas Comerciais"
              >
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden md:inline">Propostas</span>
              </button>
            )}

            {/* Quick Link: Catalog */}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("products")}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Acessar Catálogo de Produtos e Serviços"
              >
                <Package className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden md:inline">Catálogo</span>
              </button>
            )}

            {/* Primary Action: Novo Lead */}
            <button
              type="button"
              onClick={() => setIsNewLeadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <PlusCircle className="h-4 w-4 text-white" />
              <span>Novo Lead</span>
            </button>
          </div>
        </div>

        {/* Second Row: Executive KPI Metric Strip & Active Filters */}
        <div className="p-2 sm:p-2.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-2.5">
          {/* Metric Chips */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] text-neutral-400 font-medium">Em Pipeline:</span>
              <strong className="font-mono font-bold text-emerald-300 text-xs">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pipelineMetrics.totalPipelineValue)}
              </strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] text-neutral-400 font-medium">Fechados:</span>
              <strong className="font-mono font-bold text-blue-300 text-xs">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pipelineMetrics.wonValue)}
              </strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] text-neutral-400 font-medium">Quentes:</span>
              <strong className="font-bold text-amber-300 text-xs">{pipelineMetrics.hotDealsCount}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[11px] text-neutral-400 font-medium">Oportunidades:</span>
              <strong className="font-bold text-white text-xs">{pipelineMetrics.totalDeals}</strong>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(activeFilterCount > 0 || searchQuery.trim() !== "") && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {searchQuery.trim() !== "" && (
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-neutral-300 flex items-center gap-1.5">
                  Busca: &ldquo;{searchQuery}&rdquo;
                  <X className="h-3 w-3 text-neutral-400 hover:text-white cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {selectedProductFilter !== "all" && (
                <span className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-1.5">
                  Produto ativo
                  <X className="h-3 w-3 text-cyan-400 hover:text-white cursor-pointer" onClick={() => setSelectedProductFilter("all")} />
                </span>
              )}
              {selectedTempFilter !== "all" && (
                <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                  Temperatura ativa
                  <X className="h-3 w-3 text-amber-400 hover:text-white cursor-pointer" onClick={() => setSelectedTempFilter("all")} />
                </span>
              )}
              {selectedOriginFilter !== "all" && (
                <span className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-1.5">
                  Origem ativa
                  <X className="h-3 w-3 text-blue-400 hover:text-white cursor-pointer" onClick={() => setSelectedOriginFilter("all")} />
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedProductFilter("all");
                  setSelectedTempFilter("all");
                  setSelectedOriginFilter("all");
                  setSearchQuery("");
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold ml-1 cursor-pointer"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. KANBAN BOARD COLUMNS HORIZONTAL CONTAINER                              */}
      {/* ========================================================================= */}
      <main
        style={{ flex: "1 1 0%", minHeight: 0 }}
        className="relative z-10 p-3 sm:p-5 lg:p-6 overflow-x-auto overflow-y-hidden flex items-stretch gap-3 sm:gap-4 select-none pb-4"
      >
        {board.columns.map((col) => {
          const isDragOver = dragOverColId === col.id;

          // Apply all active filters
          const filteredCards = col.cards.filter((card) => {
            // Text Search
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const matchTitle = card.title.toLowerCase().includes(q);
              const matchContact = card.contactName?.toLowerCase().includes(q);
              const matchCompany = card.companyName?.toLowerCase().includes(q);
              const matchProduct = card.productName?.toLowerCase().includes(q);
              const matchPhone = card.contactPhone?.toLowerCase().includes(q);
              if (!matchTitle && !matchContact && !matchCompany && !matchProduct && !matchPhone) {
                return false;
              }
            }

            // Product Filter
            if (selectedProductFilter !== "all" && card.productId !== selectedProductFilter) {
              return false;
            }

            // Temperature Filter
            if (selectedTempFilter !== "all") {
              if (selectedTempFilter === "hot" && card.temperature !== "hot" && card.temperature !== "closing") {
                return false;
              }
              if (selectedTempFilter !== "hot" && card.temperature !== selectedTempFilter) {
                return false;
              }
            }

            // Origin Filter
            if (selectedOriginFilter !== "all" && card.leadOrigin !== selectedOriginFilter) {
              return false;
            }

            return true;
          });

          // Column total value
          const columnTotalValue = filteredCards.reduce((acc, c) => acc + (Number(c.dealValue) || 0), 0);

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOverColumn(e, col.id)}
              onDragLeave={() => setDragOverColId(null)}
              onDrop={(e) => handleDropCard(e, col.id)}
              style={{
                width: "290px",
                minWidth: "290px",
                maxWidth: "290px",
                backgroundColor: "#101214",
                height: "100%",
                minHeight: "420px"
              }}
              className={`w-72 shrink-0 flex flex-col h-full rounded-2xl border transition-all ${
                openColumnMenuId === col.id ? "z-30 relative" : "relative"
              } ${
                isDragOver
                  ? "border-purple-500/80 bg-[#101214] shadow-2xl shadow-purple-500/20 scale-[1.01]"
                  : "border-white/10 bg-[#101214] shadow-xl"
              }`}
            >
              {/* Column Header */}
              <div className="px-3.5 py-3 flex items-center justify-between gap-2 border-b border-white/5 relative z-20 shrink-0">
                {editingColId === col.id ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="text"
                      autoFocus
                      value={editingColTitle}
                      onChange={(e) => setEditingColTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRenameColumn(col.id);
                        if (e.key === "Escape") setEditingColId(null);
                      }}
                      onBlur={() => handleSaveRenameColumn(col.id)}
                      className="w-full text-xs font-bold text-white bg-[#1c2127] border border-purple-500 rounded-lg px-2 py-1 outline-none shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRenameColumn(col.id)}
                      className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shrink-0 cursor-pointer"
                      title="Salvar Nome"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3
                      onClick={() => handleStartRenameColumn(col)}
                      className="text-xs font-bold text-neutral-100 truncate cursor-pointer hover:text-purple-300 transition-colors"
                      title="Clique para renomear esta etapa do funil"
                    >
                      {col.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-400 px-1.5 py-0.5 rounded-full bg-white/5">
                      {filteredCards.length}
                    </span>
                  </div>
                )}

                {/* Value summary in column header */}
                {columnTotalValue > 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400/90 hidden sm:inline">
                    {new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short", style: "currency", currency: "BRL" }).format(columnTotalValue)}
                  </span>
                )}

                {/* 3-dots Menu */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenColumnMenuId(openColumnMenuId === col.id ? null : col.id);
                    }}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      openColumnMenuId === col.id
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "hover:bg-white/10 text-neutral-400 hover:text-white"
                    }`}
                    title="Opções da Etapa"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {/* 3-dots Dropdown */}
                  {openColumnMenuId === col.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenColumnMenuId(null);
                        }}
                      />

                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ backgroundColor: "#15181e" }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#15181e] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-50 p-2 space-y-1 animate-fadeIn text-left"
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Opções da Etapa
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenColumnMenuId(null);
                            handleStartRenameColumn(col);
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                            <Edit2 className="h-3.5 w-3.5" />
                          </div>
                          <span>Editar nome</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenColumnMenuId(null);
                            setAddingCardColId(col.id);
                            setNewCardTitle("");
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-white/10 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                          <span>Adicionar cartão</span>
                        </button>

                        <div className="border-t border-white/10 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setOpenColumnMenuId(null);
                            handleDeleteColumn(col.id);
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-rose-500/20 text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </div>
                          <span>Excluir etapa</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cards List Area */}
              <div
                style={{ flex: "1 1 0%", minHeight: "120px" }}
                className="p-2.5 flex-1 overflow-y-auto space-y-2.5 no-scrollbar min-h-0"
              >
                {filteredCards.map((card) => {
                  const isDragging = draggedCardId === card.id;
                  const totalChecks = card.checklist?.length || 0;
                  const completedChecks = card.checklist?.filter((c) => c.completed).length || 0;
                  const tempBadge = getTemperatureBadge(card.temperature);
                  const originInfo = getOriginLabel(card.leadOrigin);

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStartCard(e, card.id, col.id)}
                      onClick={() => setActiveCardModal({ card, columnId: col.id })}
                      className={`p-3.5 rounded-xl border border-white/10 bg-[#1c2127] hover:bg-[#222831] hover:border-purple-500/50 shadow-md transition-all group cursor-pointer ${
                        isDragging ? "opacity-30 scale-95 border-purple-500" : ""
                      }`}
                    >
                      {/* Top Badges Row: Only shown if product or temperature exists */}
                      {(card.productName || tempBadge) && (
                        <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                          {/* Product Tag */}
                          {card.productName ? (
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md truncate max-w-[170px]" title={card.productName}>
                              <Package className="h-3 w-3 text-purple-400 shrink-0" />
                              <span className="truncate">{card.productName}</span>
                            </div>
                          ) : <div />}

                          {/* Temperature Pill */}
                          {tempBadge && (
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${tempBadge.bg}`}>
                              <span>{tempBadge.label}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Title (Lead & Company) */}
                      <p className="text-xs font-semibold text-neutral-100 group-hover:text-white transition-colors leading-snug mb-2">
                        {card.title}
                      </p>

                      {/* Decisor / Contact Name if present */}
                      {card.contactName && card.contactName !== card.title && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-2 truncate">
                          <User className="h-3 w-3 text-neutral-500 shrink-0" />
                          <span className="truncate">{card.contactName}</span>
                          {card.companyName && <span className="text-neutral-500">· {card.companyName}</span>}
                        </div>
                      )}

                      {/* Commercial Value & Linked Proposal Badge */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {card.dealValue && card.dealValue > 0 ? (
                          <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(card.dealValue)}</span>
                            {card.billingFrequency === "monthly" && <span className="text-[9px] text-emerald-300 font-sans font-normal">/mês</span>}
                          </span>
                        ) : null}

                        {/* Proposal Linked Tag */}
                        {card.proposalNumber && (
                          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <FileText className="h-2.5 w-2.5 text-purple-400" />
                            <span>{card.proposalNumber}</span>
                          </span>
                        )}

                        {/* Linked Client User */}
                        {card.clientId && (
                          <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Cliente cadastrado no sistema">
                            <UserCheck className="h-2.5 w-2.5 text-blue-400" />
                            <span>Cliente</span>
                          </span>
                        )}
                      </div>

                      {/* Next Action / Follow-up pill */}
                      {card.nextAction && (
                        <div className="mb-2.5 px-2 py-1 rounded-lg bg-neutral-900/80 border border-white/5 text-[10px] text-neutral-300 flex items-start gap-1.5">
                          <Zap className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 italic">{card.nextAction}</span>
                        </div>
                      )}

                      {/* Card Footer Badges: Comments count, Checklist, Due Date, WhatsApp Action */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {card.commentsCount && card.commentsCount > 0 ? (
                            <span className="flex items-center gap-1 text-neutral-400 hover:text-white" title={`${card.commentsCount} atividades`}>
                              <MessageSquare className="h-3 w-3" />
                              <span className="text-[10px]">{card.commentsCount}</span>
                            </span>
                          ) : null}

                          {totalChecks > 0 && (
                            <span
                              className={`flex items-center gap-1 text-[10px] ${
                                completedChecks === totalChecks ? "text-emerald-400" : "text-neutral-400"
                              }`}
                              title={`${completedChecks} de ${totalChecks} tarefas concluídas`}
                            >
                              <CheckSquare className="h-3 w-3" />
                              <span>
                                {completedChecks}/{totalChecks}
                              </span>
                            </span>
                          )}

                          {card.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400" title="Previsão de Fechamento">
                              <Clock className="h-3 w-3 text-purple-400" />
                              <span>
                                {new Date(card.dueDate + "T00:00:00").toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit"
                                })}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Direct 1-Click WhatsApp Trigger */}
                        {card.contactPhone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWhatsApp(card.contactPhone, card.contactName, card.productName);
                            }}
                            className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                            title="Conversar no WhatsApp com abordagem inteligente"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom: "+ Adicionar um cartão" */}
              <div className="p-2 border-t border-white/5 shrink-0 bg-[#101214] rounded-b-2xl mt-auto">
                {addingCardColId === col.id ? (
                  <div className="space-y-2 p-1">
                    <textarea
                      rows={2}
                      autoFocus
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard(col.id);
                        }
                        if (e.key === "Escape") setAddingCardColId(null);
                      }}
                      placeholder="Nome do lead / oportunidade..."
                      className="w-full rounded-xl bg-[#1c2127] border border-purple-500/40 p-2 text-xs text-white outline-none placeholder-neutral-500"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAddCard(col.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCardColId(null);
                          setNewCardTitle("");
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCardColId(col.id);
                      setNewCardTitle("");
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
                      <span>Adicionar cartão</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-400">↵</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* "+ Adicionar outra lista" Column Button */}
        <div
          style={{ width: "290px", minWidth: "290px", maxWidth: "290px" }}
          className="w-72 shrink-0 self-start"
        >
          {addingColumn ? (
            <div className="p-3.5 rounded-2xl border border-white/10 bg-[#101214]/90 backdrop-blur-xl shadow-xl space-y-2.5">
              <input
                type="text"
                autoFocus
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setAddingColumn(false);
                }}
                placeholder="Nome da etapa do funil..."
                className="w-full rounded-xl bg-[#1c2127] border border-purple-500/40 px-3 py-2 text-xs text-white outline-none placeholder-neutral-500"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                >
                  Adicionar etapa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingColumn(true)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4 text-neutral-300" />
              <span>Adicionar outra etapa</span>
            </button>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: DETAILED CARD & PROSPECTION CRM EDITOR (MODERN 2-COLUMN DESIGN) */}
      {/* ========================================================================= */}
      {activeCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-[#12151c] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-left my-auto">
            {/* Top Clean Header */}
            <div className="px-6 py-4 bg-[#161a23] border-b border-white/10 flex items-center justify-between gap-4">
              {/* Breadcrumb & Stage Switcher */}
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                  <span>Pipeline</span>
                  <span className="text-neutral-600">/</span>
                </span>

                {/* Move Stage Selector */}
                <select
                  value={activeCardModal.columnId}
                  onChange={(e) => {
                    const targetColId = e.target.value;
                    if (targetColId && targetColId !== activeCardModal.columnId) {
                      handleMoveCard(activeCardModal.card.id, activeCardModal.columnId, targetColId);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 outline-none cursor-pointer hover:bg-purple-500/20 transition-colors"
                >
                  {board.columns.map((col) => (
                    <option key={col.id} value={col.id} className="bg-[#161a23] text-white">
                      Etapa: {col.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Header Right: WhatsApp shortcut & Close */}
              <div className="flex items-center gap-2 shrink-0">
                {activeCardModal.card.contactPhone && (
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(activeCardModal.card.contactPhone, activeCardModal.card.contactName, activeCardModal.card.productName)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCardModal(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 Columns (Left: Execution & Notes / Right: Sidebar Properties) */}
            <div className="p-6 overflow-y-auto max-h-[calc(92vh-130px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: MAIN CONTENT (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Nome da Oportunidade / Lead
                  </label>
                  <input
                    type="text"
                    value={activeCardModal.card.title}
                    onChange={(e) =>
                      handleSaveModalCard({ ...activeCardModal.card, title: e.target.value })
                    }
                    placeholder="Ex: Dra. Juliana — Landing Page"
                    className="w-full text-lg sm:text-xl font-black text-white bg-transparent border-b border-white/10 focus:border-purple-500 outline-none pb-1.5 transition-colors placeholder-neutral-600"
                  />
                </div>

                {/* Highlight Next Action / Follow-up */}
                <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Próxima Ação Comercial (Follow-up)</span>
                  </div>
                  <input
                    type="text"
                    value={activeCardModal.card.nextAction || ""}
                    onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, nextAction: e.target.value })}
                    placeholder="Ex: Enviar proposta ajustada na quinta às 14h..."
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400"
                  />
                </div>

                {/* Briefing & Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit2 className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Briefing & Anotações de Negociação</span>
                  </label>
                  <textarea
                    rows={4}
                    value={activeCardModal.card.description || ""}
                    onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, description: e.target.value })}
                    placeholder="Registre dores do cliente, requisitos levantados, condições acordadas e detalhes importantes..."
                    className="w-full rounded-2xl bg-neutral-900/90 border border-white/10 p-3.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-purple-500 leading-relaxed resize-y"
                  />
                </div>

                {/* Commercial Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                      <span>Checklist de Qualificação</span>
                    </label>
                    <span className="text-[11px] font-mono text-purple-400">
                      {activeCardModal.card.checklist?.filter((c) => c.completed).length || 0}/
                      {activeCardModal.card.checklist?.length || 0}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1.5">
                    {activeCardModal.card.checklist?.map((chk) => (
                      <div
                        key={chk.id}
                        onClick={() => handleToggleChecklist(chk.id)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => {}}
                          className="rounded border-white/20 text-purple-600 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span className={`text-xs flex-1 ${chk.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}>
                          {chk.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Check item */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddChecklistItem();
                      }}
                      placeholder="Adicionar tarefa rápida..."
                      className="flex-1 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs text-white border border-white/10 outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Activity & Follow-ups Timeline */}
                <div className="space-y-2.5 pt-2">
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Histórico de Atividades & Contatos</span>
                  </label>

                  <div className="p-2.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center gap-2">
                    <select
                      value={modalCommentType}
                      onChange={(e) => setModalCommentType(e.target.value as any)}
                      className="px-2 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-300 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="call">📞 Ligação</option>
                      <option value="meeting">🤝 Reunião</option>
                      <option value="comment">📝 Nota</option>
                    </select>

                    <input
                      type="text"
                      value={modalCommentText}
                      onChange={(e) => setModalCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment();
                      }}
                      placeholder="Registrar atividade ou resultado..."
                      className="flex-1 rounded-xl bg-black/40 px-3 py-1.5 text-xs text-white border border-white/10 outline-none focus:border-purple-500"
                    />

                    <button
                      type="button"
                      onClick={handleAddComment}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer shrink-0"
                    >
                      Salvar
                    </button>
                  </div>

                  {/* List of activities */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeCardModal.card.comments?.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-neutral-900/50 border border-white/5 text-xs space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                          <div className="flex items-center gap-1.5">
                            {c.type === "whatsapp" && <MessageCircle className="h-3 w-3 text-emerald-400" />}
                            {c.type === "call" && <PhoneCall className="h-3 w-3 text-blue-400" />}
                            {c.type === "meeting" && <Video className="h-3 w-3 text-purple-400" />}
                            {c.type === "comment" && <Edit2 className="h-3 w-3 text-neutral-400" />}
                            <strong className="text-purple-300">{c.author}</strong>
                          </div>
                          <span>
                            {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}{" "}
                            {new Date(c.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-neutral-200 pl-4">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PROPERTY SIDEBAR (5 cols) */}
              <div className="lg:col-span-5 space-y-4 bg-black/30 border border-white/5 p-4 sm:p-5 rounded-2xl h-fit">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center justify-between">
                  <span>Propriedades do Lead</span>
                  <span className="text-[10px] text-purple-400 font-mono">CRM Vendas</span>
                </h4>

                {/* Product Select */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Package className="h-3 w-3 text-cyan-400" />
                      <span>Produto / Serviço</span>
                    </label>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("products")}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Catálogo
                      </button>
                    )}
                  </div>
                  <select
                    value={activeCardModal.card.productId || ""}
                    onChange={(e) => handleSelectProductInModal(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white font-medium outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="">Nenhum produto selecionado</option>
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deal Value & Frequency */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-emerald-400" />
                      <span>Valor (R$)</span>
                    </label>
                    <div className="flex items-center rounded-xl bg-neutral-900 border border-emerald-500/30 px-2.5 py-1.5 focus-within:border-emerald-400">
                      <span className="text-xs font-mono font-bold text-emerald-400 select-none mr-1">R$</span>
                      <input
                        type="number"
                        value={activeCardModal.card.dealValue || ""}
                        onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, dealValue: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="0,00"
                        className="w-full bg-transparent text-xs font-mono font-bold text-emerald-300 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Cobrança
                    </label>
                    <select
                      value={activeCardModal.card.billingFrequency || "one_time"}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, billingFrequency: e.target.value as any })}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="one_time">Pontual</option>
                      <option value="monthly">Mensal (MRR)</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span>Temperatura Comercial</span>
                  </label>
                  <select
                    value={activeCardModal.card.temperature || ""}
                    onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, temperature: (e.target.value as LeadTemperature) || undefined })}
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="">Sem temperatura definida</option>
                    <option value="cold">❄️ Frio (Primeiro Contato)</option>
                    <option value="warm">🌤️ Morno (Interesse)</option>
                    <option value="hot">🔥 Quente (Proposta/Negociação)</option>
                    <option value="closing">🚀 Fechamento Iminente</option>
                    <option value="won">🎉 Ganho / Fechado</option>
                    <option value="lost">❌ Perdido</option>
                  </select>
                </div>

                {/* Contact & Company */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3 w-3 text-purple-400" />
                      <span>Nome do Decisor / Contato</span>
                    </label>
                    <input
                      type="text"
                      value={activeCardModal.card.contactName || ""}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, contactName: e.target.value })}
                      placeholder="Ex: Carlos Ferreira"
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-neutral-400" />
                      <span>Empresa / Negócio</span>
                    </label>
                    <input
                      type="text"
                      value={activeCardModal.card.companyName || ""}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, companyName: e.target.value })}
                      placeholder="Ex: Prime Tech Soluções"
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* WhatsApp & Email */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={activeCardModal.card.contactPhone || ""}
                        onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, contactPhone: e.target.value })}
                        placeholder="Ex: 11999998888"
                        className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                      />
                      {activeCardModal.card.contactPhone && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(activeCardModal.card.contactPhone, activeCardModal.card.contactName, activeCardModal.card.productName)}
                          className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 shrink-0 cursor-pointer"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3 w-3 text-blue-400" />
                      <span>E-mail</span>
                    </label>
                    <input
                      type="email"
                      value={activeCardModal.card.contactEmail || ""}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, contactEmail: e.target.value })}
                      placeholder="Ex: contato@empresa.com"
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Origin & Due Date */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Canal de Origem
                    </label>
                    <select
                      value={activeCardModal.card.leadOrigin || "whatsapp"}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, leadOrigin: e.target.value as LeadOrigin })}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="website">Site / Form</option>
                      <option value="referral">Indicação</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="outbound">Ativo</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Previsão Fechamento
                    </label>
                    <input
                      type="date"
                      value={activeCardModal.card.dueDate || ""}
                      onChange={(e) => handleSaveModalCard({ ...activeCardModal.card, dueDate: e.target.value })}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Link Client & Proposal */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Vincular Cliente
                    </label>
                    <ClientSearchCombobox
                      clients={clients}
                      selectedClientId={activeCardModal.card.clientId}
                      onSelectClient={(id) => handleSelectClientInModal(id)}
                      placeholder="Digite o nome ou e-mail..."
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Proposta Comercial
                      </label>
                      {onOpenProposalModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardModal(null);
                            onOpenProposalModal();
                          }}
                          className="text-[10px] text-purple-400 hover:underline"
                        >
                          + Criar
                        </button>
                      )}
                    </div>
                    <select
                      value={activeCardModal.card.proposalId || ""}
                      onChange={(e) => handleSelectProposalInModal(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">Nenhuma proposta vinculada</option>
                      {savedProposals.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          📄 [{prop.docNumber}] {prop.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-6 py-3.5 bg-[#161a23] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteCard(activeCardModal.card.id, activeCardModal.columnId)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Lead</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCardModal(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
                >
                  Concluir Edição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: FAST NEW LEAD CREATION                                          */}
      {/* ========================================================================= */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-purple-500/30 bg-[#141821] shadow-2xl overflow-hidden text-left my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#141821] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Cadastrar Nova Oportunidade / Lead</h3>
                  <p className="text-xs text-neutral-400">Preencha os dados de prospecção e encaixe de produto</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewLeadSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(92vh-140px)]">
              {/* Lead Title */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Título da Oportunidade / Nome do Lead *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadForm.title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, title: e.target.value })}
                  placeholder="Ex: Dra. Mariana — Clínica Odonto (Landing Page)"
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Product Fit */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Qual produto / serviço ele se encaixa? *
                </label>
                <select
                  value={newLeadForm.productId}
                  onChange={(e) => {
                    const sel = catalogProducts.find((p) => p.id === e.target.value);
                    if (sel) {
                      setNewLeadForm({
                        ...newLeadForm,
                        productId: sel.id,
                        dealValue: sel.basePrice,
                        billingFrequency: (sel.billingFrequency as any) || "one_time"
                      });
                    } else {
                      setNewLeadForm({
                        ...newLeadForm,
                        productId: "",
                        dealValue: "",
                        billingFrequency: "one_time"
                      });
                    }
                  }}
                  className="w-full rounded-xl bg-neutral-900 border border-cyan-500/40 px-3.5 py-2.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">Nenhum produto selecionado (definir depois)</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.basePrice)} {p.billingFrequency === "monthly" ? "(Mensal)" : "(Pontual)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Nome do Contato / Decisor
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.contactName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactName: e.target.value })}
                    placeholder="Ex: Dra. Mariana Souza"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    WhatsApp do Lead
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.contactPhone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPhone: e.target.value })}
                    placeholder="Ex: 11988887777"
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Value, Temperature & Funnel Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={newLeadForm.dealValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, dealValue: e.target.value })}
                    placeholder="Ex: 1500"
                    className="w-full rounded-xl bg-neutral-900 border border-emerald-500/30 px-3 py-2 text-xs font-mono font-bold text-emerald-300 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Temperatura
                  </label>
                  <select
                    value={newLeadForm.temperature}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, temperature: e.target.value as any })}
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="">Sem temperatura definida</option>
                    <option value="warm">🌤️ Morno (Qualificação)</option>
                    <option value="hot">🔥 Quente (Alto Interesse)</option>
                    <option value="cold">❄️ Frio (Primeiro Contato)</option>
                    <option value="closing">🚀 Fechamento Iminente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Etapa Inicial no Funil
                  </label>
                  <select
                    value={newLeadForm.targetColumnId}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, targetColumnId: e.target.value })}
                    className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {board.columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link Existing Client */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Vincular a um Usuário / Cliente já Cadastrado (Opcional)
                </label>
                <ClientSearchCombobox
                  clients={clients}
                  selectedClientId={newLeadForm.clientId}
                  onSelectClient={(id) => {
                    const selected = clients.find((c) => c.id === id);
                    setNewLeadForm({
                      ...newLeadForm,
                      clientId: id,
                      contactName: newLeadForm.contactName || selected?.full_name || "",
                      contactEmail: newLeadForm.contactEmail || selected?.email || ""
                    });
                  }}
                  placeholder="Digite o nome ou e-mail..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Observações / Briefing Inicial
                </label>
                <textarea
                  rows={2}
                  value={newLeadForm.description}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, description: e.target.value })}
                  placeholder="Informações adicionais sobre o projeto ou contato..."
                  className="w-full rounded-xl bg-neutral-900 border border-white/10 p-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanModule;
