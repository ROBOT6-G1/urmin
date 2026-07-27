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
  Zap,
  Lock,
  Headphones,
  ExternalLink,
  Globe,
  Send,
  MessageSquare,
  Eye,
  FileCode,
  Trash2,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { PaymentRequest, UserProfile, GeminiApiKey, Project, SupportTicket, SystemPrompt, CodeFile } from '../types';

interface AdminPanelModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRequest[];
  usersList: UserProfile[];
  allProjects: Project[];
  tickets: SupportTicket[];
  geminiKeys: GeminiApiKey[];
  systemPrompts?: SystemPrompt[];
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onUpdateUserCredits: (userId: string, newCredits: number) => void;
  onToggleUserPlan: (userId: string) => void;
  onAddGeminiKey: (name: string, key: string) => void;
  onToggleGeminiKey: (keyId: string) => void;
  onReplyTicket: (ticketId: string, replyText: string) => void;
  onAddSystemPrompt?: (title: string, content: string) => void;
  onToggleSystemPrompt?: (id: string) => void;
  onUpdateProjectContent?: (projectId: string, files: CodeFile[], title: string, description: string) => void;
  onSelectProjectAndPreview?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onRunAuditPro?: () => Promise<{ auditedCount: number; resetUsers: string[] }>;
  onToggleAiKeySub?: (userId: string, active: boolean) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  user,
  isOpen,
  onClose,
  payments,
  usersList,
  allProjects,
  tickets,
  geminiKeys,
  systemPrompts = [],
  onApprovePayment,
  onRejectPayment,
  onUpdateUserCredits,
  onToggleUserPlan,
  onAddGeminiKey,
  onToggleGeminiKey,
  onReplyTicket,
  onAddSystemPrompt,
  onToggleSystemPrompt,
  onUpdateProjectContent,
  onSelectProjectAndPreview,
  onDeleteProject,
  onRunAuditPro,
  onToggleAiKeySub,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'support' | 'keys' | 'prompts' | 'content'>('payments');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [deletingProjId, setDeletingProjId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [replyInputs, setReplyInputs] = useState<{ [ticketId: string]: string }>({});
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Prompts and Content editing state
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHtmlContent, setEditHtmlContent] = useState('');

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

  const handleSendReply = (ticketId: string) => {
    const text = replyInputs[ticketId];
    if (!text || !text.trim()) return;
    onReplyTicket(ticketId, text.trim());
    setReplyInputs((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const openTickets = tickets.filter((t) => t.status === 'open' || !t.reply);

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'open') return t.status === 'open' || !t.reply;
    if (ticketFilter === 'resolved') return t.status === 'resolved' || !!t.reply;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg flex-shrink-0">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Paiements</span>
            {pendingPayments.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Utilisateurs</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'support'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Support</span>
            {openTickets.length > 0 && (
              <span className="bg-purple-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                {openTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'keys'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Clés Gemini</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'prompts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Prompts IA</span>
            {systemPrompts.filter(p => p.isActive).length > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                {systemPrompts.filter(p => p.isActive).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Éditeur Sites</span>
          </button>
        </div>

        {/* TAB 1: Vérification Paiement */}
        {activeTab === 'payments' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              Ireo aloa vola Orange Money nalefan'ny mpanjifa amin'ny <strong>032 39 116 54 (RAVELOMANANTSOA URMIN)</strong> :
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Tsy misy aloa vola miandry fanamafisana amin'izao fotoana izao.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
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
                          {p.isAiKeySubscription ? (
                            <span className="text-amber-400 font-extrabold">Abonnement Clé IA (10k/m)</span>
                          ) : p.isProSubscription ? (
                            <span className="text-amber-400 font-extrabold">Plan Pro (5k/m)</span>
                          ) : (
                            `${p.creditsRequested} Crédits`
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Téléphone Orange :</div>
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
                          <Check className="w-3.5 h-3.5" /> Apetraho 40 Crédits / Valider
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Contrôle Utilisateur & Sites */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            {/* Audit & Security Control Bar */}
            <div className="p-3.5 bg-slate-950 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Analyse & Fiarovana Plan Pro</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Zahao ireo kaonty Pro tsy nividy abonnement mba haverina ho Plan Gratuit.
                </p>
              </div>

              {onRunAuditPro && (
                <button
                  onClick={async () => {
                    setIsAuditing(true);
                    setAuditMessage(null);
                    try {
                      const res = await onRunAuditPro();
                      if (res.resetUsers.length > 0) {
                        setAuditMessage(`Analyse vita! Kaonty Pro ${res.resetUsers.length} tsy nividy abonnement no naverina ho Plan Gratuit (${res.resetUsers.join(', ')}).`);
                      } else {
                        setAuditMessage(`Analyse vita! Tsy misy kaonty Pro hosoka na tsy nividy abonnement hita.`);
                      }
                    } catch (e: any) {
                      setAuditMessage(`Diso ny analyse: ${e?.message || e}`);
                    } finally {
                      setIsAuditing(false);
                    }
                  }}
                  disabled={isAuditing}
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl border border-indigo-400/40 shadow-lg flex items-center gap-1.5 transition-all shrink-0 text-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>{isAuditing ? 'Manadihady...' : 'Hamarino sy Diovy ny Plan Pro'}</span>
                </button>
              )}
            </div>

            {auditMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl font-medium leading-relaxed">
                {auditMessage}
              </div>
            )}

            <div className="text-slate-400">
              Ireo mpampiasa DEVWEBIA rehetra sy ny <strong>site web efa vitany</strong> :
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {usersList.map((u) => {
                const userProjs = allProjects.filter(
                  (p) =>
                    p.userId === u.id ||
                    (p.userEmail && p.userEmail.toLowerCase() === u.email.toLowerCase())
                );

                return (
                  <div
                    key={u.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
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
                          <span>Sites namboarina : <strong className="text-emerald-400">{userProjs.length}</strong></span>
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
                        {onToggleAiKeySub && (
                          <button
                            onClick={() => onToggleAiKeySub(u.id, !u.aiKeySubActive)}
                            className={`px-3 py-1.5 rounded-xl border font-bold transition-all text-xs flex items-center gap-1 ${
                              u.aiKeySubActive
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{u.aiKeySubActive ? 'Clé IA Active' : 'Activer Clé IA'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Liste des sites pour cet utilisateur */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tranonkala / Sites an'i {u.name || u.email} :</span>
                      </div>

                      {userProjs.length === 0 ? (
                        <div className="p-3 bg-slate-900/60 rounded-xl text-slate-500 italic text-[11px] border border-slate-800/80">
                          Tsy mbola manana site namboarina ity mpampiasa ity.
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {userProjs.map((p) => (
                            <div
                              key={p.id}
                              className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors"
                            >
                              <div>
                                <div className="font-bold text-white text-xs truncate flex items-center justify-between">
                                  <span>{p.title}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {p.files.length} fichiers
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[10px] line-clamp-1 mt-0.5">
                                  {p.description || 'Tranonkala namboarina tamin\'i DEVWEBIA'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                                {onSelectProjectAndPreview && (
                                  <button
                                    onClick={() => {
                                      onSelectProjectAndPreview(p.id);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Sokafy Preview</span>
                                  </button>
                                )}

                                <a
                                  href={`#preview-${p.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (onSelectProjectAndPreview) {
                                      onSelectProjectAndPreview(p.id);
                                      onClose();
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                                  <span>Lien Site</span>
                                </a>

                                {onDeleteProject && (
                                  deletingProjId === p.id ? (
                                    <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/50 rounded-lg p-0.5 ml-auto" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          onDeleteProject(p.id);
                                          setDeletingProjId(null);
                                        }}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded flex items-center gap-0.5 transition-all"
                                        title="Hamafiso ny fafana"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Fafana</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setDeletingProjId(null);
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-white"
                                        title="Ajanona"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setDeletingProjId(p.id);
                                      }}
                                      className="p-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[10px] transition-all ml-auto"
                                      title="Fafana irety site"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Support Client (Messages & Reponses) */}
        {activeTab === 'support' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="text-slate-400">
                Hafatra sy olana nalefan'ny mpanjifa amin'ny Support :
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
                <button
                  onClick={() => setTicketFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] ${
                    ticketFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rehetra ({tickets.length})
                </button>
                <button
                  onClick={() => setTicketFilter('open')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] ${
                    ticketFilter === 'open'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tsy voavaly ({openTickets.length})
                </button>
                <button
                  onClick={() => setTicketFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] ${
                    ticketFilter === 'resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Voavaly ({tickets.length - openTickets.length})
                </button>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Tsy misy hafatra support amin'ity filtre ity.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between font-bold border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{t.userEmail}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'resolved' || t.reply
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                        }`}
                      >
                        {t.status === 'resolved' || t.reply ? 'Voavaly / Résolu' : 'En attente'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-amber-300 text-xs">
                        Sujet : {t.subject}
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap font-sans text-xs">
                        {t.message}
                      </div>
                    </div>

                    {/* Image Attachment if uploaded */}
                    {t.imageUrl && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold">
                          Capture d'écran nalefan'ny client :
                        </div>
                        <a
                          href={t.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block border border-slate-700 rounded-xl overflow-hidden max-w-xs"
                        >
                          <img
                            src={t.imageUrl}
                            alt="Capture client"
                            className="w-full max-h-48 object-cover hover:scale-105 transition-transform"
                          />
                        </a>
                      </div>
                    )}

                    {/* Existing Reply if already answered */}
                    {t.reply && (
                      <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-emerald-400 flex items-center justify-between text-[11px]">
                          <span>Valinteny nalefanao amin'ny client :</span>
                          {t.replyAt && (
                            <span className="text-[10px] text-emerald-300/70 font-mono">
                              {new Date(t.replyAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-200 whitespace-pre-wrap">{t.reply}</div>
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <label className="block text-slate-300 font-bold text-[11px]">
                        {t.reply ? 'Manoatra na mamaly indray (Modifier la réponse) :' : 'Mamaly ity hafatra ity :'}
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          placeholder="Soraty eto ny valinteny ho an'ity mpanjifa ity..."
                          value={replyInputs[t.id] ?? ''}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [t.id]: e.target.value }))
                          }
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 text-xs resize-none"
                        />
                        <button
                          onClick={() => handleSendReply(t.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 flex flex-col items-center justify-center gap-1 flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                          <span className="text-[10px]">Mandefa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Clés API Gemini & Rotation */}
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

        {/* TAB 5: Prompts Système & Règles IA */}
        {activeTab === 'prompts' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              Atsangano eto ireo <strong>Prompts Système & Règles IA</strong> izay hibaiko sy hifehy ny IA 100% mba tsy hanao fahadisoana (ohatra: tsy hamono ny kaody efa nisy, hampiditra options rehetra, sns).
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPromptContent.trim()) return;
                if (onAddSystemPrompt) {
                  onAddSystemPrompt(newPromptTitle || `Règle Admin ${systemPrompts.length + 1}`, newPromptContent.trim());
                }
                setNewPromptTitle('');
                setNewPromptContent('');
              }}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="font-bold text-white">Ajouter un nouveau Prompt / Règle stricte pour l'IA :</div>
              <input
                type="text"
                placeholder="Titre de la règle (ex: Règle anti-suppression de code)"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
              <textarea
                rows={3}
                placeholder="Contenu de la consigne stricte (ex: Tu dois obligatoirement préserver tous les fichiers existants et ne jamais supprimer le header/footer...)"
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer et Appliquer à l'IA (100% Respect)</span>
              </button>
            </form>

            <div className="space-y-2">
              <div className="font-bold text-slate-300">Règles & Prompts Système Actifs ({systemPrompts.length}) :</div>
              {systemPrompts.length === 0 ? (
                <div className="p-4 text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Tsy misy prompt na règle spécifique voarindra amin'izao fotoana izao.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {systemPrompts.map((p) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-xs">{p.title}</div>
                        <button
                          onClick={() => onToggleSystemPrompt && onToggleSystemPrompt(p.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            p.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {p.isActive ? 'Mandrehitra (Active)' : 'Nijanona (Inactive)'}
                        </button>
                      </div>
                      <div className="text-slate-300 text-[11px] font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                        {p.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Éditeur de Site & Contenu Global (Header à Footer) */}
        {activeTab === 'content' && (
          <div className="space-y-4 text-xs">
            <div className="text-slate-400">
              <strong>Editeur de Contenu Global (Header à Footer)</strong> : Ovay sy amboary mivantana ny lohateny, ny filazalazana, ary ny kaody HTML/CSS an'ireo tranonkala rehetra namboarina ao amin'ny système.
            </div>

            {allProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Tsy misy tranonkala ao amin'ny rafitra amin'izao fotoana izao.
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {allProjects.map((proj) => {
                  const isEditing = editingProjId === proj.id;
                  const idxFile = proj.files.find((f) => f.name === 'index.html') || proj.files[0];

                  return (
                    <div key={proj.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <span>{proj.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Propriétaire / Email : <strong className="text-indigo-300">{proj.userEmail || proj.userId}</strong>
                          </div>
                        </div>

                        {!isEditing ? (
                          <button
                            onClick={() => {
                              setEditingProjId(proj.id);
                              setEditTitle(proj.title);
                              setEditDescription(proj.description);
                              setEditHtmlContent(idxFile ? idxFile.content : '');
                            }}
                            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-xl font-bold transition-all text-xs flex items-center gap-1"
                          >
                            <span>Ovay (Modifier Header-Footer)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProjId(null);
                            }}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                          >
                            Hanafoana
                          </button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="text-slate-400 text-[11px] line-clamp-2">
                          {proj.description || 'Tsy misy filazalazana.'} — ({proj.files.length} fichiers)
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Titre du Site :</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Description / Résumé :</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">Contenu HTML (Header, Sections, Footer complets) :</label>
                            <textarea
                              rows={8}
                              value={editHtmlContent}
                              onChange={(e) => setEditHtmlContent(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-[11px] outline-none focus:border-indigo-500 resize-y"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                if (onUpdateProjectContent) {
                                  const newFiles = proj.files.map((f) => {
                                    if (f.name === 'index.html' || f === idxFile) {
                                      return { ...f, content: editHtmlContent };
                                    }
                                    return f;
                                  });
                                  if (!newFiles.some((f) => f.name === 'index.html')) {
                                    newFiles.unshift({ name: 'index.html', language: 'html', content: editHtmlContent });
                                  }
                                  onUpdateProjectContent(proj.id, newFiles, editTitle, editDescription);
                                }
                                setEditingProjId(null);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Tehirizo sy Sync (Save & Sync)</span>
                            </button>
                          </div>
                        </div>
                      )}
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

