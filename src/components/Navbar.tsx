import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Eye,
  Code2,
  Rocket,
  Download,
  Zap,
  ShieldAlert,
  User,
  PlusCircle,
  Crown,
  BookOpen,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'chat' | 'preview';
  previewSubTab: 'web' | 'code' | 'publish' | 'download';
  setActiveTab: (tab: 'chat' | 'preview') => void;
  setPreviewSubTab: (subTab: 'web' | 'code' | 'publish' | 'download') => void;
  onOpenRecharge: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenGuide: () => void;
  onNewProject: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  previewSubTab,
  setActiveTab,
  setPreviewSubTab,
  onOpenRecharge,
  onOpenAdmin,
  onOpenAuth,
  onOpenGuide,
  onNewProject,
  onToggleSidebar,
}) => {
  const isAdmin = user.email === 'horlandobe@gmail.com' || user.email === 'eventuelleboutique@gmail.com';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="Menu Sidebar"
          >
            <span className="text-xl">☰</span>
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  DEVWEB<span className="text-indigo-400">IA</span>
                </span>
                {user.plan === 'pro' ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-black uppercase text-slate-950 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                    FREE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Options Required */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* a. Crédit WEB IA */}
          <button
            onClick={onOpenRecharge}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
              user.credits > 3
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/90 hover:border-indigo-400'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
            }`}
            title="Clikeo mba hividianana crédit"
          >
            <Zap className={`w-4 h-4 ${user.credits <= 3 ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className="hidden xs:inline">Crédit WEB IA :</span>
            <span className="font-extrabold text-white bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              {user.credits}
            </span>
          </button>

          {/* b. Chat Button */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* c. Preview Button */}
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* d. Publish Button in Navbar header */}
          <button
            onClick={() => {
              setActiveTab('preview');
              setPreviewSubTab('publish');
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all shadow-md shadow-indigo-600/20"
            title="Publier sur Vercel"
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span className="hidden xs:inline">Publish</span>
          </button>
        </div>

        {/* Right Action Icons & Admin Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs font-bold transition-all shadow-md"
            title="Guide & Toromarika IA"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Guide IA</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all"
              title="Espace Administration (horlandobe@gmail.com)"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Gestion Admin</span>
            </button>
          )}

          <button
            onClick={onNewProject}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            title="Nouveau Projet"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span>Projet Vaovao</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={user.email}
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-navigation bar when Preview tab is active */}
      {activeTab === 'preview' && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setPreviewSubTab('web')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                previewSubTab === 'web'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              👉 Vu site web
            </button>

            <button
              onClick={() => setPreviewSubTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                previewSubTab === 'code'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              👉 Vu code
            </button>

            <button
              onClick={() => setPreviewSubTab('publish')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                previewSubTab === 'publish'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              👉 Publish
            </button>

            <button
              onClick={() => setPreviewSubTab('download')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                previewSubTab === 'download'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              👉 Télécharger (ZIP)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
