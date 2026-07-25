import React, { useState } from 'react';
import { X, User, ShieldAlert, LogIn, Database, CheckCircle2, Mail, Lock, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithGoogle
} from '../lib/firebase';

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
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Tab/Mode selection (true = Sign Up / Inscription, false = Sign In / Connexion)
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);

  if (!isOpen) return null;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(userCredential.user, {
        displayName: cleanUsername,
      });
      
      onSwitchUser(cleanEmail, cleanUsername);
      onClose();
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      let errMsg = 'Nisy olana teo am-pisoratana anarana. Azafady andramo indray.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Efa misy mampiasa ity adiresy email ity!';
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
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim();

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
        errMsg = 'Tsy misy kaonty mampiasa io email io!';
      } else if (err.code === 'auth/wrong-password') {
        errMsg = 'Diso ny teny miafina (mot de passe) nampidirinao!';
      } else if (err.code === 'auth/invalid-credential') {
        errMsg = 'Email na teny miafina diso. Andramo indray.';
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser && fbUser.email) {
        onSwitchUser(fbUser.email, fbUser.displayName || 'Utilisateur Google');
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      // Fallback message with help for Vercel unauthorized domains
      setAuthError(
        "Raha amin'ny Vercel ianao no mampiasa azy, azafady ampidiro ao amin'ny Firebase Console (Authentication > Settings > Authorized domains) ilay domain Vercel-nao. Azonao ampiasaina koa ny fidirana amin'ny alalan'ny Email etsy ambany."
      );
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

        {authError && (
          <div className="p-3.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs rounded-2xl text-center leading-relaxed font-medium">
            {authError}
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
          <div className="space-y-5">
            {/* Primary Google Login Option */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-3 border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Miandry kely...' : 'Hifandray amin\'ny Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[11px] font-bold uppercase tracking-wider">Na ampiasao ny Email</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Teny miafina (Mot de passe)</span>
              </label>
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
          </div>
        )}

        {/* Quick Admin Connection Button (Only shown if not typing password) */}
        {!showAdminPasswordInput && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleAdminQuickLoginClick}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Accès Administrateur Direct (horlandobe@gmail.com)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
