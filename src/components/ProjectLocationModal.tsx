import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Save,
  Sparkles,
  Building2,
  Phone,
  Clock,
  Globe2,
  FileText,
  Compass,
  Check,
  Send,
} from 'lucide-react';
import { Project, ProjectLocation, CodeFile } from '../types';

interface ProjectLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentProjectId: string;
  onUpdateProjectFiles: (projectId: string, newFiles: CodeFile[]) => void;
  onSendLocationPromptToAI: (prompt: string) => void;
}

export const ProjectLocationModal: React.FC<ProjectLocationModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onUpdateProjectFiles,
  onSendLocationPromptToAI,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId);
  const [locationData, setLocationData] = useState<ProjectLocation>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Madagascar',
    phone: '',
    openingHours: '',
    googleMapsEmbed: '',
    notes: '',
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync selected project and pre-fill form
  useEffect(() => {
    if (currentProjectId) {
      setSelectedProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    if (!targetProject) return;

    // Check if location object exists on project
    if (targetProject.location) {
      setLocationData({
        name: targetProject.location.name || '',
        address: targetProject.location.address || '',
        city: targetProject.location.city || '',
        postalCode: targetProject.location.postalCode || '',
        country: targetProject.location.country || 'Madagascar',
        phone: targetProject.location.phone || '',
        openingHours: targetProject.location.openingHours || '',
        googleMapsEmbed: targetProject.location.googleMapsEmbed || '',
        notes: targetProject.location.notes || '',
      });
      return;
    }

    // Otherwise check for location.json file in project.files
    let files: CodeFile[] = [];
    if (Array.isArray(targetProject.files)) {
      files = targetProject.files;
    } else if (typeof targetProject.files === 'string') {
      try {
        files = JSON.parse(targetProject.files);
      } catch {
        files = [];
      }
    }

    const locFile = files.find((f) => f && f.name === 'location.json');
    if (locFile && locFile.content) {
      try {
        const parsed = JSON.parse(locFile.content);
        setLocationData({
          name: parsed.name || '',
          address: parsed.address || '',
          city: parsed.city || '',
          postalCode: parsed.postalCode || '',
          country: parsed.country || 'Madagascar',
          phone: parsed.phone || '',
          openingHours: parsed.openingHours || '',
          googleMapsEmbed: parsed.googleMapsEmbed || '',
          notes: parsed.notes || '',
        });
        return;
      } catch {
        // Ignore JSON parse failure
      }
    }

    // Default empty
    setLocationData({
      name: targetProject.title || '',
      address: '',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar',
      phone: '',
      openingHours: 'Lundi - Samedi: 08h00 - 18h00',
      googleMapsEmbed: '',
      notes: '',
    });
  }, [targetProject?.id]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectLocation, value: string) => {
    setLocationData((prev) => ({ ...prev, [field]: value }));
  };

  const createUpdatedFiles = (): CodeFile[] => {
    if (!targetProject) return [];

    let rawFiles = targetProject.files || [];
    if (typeof rawFiles === 'string') {
      try {
        rawFiles = JSON.parse(rawFiles);
      } catch {
        rawFiles = [];
      }
    }
    const currentFiles: CodeFile[] = Array.isArray(rawFiles) ? [...rawFiles] : [];

    const jsonContent = JSON.stringify(
      {
        projectId: targetProject.id,
        projectTitle: targetProject.title,
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        postalCode: locationData.postalCode,
        country: locationData.country,
        phone: locationData.phone,
        openingHours: locationData.openingHours,
        googleMapsEmbed: locationData.googleMapsEmbed,
        notes: locationData.notes,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    );

    const locationFile: CodeFile = {
      name: 'location.json',
      language: 'json',
      content: jsonContent,
    };

    const existingIdx = currentFiles.findIndex(
      (f) => f && f.name === 'location.json'
    );

    if (existingIdx >= 0) {
      currentFiles[existingIdx] = locationFile;
    } else {
      currentFiles.push(locationFile);
    }

    return currentFiles;
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProject) return;

    const newFiles = createUpdatedFiles();
    targetProject.location = locationData;
    onUpdateProjectFiles(targetProject.id, newFiles);

    setSuccessMessage("✅ TAFIDITRA SY VOATAHIRY AMIN'NY 'location.json' NY LOCALISATION!");
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  const handleSaveAndSendToAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProject) return;

    const newFiles = createUpdatedFiles();
    targetProject.location = locationData;
    onUpdateProjectFiles(targetProject.id, newFiles);

    const promptText = `Miarahaba DEVWEB IA, nampidirina sy voatahiry am-pahombiazana ao amin'ny paràmetren'ny projet ny Localisation vaovao ho an'ny "${targetProject.title}".

Noforonina sy nosoratana vaovao ny fichier 'location.json'. Indro ny mombamomba azy :
- Nom/Établissement: ${locationData.name || 'N/A'}
- Adresse: ${locationData.address || 'N/A'}, ${locationData.city || ''} ${locationData.country || ''}
- Téléphone: ${locationData.phone || 'N/A'}
- Horaires: ${locationData.openingHours || 'N/A'}
- Notes: ${locationData.notes || 'N/A'}
${locationData.googleMapsEmbed ? `- Google Maps Iframe / Link: ${locationData.googleMapsEmbed}` : ''}

Azafady mba ampidiro sy amboary mivantana ao amin'ny tranonkala (sections Contact, Carte Google Maps, Pied de Page / Footer, En-tête / Header) mampiasa ity fichier 'location.json' mitokana ity !`;

    onClose();
    onSendLocationPromptToAI(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Localisation Manuelle du Projet
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Fichier location.json
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ataovy ampy tsara ny toerana misy anao mba hampidiran'ny IA carte sy infos exactes amin'ny site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Project Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Safidio ny Projet tiana hametrahana Localisation :
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.title} ({p.files?.length || 1} fichiers)
                </option>
              ))}
            </select>
          </div>

          {/* Alert Info */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
            <Compass className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Ahoana no fiasan'ity Localisation ity?</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Rehefa fenoinao ireto champs ireto dia hamorona fichier <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">location.json</code> manokana izy. Avy eo ny IA dia hampiasa io fichier io mba hametrahana carte Google Maps interactive, section Contact sy pied de page exact amin'ny tranonkala.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name / Établissement */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anaran'ny Toerana / Établissement :
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="ohatra: Boutique Mahajanga, DevWeb Store, Restaurant Le Gourmet"
                  value={locationData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse complète / Lalana / Lot :
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="ohatra: Lot II M 40 Bis, Rue de l'Indépendance"
                  value={locationData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tanàna / Ville / Région :
              </label>
              <input
                type="text"
                placeholder="ohatra: Antananarivo, Tamatave, Majunga"
                value={locationData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Code Postal & Pays */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Code Postal :
                </label>
                <input
                  type="text"
                  placeholder="101"
                  value={locationData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pays :
                </label>
                <input
                  type="text"
                  placeholder="Madagascar"
                  value={locationData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Phone / Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Téléphone / WhatsApp du Lieu :
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="+261 34 00 000 00"
                  value={locationData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ora Fisokafana / Horaires :
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Lundi - Samedi : 08h00 - 18h00"
                  value={locationData.openingHours}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Google Maps Embed or Link */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lien Google Maps na Code Iframe Embed (Optionnel) :
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={2}
                  placeholder={`Mampidira lien Google Maps na <iframe src="https://www.google.com/maps/embed?..." ...></iframe>`}
                  value={locationData.googleMapsEmbed}
                  onChange={(e) => handleChange('googleMapsEmbed', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 custom-scrollbar"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Point sur Google Maps ou code d'intégration HTML.
              </p>
            </div>

            {/* Notes / Instructions */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Toromarika fanampiny / Remarques :
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="ohatra: En face de la Pharmacie Principale, Parking disponible"
                  value={locationData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveOnly}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Tahiry amin'i location.json ihany</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndSendToAI}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Enregistrer & Intégrer par IA 🚀</span>
            <Send className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
};
