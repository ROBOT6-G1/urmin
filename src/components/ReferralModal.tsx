import React, { useState } from 'react';
import { X, Users, Copy, Check, Gift, Sparkles, Share2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ReferralModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const referralUrl = `https://devwebia.mg/ref/${user.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Programme de Parrainage</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Mahazoa <strong className="text-pink-400">+5 Crédits bonus</strong> ho an'ny namana tsirairay misoratra anarana amin'ny rohy parrainage-nao!
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-1">Namana nasaina (Inscrits) :</div>
            <div className="text-2xl font-black text-white">{user.referralsCount}</div>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-1">Crédits Bonus azonao :</div>
            <div className="text-2xl font-black text-pink-400">
              +{user.referralsCount * 5} Crédits
            </div>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-bold">Rohy Parrainage anao (Lien unique) :</label>
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="bg-transparent text-slate-200 font-mono text-xs w-full outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shadow-md shadow-pink-600/20"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" /> Copié!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Kopiaina
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-pink-950/40 border border-pink-500/30 p-4 rounded-2xl text-xs text-pink-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-pink-300">
            <Sparkles className="w-4 h-4 text-amber-400" /> Fomba fiasany :
          </div>
          <p className="text-slate-300">
            Mandefa ity rohy ity amin'ny Facebook, WhatsApp, na Messenger. Rehefa misoratra anarana izy ireo dia mahazo 5 crédits vaovao avy hatrany ianao.
          </p>
        </div>
      </div>
    </div>
  );
};
