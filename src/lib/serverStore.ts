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

export interface PortalData {
  clients: StoredClient[];
  projects: StoredProject[];
  updates: Record<string, StoredUpdate[]>;
  notifications: StoredNotification[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "portal-data.json");

const DEFAULT_DATA: PortalData = {
  clients: [
    {
      id: "client-danilo-buess",
      email: "danilobuess@hotmail.com",
      full_name: "Danilo Buess",
      password: "Cliente@123",
      phone: "553598030543",
      company: "Buess Soluções",
      status: "active",
      role: "client",
      created_at: new Date().toISOString(),
    },
    {
      id: "admin-mairareis",
      email: "mairareis2017@gmail.com",
      full_name: "Maira Reis",
      status: "active",
      role: "admin",
      created_at: new Date().toISOString(),
    },
  ],
  projects: [],
  updates: {},
  notifications: [],
};

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readPortalData(): PortalData {
  try {
    ensureDirectoryExists(DATA_FILE_PATH);
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    
    if (!parsed.clients || !Array.isArray(parsed.clients)) parsed.clients = DEFAULT_DATA.clients;
    if (!parsed.projects || !Array.isArray(parsed.projects)) parsed.projects = [];
    if (!parsed.updates || typeof parsed.updates !== "object") parsed.updates = {};
    if (!parsed.notifications || !Array.isArray(parsed.notifications)) parsed.notifications = [];

    const hasDanilo = parsed.clients.some((c: StoredClient) => c.email?.toLowerCase() === "danilobuess@hotmail.com");
    if (!hasDanilo) {
      parsed.clients.unshift(DEFAULT_DATA.clients[0]);
    }

    return parsed;
  } catch (err) {
    console.error("Error reading portal-data.json:", err);
    return DEFAULT_DATA;
  }
}

export function writePortalData(data: PortalData): void {
  try {
    ensureDirectoryExists(DATA_FILE_PATH);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing portal-data.json:", err);
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

  const clientToSave: StoredClient = {
    id: client.id || (existingIdx >= 0 ? data.clients[existingIdx].id : `client-${Date.now()}`),
    email: cleanEmail,
    full_name: (client.full_name || (existingIdx >= 0 ? data.clients[existingIdx].full_name : formattedFallback) || formattedFallback).trim(),
    password: client.password || (existingIdx >= 0 ? data.clients[existingIdx].password : "Cliente@123") || "Cliente@123",
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
  return data.projects.filter(
    (p) =>
      p.client_id === clientId ||
      (cleanEmail && p.client_email?.toLowerCase() === cleanEmail) ||
      (cleanEmail && p.client_id === cleanEmail)
  );
}

export function saveProject(proj: Partial<StoredProject> & { title: string; client_id: string }): StoredProject {
  const data = readPortalData();
  const existingIdx = data.projects.findIndex((p) => (proj.id && p.id === proj.id) || (p.title === proj.title && p.client_id === proj.client_id));

  const projectToSave: StoredProject = {
    id: proj.id || (existingIdx >= 0 ? data.projects[existingIdx].id : `proj-${Date.now()}`),
    client_id: proj.client_id,
    client_email: proj.client_email || (existingIdx >= 0 ? data.projects[existingIdx].client_email : undefined),
    title: proj.title.trim(),
    description: proj.description !== undefined ? proj.description : (existingIdx >= 0 ? data.projects[existingIdx].description : null),
    status: proj.status || (existingIdx >= 0 ? data.projects[existingIdx].status : "planejamento"),
    progress: proj.progress !== undefined ? proj.progress : (existingIdx >= 0 ? data.projects[existingIdx].progress : 0),
    start_date: proj.start_date !== undefined ? proj.start_date : (existingIdx >= 0 ? data.projects[existingIdx].start_date : null),
    deadline: proj.deadline !== undefined ? proj.deadline : (existingIdx >= 0 ? data.projects[existingIdx].deadline : null),
    preview_url: proj.preview_url !== undefined ? proj.preview_url : (existingIdx >= 0 ? data.projects[existingIdx].preview_url : null),
    figma_url: proj.figma_url !== undefined ? proj.figma_url : (existingIdx >= 0 ? data.projects[existingIdx].figma_url : null),
    repo_url: proj.repo_url !== undefined ? proj.repo_url : (existingIdx >= 0 ? data.projects[existingIdx].repo_url : null),
    category: proj.category !== undefined ? proj.category : (existingIdx >= 0 ? data.projects[existingIdx].category : "Web App"),
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
