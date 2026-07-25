import React, { useState, useEffect } from 'react';
import { X, Github, Globe, Check, Flame, Lock, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  
  const [firebaseProjectId, setFirebaseProjectId] = useState(user.firebaseProjectId || '');
  const [firebaseApiKey, setFirebaseApiKey] = useState(user.firebaseApiKey || '');
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(user.firebaseAuthDomain || '');
  const [firebaseDatabaseId, setFirebaseDatabaseId] = useState(user.firebaseDatabaseId || '');
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [firebaseProjects, setFirebaseProjects] = useState<any[]>([]);
  const [isFetchingFirebase, setIsFetchingFirebase] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGithubToken(user.githubToken || '');
      setGithubUsername(user.githubUsername || '');
      setVercelToken(user.vercelToken || '');
      setFirebaseProjectId(user.firebaseProjectId || '');
      setFirebaseApiKey(user.firebaseApiKey || '');
      setFirebaseAuthDomain(user.firebaseAuthDomain || '');
      setFirebaseDatabaseId(user.firebaseDatabaseId || '');
      setSavedSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleConnectFirebaseGoogle = async () => {
    setIsFetchingFirebase(true);
    setFirebaseError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/cloud-platform');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        setFirebaseError('Tsy nahazo token avy amin\'ny Google.');
        return;
      }
      
      const res = await fetch('https://firebase.googleapis.com/v1beta1/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        setFirebaseProjects(data.results.map((p: any) => ({ ...p, accessToken: token })));
      } else {
        setFirebaseError('Tsy manana projet Firebase ianao amin\'io compte Google io.');
      }
    } catch (err: any) {
      console.error(err);
      setFirebaseError(err.message || 'Nisy olana nandritra ny fidirana amin\'ny Google.');
    } finally {
      setIsFetchingFirebase(false);
    }
  };

  const handleSelectFirebaseProject = async (project: any) => {
    setIsFetchingFirebase(true);
    setFirebaseError('');
    try {
      const token = project.accessToken;
      
      const appsRes = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${project.projectId}/webApps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      
      let appId = appsData.apps?.[0]?.appId;
      
      if (!appId) {
         setFirebaseError(`Tsy misy Web App ao amin'ny projet ${project.projectId}. Mamorona iray ao amin'ny Firebase Console aloha.`);
         setIsFetchingFirebase(false);
         return;
      }
      
      const configRes = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${project.projectId}/webApps/${appId}/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const configData = await configRes.json();
      
      setFirebaseProjectId(configData.projectId || project.projectId);
      setFirebaseApiKey(configData.apiKey);
      setFirebaseAuthDomain(configData.authDomain || `${project.projectId}.firebaseapp.com`);
      setFirebaseDatabaseId('(default)');
      setFirebaseProjects([]);
      setFirebaseError('');
    } catch (err: any) {
      console.error(err);
      setFirebaseError('Nisy olana rehefa naka configuration: ' + err.message);
    } finally {
      setIsFetchingFirebase(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConnections({
      githubConnected: Boolean(githubToken || githubUsername),
      githubToken,
      githubUsername,
      vercelConnected: Boolean(vercelToken),
      vercelToken,
      firebaseConnected: Boolean(firebaseProjectId && firebaseApiKey),
      firebaseProjectId,
      firebaseApiKey,
      firebaseAuthDomain,
      firebaseDatabaseId,
      firebaseStorageBucket: '',
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
          <h2 className="text-2xl font-black text-white">Vos Propres Intégrations</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Mba hanamaivanana ny projet, azafady ampidiro eto ny <strong>Firebase, Vercel, ary GitHub</strong> anao manokana ho an'ny tetikasanao (projets générés).
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Firebase Connection Block */}
          <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-950 to-orange-950/30 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>FIREBASE Database & Auth (Manokana)</span>
              </div>
              {user.firebaseConnected ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" /> Connecté
                </span>
              ) : (
                <span className="text-amber-400 font-bold bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">Non lié</span>
              )}
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                <span>Ho an'ny tetikasanao irery ihany :</span>
              </div>
              <p className="leading-relaxed">
                Ampidiro eto ny Firebase Configuration-nao manokana mba ho ao amin'ny kaontinao no hipetraka ny base de données an'ireo projet ho foroninao.
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              <button 
                type="button" 
                onClick={handleConnectFirebaseGoogle}
                disabled={isFetchingFirebase}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all border border-slate-200"
              >
                 <svg className="w-4 h-4" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                 </svg>
                 {isFetchingFirebase ? 'Miandry kely...' : 'Connecter avec Google'}
              </button>
              
              {firebaseError && (
                <div className="text-rose-400 text-[10px] font-medium bg-rose-950/50 p-2.5 rounded-lg border border-rose-900/50">
                  {firebaseError}
                </div>
              )}

              {firebaseProjects.length > 0 && (
                <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-amber-500/30">
                  <p className="text-[11px] font-bold text-amber-300 mb-2">Safidio ny Projet Firebase :</p>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {firebaseProjects.map((p) => (
                      <button
                        key={p.projectId}
                        type="button"
                        onClick={() => handleSelectFirebaseProject(p)}
                        className="text-left text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2.5 rounded-lg text-white font-medium transition-all"
                      >
                        {p.displayName || p.projectId} <span className="text-slate-400 font-normal">({p.projectId})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Na ampidiro manokana</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400 text-[11px] font-semibold">Firebase Project ID :</label>
              <input
                type="text"
                placeholder="ex: my-project-id"
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
                  placeholder="AIzaSy... (Firebase API Key)"
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold">Auth Domain (Optionnel) :</label>
                <input
                  type="text"
                  placeholder="ex: my-project.firebaseapp.com"
                  value={firebaseAuthDomain}
                  onChange={(e) => setFirebaseAuthDomain(e.target.value)}
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
