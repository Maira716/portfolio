import fs from "fs";
import path from "path";

export interface StoredClient {
  id: string;
  email: string;
  full_name: string;
  password?: string;
  phone?: string | null;
  company?: string | null;
  status: "active" | "blocked";
  role: "client" | "admin";
  created_at: string;
}

export interface StoredProject {
  id: string;
  client_id: string;
  client_email?: string;
  client_name?: string;
  title: string;
  description: string | null;
  status: "planejamento" | "design" | "desenvolvimento" | "testes" | "concluido" | "pausado";
  progress: number;
  start_date: string | null;
  deadline: string | null;
  preview_url: string | null;
  figma_url: string | null;
  repo_url: string | null;
  category: string | null;
  next_update_at?: string | null;
  countdown_released?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StoredUpdate {
  id: string;
  project_id: string;
  title: string;
  content: string;
  category: "update" | "meeting" | "milestone" | "launch" | "alert" | "version";
  version_tag?: string | null;
  meeting_attendees?: string | null;
  created_at: string;
}

export interface StoredNotification {
  id: string;
  client_id?: string;
  client_email?: string;
  project_id: string;
  project_title: string;
  title: string;
  message: string;
  type: "update" | "progress" | "document" | "finance" | "milestone";
  read: boolean;
  created_at: string;
}

export type StoredPaymentMethod = "pix" | "boleto" | "cartao" | "ted" | "link";

export interface StoredProjectInstallment {
  id: string;
  project_id: string;
  installment_number: number;
  title: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method?: StoredPaymentMethod;
  receipt_url?: string | null;
  notes?: string | null;
}

export interface StoredProjectFinancialData {
  project_id: string;
  total_contract_value: number;
  notes?: string | null;
  installments: StoredProjectInstallment[];
}

export interface StoredProjectDocument {
  id: string;
  project_id: string;
  title: string;
  filename: string;
  category: "contrato" | "proposta" | "termo_aceite" | "briefing" | "nda" | "recibo" | "laudo" | "outro";
  visibility: "client" | "internal";
  file_url: string;
  file_size_bytes: number;
  file_size_formatted?: string;
  mime_type?: string;
  uploaded_at: string;
  notes?: string | null;
}

export interface StoredProposalOption {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  price: number;
  billingFrequency: "one_time" | "monthly" | "quarterly" | "yearly" | "hourly";
  timelineWeeks?: string;
  paymentTerms?: string;
  warrantyDays?: number;
  badge?: string;
  isRecommended?: boolean;
  scopeItems: string[];
}

export interface StoredCommercialProposal {
  id: string;
  docNumber: string;
  title: string;
  templateType?: "software_dev" | "partnership_recurring";
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  projectId?: string;
  projectTitle: string;
  category: string;
  billingFrequency: "one_time" | "monthly" | "quarterly" | "yearly" | "hourly";
  scopeItems: string[];
  timelineWeeks: string;
  totalValue: number;
  paymentTerms: string;
  validityDays: number;
  warrantyDays: number;
  notes?: string;
  status: "draft" | "sent" | "in_negotiation" | "approved" | "rejected";
  options?: StoredProposalOption[];
  createdAt: string;
}

export interface StoredMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  order_index?: number;
  completed: boolean;
  completed_at?: string | null;
  stage?: string | null;
  progress?: number;
  tasks?: { id: string; text: string; completed: boolean }[];
}

export interface StoredQuickLink {
  id: string;
  project_id: string;
  label: string;
  url: string;
  category: "figma" | "staging" | "docs" | "github" | "api" | "production" | "video" | "outro";
  description?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface StoredIssuerSettings {
  companyName: string;
  tradingName: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  roleTitle: string;
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random";
  pixKey: string;
  pixBeneficiary: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
}

export interface PortalData {
  clients: StoredClient[];
  projects: StoredProject[];
  updates: Record<string, StoredUpdate[]>;
  notifications: StoredNotification[];
  finances?: Record<string, StoredProjectFinancialData>;
  documents?: Record<string, StoredProjectDocument[]>;
  proposals?: StoredCommercialProposal[];
  milestones?: Record<string, StoredMilestone[]>;
  quickLinks?: Record<string, StoredQuickLink[]>;
  issuerSettings?: StoredIssuerSettings;
}

let memoryCache: PortalData | null = null;

function getDataFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "portal-data.json");
  }
  return path.join(process.cwd(), "src", "data", "portal-data.json");
}

const DEFAULT_DATA: PortalData = {
  clients: [
    {
      id: "client-gabriel-01",
      email: "gabrielmonteiropersonalswim@gmail.com",
      full_name: "Gabriel",
      password: "Cliente@123",
      phone: null,
      company: null,
      status: "active",
      role: "client",
      created_at: new Date().toISOString(),
    },
    {
      id: "client-danilo-01",
      email: "danilobuess@hotmail.com",
      full_name: "Danilo Buess",
      password: "Cliente@123",
      phone: "16974007791",
      company: "Nasser SA",
      status: "active",
      role: "client",
      created_at: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "a892a989-cfd0-40cd-a0e7-22a2ade6d016",
      client_id: "client-gabriel-01",
      client_email: "gabrielmonteiropersonalswim@gmail.com",
      client_name: "Gabriel",
      title: "AVANTT",
      description: "Desenvolvimento de aplicativo mobile sob medida e sistema de gestão",
      status: "desenvolvimento",
      progress: 35,
      start_date: "2026-09-13",
      deadline: "2027-09-20",
      preview_url: null,
      figma_url: null,
      repo_url: null,
      category: "SAAS / PAINEL",
      created_at: "2026-09-13T20:30:01.000Z",
      updated_at: "2026-10-03T15:00:00.000Z",
    },
  ],
  updates: {},
  milestones: {},
  quickLinks: {},
  notifications: [],
  finances: {},
  documents: {},
  proposals: [],
};

function ensureDirectoryExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    // Ignore directory creation error in read-only environments
  }
}

export function readPortalData(): PortalData {
  const filePath = getDataFilePath();
  try {
    ensureDirectoryExists(filePath);
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
      } catch {}
      memoryCache = JSON.parse(JSON.stringify(DEFAULT_DATA));
      return memoryCache!;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    
    if (!parsed.clients || !Array.isArray(parsed.clients)) parsed.clients = DEFAULT_DATA.clients;
    if (!parsed.projects || !Array.isArray(parsed.projects)) parsed.projects = DEFAULT_DATA.projects;
    if (!parsed.updates || typeof parsed.updates !== "object") parsed.updates = {};
    if (!parsed.notifications || !Array.isArray(parsed.notifications)) parsed.notifications = [];
    if (!parsed.finances || typeof parsed.finances !== "object") parsed.finances = {};
    if (!parsed.documents || typeof parsed.documents !== "object") parsed.documents = {};
    if (!parsed.proposals || !Array.isArray(parsed.proposals)) parsed.proposals = [];
    if (!parsed.milestones || typeof parsed.milestones !== "object") parsed.milestones = {};
    if (!parsed.quickLinks || typeof parsed.quickLinks !== "object") parsed.quickLinks = {};

    // Ensure registered clients are present
    for (const defClient of DEFAULT_DATA.clients) {
      if (!parsed.clients.some((c: any) => c.email?.toLowerCase() === defClient.email.toLowerCase())) {
        parsed.clients.push(defClient);
      }
    }

    // Ensure authentic project is present
    for (const defProj of DEFAULT_DATA.projects) {
      if (!parsed.projects.some((p: any) => p.id === defProj.id || p.title === defProj.title)) {
        parsed.projects.push(defProj);
      }
    }

    // Deduplicate projects strictly by title + client
    const uniqueProjects: StoredProject[] = [];
    const seenProj = new Set<string>();
    for (const p of parsed.projects) {
      const key = `${(p.title || "").trim().toLowerCase()}`;
      if (!seenProj.has(key)) {
        seenProj.add(key);
        uniqueProjects.push(p);
      }
    }
    parsed.projects = uniqueProjects;

    memoryCache = parsed;
    return parsed;
  } catch (err) {
    console.error("Error reading portal-data.json, using in-memory store:", err);
    memoryCache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return memoryCache!;
  }
}

export function writePortalData(data: PortalData): void {
  memoryCache = data;
  const filePath = getDataFilePath();
  try {
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    // In serverless read-only environments, memoryCache guarantees data is kept in-memory
  }
}

export function getClientByEmail(email: string): StoredClient | undefined {
  const data = readPortalData();
  const clean = (email || "").trim().toLowerCase();
  return data.clients.find((c) => c.email.toLowerCase() === clean);
}

export function saveClient(client: Partial<StoredClient> & { email: string; full_name?: string }): StoredClient {
  const data = readPortalData();
  const cleanEmail = client.email.trim().toLowerCase();
  const existingIdx = data.clients.findIndex((c) => c.email.toLowerCase() === cleanEmail || (client.id && c.id === client.id));

  const fallbackName = cleanEmail.split("@")[0];
  const formattedFallback = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  const existingPassword = existingIdx >= 0 ? data.clients[existingIdx].password : undefined;
  const clientToSave: StoredClient = {
    id: client.id || (existingIdx >= 0 ? data.clients[existingIdx].id : `client-${Date.now()}`),
    email: cleanEmail,
    full_name: (client.full_name || (existingIdx >= 0 ? data.clients[existingIdx].full_name : formattedFallback) || formattedFallback).trim(),
    password: client.password || existingPassword || undefined,
    phone: client.phone !== undefined ? client.phone : (existingIdx >= 0 ? data.clients[existingIdx].phone : null),
    company: client.company !== undefined ? client.company : (existingIdx >= 0 ? data.clients[existingIdx].company : null),
    status: client.status || (existingIdx >= 0 ? data.clients[existingIdx].status : "active") || "active",
    role: client.role || (existingIdx >= 0 ? data.clients[existingIdx].role : "client") || "client",
    created_at: existingIdx >= 0 ? data.clients[existingIdx].created_at : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    data.clients[existingIdx] = clientToSave;
  } else {
    data.clients.unshift(clientToSave);
  }

  writePortalData(data);
  return clientToSave;
}

export function deleteClient(clientIdOrEmail: string): boolean {
  const data = readPortalData();
  const clean = clientIdOrEmail.trim().toLowerCase();
  const initialLength = data.clients.length;
  data.clients = data.clients.filter((c) => c.id !== clientIdOrEmail && c.email.toLowerCase() !== clean);
  if (data.clients.length !== initialLength) {
    writePortalData(data);
    return true;
  }
  return false;
}

export function getProjectsForClient(clientId: string, clientEmail?: string): StoredProject[] {
  const data = readPortalData();
  const cleanEmail = (clientEmail || "").trim().toLowerCase();
  const cleanClientId = (clientId || "").trim().toLowerCase();

  const matchedClient = data.clients.find(
    (c) =>
      (clientId && c.id === clientId) ||
      (cleanClientId && c.id?.toLowerCase() === cleanClientId) ||
      (cleanEmail && c.email?.toLowerCase() === cleanEmail)
  );

  return data.projects.filter((p) => {
    if (clientId && p.client_id === clientId) return true;
    if (cleanClientId && p.client_id?.toLowerCase() === cleanClientId) return true;
    if (cleanEmail && p.client_email?.toLowerCase() === cleanEmail) return true;
    if (cleanEmail && p.client_id?.toLowerCase() === cleanEmail) return true;
    if (matchedClient) {
      if (p.client_id === matchedClient.id) return true;
      if (p.client_email?.toLowerCase() === matchedClient.email?.toLowerCase()) return true;
      if ((p as any).client_name && matchedClient.full_name && (p as any).client_name.toLowerCase() === matchedClient.full_name.toLowerCase()) return true;
    }
    return false;
  });
}

export function saveProject(proj: Partial<StoredProject> & { title: string; client_id: string }): StoredProject {
  const data = readPortalData();
  const existingIdx = data.projects.findIndex((p) => (proj.id && p.id === proj.id) || (p.title === proj.title && p.client_id === proj.client_id));

  // Find linked client to attach email and name if available
  const matchedClient = data.clients.find(
    (c) =>
      c.id === proj.client_id ||
      (c.email && c.email.toLowerCase() === proj.client_id.toLowerCase()) ||
      (proj.client_email && c.email.toLowerCase() === proj.client_email.toLowerCase())
  );

  const clientEmail = proj.client_email || matchedClient?.email || (proj.client_id.includes("@") ? proj.client_id : (existingIdx >= 0 ? data.projects[existingIdx].client_email : undefined));
  const clientName = (proj as any).client_name || matchedClient?.full_name || (existingIdx >= 0 ? (data.projects[existingIdx] as any).client_name : undefined);

  const projectToSave: StoredProject & { client_name?: string } = {
    id: proj.id || (existingIdx >= 0 ? data.projects[existingIdx].id : `proj-${Date.now()}`),
    client_id: proj.client_id,
    client_email: clientEmail,
    client_name: clientName,
    title: proj.title.trim(),
    description: proj.description !== undefined ? proj.description : (existingIdx >= 0 ? data.projects[existingIdx].description : null),
    status: proj.status || (existingIdx >= 0 ? data.projects[existingIdx].status : "planejamento"),
    progress: proj.progress !== undefined ? Number(proj.progress) : (existingIdx >= 0 ? data.projects[existingIdx].progress : 0),
    start_date: proj.start_date !== undefined ? proj.start_date : (existingIdx >= 0 ? data.projects[existingIdx].start_date : null),
    deadline: proj.deadline !== undefined ? proj.deadline : (existingIdx >= 0 ? data.projects[existingIdx].deadline : null),
    preview_url: proj.preview_url !== undefined ? proj.preview_url : (existingIdx >= 0 ? data.projects[existingIdx].preview_url : null),
    figma_url: proj.figma_url !== undefined ? proj.figma_url : (existingIdx >= 0 ? data.projects[existingIdx].figma_url : null),
    repo_url: proj.repo_url !== undefined ? proj.repo_url : (existingIdx >= 0 ? data.projects[existingIdx].repo_url : null),
    category: proj.category !== undefined ? proj.category : (existingIdx >= 0 ? data.projects[existingIdx].category : "Mobile App (React Native)"),
    next_update_at: proj.next_update_at !== undefined ? proj.next_update_at : (existingIdx >= 0 ? data.projects[existingIdx].next_update_at || null : null),
    countdown_released: proj.countdown_released !== undefined ? Boolean(proj.countdown_released) : (existingIdx >= 0 ? Boolean(data.projects[existingIdx].countdown_released) : false),
    created_at: existingIdx >= 0 ? data.projects[existingIdx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    data.projects[existingIdx] = projectToSave;
  } else {
    data.projects.unshift(projectToSave);
  }

  writePortalData(data);
  return projectToSave;
}

export function deleteProject(projectId: string): boolean {
  const data = readPortalData();
  const initialLength = data.projects.length;
  data.projects = data.projects.filter((p) => p.id !== projectId);
  if (data.projects.length !== initialLength) {
    if (data.updates[projectId]) {
      delete data.updates[projectId];
    }
    writePortalData(data);
    return true;
  }
  return false;
}

export function getUpdatesForProject(projectId: string): StoredUpdate[] {
  const data = readPortalData();
  return data.updates[projectId] || [];
}

export function saveUpdateForProject(projectId: string, update: StoredUpdate): StoredUpdate[] {
  const data = readPortalData();
  const current = data.updates[projectId] || [];
  const existingIdx = current.findIndex((u) => u.id === update.id);
  
  if (existingIdx >= 0) {
    current[existingIdx] = update;
  } else {
    current.unshift(update);
  }
  
  data.updates[projectId] = current;

  const proj = data.projects.find((p) => p.id === projectId);
  const notif: StoredNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    project_id: projectId,
    project_title: proj?.title || "Projeto",
    client_id: proj?.client_id,
    client_email: proj?.client_email,
    title: `📌 Nova atualização: ${update.title}`,
    message: update.content.slice(0, 160) + (update.content.length > 160 ? "..." : ""),
    type: "update",
    read: false,
    created_at: new Date().toISOString(),
  };
  data.notifications.unshift(notif);

  writePortalData(data);
  return current;
}

export function getNotificationsForClient(clientId?: string, clientEmail?: string): StoredNotification[] {
  const data = readPortalData();
  const cleanEmail = (clientEmail || "").trim().toLowerCase();
  return data.notifications.filter(
    (n) =>
      !clientId ||
      n.client_id === clientId ||
      (cleanEmail && n.client_email?.toLowerCase() === cleanEmail) ||
      !n.client_id
  );
}

export function markNotificationRead(notifId: string): void {
  const data = readPortalData();
  const notif = data.notifications.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    writePortalData(data);
  }
}

export function getFinancesForProject(projectId: string): StoredProjectFinancialData | null {
  const data = readPortalData();
  return data.finances?.[projectId] || null;
}

export function getAllFinances(): Record<string, StoredProjectFinancialData> {
  const data = readPortalData();
  return data.finances || {};
}

export function saveFinancesForProject(
  projectId: string,
  finances: StoredProjectFinancialData
): StoredProjectFinancialData {
  const data = readPortalData();
  if (!data.finances) {
    data.finances = {};
  }
  data.finances[projectId] = finances;
  writePortalData(data);
  return finances;
}

export function saveAllFinances(
  financesMap: Record<string, StoredProjectFinancialData>
): Record<string, StoredProjectFinancialData> {
  const data = readPortalData();
  data.finances = { ...(data.finances || {}), ...financesMap };
  writePortalData(data);
  return data.finances;
}

export function getDocumentsForProject(
  projectId: string,
  visibility?: "client" | "all"
): StoredProjectDocument[] {
  const data = readPortalData();
  const list = data.documents?.[projectId] || [];
  if (visibility === "client") {
    return list.filter((d) => d.visibility === "client");
  }
  return list;
}

export function getAllDocuments(): Record<string, StoredProjectDocument[]> {
  const data = readPortalData();
  return data.documents || {};
}

export function saveDocumentsForProject(
  projectId: string,
  docs: StoredProjectDocument[]
): StoredProjectDocument[] {
  const data = readPortalData();
  if (!data.documents) {
    data.documents = {};
  }
  data.documents[projectId] = docs;
  writePortalData(data);
  return docs;
}

export function saveAllDocuments(
  docsMap: Record<string, StoredProjectDocument[]>
): Record<string, StoredProjectDocument[]> {
  const data = readPortalData();
  data.documents = { ...(data.documents || {}), ...docsMap };
  writePortalData(data);
  return data.documents;
}

// Commercial Proposals Store
export function getStoredProposals(): StoredCommercialProposal[] {
  const data = readPortalData();
  return data.proposals || [];
}

export function getStoredProposalById(idOrDocNumber: string): StoredCommercialProposal | null {
  const data = readPortalData();
  const list = data.proposals || [];
  const normalized = idOrDocNumber.trim().toLowerCase();
  return (
    list.find(
      (p) =>
        p.id.toLowerCase() === normalized ||
        p.docNumber.toLowerCase() === normalized
    ) || null
  );
}

export function saveStoredProposal(proposal: StoredCommercialProposal): StoredCommercialProposal {
  const data = readPortalData();
  if (!data.proposals) {
    data.proposals = [];
  }
  const existingIdx = data.proposals.findIndex((p) => p.id === proposal.id);
  if (existingIdx >= 0) {
    data.proposals[existingIdx] = proposal;
  } else {
    data.proposals.unshift(proposal);
  }
  writePortalData(data);
  return proposal;
}

export function saveAllStoredProposals(
  proposals: StoredCommercialProposal[]
): StoredCommercialProposal[] {
  const data = readPortalData();
  data.proposals = proposals;
  writePortalData(data);
  return proposals;
}

// Project Milestones Store
export function getMilestonesForProject(projectId: string): StoredMilestone[] {
  const data = readPortalData();
  return data.milestones?.[projectId] || [];
}

export function getAllMilestones(): Record<string, StoredMilestone[]> {
  const data = readPortalData();
  return data.milestones || {};
}

export function saveMilestonesForProject(
  projectId: string,
  milestonesList: StoredMilestone[]
): StoredMilestone[] {
  const data = readPortalData();
  if (!data.milestones) {
    data.milestones = {};
  }
  data.milestones[projectId] = milestonesList;
  writePortalData(data);
  return milestonesList;
}

export function saveAllMilestones(
  milestonesMap: Record<string, StoredMilestone[]>
): Record<string, StoredMilestone[]> {
  const data = readPortalData();
  data.milestones = { ...(data.milestones || {}), ...milestonesMap };
  writePortalData(data);
  return data.milestones;
}

// Project Quick Links Store
export function getQuickLinksForProject(projectId: string): StoredQuickLink[] {
  const data = readPortalData();
  return data.quickLinks?.[projectId] || [];
}

export function getAllQuickLinks(): Record<string, StoredQuickLink[]> {
  const data = readPortalData();
  return data.quickLinks || {};
}

export function saveQuickLinksForProject(
  projectId: string,
  linksList: StoredQuickLink[]
): StoredQuickLink[] {
  const data = readPortalData();
  if (!data.quickLinks) {
    data.quickLinks = {};
  }
  data.quickLinks[projectId] = linksList;
  writePortalData(data);
  return linksList;
}

export function saveAllQuickLinks(
  linksMap: Record<string, StoredQuickLink[]>
): Record<string, StoredQuickLink[]> {
  const data = readPortalData();
  data.quickLinks = { ...(data.quickLinks || {}), ...linksMap };
  writePortalData(data);
  return data.quickLinks;
}

export const DEFAULT_ISSUER_SETTINGS: StoredIssuerSettings = {
  companyName: "Maira Reis - Desenvolvimento & UI/UX Design",
  tradingName: "Maira Reis Dev",
  documentNumber: "55.843.406/0001-28",
  email: "mairareis2017@gmail.com",
  phone: "553598030543",
  address: "Atendimento Remoto / Brasil",
  city: "Pouso Alegre",
  state: "MG",
  website: "https://mairareis.dev",
  roleTitle: "Engenheira de Software & UI/UX Designer",
  pixKeyType: "cnpj",
  pixKey: "55.843.406/0001-28",
  pixBeneficiary: "Maira Reis",
  bankName: "C6",
  bankAgency: "0001",
  bankAccount: "",
};

export function getIssuerSettings(): StoredIssuerSettings {
  const data = readPortalData();
  if (data.issuerSettings && data.issuerSettings.pixKey) {
    return { ...DEFAULT_ISSUER_SETTINGS, ...data.issuerSettings };
  }
  return DEFAULT_ISSUER_SETTINGS;
}

export function saveIssuerSettings(settings: Partial<StoredIssuerSettings>): StoredIssuerSettings {
  const data = readPortalData();
  const updated: StoredIssuerSettings = {
    ...DEFAULT_ISSUER_SETTINGS,
    ...(data.issuerSettings || {}),
    ...settings,
  };
  data.issuerSettings = updated;
  writePortalData(data);
  return updated;
}


