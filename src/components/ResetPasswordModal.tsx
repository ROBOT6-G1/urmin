import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { auth, verifyPasswordResetCode, confirmPasswordReset } from '../lib/firebase';

interface ResetPasswordModalProps {
  oobCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  oobCode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !oobCode) return;

    setIsVerifying(true);
    setErrorText(null);

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setAccountEmail(email);
      })
      .catch((err) => {
        console.error('Verify oobCode error:', err);
        setErrorText('Efa lany daty na tsy manankery intsony ity rohy fanovana teny miafina ity. Azafady manaova mangataha indray.');
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [isOpen, oobCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorText('Ny teny miafina dia verifier-ina fa tsy maintsy farafahakeliny 6 karaktera!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorText('Tsy mitovy ny teny miafina roa nampidirinao!');
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessText('Tafita soa aman-tsara ny fanovana ny teny miafinao ho an\'i DEVWEBIA! Afaka miditra amin\'ny teny miafina vaovao ianao izao.');
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      console.error('Confirm password reset error:', err);
      setErrorText('Nisy olana tamin\'ny fanovana ny teny miafina. Azafady andramo indray na mangataha rohy vaovao.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">DEVWEBIA</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white">Hanova teny miafina</h2>
          </div>
        </div>

        {isVerifying ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs font-medium">Mamaritra ny kaontinao ao amin'i DEVWEBIA...</p>
          </div>
        ) : successText ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-emerald-200 leading-relaxed">{successText}</p>
          </div>
        ) : errorText && !accountEmail ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-rose-300 leading-relaxed">{errorText}</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Akatona
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {accountEmail && (
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-400">Kaonty : </span>
                <span className="font-bold text-indigo-300">{accountEmail}</span>
              </div>
            )}

            {errorText && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Teny miafina vaovao (Nouveau mot de passe)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Aseho indray ny teny miafina (Confirmer)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Ajanona
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mamaritra...</span>
                  </>
                ) : (
                  <span>Hanova teny miafina (DEVWEBIA)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
