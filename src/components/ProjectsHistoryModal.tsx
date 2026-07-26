import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Sparkles,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  FileCode,
  Check,
  Plus,
  Search,
  Wand2,
  Lock,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onModifyWithAI: (projectId: string) => void;
  onPreviewProject: (projectId: string) => void;
}

export const ProjectsHistoryModal: React.FC<ProjectsHistoryModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onModifyWithAI,
  onPreviewProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startRename = (proj: Project) => {
    setEditingId(proj.id);
    setEditTitle(proj.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameProject(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-lg shadow-indigo-600/10">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Historique sy Liste an'ireo Sites Vita ({projects.length})
              </h2>
              <p className="text-xs text-slate-400">
                Safidio ny site tianao hojerevana, amboarina, na modifiena amin'i DEVWEB IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Hikaroka amin'ny anaran'ny site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Mamorona Projet Vaovao</span>
          </button>
        </div>

        {/* Projects Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-[250px]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <FolderKanban className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Tsy nisy site hita tamin'ny fikarohana</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                const isActive = proj.id === currentProjectId;
                const fileCount = proj.files ? proj.files.length : 1;
                const formattedDate = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={proj.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative group ${
                      isActive
                        ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Top Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        {editingId === proj.id ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white w-full focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(proj.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => saveRename(proj.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-white line-clamp-1">
                                {proj.title}
                              </h3>
                              {isActive && (
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                  <Sparkles className="w-3 h-3 text-amber-400" /> Actif
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {proj.description || 'Tranonkala namboarina tamin\'i DEVWEB IA'}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startRename(proj)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hanova Anarana"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateProject(proj.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Dupliquer (Kopiapo)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {deletingId === proj.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onDeleteProject(proj.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors"
                                title="Hamafiso ny fafana"
                              >
                                <Check className="w-3 h-3" />
                                <span>Fafana</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setDeletingId(null);
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Ajanona"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setDeletingId(proj.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Fafana ny site"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          <FileCode className="w-3 h-3 text-indigo-400" />
                          <strong>{fileCount}</strong> {fileCount > 1 ? 'fichiers' : 'fichier'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onModifyWithAI(proj.id);
                          onClose();
                        }}
                        className="flex-1 py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Modifier avec l'IA</span>
                      </button>

                      <button
                        onClick={() => {
                          onPreviewProject(proj.id);
                          onClose();
                        }}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                        title="Jereo Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Akatona (Fermer)
          </button>
        </div>
      </div>
    </div>
  );
};
