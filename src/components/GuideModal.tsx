import React from 'react';
import {
  X,
  BookOpen,
  Key,
  ShieldCheck,
  Github,
  Globe,
  Flame,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectedApps: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onOpenConnectedApps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Guide & Toromarika DEVWEBIA</h2>
            <p className="text-xs text-slate-400">Toromarika feno momba ny Admin, GitHub, Vercel & 12 Modèles</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          
          {/* Guide 1: Admin Interface PIN */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Key className="w-4 h-4" />
              <span>1. Idirana amin'ny Espace Admin (admin.html) :</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              • Ny mot de passe par défaut ho an'ny admin.html rehetra dia <strong>1234</strong>.<br />
              • Azonao atao ny manindry <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">Enter</code> amina clavier-nao rehefa nampiditra 1234 mba hidirana mivantana.<br />
              • Raha te hanova mot de passe admin ianao dia mankany amin'ny section <strong>4. Sécurité</strong> ao amin'ny admin.html.
            </p>
          </div>

          {/* Guide 2: GitHub & Vercel API Keys Persistence */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Fitahirizana permanent Clé API GitHub & Vercel :</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              • Ny clés API (GitHub Token <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded">ghp_...</code> & Vercel Token <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded">vc_...</code>) dia voatahiry tanteraka amin'ny kontonao ankehitriny.<br />
              • Na manao actualiser ny pejy ianao na mikatona ny navigateur, <strong>tsy manjavona intsony</strong> ny clé API nampidirinao.<br />
              • Raha te hampiditra na hanova ny clefs-nao dia kitiho ny bouton eto ambany:
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenConnectedApps();
              }}
              className="mt-2 px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>Hampiditra / Hanova Clé API (GitHub & Vercel)</span>
            </button>
          </div>

          {/* Guide 3: 12 Modèles & 10 Options */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>3. Assistant 12 Modèles sy 10 Options completos :</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              • Ny IA DEVWEBIA dia manana <strong>12 Modèles de Sites Web</strong> (E-Commerce, Hôtel, Restaurant, Formation, Cabinet Médical, BTP, etc.).<br />
              • Isaky ny site nifidyana dia misy <strong>10 Options complets</strong> azo configurable amin'ny <em>Réponse Sélectionnée (IA)</em> na <em>Réponse Libre (Client)</em>.<br />
              • Mamorona fichiers feno 15 hatramin'ny 20 ny IA mba hisian'ny pejy rehetra sy admin feno sy matitra!
            </p>
          </div>

        </div>

        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg"
          >
            Azafady Azoko Tsara (Fermer)
          </button>
        </div>
      </div>
    </div>
  );
};
