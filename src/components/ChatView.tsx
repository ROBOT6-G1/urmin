import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Code2,
  Eye,
  AlertTriangle,
  ShoppingBag,
  Briefcase,
  Utensils,
  Globe,
  Newspaper,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ChatMessage, Project, UserProfile } from '../types';

interface ChatViewProps {
  user: UserProfile;
  currentProject: Project;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onSwitchToPreview: () => void;
  onOpenRecharge: () => void;
  isGenerating: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  user,
  currentProject,
  messages,
  onSendMessage,
  onSwitchToPreview,
  onOpenRecharge,
  isGenerating,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    if (user.credits <= 0) {
      onOpenRecharge();
      return;
    }

    const text = promptInput;
    setPromptInput('');
    onSendMessage(text);
  };

  const handleQuickPrompt = (presetText: string) => {
    if (user.credits <= 0) {
      onOpenRecharge();
      return;
    }
    onSendMessage(presetText);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Banner / Project Info */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">{currentProject.title}</span>
          <span className="text-slate-500 hidden sm:inline">• {currentProject.files.length} Fichier(s)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToPreview}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mijery alalana (Preview)</span>
          </button>
        </div>
      </div>

      {/* Out of credits warning banner */}
      {user.credits <= 0 && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-3 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>Lany crédit !</strong> Tsy afaka mamorona site intsony ilay IA. Mividia crédit mba hitohizana.
            </span>
          </div>
          <button
            onClick={onOpenRecharge}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg shadow-sm whitespace-nowrap transition-all"
          >
            Mividy Crédit izao
          </button>
        </div>
      )}

      {/* Main Discussion Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar max-w-4xl mx-auto w-full">
        {/* Welcome Card if first message */}
        {messages.length === 0 && (
          <div className="text-center py-10 px-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Inona no tranonkala tianao havoakan'i DEVWEB IA?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manoratra prompt amin'ny teny Malagasy na Français amina detail feno (Loko, Vokatra, Pejy, Boutons). Mamorona site amin'ny alalan'ny Gemini AI avy hatrany.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="pt-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Safidio amin'ireto modèle ireto
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                <button
                  onClick={() =>
                    handleQuickPrompt(
                      'Mamorona site E-commerce ho ani fivarotana vêtements & accessoires moderne aminny teny Malagasy miaraka aminny panier, cartes produits sy paiement Mvola'
                    )
                  }
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Site E-Commerce Vokatra</div>
                    <div className="text-[11px] text-slate-400">Panier, Produits, Mobile Money</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      'Mamorona site Portfolio professionnel ho ani Développeur Web / Designer miaraka aminny mode sombre, projets, compétences sy formulaire de contact'
                    )
                  }
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Portfolio Pro</div>
                    <div className="text-[11px] text-slate-400">Projets, Formulaire, Compétences</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      'Mamorona site Restaurant & Tsakitsaky aminny teny Malagasy miaraka aminny Menu, Réservation de table sy Localisation Antananarivo'
                    )
                  }
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Restaurant & Hotely</div>
                    <div className="text-[11px] text-slate-400">Menu, Reservation, Adresse</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleQuickPrompt(
                      'Mamorona Landing Page ho ani Agence Digital / Marketing ao Madagascar miaraka aminny Tarifs, FAQ sy Témoignages clients'
                    )
                  }
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Landing Page Agence</div>
                    <div className="text-[11px] text-slate-400">Offres, Témoignages, Tarifs</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Generated Code Badge Notification */}
                {msg.generatedCode && msg.generatedCode.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{msg.generatedCode.length} Fichier(s) namboarina!</span>
                    </div>
                    <button
                      onClick={onSwitchToPreview}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Jereo amin'ny Preview</span>
                    </button>
                  </div>
                )}

                {/* Token / Credit Info */}
                {msg.creditsDeducted ? (
                  <div className="text-[11px] text-slate-500 text-right font-mono pt-1">
                    ⚡ -{msg.creditsDeducted} Crédit (~15,000 Tokens)
                  </div>
                ) : null}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>DEVWEB IA dia eo am-panoratana ny code tranonkalanao...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Fixed Input Box */}
      <div className="p-4 bg-slate-900 border-t border-slate-800/80">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                user.credits > 0
                  ? 'Manorata prompt ho an\'i IA (ohatra: Ampio section témoignage sy mode sombre amin\'ity site ity...)'
                  : 'Lany crédit ianao! Mividia crédit afahanao manao site Web...'
              }
              disabled={isGenerating || user.credits <= 0}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 rounded-2xl py-3 pl-4 pr-14 text-sm text-white placeholder-slate-500 resize-none outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim() || user.credits <= 0}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white shadow-md disabled:text-slate-600 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> 1 crédit = 15,000 tokens
            </span>
            <span>Appuyez sur Entrée pour envoyer</span>
          </div>
        </form>
      </div>
    </div>
  );
};
