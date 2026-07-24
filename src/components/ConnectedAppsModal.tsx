import React, { useState } from 'react';
import { X, Github, Globe, Check, Flame, Lock, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

interface ConnectedAppsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveConnections: (updated: Partial<UserProfile>) => void;
}

export const ConnectedAppsModal: React.FC<ConnectedAppsModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveConnections,
}) => {
  const [githubToken, setGithubToken] = useState(user.githubToken || '');
  const [githubUsername, setGithubUsername] = useState(user.githubUsername || '');
  const [vercelToken, setVercelToken] = useState(user.vercelToken || '');
  
  const [firebaseProjectId, setFirebaseProjectId] = useState(
    user.firebaseProjectId || firebaseConfigData.projectId
  );
  const [firebaseApiKey, setFirebaseApiKey] = useState(
    user.firebaseApiKey || firebaseConfigData.apiKey
  );
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(
    user.firebaseAuthDomain || firebaseConfigData.authDomain
  );
  const [firebaseDatabaseId, setFirebaseDatabaseId] = useState(
    user.firebaseDatabaseId || firebaseConfigData.firestoreDatabaseId
  );
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConnections({
      githubConnected: Boolean(githubToken || githubUsername),
      githubToken,
      githubUsername,
      vercelConnected: Boolean(vercelToken),
      vercelToken,
      firebaseConnected: true,
      firebaseProjectId,
      firebaseApiKey,
      firebaseAuthDomain,
      firebaseDatabaseId,
      firebaseStorageBucket: firebaseConfigData.storageBucket,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500/20" />
          </div>
          <h2 className="text-2xl font-black text-white">Applications & Base de données</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            DEVWEBIA dia mampiasa ny <strong>FIREBASE</strong> ho base de données lehibe sy fitahirizana ny informations secrets an'i client tsirairay.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Firebase Connection Block */}
          <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-950 to-orange-950/30 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>FIREBASE Database, Auth & Storage</span>
              </div>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> Connecté Automatique
              </span>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                <span>Fitahirizana Secrets sy Aksé IA DEVWEBIA :</span>
              </div>
              <p className="leading-relaxed">
                Ny IA DEVWEBIA dia efa manana accès feno amin'ny Firebase (Firestore, Auth, Storage) mba hamoronana tranonkala amin'ny base de données mivantana.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 text-[11px] font-semibold">Firebase Project ID :</label>
              <input
                type="text"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold">API Key :</label>
                <input
                  type="password"
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold">Firestore Database ID :</label>
                <input
                  type="text"
                  value={firebaseDatabaseId}
                  onChange={(e) => setFirebaseDatabaseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* GitHub Connection */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Github className="w-5 h-5 text-slate-200" />
                <span>GitHub API Token & Username</span>
              </div>
              {user.githubConnected ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Connecté
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Non lié</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Soraty eto ny pseudo sy Token GitHub-nao :</span>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold flex items-center gap-1 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-500/30"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Maka GitHub Token eto ↗</span>
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Pseudo GitHub (ex: dev-mg)"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                placeholder="Personal Access Token (ghp_...)"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Vercel Connection */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Vercel Access Token</span>
              </div>
              {user.vercelConnected ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Connecté
                </span>
              ) : (
                <span className="text-amber-400 font-bold">Non lié</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Soraty eto ny Vercel Auth Token-nao :</span>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Maka Vercel Token eto ↗</span>
              </a>
            </div>

            <input
              type="password"
              placeholder="Vercel Auth Token (vc_...)"
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl text-center">
              ✓ Protocole sy Firebase nosoratana am-pahombiazana!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all"
          >
            Enregistrer les Connexions & Firebase
          </button>
        </form>
      </div>
    </div>
  );
};
