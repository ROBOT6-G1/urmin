import React from 'react';
import {
  X,
  Info,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Target,
  Sparkles,
  ShieldCheck,
  Award,
  Globe,
  Rocket,
  Code2,
  Heart,
  MessageCircle,
  Building,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-pink-500/20 to-emerald-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-xl">
            <Info className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Momba Anay / À propos de nous</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            DEVWEBIA Madagascar
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Plateforme IA n°1 Malagasy ho an'ny famoronana tranonkala matihanina sy haingana.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {/* Section 1: Informations Clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Toerana misy anay (Localisation) :</span>
              </div>
              <p className="text-white font-mono text-xs leading-relaxed pl-6">
                MADAGASIKARA, RÉGION SAVA, DISTRICT D'ANTALAHA, CODE POSTAL 206
              </p>
            </div>

            {/* Date Creation */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Daty noforonina (Date de création) :</span>
              </div>
              <p className="text-white font-mono text-xs leading-relaxed pl-6">
                25 Jolay 2026 (25 Juillet 2026)
              </p>
            </div>
          </div>

          {/* Contact Direct Section */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Fifandraisana sy Support Client :</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Miasa 24/7
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href="tel:0323911654"
                className="flex items-center gap-2.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Laharana finday :</div>
                  <div className="text-white font-mono font-bold text-xs">032 39 116 54</div>
                </div>
              </a>

              <a
                href="https://wa.me/261323911654"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">WhatsApp Direct :</div>
                  <div className="text-emerald-400 font-bold text-xs">+261 32 39 116 54</div>
                </div>
              </a>
            </div>
          </div>

          {/* Section 2: Objectifs & Vision */}
          <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm border-b border-slate-800 pb-2">
              <Target className="w-4 h-4" />
              <span>Inona no Tanjona sy Objectifs lehibe (Nos Objectifs) ?</span>
            </div>
            <ul className="space-y-2.5 text-slate-300 leading-relaxed text-xs">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Démocratisation ny Création Web :</strong> Hanampy ny Malagasy rehetra (mpandraharaha, e-commerçants, mpianatra, orinasa, fikambanana) hahatsangana tranonkala matihanina amin'ny vidiny kely sy ara-potoana.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Teknolojia IA eo am-tanana :</strong> Fampiasana ny Inteligensa Artifisialy Gemini feno mba hamadihana ny hevitra, ny feo (Vocal) na ny sary ho kaody React, HTML, CSS, sy Tailwind manaraka ny toetron'ny vanim-potoana.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Fampahafantarana sy E-commerce Local :</strong> Fampifandraisana mora ny tranonkala amin'ny fomba fandoavam-bola eto Madagasikara (Mvola, Orange Money, Airtel Money) sy fampidirana ny commande amin'ny WhatsApp.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong className="text-white">Autonomie sy Sanction Code :</strong> Tsy fihazonana na fanafenana ny kaody—afaka télécharGena amin'ny ZIP ny kaody rehetra ho an'ny hosting na servera manokana.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3: Engagements & Valeurs */}
          <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm border-b border-slate-800 pb-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Ireo Engagements sy Agny fiarovana :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fiarovana sy Sécurité</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Hébergement sécurisé amin'ny Google Cloud Platform sy Firebase Firestore miaraka amin'ny chiffrement SSL.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Haingana sy Performance</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Sites optimisés amin'ny Vercel CDN, Tailwind CSS responsive, ary Google SEO prêt pour l'indexation.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 pb-1 border-t border-slate-800/60">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <span>Natao amin'ny fitiavana ho an'i Madagasikara</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
              <span>• DEVWEBIA 2026</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
