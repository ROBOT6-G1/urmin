import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, Sparkles, Send } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    q: "Inona no atao hoe DEVWEB IA?",
    a: "DEVWEB IA dia sehatra SaaS Malagasy mamorona tranonkala (site web) feno sy miasa avy hatrany amin'ny alalan'ny Inteligensa Artifisialy Gemini AI. Azonao atao ny mamorona site E-commerce, Portfolio, Blog na Landing Page ao anatin'ny segondra vitsy.",
  },
  {
    q: "Ahoana no fomba fiasan'ny Crédit WEB IA?",
    a: "Ny 1 Crédit dia mitovy amin'ny 15,000 tokens. Isaky ny mamorona na manova site amin'ny alalan'ny AI ianao dia analana 1 crédit. Afaka mividy crédit amin'ny alalan'ny Mvola / Orange Money / Airtel Money (5 Crédits = 1,000 Ar) ianao.",
  },
  {
    q: "Inona no mahasamihafa ny Plan Gratuit sy Plan Pro?",
    a: "Sur le Plan Gratuit dia misy logo 'vita amin'i DEVWEBIA' eo amin'ny site ary 1Go no stockage omena. Sur le Plan Pro (5,000 Ar/mois) kosa dia miala ny logo DEVWEBIA, afaka mampiasa Firebase (Firestore & Storage) sy Domaine Personnalisé ianao, ary mahazo +15 Crédits bonus isam-bolana.",
  },
  {
    q: "Ahoana no fomba fanaovana Déploiement automatique amin'ny Vercel?",
    a: "Mandehana ao amin'ny 'Applications Connectées', ampidiro ny Access Token GitHub sy Vercel anao. Rehefa izany dia afaka mikitika ny bouton 'Publish' ao amin'ny Preview ianao hanaovana déploiement direct.",
  },
  {
    q: "Iza avy ny laharana fandoavana vola?",
    a: "Ny laharana fandoavana vola dia 0323911654 amin'ny anaran'i RAVELOMANANTSOA URMIN.",
  },
];

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!isOpen) return null;

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `FAQ Question: ${customQuestion}` }),
      });
      const data = await res.json();
      setAiAnswer(data.response || "Miala tsiny, nisy olana kely.");
    } catch (err) {
      setAiAnswer("Tsy afaka namaly teo no ho eo ilay IA.");
    } finally {
      setIsAsking(false);
    }
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">FAQ / Fanontaniana Matetika</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ireo valin'ny fanontaniana matetika apipetraky ny mpanjifa ao amin'i DEVWEBIA.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 text-xs">
          {FAQS.map((faq, idx) => {
            const isOpenFaq = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpenFaq ? null : idx)}
                  className="w-full p-3.5 text-left font-bold text-slate-200 flex items-center justify-between gap-2 hover:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpenFaq ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {isOpenFaq && (
                  <div className="px-3.5 pb-3.5 text-slate-400 text-xs leading-relaxed border-t border-slate-900 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Generator FAQ search feature requested */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Manana fanontaniana hafa? Anontanio mivantana i IA :</span>
          </div>

          <form onSubmit={handleAskAi} className="flex gap-2">
            <input
              type="text"
              placeholder="Soraty eto ny fanontanianao..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAsking || !customQuestion.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Namaly</span>
            </button>
          </form>

          {isAsking && <div className="text-slate-400 animate-pulse">Efa am-pamaliana ny IA...</div>}

          {aiAnswer && (
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-200 leading-relaxed">
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
