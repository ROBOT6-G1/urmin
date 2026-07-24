import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Send,
  Phone,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile, PaymentRequest } from '../types';

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
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPrice = 10000;
  const creditsAmount = 40;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || !transactionRef) return;

    onSubmitPayment({
      userId: user.id,
      userEmail: user.email,
      amountAr: currentPrice,
      creditsRequested: creditsAmount,
      isProSubscription: false,
      provider: 'orange_money',
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Paiement DEVWEBIA</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Paiement unique afahana manorina tranokala mazava tsara amin'ny alalan'ny IA.
          </p>
        </div>

        {/* Single Offer Card */}
        <div className="bg-gradient-to-br from-orange-950/40 via-slate-950 to-slate-900 p-5 rounded-2xl border border-orange-500/40 text-center space-y-3 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Paiement Unique</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white">10 000 Ar</div>
            <div className="text-lg font-bold text-orange-400">= 40 Crédits IA</div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed max-w-xs mx-auto">
            Hahazoana crédit 40 afahana manorina sy mampiditra safidy (options) maro amin'ny tranokala mazava tsara.
          </p>
        </div>

        {/* Official Payment Number Box - Orange Money ONLY */}
        <div className="bg-orange-950/40 border border-orange-500/40 p-4 rounded-2xl space-y-3 text-xs">
          <div className="font-extrabold text-orange-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              Orange Money ihany
            </span>
            <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/30">
              Paiement Officiel
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 font-mono">
            <div className="flex items-center gap-2.5 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Numéro Orange Money :</div>
                <div className="font-black text-sm text-white">032 39 116 54</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
              <UserCheck className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Anarana (Destinataire) :</div>
                <div className="font-black text-xs text-white truncate">RAVELOMANANTSOA URMIN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Form */}
        {submittedSuccess ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-center space-y-2 text-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm">Fanamafisana paiement voaray!</div>
            <p className="text-xs text-slate-300">
              Andraso kely ny fanamarinana ny SMS Orange Money avy amin'ny Admin. Homena avy hatrany ny crédit 40-nao!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Laharana nandefasana vola Orange Money (Téléphone) :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ohatra: 0321234567"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Référence Transaction SMS Orange Money :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ohatra: OM260724.1042.A89"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Nalefa ny 10 000 Ar - Hanamarina Paiement</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
