import React, { useState } from 'react';
import {
  X,
  Zap,
  Crown,
  CheckCircle2,
  Send,
  Phone,
  UserCheck,
  CreditCard,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { UserProfile, PaymentRequest } from '../types';
import { calculateCreditPrice } from '../services/storage';

interface RechargeModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (payment: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmitPayment,
}) => {
  const [selectedCredits, setSelectedCredits] = useState<number>(10);
  const [isProOption, setIsProOption] = useState<boolean>(false);
  const [provider, setProvider] = useState<'mvola' | 'orange_money' | 'airtel_money'>('mvola');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPrice = isProOption ? 5000 : calculateCreditPrice(selectedCredits).amountAr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || !transactionRef) return;

    onSubmitPayment({
      userId: user.id,
      userEmail: user.email,
      amountAr: currentPrice,
      creditsRequested: isProOption ? 15 : selectedCredits,
      isProSubscription: isProOption,
      provider,
      senderPhone,
      transactionRef,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Mividy Crédit & Plan Pro</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Tohizo ny famoronana tranonkala amin'ny alalan'ny Gemini AI amin'i DEVWEBIA.
          </p>
        </div>

        {/* Plan / Credit Selector Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setIsProOption(false)}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              !isProOption
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Achat de Crédit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProOption(true)}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isProOption
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Plan Pro (5,000 Ar)</span>
          </button>
        </div>

        {/* Option A: Buy Custom Credits */}
        {!isProOption ? (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Soraty ny isan'ny Crédit tianao hivividy :</span>
              <span className="text-amber-400 font-mono text-[11px]">1 Crédit = 15,000 Tokens</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={5}
                step={5}
                value={selectedCredits}
                onChange={(e) => setSelectedCredits(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 font-black text-xl text-white text-center outline-none focus:border-indigo-500"
              />
              <div className="flex-1 text-right">
                <div className="text-xs text-slate-400">Montant à payer :</div>
                <div className="text-2xl font-black text-emerald-400">
                  {currentPrice.toLocaleString()} Ar
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2 text-xs pt-1">
              {[5, 10, 20, 50].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCredits(c)}
                  className={`py-2 rounded-xl border text-center font-bold transition-all ${
                    selectedCredits === c
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c} Crédit ({calculateCreditPrice(c).amountAr}Ar)
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Option B: Pro Plan Perks */
          <div className="space-y-3 bg-gradient-to-br from-amber-950/40 via-slate-950 to-orange-950/30 p-5 rounded-2xl border border-amber-500/30 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 text-sm">Avantages du Plan Pro</span>
              <span className="text-xl font-black text-white">5,000 Ar / mois</span>
            </div>
            <ul className="space-y-2 text-slate-300 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span><strong>Miala ny logo DEVWEBIA</strong> amin'ny site rehetra noforonina</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Afaka mampiasa ny <strong>Base de données Firebase (Firestore)</strong>-nao</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Afaka mampiditra <strong>Domaine Personnel</strong> anao manokana</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span><strong>+15 Crédits bonus</strong> omena isam-bolana</span>
              </li>
            </ul>
          </div>
        )}

        {/* Official Payment Number Box Required */}
        <div className="bg-indigo-950/80 border border-indigo-500/40 p-4 rounded-2xl space-y-2 text-xs">
          <div className="font-extrabold text-indigo-200 uppercase tracking-wider flex items-center justify-between">
            <span>Uner Numéro de paiement officiel :</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
              Mobile Money
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 pt-1 font-mono">
            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <Phone className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Numéro :</div>
                <div className="font-black text-sm text-white">0323911654</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[10px] text-slate-400">Nom du destinataire :</div>
                <div className="font-black text-xs text-white truncate">RAVELOMANANTSOA URMIN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Form */}
        {submittedSuccess ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-center space-y-2 text-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm">Fangatahana aloa vola voaray!</div>
            <p className="text-xs text-slate-300">
              Andraso kely ny fanamarinana avy amin'ny Admin (horlandobe@gmail.com). Homena avy hatrany ny crédit-nao!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-3 gap-2">
              {(['mvola', 'orange_money', 'airtel_money'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`p-2.5 rounded-xl border font-bold capitalize transition-all ${
                    provider === p
                      ? 'bg-indigo-600/30 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-250'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Laharana nandefasana vola (Téléphone) :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ohatra: 0341234567"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Référence Transaction SMS :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ohatra: MV260724.0912.B12"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Alefa ny Fanamafisana Paiement ({currentPrice.toLocaleString()} Ar)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
