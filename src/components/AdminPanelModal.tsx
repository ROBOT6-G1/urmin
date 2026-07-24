import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Users,
  Key,
  Check,
  XCircle,
  Plus,
  RefreshCw,
  Zap,
  Crown,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { PaymentRequest, UserProfile, GeminiApiKey } from '../types';

interface AdminPanelModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRequest[];
  usersList: UserProfile[];
  geminiKeys: GeminiApiKey[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onUpdateUserCredits: (userId: string, newCredits: number) => void;
  onToggleUserPlan: (userId: string) => void;
  onAddGeminiKey: (name: string, key: string) => void;
  onToggleGeminiKey: (keyId: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  user,
  isOpen,
  onClose,
  payments,
  usersList,
  geminiKeys,
  onApprovePayment,
  onRejectPayment,
  onUpdateUserCredits,
  onToggleUserPlan,
  onAddGeminiKey,
  onToggleGeminiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'keys'>('payments');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  if (!isOpen) return null;

  // Strict email lock as per specification!
  if (user.email !== 'horlandobe@gmail.com') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Accès Refusé</h2>
          <p className="text-slate-400 text-xs">
            L'accès à cette zone d'administration est strictement réservé à l'adresse e-mail <strong>horlandobe@gmail.com</strong>.
          </p>
        </div>
      </div>
    );
  }

  const handleAddKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) return;
    onAddGeminiKey(newKeyName || `Clé Gemini ${geminiKeys.length + 1}`, newKeyValue.trim());
    setNewKeyName('');
    setNewKeyValue('');
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Panneau d'Administration DEVWEBIA
            </h2>
            <div className="text-xs text-amber-400 font-bold">
              Connecté en tant que Admin (horlandobe@gmail.com)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Vérification Paiement</span>
            {pendingPayments.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contrôle Utilisateur</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'keys'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Clés API Gemini</span>
          </button>
        </div>

        {/* TAB 1: Vérification Paiement */}
        {activeTab === 'payments' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              Ireo aloa vola nalefan'ny mpanjifa amin'ny <strong>0323911654 (RAVELOMANANTSOA URMIN)</strong> :
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Tsy misy aloa vola miandry fanamafisana amin'izao fotoana izao.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{p.userEmail}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase ${
                          p.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500">Montant :</div>
                        <div className="font-bold text-emerald-400">{p.amountAr.toLocaleString()} Ar</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Crédits / Offre :</div>
                        <div className="font-bold text-indigo-300">
                          {p.isProSubscription ? 'Plan Pro (15 Cr)' : `${p.creditsRequested} Crédits`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Téléphone :</div>
                        <div className="font-bold text-slate-200">{p.senderPhone}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Réf. Trans :</div>
                        <div className="font-bold text-amber-300 truncate">{p.transactionRef}</div>
                      </div>
                    </div>

                    {p.status === 'pending' && (
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => onRejectPayment(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Gafao / Rejeter
                        </button>
                        <button
                          onClick={() => onApprovePayment(p.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <Check className="w-3.5 h-3.5" /> Apetraho Crédit / Valider
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Contrôle Utilisateur */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              Ireo mpampiasa DEVWEBIA rehetra sy ny kaontin'izy ireo :
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{u.email}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.plan === 'pro'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.plan}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] flex items-center gap-3">
                      <span>⚡ Crédits actuels : <strong className="text-indigo-300">{u.credits}</strong></span>
                      <span>Stockage : {u.storageUsedMb}MB / {u.plan === 'pro' ? 'Illimité' : '1000MB'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onUpdateUserCredits(u.id, u.credits + 10)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold transition-all text-xs"
                    >
                      +10 Crédits
                    </button>
                    <button
                      onClick={() => onToggleUserPlan(u.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all text-xs"
                    >
                      Changer Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Clés API Gemini & Rotation */}
        {activeTab === 'keys' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              Ampidiro clés API Gemini fanampiny. Manao rotation automatique ny système rehefa lany quota ny clé iray.
            </div>

            <form onSubmit={handleAddKeySubmit} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-white">Ajouter une nouvelle clé API Gemini :</div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nom de la clé (ex: Gemini Backup 1)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
                <input
                  type="password"
                  placeholder="AIzaSy... (Gemini API Key)"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer la Clé dans le Pool</span>
              </button>
            </form>

            <div className="space-y-2">
              <div className="font-bold text-slate-300">Clés API actives dans le pool :</div>
              {geminiKeys.length === 0 ? (
                <div className="p-4 text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Actuellement, la clé d'environnement par défaut est utilisée.
                </div>
              ) : (
                <div className="space-y-2">
                  {geminiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">{k.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Utilisations : {k.usageCount}
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleGeminiKey(k.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          k.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {k.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
