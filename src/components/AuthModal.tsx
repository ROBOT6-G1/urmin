import React, { useState } from 'react';
import { X, User, ShieldAlert, LogIn, Database, CheckCircle2, Mail, Lock, UserPlus, MapPin, ShieldCheck, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from '../lib/firebase';
import {
  validateEmailNotAlias,
  requestGeolocationPermission,
  verifyAntiDoubleAccount,
  registerDeviceSecurityRecord,
} from '../services/securityService';

interface AuthModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSwitchUser: (email: string, name?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  isOpen,
  onClose,
  onSwitchUser,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [securityStatusText, setSecurityStatusText] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Tab/Mode selection (true = Sign Up / Inscription, false = Sign In / Connexion)
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [resetSuccessText, setResetSuccessText] = useState<string | null>(null);
  const [emailInUsePrompt, setEmailInUsePrompt] = useState<boolean>(false);

  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Azafady, ampidiro ny adiresy email-nao aloha mba handefasana ny hamerenana ny mot de passe!');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setResetSuccessText(null);

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      setResetSuccessText(`Efa nalefa amin'ny email-nao (${cleanEmail}) avy amin'i DEVWEBIA ny hafatra. Kitiho fotsiny ilay bouton "Hanova teny miafina / Reset Password" na "DEVWEBIA" ao amin'ny imailakao mba hidirana amin'ny takelaka hanovana ny mot de passe!`);
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      if (err.code === 'auth/user-not-found') {
        setAuthError(`Tsy misy kaonty mampiasa ity email ity (${cleanEmail}).`);
      } else {
        setAuthError('Tsy nahomby ny fandefasana ny imailaka hamerenana ny teny miafina. Azafady andramo indray.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setSecurityStatusText(null);
    setEmailInUsePrompt(false);
    setResetSuccessText(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // 1. Basic Form Validations
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Azafady, ampidiro adiresy email mety !');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setAuthError('Ny teny miafina dia tsy maintsy mihoatra ny litera 6!');
      setIsLoading(false);
      return;
    }
    if (!cleanUsername) {
      setAuthError("Azafady, ampidiro ny anaranao (Nom d'utilisateur)!");
      setIsLoading(false);
      return;
    }

    // 2. Email Alias Validation (No '+' aliases or temporary email domains)
    const emailValidation = validateEmailNotAlias(cleanEmail);
    if (!emailValidation.isValid) {
      setAuthError(emailValidation.reason || 'Tsy manaiky adiresy email alias na temporaire!');
      setIsLoading(false);
      return;
    }

    try {
      // 3. Request Geolocation Permission (Non-blocking security check)
      setSecurityStatusText('Mizaha ny fiarovana sy géolocalisation...');
      let userLocation = { latitude: 0, longitude: 0, accuracy: 0 };
      try {
        userLocation = await requestGeolocationPermission();
      } catch {
        // Fallback gracefully without blocking registration
      }

      // 4. Anti-Double Account Verification (Analyze Device Fingerprint & Location)
      setSecurityStatusText('Manao analyse Chrome Device ID & Anti-Double Compte...');
      const securityCheck = await verifyAntiDoubleAccount(cleanEmail, userLocation);
      
      if (!securityCheck.allowed) {
        setAuthError(securityCheck.reason || 'Tsy avela manao double compte!');
        setIsLoading(false);
        setSecurityStatusText(null);
        return;
      }

      // 5. Create Firebase Auth Account
      setSecurityStatusText('Mamorona kaonty feno...');
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(userCredential.user, {
        displayName: cleanUsername,
      });

      // 6. Register Device Security Record in Firestore
      if (securityCheck.deviceInfo) {
        await registerDeviceSecurityRecord(userCredential.user.uid, cleanEmail, securityCheck.deviceInfo);
      }
      
      onSwitchUser(cleanEmail, cleanUsername);
      onClose();
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      let errMsg = 'Nisy olana teo am-pisoratana anarana. Azafady andramo indray.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = `Efa misy kaonty mampiasa ity adiresy email ity (${cleanEmail})!`;
        setEmailInUsePrompt(true);
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Diso ny adiresy email nampidirinao!';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Malemy loatra ny teny miafina! (Litera 6 farafahakeliny)';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Tsy mbola mavitrika (activé) ny Email/Password ao amin\'ny Firebase Console. Azafady jereo ny Configuration.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsLoading(false);
      setSecurityStatusText(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setEmailInUsePrompt(false);
    setResetSuccessText(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Azafady, ampidiro adiresy email mety !');
      setIsLoading(false);
      return;
    }
    if (!password) {
      setAuthError('Azafady, ampidiro ny teny miafina!');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const displayName = userCredential.user.displayName || 'Mpanjifa DEVWEBIA';
      
      onSwitchUser(cleanEmail, displayName);
      onClose();
    } catch (err: any) {
      console.error('Sign In Error:', err);
      let errMsg = 'Diso ny email na ny teny miafina (mot de passe)!';
      if (err.code === 'auth/user-not-found') {
        errMsg = `Tsy mbola misy kaonty mampiasa ity email ity (${cleanEmail}). Tsindrio ny 'Fisoratana' mba hamoronana kaonty vaovao.`;
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Diso ny email na ny teny miafina (mot de passe) nampidirinao. Jereo tsara ny litera madinika/maventy na tsindrio "Mot de passe oublié".';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Tsy mbola mavitrika (activé) ny Email/Password ao amin\'ny Firebase Console. Azafady jereo ny Configuration.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminQuickLoginClick = () => {
    setAuthError(null);
    setShowAdminPasswordInput(true);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '1234') {
      onSwitchUser('horlandobe@gmail.com', 'Admin Horlando');
      onClose();
    } else {
      setAuthError('Teny miafina (Mot de passe) diso ho an\'ny Administrateur !');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-lg">
            {isSignUp ? <UserPlus className="w-6 h-6 text-indigo-400" /> : <User className="w-6 h-6 text-indigo-400" />}
          </div>
          <h2 className="text-2xl font-black text-white">
            {isSignUp ? 'Fisoratana anarana' : 'Fidirana amin\'ny kaonty'}
          </h2>
          <p className="text-slate-400 text-xs px-2 leading-relaxed">
            {isSignUp 
              ? 'Mamorona kaonty vaovao mba afahana mitahiry ny site-nao sy mampiasa ny hery rehetra an\'ny IA.' 
              : 'Hifandray amin\'ny kaontinao manokana mba ho voatahiry tsara sy tsy ho very ny tantaran\'ny asa sy projet-nao rehetra.'}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bonus 5 Crédits maimaimpoana avy hatrany rehefa tafiditra!</span>
          </div>
        </div>

        {securityStatusText && (
          <div className="p-3.5 bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs rounded-2xl flex items-center justify-center gap-2.5 animate-pulse font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{securityStatusText}</span>
          </div>
        )}

        {resetSuccessText && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-2xl text-center leading-relaxed font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{resetSuccessText}</span>
          </div>
        )}

        {authError && (
          <div className="p-3.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs rounded-2xl text-center leading-relaxed font-medium space-y-2">
            <div className="flex items-start gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
            {emailInUsePrompt && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setAuthError(null);
                  setEmailInUsePrompt(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Tsindrio eto mba hiditra (Fidirana / Connexion)</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Selection */}
        {!showAdminPasswordInput && (
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => { setIsSignUp(false); setAuthError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${!isSignUp ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white'}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Fidirana (Connexion)</span>
            </button>
            <button
              onClick={() => { setIsSignUp(true); setAuthError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isSignUp ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-white'}`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Fisoratana (Inscription)</span>
            </button>
          </div>
        )}

        {showAdminPasswordInput ? (
          <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Teny miafina ho an'ny Administrateur</span>
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Ampidiro ny Mot de passe..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAdminPasswordInput(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-750 transition-colors"
              >
                Hiverina
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black transition-colors"
              >
                Hampifandray
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] text-slate-300 space-y-1.5">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fiarovana Avo Lenta (Anti-Double Compte)</span>
                </div>
                <ul className="space-y-1 text-slate-400 pl-1 list-disc list-inside leading-relaxed">
                  <li><strong>Géolocalisation & Fiarovana:</strong> Fiarovana automatique ny kaonty ambonin'ny IP adresse sy appareil-nao.</li>
                  <li><strong>Analyse IP & Chrome ID:</strong> Hijery sy hanara-maso IP Adresse sy Chrome Device Fingerprint ny système.</li>
                  <li><strong>Tsy manaiky Email Alias:</strong> Tsy ekena ny email misy alias '+' na mampiasa temp mail.</li>
                </ul>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span>Anaranao (Nom d'utilisateur)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ohatra: Horlando Be"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-indigo-400" />
                <span>Adiresy Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ohatra: anarana@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Teny miafina (Mot de passe)</span>
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {isLoading 
                  ? 'Miandry kely...' 
                  : isSignUp 
                    ? 'Hisoratra anarana maimaimpoana' 
                    : 'Hampifandray amin\'ny Email'}
              </span>
            </button>

            {/* Firebase Auto-Sync indicator */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl text-xs space-y-1.5 mt-2">
              <div className="font-bold text-indigo-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Durable Cloud Persistence (Firestore)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ny asa, ny projet, ary ny tantara rehetra dia voatahiry mivantana sy azo antoka ao amin'ny database Firestore mba tsy ho very rehefa miala na manadio browser cache.
              </p>
            </div>
          </form>
        )}

        {/* Admin login button removed */}
      </div>
    </div>
  );
};
