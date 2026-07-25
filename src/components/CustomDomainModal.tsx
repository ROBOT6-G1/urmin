import React, { useState } from 'react';
import { X, Globe, Copy, Check, Send, Sparkles, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { UserProfile, Project } from '../types';

interface CustomDomainModalProps {
  user: UserProfile;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onSendDomainToChat: (domainPrompt: string) => void;
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  user,
  projects,
  isOpen,
  onClose,
  onUpdateUser,
  onSendDomainToChat,
}) => {
  const [domainInput, setDomainInput] = useState(user.customDomain || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    if (!user.vercelToken) {
      setErrorMsg("Mila Token Vercel ianao ahafahana mampifandray domaine mivantana. Ampidiro ao amin'ny 'Apps Connectées' izany aloha.");
      return;
    }

    if (!selectedProjectId) {
      setErrorMsg("Misafidiana projet iray azafady.");
      return;
    }

    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;

    setIsDeploying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/deploy/vercel/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vercelToken: user.vercelToken,
          repoName: proj.title,
          domain: domainInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nisy olana ny fampidirana ny domaine.');
      }

      setSuccessMsg(`Tafiditra soa aman-tsara amin'ny projet Vercel-nao ny domaine ${data.domain} !`);
      if (onUpdateUser) {
        onUpdateUser({ customDomain: data.domain });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Domaine Personnalisé</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Mampidira domaine anao manokana (ohatra: www.orasa.mg na brand.com).
          </p>
        </div>

        {user.plan === 'free' ? (
          <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4" />
              <span>Misarika ny attention: Plan Pro ilaina !</span>
            </div>
            <p>
              Ny Domaine Personnalisé dia natokana ho an'ny mpampiasa <strong>Plan Pro (5,000 Ar/mois)</strong>. Mandehana amin'ny Recharge raha te hifindra Pro.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleApplyDomain} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Safidio ny Projet hasiana ilay Domaine :
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-teal-500 text-xs mb-3"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.files?.length || 1} fichiers)
                </option>
              ))}
            </select>
            
            <label className="block text-slate-300 font-bold mb-1">
              Soraty ny Nom de domaine-nao :
            </label>
            <input
              type="text"
              required
              placeholder="Ohatra: www.mybrand.mg"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-teal-500 text-sm"
            />
          </div>

          {/* Required DNS instructions requested */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="font-bold text-slate-200">Kojakoja sy DNS Vercel ilaina :</div>
            <div className="space-y-2 font-mono text-[11px] text-slate-300">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-teal-400 font-bold">Type A :</span> Record @ → <span className="text-white">76.76.21.21</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-teal-400 font-bold">Type CNAME :</span> Record www → <span className="text-white">cname.vercel-dns.com</span>
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {!successMsg && (
            <button
              type="submit"
              disabled={isDeploying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeploying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isDeploying ? 'Ampifandraisina...' : 'Ampifandraiso mivantana'}</span>
            </button>
          )}
          
          {successMsg && (
            <div className="pt-2 text-center">
              <p className="text-slate-400 text-[11px] mb-3">Tsarovy fa mila manamboatra ny <strong>Zone DNS</strong> any amin'ny mpivarotra domaine (ni-vidiananao azy) ianao amin'ireo fampahalalana (A na CNAME) aseho eo ambony.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Akatona
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
