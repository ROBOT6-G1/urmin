import React, { useState } from 'react';
import {
  X,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Globe,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Project, UserProfile } from '../types';

interface GoogleSeoModalProps {
  user: UserProfile;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateProjectFiles: (projectId: string, newFiles: any[], deployedUrl?: string) => void;
  onOpenConnectedApps?: () => void;
  onSendSeoPromptToAI?: (prompt: string) => void;
}

export const GoogleSeoModal: React.FC<GoogleSeoModalProps> = ({
  user,
  projects,
  isOpen,
  onClose,
  onUpdateProjectFiles,
  onOpenConnectedApps,
  onSendSeoPromptToAI,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [verificationTag, setVerificationTag] = useState<string>('');
  const [step, setStep] = useState<'input' | 'success' | 'deploying' | 'done'>('input');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deployStepText, setDeployStepText] = useState<string>('');
  const [isTroubleOpen, setIsTroubleOpen] = useState<boolean>(false);

  const [injectedFiles, setInjectedFiles] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleSaveAndInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationTag.trim()) {
      setErrorMessage("Ampidiro azafady ilay balise HTML na code de vérification Google.");
      return;
    }
    if (!selectedProjectId) {
      setErrorMessage("Misafidiana projet iray azafady.");
      return;
    }

    setErrorMessage('');

    // Find selected project
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) {
      setErrorMessage("Tsy hita ilay projet voafidy.");
      return;
    }

    // Inject verification tag into index.html
    let rawFiles = proj.files || [];
    if (typeof rawFiles === 'string') {
      try {
        rawFiles = JSON.parse(rawFiles);
      } catch (e) {
        rawFiles = [];
      }
    }
    let files = Array.isArray(rawFiles) ? rawFiles : [];
    if (files.length === 0) {
      files = [{
        name: 'index.html',
        path: 'index.html',
        content: `<!DOCTYPE html>\n<html lang="mg">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${proj.title}</title>\n  </head>\n  <body>\n    <div id="root"><h1>${proj.title}</h1></div>\n  </body>\n</html>`,
      }];
    }
    let indexFileIndex = files.findIndex((f: any) => f && (f.name === 'index.html' || f.path === 'index.html'));

    const isHtmlFile = verificationTag.toLowerCase().includes('.html') || (verificationTag.toLowerCase().trim().startsWith('google') && !verificationTag.includes('<'));
    let updatedFiles = [...files];
    let cleanTag = verificationTag.trim();

    if (isHtmlFile) {
      // Robustly extract the actual filename to avoid issues if they pasted "google-site-verification: google1234.html"
      const match = cleanTag.match(/(google[a-zA-Z0-9]+(?:\.html)?)/i);
      const fileName = match ? (match[1].toLowerCase().endsWith('.html') ? match[1] : `${match[1]}.html`) : (cleanTag.includes('.') ? cleanTag.trim() : `${cleanTag.trim()}.html`);
      const fileContent = `google-site-verification: ${fileName}`;
      // Add or update this verification file in updatedFiles
      const existingFileIdx = updatedFiles.findIndex((f: any) => f && (f.name === fileName || f.path === fileName));
      if (existingFileIdx >= 0) {
        updatedFiles[existingFileIdx] = {
          ...updatedFiles[existingFileIdx],
          content: fileContent,
        };
      } else {
        updatedFiles.push({
          name: fileName,
          path: fileName,
          content: fileContent,
        });
      }
    } else {
      // Robustly format verification meta tag for Google Search Console
      let metaTagStr = cleanTag;
      if (!metaTagStr.includes('google-site-verification')) {
        const contentMatch = metaTagStr.match(/content=["']([^"']+)["']/i);
        const token = contentMatch ? contentMatch[1] : metaTagStr.replace(/<[^>]*>/g, '').trim();
        metaTagStr = `<meta name="google-site-verification" content="${token}" />`;
      } else if (!metaTagStr.startsWith('<')) {
        metaTagStr = `<meta name="google-site-verification" content="${metaTagStr}" />`;
      }

      if (indexFileIndex >= 0) {
        let content = updatedFiles[indexFileIndex].content || '';
        // Remove any existing verification tag to avoid duplication
        content = content.replace(/<meta name="google-site-verification"[^>]*>/gi, '');

        // Inject inside <head> if possible, or add <head> if missing, while preserving 100% of existing code
        if (content.includes('</head>')) {
          content = content.replace('</head>', `    ${metaTagStr}\n  </head>`);
        } else if (content.includes('<head>')) {
          content = content.replace('<head>', `<head>\n    ${metaTagStr}`);
        } else if (content.match(/<html[^>]*>/i)) {
          const match = content.match(/<html[^>]*>/i);
          if (match && match.index !== undefined) {
            const insertIdx = match.index + match[0].length;
            content = content.slice(0, insertIdx) + `\n<head>\n    ${metaTagStr}\n</head>` + content.slice(insertIdx);
          } else {
            content = `<head>\n    ${metaTagStr}\n</head>\n` + content;
          }
        } else if (content.trim().length === 0) {
          content = `<!DOCTYPE html>\n<html lang="mg">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    ${metaTagStr}\n    <title>${proj.title}</title>\n  </head>\n  <body>\n    <div id="root"><h1>${proj.title}</h1></div>\n  </body>\n</html>`;
        } else {
          // Has content but no head/html tag - prepend head with metaTagStr without losing any code
          content = `<head>\n    ${metaTagStr}\n</head>\n` + content;
        }

        updatedFiles[indexFileIndex] = {
          ...updatedFiles[indexFileIndex],
          content,
        };
      } else {
        // Create index.html if not present
        updatedFiles.push({
          name: 'index.html',
          path: 'index.html',
          content: `<!DOCTYPE html>\n<html lang="mg">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    ${metaTagStr}\n    <title>${proj.title}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
        });
      }
    }

    setInjectedFiles(updatedFiles);
    // Update project files in state/storage
    onUpdateProjectFiles(selectedProjectId, updatedFiles);

    // Transition to success state
    setStep('success');
  };

  const handleTriggerVercelDeploy = async () => {
    if (!user.vercelToken || !user.vercelToken.trim()) {
      if (confirm("Tsy mbola misy Vercel Token voatahiry. Tianao ve ny hampiditra azy ao amin'ny Connected Apps?")) {
        onClose();
        if (onOpenConnectedApps) onOpenConnectedApps();
      }
      return;
    }

    setStep('deploying');
    setDeployStepText("Mampifandray amin'ny serveur Vercel sy manao compilation...");

    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) {
      setErrorMessage("Tsy hita ilay projet.");
      setStep('success');
      return;
    }

    let files = injectedFiles;
    if (!files || files.length === 0) {
      let rawFiles = proj.files || [];
      if (typeof rawFiles === 'string') {
        try { rawFiles = JSON.parse(rawFiles); } catch (e) { rawFiles = []; }
      }
      files = Array.isArray(rawFiles) && rawFiles.length > 0 ? rawFiles : [{
        name: 'index.html',
        path: 'index.html',
        content: `<!DOCTYPE html>\n<html lang="mg">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${proj.title}</title>\n  </head>\n  <body>\n    <div id="root"><h1>${proj.title}</h1></div>\n  </body>\n</html>`,
      }];
    }
    const repoName = proj.githubRepo || proj.title;

    try {
      // 1. Sync GitHub if connected
      if (user.githubToken && user.githubUsername && repoName) {
        setDeployStepText("Mandefa ny code sy ny balise SEO ao amin'ny GitHub...");
        await fetch('/api/deploy/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubToken: user.githubToken,
            githubUsername: user.githubUsername,
            repoName,
            files,
          }),
        });
      }

      // 2. Deploy to Vercel via backend API
      setDeployStepText("Déploiement réel amin'ny Vercel CDN (live URL)...");
      const vercelRes = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vercelToken: user.vercelToken,
          repoName,
          files,
        }),
      });

      const vercelData = await vercelRes.json();
      if (!vercelRes.ok || !vercelData.success) {
        throw new Error(vercelData.error || 'Tsy nahatomombana ny déploiement Vercel.');
      }

      const finalUrl = vercelData.url || vercelData.aliasUrl;
      proj.deployedUrl = finalUrl;
      onUpdateProjectFiles(selectedProjectId, files, finalUrl);

      setDeployStepText("Tafakatra soa aman-tsara amin'ny Vercel (Live URL: " + finalUrl + ")");
      setTimeout(() => {
        setStep('done');
      }, 1000);
    } catch (err: any) {
      console.error('Vercel SEO deploy error:', err);
      setErrorMessage(err.message || 'Misy olana tamin\'ny déploiement Vercel.');
      setStep('success');
    }
  };

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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-lg">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">SEO Google Search Console</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ampidiro ao amin'ny Google Search Console ny site-nao mba hahazoana indexing haingana sy ho hita amin'ny Google.
          </p>
        </div>

        {/* Step 1: Link & Guide to Google Console */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">1</span>
              <span>Rindran'ny Google Search Console</span>
            </div>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Mandehana amin'ny Google Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            • Safidio ny <strong>Domaine prefix</strong> (raha mbola mandeha gratuit na mbola tsy manana domaine personnel ohatra ny Vercel URL).<br />
            • Ampidiro ny lien efa déployer (ohatra: <code className="text-indigo-300 font-mono">https://anao.vercel.app</code>).<br />
            • Midina kely any ambany amin'ny safidy <strong>"Autre méthode de validation"</strong> ary safidio ny <strong className="text-indigo-300">Balise HTML</strong>.<br />
            • Adikao (Copier) ilay balise omen'i Google ohatra hoe: <code className="text-slate-300 font-mono">&lt;meta name="google-site-verification" content="..." /&gt;</code>.
          </p>

          {onSendSeoPromptToAI && (
            <button
              onClick={() => {
                const proj = projects.find((p) => p.id === selectedProjectId) || projects[0];
                const title = proj ? proj.title : 'My Site';
                const promptText = `Miarahaba DEVWEB IA! Tiako handeha amin'ny Google Search Console ity projet "${title}" ity. Ampio aho hampiditra ny balise de vérification Google HTML ao amin'ny fichier index.html. Angataho amiko ilay balise de vérification azafady, dia ampidiro ao amin'ny index.html an'ity projet ity ihany izany.`;
                onSendSeoPromptToAI(promptText);
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Hampiditra amin'ny alalan'ny IA (DEVWEB IA)</span>
            </button>
          )}
        </div>

        {/* Main Flow based on Step */}
        {step === 'input' && (
          <form onSubmit={handleSaveAndInject} className="space-y-4 text-xs">
            {/* Select project */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Safidio ny Projet misy ilay lien Vercel:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-indigo-500 text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.files?.length || 1} fichiers)
                  </option>
                ))}
              </select>
            </div>

            {/* Input Tag */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Ampidiro eto ilay Balise HTML / Code de vérification Google :
              </label>
              <textarea
                required
                rows={3}
                placeholder='Ohatra: <meta name="google-site-verification" content="abc123xyz..." />'
                value={verificationTag}
                onChange={(e) => setVerificationTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Enregistrer (Asio ny Balise ao amin'ny Projet)</span>
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Succès !</h3>
              <p className="text-xs text-slate-300">
                Tafiditra soa aman-tsara ao amin'ny project <strong className="text-emerald-300">index.html</strong> ny balise SEO Google anao.
              </p>
            </div>

            <button
              onClick={handleTriggerVercelDeploy}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Mettre à jour le site (Déploiement Vercel)</span>
            </button>
          </div>
        )}

        {step === 'deploying' && (
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Fanaovana Déploiement automatique...</h3>
              <p className="text-xs text-cyan-300 font-mono">{deployStepText}</p>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="p-6 bg-indigo-950/70 border border-indigo-500/50 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Terminé !</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tafakatra soa aman-tsara any amin'ny Vercel ny code vaovao misy ny Google SEO balise.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300 font-medium">
                👉 Miverena indray izao any amin'ny <strong>Google Search Console</strong> ary tsindrio ny bokitra <strong>Vérifier</strong> mba hamaranana ny indexing!
              </div>
            </div>

            <button
              onClick={() => {
                setStep('input');
                setVerificationTag('');
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Hanao hafa ber
            </button>
          </div>
        )}

        {/* Collapsible Troubleshooting Section */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
          <button
            type="button"
            onClick={() => setIsTroubleOpen(!isTroubleOpen)}
            className="w-full px-4 py-3 text-left font-bold text-slate-300 text-xs flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inona no antony raha miteny hoe "Introuvable" i Google?</span>
            </span>
            <span className="text-slate-500">{isTroubleOpen ? '▲' : '▼'}</span>
          </button>
          {isTroubleOpen && (
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed max-h-64 overflow-y-auto">
              <p>
                Raha efa nampidirinao ny balise na ny rakitra (file) nefa mbola milaza i Google fa <strong>"introuvable"</strong> na tsy hita izany, ireto misy antony matetika sy ny vahaolana:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong className="text-slate-200">1. Vercel Deployment Protection (Authentication) :</strong> 
                  Raha mampiasa ny Vercel default ianao, dia matetika no velona ho azy ny "Authentication / Deployment Protection" amin'ny fanasongadinana ny site. 
                  Mandehana any amin'ny <span className="text-indigo-300 font-bold">Vercel Dashboard &gt; Projects &gt; [Projet-nao] &gt; Settings &gt; Deployment Protection</span> dia <strong>vonoy (Disable)</strong> ny "Vercel Authentication". Raha tsy izany, dia voasakana ny robots an'i Google satria mangataka login foana ny site.
                </li>
                <li>
                  <strong className="text-slate-200">2. Diso ny URL any amin'ny Google Console :</strong> 
                  Hamarino tsara fa tsy misy diso tsipelina ilay URL nampidirinao any amin'ny Google Search Console, ary mampiasa <code className="text-indigo-300 font-mono">https://</code> fa tsy <code className="text-indigo-300 font-mono">http://</code>.
                </li>
                <li>
                  <strong className="text-slate-200">3. Vercel Cache / Fotoana fiparitahana (Propagation) :</strong> 
                  Mila miandry 30 segondra hatramin'ny 1 minitra vao miparitaka tsara any amin'ny CDN Vercel rehetra maneran-tany ny fanovana farany. Andramo mitsidika mivantana ilay site-nao aloha dia jereo amin'ny "View Page Source" raha efa hita tokoa ny balise.
                </li>
                <li>
                  <strong className="text-slate-200">4. Cloudflare na Firewall (WAF) :</strong> 
                  Raha mampiasa domaine custom ampifandraisina amin'ny Cloudflare ianao, hamarino fa tsy misy Security Rule na "Under Attack Mode" mandeha izay mety hanakana an'i Google (fahadisoana 403 na Captcha).
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
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
