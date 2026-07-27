import React, { useState } from 'react';
import {
  X,
  Key,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  Check,
  Cpu,
} from 'lucide-react';
import { UserProfile } from '../types';

interface CustomAiKeyModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUserKey: (apiKey: string, useCustomKey: boolean, model: string) => void;
  onOpenRechargeForAiKey: () => void;
}

export const CustomAiKeyModal: React.FC<CustomAiKeyModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUserKey,
  onOpenRechargeForAiKey,
}) => {
  const [apiKey, setApiKey] = useState<string>(user.customGeminiApiKey || '');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(
    user.customGeminiModel || 'gemini-3.6-flash'
  );
  const [useCustomKey, setUseCustomKey] = useState<boolean>(
    Boolean(user.useCustomKey && user.aiKeySubActive)
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isSubActive = Boolean(user.aiKeySubActive);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubActive && useCustomKey) {
      alert("Mila manao abonnement 10.000 Ar / volana ianao alohan'ny hahafahana manao mavitrika ny Clé IA personnel !");
      return;
    }

    onUpdateUserKey(apiKey.trim(), isSubActive ? useCustomKey : false, selectedModel);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
            <Key className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Option Illimitée • Ouvert à Tous</span>
          </div>
          <h2 className="text-2xl font-black text-white">Ma Clé IA : API Gemini Personnel</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Ampidiro ny <strong>Clé API Gemini</strong>-nao manokana mba handefasana sy hanamboarana ny tranonkala amin'ny fomba illimité, tsy misy fetra ary tsy miankina amin'ny crédit DEVWEBIA.
          </p>
        </div>

        {/* Condition Check: 10,000 Ar / Month Subscription */}
        {!isSubActive ? (
          <div className="bg-amber-950/50 border border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300 font-extrabold text-sm">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>🔒 Formule Clé IA Personnelle (10.000 Ar / volana) Tsy Mbola Mavitrika</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Mila manao abonnement <strong>10,000 Ar / volana</strong> ianao raha te hampiasa ny Clé API Gemini personnel-nao amin'ny fomba illimité ao amin'ny DEVWEBIA.
            </p>
            <p className="text-amber-400 text-[11px] font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              ⚠️ Tsy afaka mampiasa IA personnel na dia efa manana Clé API aza ianao raha tsy mbola mavitrika ity abonnement 10,000 Ar / volana ity.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRechargeForAiKey();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Mandoa Abonnement 10,000 Ar / volana (Aktivaina izao)</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold text-sm text-emerald-300">✅ Abonnement Clé IA (10,000 Ar / volana) Mavitrika!</div>
              <div className="text-slate-300">Efa mavitrika ny abonnement-nao. Afaka mampiasa ny Clé API Gemini personnel-nao tsy misy fetra ianao.</div>
            </div>
          </div>
        )}

        {/* Key Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Clé API Gemini (AIzaSy...) :</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
              >
                Maka Clé API Gratuit <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Auto-selected Gemini Model Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-slate-200 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Modèle API Gemini (Auto-Sélectionné) :</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium outline-none focus:border-purple-500"
            >
              <option value="gemini-3.6-flash">⚡ gemini-3.6-flash (Auto-Sélectionné • Ultra Rapide & Recommandé)</option>
              <option value="gemini-3.1-pro-preview">🧠 gemini-3.1-pro-preview (Pro • Code Complexe & Analyse Avancée)</option>
              <option value="gemini-3.5-flash">🚀 gemini-3.5-flash (Flash • Rapide & Fluide)</option>
              <option value="gemini-3.1-flash-lite">⚙️ gemini-3.1-flash-lite (Lite • Économe)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Ataon'ny système auto-select direct ity modely ampiasan'ny Clé API Gemini-nao ity.
            </p>
          </div>

          {/* Active Switch Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <label
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                useCustomKey && isSubActive
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              } ${!isSubActive ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="space-y-0.5">
                <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aktivaina ny Clé IA Personnel (Illimité)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Hampiasa ny API Key Gemini-nao manokana, tsy mila mandany crédit platform.
                </div>
              </div>

              <input
                type="checkbox"
                disabled={!isSubActive}
                checked={useCustomKey && isSubActive}
                onChange={(e) => setUseCustomKey(e.target.checked)}
                className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Feedback & Save Button */}
          {saveSuccess ? (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Voatahiry sy Voamaro ny Clé IA Personnel-nao!</span>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Tahirizina sy Ampiasaina ny Clé IA</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
