"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Filter,
  Eye,
  Download,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Layers,
  FileCheck2,
  FolderKanban,
} from "lucide-react";
import { ProjectDocument, Project, DocumentCategory, DocumentVisibility, getDocumentCategoryInfo, formatFileSize } from "@/app/admin/page";

interface DocumentsModuleProps {
  documents: Record<string, ProjectDocument[]>;
  projects: Project[];
  onOpenDocModal: (projectId: string, doc?: ProjectDocument) => void;
  onOpenDocGenerator: (projectId?: string) => void;
  onOpenPdfViewer: (doc: ProjectDocument) => void;
  onDeleteDocument: (projectId: string, docId: string) => void;
}

export function DocumentsModule({
  documents,
  projects,
  onOpenDocModal,
  onOpenDocGenerator,
  onOpenPdfViewer,
  onDeleteDocument,
}: DocumentsModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const allDocs: (ProjectDocument & { project?: Project })[] = Object.entries(documents).flatMap(
    ([projId, list]) => {
      const proj = projects.find((p) => p.id === projId);
      return list.map((doc) => ({ ...doc, project: proj }));
    }
  );

  // KPIs
  const totalCount = allDocs.length;
  const contractsCount = allDocs.filter((d) => d.category === "contrato").length;
  const proposalsCount = allDocs.filter((d) => d.category === "proposta").length;
  const acceptancesCount = allDocs.filter((d) => d.category === "termo_aceite").length;
  const clientVisibleCount = allDocs.filter((d) => d.visibility === "client").length;

  const filteredDocs = allDocs.filter((doc) => {
    const proj = doc.project;
    const matchSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (proj?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchVisibility = visibilityFilter === "all" || doc.visibility === visibilityFilter;
    const matchProject = projectFilter === "all" || doc.project_id === projectFilter;

    return matchSearch && matchCategory && matchVisibility && matchProject;
  });

  const handleDownload = (doc: ProjectDocument) => {
    if (doc.file_url && doc.file_url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = doc.file_url;
      link.download = doc.filename || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const sample = `%PDF-1.4\n1 0 obj\n<< /Title (${doc.title}) /Author (Maira Reis) >>\nendobj\n%%EOF`;
      const blob = new Blob([sample], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/80 border border-blue-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
            <FileText size={14} className="text-blue-400" />
            <span>Central de Arquivos & Contratos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Documentos & Contratos 📑
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
            Gerencie propostas, termos de aceite, NDAs e contratos vinculados aos seus projetos. Gere novos documentos oficiais em PDF com 1 clique.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenDocGenerator(projects[0]?.id)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles size={15} />
            <span>Gerador Rápido de PDFs</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDocModal(projects[0]?.id || "")}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>Upload PDF / Link</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Arquivos</span>
            <FileText size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{clientVisibleCount} visíveis aos clientes</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase">Contratos Principais</span>
            <FileCheck2 size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-300 mt-2">{contractsCount}</p>
          <p className="text-[11px] text-purple-400/70 mt-0.5">Formalizações ativas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Termos de Aceite</span>
            <Globe size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300 mt-2">{acceptancesCount}</p>
          <p className="text-[11px] text-emerald-400/70 mt-0.5">Homologações formais</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 bg-blue-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase">Propostas & NDAs</span>
            <Layers size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-300 mt-2">{proposalsCount}</p>
          <p className="text-[11px] text-blue-400/70 mt-0.5">Acordos preliminares</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documento por título, arquivo, projeto ou notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Todas as Categorias</option>
          <option value="contrato">Contrato Principal</option>
          <option value="proposta">Proposta Comercial</option>
          <option value="termo_aceite">Termo de Aceite</option>
          <option value="briefing">Briefing Técnico</option>
          <option value="nda">Acordo NDA</option>
          <option value="recibo">Recibo Fiscal</option>
        </select>

        {/* Visibility Filter */}
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Todas as Visibilidades</option>
          <option value="client">Visível no Portal do Cliente</option>
          <option value="internal">Apenas Interno (Admin)</option>
        </select>

        {/* Project Filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Todos os Projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
          <FileText size={40} className="text-gray-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Nenhum documento encontrado.</p>
          <p className="text-xs text-gray-500">
            Adicione contratos em PDF ou gere termos oficiais para os projetos dos seus clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const catInfo = getDocumentCategoryInfo(doc.category);
            const isClientVisible = doc.visibility === "client";
            const proj = doc.project;

            return (
              <div
                key={doc.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-4 shadow-lg group hover:bg-slate-900/95"
              >
                <div>
                  {/* Top Bar: Category Badge & Visibility */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${catInfo.badgeClass}`}>
                      {catInfo.label}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                        isClientVisible
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      }`}
                    >
                      {isClientVisible ? <Globe size={10} /> : <Lock size={10} />}
                      <span>{isClientVisible ? "Cliente" : "Interno"}</span>
                    </span>
                  </div>

                  {/* Project Tag & Title */}
                  <span className="text-[11px] text-indigo-400 font-bold block mb-1">
                    📁 {proj?.title || "Projeto"}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {doc.title}
                  </h4>

                  {/* File meta */}
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-2">
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>•</span>
                    <span className="truncate">{doc.filename}</span>
                  </p>

                  {/* Notes */}
                  {doc.notes && (
                    <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-white/5 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Footer Toolbar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPdfViewer(doc)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Visualizar PDF"
                    >
                      <Eye size={12} />
                      <span>Visualizar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                      title="Baixar Arquivo"
                    >
                      <Download size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDocModal(doc.project_id, doc)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                      title="Editar Metadados"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.project_id, doc.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Excluir Documento"
                    >
                      <Trash2 size={13} />
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
}
