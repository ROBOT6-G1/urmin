import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Send,
  Phone,
  UserCheck,
  Sparkles,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  History,
} from 'lucide-react';
import { UserProfile, PaymentRequest } from '../types';

interface RechargeModalProps {
  user: UserProfile;
  payments: PaymentRequest[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (payment: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>) => void;
  onRefreshPayments?: () => Promise<void>;
  onApplyPayment?: (payment: PaymentRequest) => Promise<void>;
  initialType?: 'credits' | 'ai_key_sub';
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  user,
  payments,
  isOpen,
  onClose,
  onSubmitPayment,
  onRefreshPayments,
  onApplyPayment,
  initialType = 'credits',
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const [paymentType, setPaymentType] = useState<'credits' | 'ai_key_sub'>(initialType);
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentPrice = 10000;
  const creditsAmount = paymentType === 'credits' ? 40 : 0;

  // Filter payments for this specific user
  const userPayments = payments.filter(
    (p) =>
      p.userId === user.id ||
      (p.userEmail && user.email && p.userEmail.toLowerCase() === user.email.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || !transactionRef) return;

    onSubmitPayment({
      userId: user.id,
      userEmail: user.email,
      amountAr: currentPrice,
      creditsRequested: creditsAmount,
      isProSubscription: false,
      isAiKeySubscription: paymentType === 'ai_key_sub',
      provider: 'orange_money',
      senderPhone,
      transactionRef,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      // Auto switch to history tab so they can see it pending!
      setActiveTab('history');
    }, 2000);
  };

  const handleRefresh = async () => {
    if (!onRefreshPayments) return;
    setIsSyncing(true);
    try {
      await onRefreshPayments();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApply = async (p: PaymentRequest) => {
    if (!onApplyPayment) return;
    try {
      await onApplyPayment(p);
      setSuccessMsg('Tafiditra soa aman-tsara ny crédit-nao! Misaotra anao.');
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (e) {
      console.error(e);
    }
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
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Paiement DEVWEBIA</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Fividianana crédit sy fanamarinana fandoavam-bola amin'ny alalan'ny Orange Money.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('buy')}
            className={`pb-2.5 font-extrabold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'buy'
                ? 'text-orange-400 font-black'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Mividy Crédit</span>
            {activeTab === 'buy' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              handleRefresh();
            }}
            className={`pb-2.5 font-extrabold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-orange-400 font-black'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique de paiement</span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
            {userPayments.filter((p) => p.status === 'pending').length > 0 && (
              <span className="bg-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {userPayments.filter((p) => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-center text-xs text-emerald-200 animate-bounce flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-extrabold">{successMsg}</span>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'buy' ? (
          <div className="space-y-6">
            {/* Offer Selection */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentType('credits')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentType === 'credits'
                    ? 'bg-orange-950/60 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-extrabold text-sm text-orange-400">10 000 Ar</div>
                <div className="font-bold text-white text-xs mt-0.5">= 40 Crédits IA</div>
                <div className="text-[10px] text-slate-400 mt-1">Paiement unique ahazoana 40 crédits.</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('ai_key_sub')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  paymentType === 'ai_key_sub'
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-extrabold text-sm text-amber-400">10 000 Ar / mois</div>
                <div className="font-bold text-white text-xs mt-0.5">Abonnement Clé IA</div>
                <div className="text-[10px] text-slate-400 mt-1">Mampiasa Clé Gemini Personnel (Illimité).</div>
              </button>
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
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <div className="font-bold text-sm">Nalefa soa aman-tsara!</div>
                <p className="text-xs text-slate-300">
                  Andraso kely ny fanamarinana ny SMS Orange Money avy amin'ny Admin. Homena ao amin'ny Historique ny crédit-nao raha vao voamarina!
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
        ) : (
          /* Historique de Paiement Tab Content */
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between sticky top-0 bg-slate-900 pb-2 z-10 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300">Ireo fandoavam-bola nalefanao:</h3>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 transition-colors text-[11px] font-bold"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Hanamarina (Refresh)</span>
              </button>
            </div>

            {userPayments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">
                  Tsy mbola misy fandoavam-bola voaray. Fidio ny "Mividy Crédit" mba handefasana fangatahana voalohany.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {userPayments.map((p) => {
                  const isApplied = user.appliedPaymentIds?.includes(p.id) || false;
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700/80 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-black text-orange-400 text-sm">
                          {p.amountAr.toLocaleString()} Ar
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500">Référence SMS:</span>
                          <div className="font-mono font-bold text-white truncate" title={p.transactionRef}>
                            {p.transactionRef}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Mpanome / Offer:</span>
                          <div className="font-bold text-white">
                            {p.isAiKeySubscription ? (
                              <span className="text-amber-400 font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Abonnement Clé IA
                              </span>
                            ) : (
                              `+${p.creditsRequested || 40} Crédits IA`
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges & Manual Apply Action */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <span>Laharana:</span>
                          <span className="font-mono font-bold text-slate-300">{p.senderPhone}</span>
                        </div>

                        <div className="flex items-center justify-end">
                          {p.status === 'pending' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-extrabold uppercase">
                              <Clock className="w-3 h-3" />
                              <span>En Attente...</span>
                            </div>
                          )}

                          {p.status === 'rejected' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold uppercase">
                              <AlertCircle className="w-3 h-3" />
                              <span>Refusé / Nolavina</span>
                            </div>
                          )}

                          {p.status === 'approved' && (
                            <>
                              {isApplied ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                                  <Check className="w-3 h-3" />
                                  <span>Tafiditra / Validé</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApply(p)}
                                  className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Hampiditra Crédit</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
