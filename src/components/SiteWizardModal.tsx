import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Building2,
  Briefcase,
  ShoppingBag,
  Utensils,
  GraduationCap,
  Users,
  Stethoscope,
  Home,
  Plane,
  Dumbbell,
  Scale,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Bot,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';
import { SITE_CATEGORIES, SiteCategory, SiteOption } from '../data/siteTemplates';

interface SiteWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateSite: (prompt: string) => void;
}

export const SiteWizardModal: React.FC<SiteWizardModalProps> = ({
  isOpen,
  onClose,
  onGenerateSite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SiteCategory | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // For Step 2: Track which options are enabled, and for each option, whether mode is 'ai' or 'custom', and custom text
  const [optionConfigs, setOptionConfigs] = useState<{
    [optionId: string]: {
      enabled: boolean;
      mode: 'ai' | 'custom';
      customText: string;
    };
  }>({});

  if (!isOpen) return null;

  const handleSelectCategory = (category: SiteCategory) => {
    setSelectedCategory(category);
    // Initialize default option states (all enabled, mode='ai', customText='')
    const initialConfigs: {
      [optionId: string]: { enabled: boolean; mode: 'ai' | 'custom'; customText: string };
    } = {};
    category.options.forEach((opt) => {
      initialConfigs[opt.id] = {
        enabled: true,
        mode: 'ai',
        customText: '',
      };
    });
    setOptionConfigs(initialConfigs);
    setStep(2);
  };

  const handleToggleOption = (optionId: string) => {
    setOptionConfigs((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        enabled: !prev[optionId]?.enabled,
      },
    }));
  };

  const handleModeChange = (optionId: string, mode: 'ai' | 'custom') => {
    setOptionConfigs((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        mode,
      },
    }));
  };

  const handleCustomTextChange = (optionId: string, text: string) => {
    setOptionConfigs((prev) => ({
      ...prev,
      [optionId]: {
        ...prev[optionId],
        customText: text,
      },
    }));
  };

  const handleBuildPrompt = () => {
    if (!selectedCategory) return;

    let prompt = `MAMORONA TRANONKALA MATIHANINA SY COMPLET "${selectedCategory.name.toUpperCase()}" (MODÈLE SPÉCIFIQUE: ${selectedCategory.id})

Aza adino ireto toromarika LEHIBE SY TSY AZO ATVOHOKA ireto:
1. EXÉCUTION DE TOUTES LES 10 OPTIONS : Tu dois OBLIGATOIREMENT créer du code complet pour CHACUNE des 10 options ci-dessous sans en sauter aucune.
2. SARY PAR DÉFAUT SY IMAGES FONCTIONNELLES : Utilise UNIQUEMENT de vraies URLs Unsplash HD (https://images.unsplash.com/photo-...) et ajoute l'attribut onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';" sur CHAQUE balise <img>. Interdiction d'utiliser des chemins relatifs comme 'images/hero.jpg'.
3. DESIGN UNIQUE ET MODÈLE SPÉCIFIQUE : Utilise la charte graphique, les composants interactifs et les layouts dédiés à ce secteur (${selectedCategory.name}). Ne fais pas un design générique !
4. ARCHITECTURE MULTI-FICHIERS SÉPARÉE (Génère 15 à 20 fichiers bien organisés) :
   - Fichiers HTML séparés : index.html, apropos.html, services.html, realisations.html, faq.html, blog.html, contact.html, admin.html, etc.
   - Fichiers JS séparés : app.js, admin.js, firebase-config.js.
   - Fichier CSS dédié : style.css.
5. ESPACE ADMIN SÉCURISÉ & SYNC FIRESTORE EN DIRECT (admin.html + admin.js) :
   - Mot de passe admin par défaut "1234" (modifiable dans l'admin).
   - Formulaires d'édition pour TOUTES les 10 options et leurs URLs d'images.
   - Uploader de fichiers image avec compresseur HTML5 Canvas (<150KB) et aperçu miniature.
   - Gestionnaire de liste de produits / services / éléments.
   - Boîte de réception des messages et réservations.

Ireo 10 Sections / Options ampahafantarina sy amboarina amin'ity site ity:\n`;

    selectedCategory.options.forEach((opt, index) => {
      const cfg = optionConfigs[opt.id];
      if (cfg && cfg.enabled) {
        prompt += `\n- OPTION ${index + 1} (${opt.title}): `;
        if (cfg.mode === 'ai') {
          prompt += `[Réponse Sélectionnée - IA Hamorona content complet]: Fampahafantarana matihanina, sary Unsplash mifanaraka, sy texte complet feno noforonin'i IA.`;
        } else {
          prompt += `[Réponse Libre - Client Information]: "${cfg.customText.trim() || 'Fampahafantarana manokana ampidiriny client'}".`;
        }
      }
    });

    onGenerateSite(prompt);
    onClose();
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Utensils': return <Utensils className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Stethoscope': return <Stethoscope className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Plane': return <Plane className="w-6 h-6" />;
      case 'Dumbbell': return <Dumbbell className="w-6 h-6" />;
      case 'Scale': return <Scale className="w-6 h-6" />;
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {step === 1 ? 'Safidio ny Modèle de Site (12 Modèles)' : `Configuration: ${selectedCategory?.name}`}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1
                  ? 'Fasiana ny safidy rehetra araka ny 10 Options takian\'i IA.'
                  : 'Fasiana checkbox, réponse sélectionnée (IA) na réponse libre ho an\'ny section tsirairay.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SITE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="p-5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-all duration-300 group flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${cat.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-indigo-950 group-hover:text-indigo-300 text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      10 Options
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-bold">
                    <span>Configure-o eto</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Configure 10 Options */}
          {step === 2 && selectedCategory && (
            <div className="space-y-6">
              
              {/* Category summary banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${selectedCategory.color} text-white`}>
                    {getCategoryIcon(selectedCategory.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedCategory.name}</h3>
                    <p className="text-slate-400 text-xs">Misy options 10 azo configurable araka ny safidinao.</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  Soloina karazana hafa
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs text-indigo-200 leading-relaxed space-y-1">
                <p className="font-bold text-indigo-300">💡 Toromarika momba ireo réponse sélectionnée sy libre :</p>
                <p>• <strong>Réponse Sélectionnée (IA)</strong> : Hamorona fampahafantarana automatique matihanina ny IA (Mbola azo ovaina ao amin'ny Admin izany vao teraka ilay site).</p>
                <p>• <strong>Réponse Libre (Utilisateur)</strong> : Manoratra ny antsipiriany tianao apetraka mivantana amin'io section io ianao.</p>
              </div>

              {/* Options list */}
              <div className="space-y-4">
                {selectedCategory.options.map((opt, idx) => {
                  const cfg = optionConfigs[opt.id] || { enabled: true, mode: 'ai', customText: '' };

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        cfg.enabled
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/30 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Checkbox & Title */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`check-${opt.id}`}
                            checked={cfg.enabled}
                            onChange={() => handleToggleOption(opt.id)}
                            className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor={`check-${opt.id}`} className="cursor-pointer">
                            <span className="font-extrabold text-white text-sm block">
                              {opt.title}
                            </span>
                            <span className="text-slate-400 text-xs block">
                              {opt.description}
                            </span>
                          </label>
                        </div>

                        {/* Mode switch (AI vs Custom) */}
                        {cfg.enabled && (
                          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleModeChange(opt.id, 'ai')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                cfg.mode === 'ai'
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Réponse Sélectionnée (IA)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleModeChange(opt.id, 'custom')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                cfg.mode === 'custom'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Réponse Libre</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Custom Input Box if 'custom' mode selected */}
                      {cfg.enabled && cfg.mode === 'custom' && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <label className="block text-[11px] font-bold text-amber-400 mb-1.5">
                            Manoratra ny fampahafantarana tianao apetraka amin'ity section ity:
                          </label>
                          <textarea
                            rows={2}
                            value={cfg.customText}
                            onChange={(e) => handleCustomTextChange(opt.id, e.target.value)}
                            placeholder={`Antsipiriany ho an'ny ${opt.title} (Ohatra: Titre, Vokatra, Horaires, Laharana telephone...)...`}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        {step === 2 && (
          <div className="p-6 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between sticky bottom-0">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
            >
              Miverina
            </button>

            <button
              onClick={handleBuildPrompt}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>GÉNÉRER ITY SITE ITY (AVY AMIN'NY IA)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
