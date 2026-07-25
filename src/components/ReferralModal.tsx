import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Gift,
  Sparkles,
  Share2,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, ReferralRecord } from '../types';
import {
  fetchReferredUsers,
  applyReferralCode,
  ApplyReferralResult,
} from '../services/referralService';

interface ReferralModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputRefCode, setInputRefCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<ApplyReferralResult | null>(null);
  const [referredList, setReferredList] = useState<ReferralRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'apply' | 'history'>('invite');

  // Compute live referral URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://devwebia.mg';
  const referralUrl = `${origin}?ref=${user.referralCode}`;

  useEffect(() => {
    if (isOpen && user.referralCode) {
      loadReferredList();
    }
  }, [isOpen, user.referralCode]);

  const loadReferredList = async () => {
    setIsLoadingList(true);
    try {
      const records = await fetchReferredUsers(user.referralCode);
      setReferredList(records);
      if (onUpdateUser && user.referralsCount !== records.length) {
        onUpdateUser({ ...user, referralsCount: records.length });
      }
    } catch (e) {
      console.error('Error loading referred list:', e);
    } finally {
      setIsLoadingList(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleApplyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRefCode.trim()) return;

    setIsApplying(true);
    setFeedback(null);

    const result = await applyReferralCode(user, inputRefCode);
    setFeedback(result);
    setIsApplying(false);

    if (result.success && result.updatedUser) {
      if (onUpdateUser) {
        onUpdateUser(result.updatedUser);
      }
      setInputRefCode('');
      loadReferredList();
    }
  };

  // Utility to mask email for privacy (e.g. j***@gmail.com)
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  };

  const realCount = referredList.length;

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
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/10">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Programme de Parrainage Réel</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Mahazoa <strong className="text-pink-400">+5 Crédits bonus</strong> miaraka amin'ny namanao amin'ny alalan'ny rohy sy code parrainage!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'invite'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Rohy Parrainage</span>
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apply'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ampidiro Code</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Filleuls ({realCount})</span>
          </button>
        </div>

        {/* TAB 1: Invite & Copy Link */}
        {activeTab === 'invite' && (
          <div className="space-y-5">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">Filleuls inscrits :</div>
                <div className="text-2xl font-black text-white">
                  {realCount}
                </div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-1">Crédits GAGNES :</div>
                <div className="text-2xl font-black text-pink-400">
                  +{realCount * 5} Crédits
                </div>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-bold">
                Rohy Parrainage manokana (Lien unique Réel) :
              </label>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="bg-transparent text-slate-200 font-mono text-xs w-full outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shadow-md shadow-pink-600/20"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Copié!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopiaina
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Code Parrain anao: <strong className="text-pink-400">{user.referralCode}</strong>
              </p>
            </div>

            {/* Free plan monthly cap warning */}
            {user.plan === 'free' && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-300">Limitation Plan Gratuit : 30 Crédits max par mois</div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Ny mpikambana Plan Gratuit dia mahazo <strong>maximum 30 Crédits par mois</strong> amin'ny parrainage (na fitambaran'ny crédit). Rehefa feno 30 amin'ity volana ity dia tsy mahazo crédit vaovao intsony. Mba hahazoana crédit illimité dia miakara amin'ny Plan PRO!
                  </p>
                </div>
              </div>
            )}

            <div className="bg-pink-950/40 border border-pink-500/30 p-4 rounded-2xl text-xs text-pink-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-pink-300">
                <Sparkles className="w-4 h-4 text-amber-400" /> Fomba fampiasana azy :
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Zapao amin'ny Facebook, Messenger na WhatsApp ity rohy ity. Rehefa misoratra anarana amin'ny alalany ny namanao dia mahazo <strong className="text-pink-300">+5 Crédits</strong> avy hatrany izy, ary mahazo <strong className="text-pink-300">+5 Crédits</strong> ihany koa ianao!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Apply a Referral Code */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            {user.referredBy ? (
              <div className="p-5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-extrabold text-white text-base">Code Parrain Efa Nampiasaina</h3>
                <p className="text-xs text-slate-300">
                  Efa nahazo ny bonus +5 Crédits ianao tamin'ny alalan'ny code parrain: <strong className="text-emerald-400 font-mono">{user.referredBy}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-slate-300 text-xs font-bold">
                    Ampidiro eto ny Code Parrain avy amin'ny namanao:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ohatra: DEVWEB-8921"
                      value={inputRefCode}
                      onChange={(e) => setInputRefCode(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !inputRefCode.trim()}
                      className="px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {isApplying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Valider-na</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      feedback.success
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    }`}
                  >
                    {feedback.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{feedback.message}</div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* TAB 3: History of Filleuls */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Liste an'ireo namana nampiasa ny code-nao:</span>
              <button
                onClick={loadReferredList}
                className="text-pink-400 hover:underline font-bold text-[11px]"
              >
                Rafraîchir
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingList ? (
                <div className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-500" />
                  <span className="text-xs">Maka ny liste amin'ny Firestore...</span>
                </div>
              ) : referredList.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">
                    Mbola tsy misy filleul vaovao
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Zapao ny rohy parrainage-nao mba hahazoana +5 Crédits voalohany!
                  </p>
                </div>
              ) : (
                referredList.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">
                        {maskEmail(ref.referredUserEmail)}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ref.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                      +{ref.bonusCredits} Crédits
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Akatona (Fermer)
          </button>
        </div>
      </div>
    </div>
  );
};
