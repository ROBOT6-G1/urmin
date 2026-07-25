import React, { useState } from 'react';
import {
  FolderKanban,
  Zap,
  Plug,
  HelpCircle,
  Headphones,
  Users,
  Globe,
  LogOut,
  Plus,
  ShieldCheck,
  Crown,
  ChevronRight,
  X,
  Search,
  Wand2,
  Eye,
  Copy,
  Trash2,
  Sparkles,
  ExternalLink,
  Rocket,
  Info,
} from 'lucide-react';
import { Project, UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile;
  projects: Project[];
  currentProjectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onOpenRecharge: () => void;
  onOpenConnectedApps: () => void;
  onOpenFaq: () => void;
  onOpenSupport: () => void;
  onOpenReferral: () => void;
  onOpenDomain: () => void;
  onOpenGoogleSeo: () => void;
  onOpenAdmin: () => void;
  onOpenAbout?: () => void;
  onLogout: () => void;
  onDuplicateProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenHistoryModal?: () => void;
  onPreviewProject?: (projectId: string) => void;
  onPublishProject?: (projectId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  projects,
  currentProjectId,
  isOpen,
  onClose,
  onSelectProject,
  onNewProject,
  onOpenRecharge,
  onOpenConnectedApps,
  onOpenFaq,
  onOpenSupport,
  onOpenReferral,
  onOpenDomain,
  onOpenGoogleSeo,
  onOpenAdmin,
  onOpenAbout,
  onLogout,
  onDuplicateProject,
  onDeleteProject,
  onOpenHistoryModal,
  onPreviewProject,
  onPublishProject,
}) => {
  const isAdmin = user.email === 'horlandobe@gmail.com';
  const [searchHistory, setSearchHistory] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 text-slate-300 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Projet Vaovao</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {/* 👉 Historique de projet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                Historique Sites ({projects.length})
              </span>
              {onOpenHistoryModal && (
                <button
                  onClick={() => {
                    onOpenHistoryModal();
                    onClose();
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md transition-colors"
                >
                  Voir Tout
                </button>
              )}
            </div>

            {/* Quick Search */}
            {projects.length > 3 && (
              <div className="relative px-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Hikaroka..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* List of projects */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === currentProjectId;
                const fileCount = proj.files ? proj.files.length : 1;

                return (
                  <div
                    key={proj.id}
                    className={`p-2 rounded-xl text-xs font-medium border transition-all flex flex-col gap-1.5 group ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div className="truncate pr-1 space-y-0.5">
                        <div className="font-extrabold text-slate-200 truncate flex items-center gap-1.5">
                          {isSelected && <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span className="truncate">{proj.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {fileCount} {fileCount > 1 ? 'fichiers' : 'fichier'}
                        </div>
                      </div>

                      <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Amboarina
                      </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <button
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                        title="Modifier avec IA"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Modifier IA</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {onPreviewProject && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onPreviewProject(proj.id);
                                onClose();
                              }}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                              title="Aperçu Preview"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            {onPublishProject && (
                              <button
                                onClick={() => {
                                  onPublishProject(proj.id);
                                  onClose();
                                }}
                                className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800"
                                title="Publier sur Vercel"
                              >
                                <Rocket className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                        {onDuplicateProject && (
                          <button
                            onClick={() => onDuplicateProject(proj.id)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            title="Dupliquer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                        {onDeleteProject && projects.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Tena tianao hofafana ve ny site "${proj.title}"?`)) {
                                onDeleteProject(proj.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                            title="Fafana"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Sidebar Actions Required */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Fitaovana & Option
            </div>

            {/* 👉 Bouton recharge */}
            <button
              onClick={() => {
                onOpenRecharge();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Bouton Recharge Crédit</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                Mividy
              </span>
            </button>

            {/* 👉 Application connectée */}
            <button
              onClick={() => {
                onOpenConnectedApps();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Plug className="w-4 h-4" />
                </div>
                <span>Applications Connectées</span>
              </div>
              <div className="flex items-center gap-1">
                {user.githubConnected && <span className="w-2 h-2 rounded-full bg-emerald-400" title="GitHub" />}
                {user.vercelConnected && <span className="w-2 h-2 rounded-full bg-cyan-400" title="Vercel" />}
                {user.firebaseConnected && <span className="w-2 h-2 rounded-full bg-amber-500" title="Firebase DB" />}
              </div>
            </button>

            {/* 👉 FAQ */}
            <button
              onClick={() => {
                onOpenFaq();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span>FAQ / Fanontaniana</span>
            </button>

            {/* 👉 Service client */}
            <button
              onClick={() => {
                onOpenSupport();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Headphones className="w-4 h-4" />
              </div>
              <span>Service Client Support</span>
            </button>

            {/* 👉 Parrainage */}
            <button
              onClick={() => {
                onOpenReferral();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                  <Users className="w-4 h-4" />
                </div>
                <span>Parrainage (+5 Crédits)</span>
              </div>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full">
                Bonus
              </span>
            </button>

            {/* 👉 Connecter à une domaine */}
            <button
              onClick={() => {
                onOpenDomain();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Globe className="w-4 h-4" />
              </div>
              <span>Domaine Personnalisé</span>
            </button>

            {/* 👉 SEO Google */}
            <button
              onClick={() => {
                onOpenGoogleSeo();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Search className="w-4 h-4" />
                </div>
                <span>SEO Google</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                Vercel
              </span>
            </button>

            {/* 👉 Apropos de nous */}
            <button
              onClick={() => {
                if (onOpenAbout) onOpenAbout();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Info className="w-4 h-4" />
              </div>
              <span>Apropos de nous</span>
            </button>

            {/* Admin Management if admin email */}
            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Gestion Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          {/* Plan overview card */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Offre Actuelle</div>
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                {user.plan === 'pro' ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> Plan Pro (5000Ar)
                  </>
                ) : (
                  <>Plan Gratuit (1GB)</>
                )}
              </div>
            </div>
            {user.plan === 'free' && (
              <button
                onClick={() => {
                  onOpenRecharge();
                  onClose();
                }}
                className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
              >
                Passez Pro
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="truncate text-slate-400 text-[11px]" title={user.email}>
              👤 {user.email}
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-xs font-semibold p-1 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
