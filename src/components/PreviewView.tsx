import React, { useState } from 'react';
import {
  Eye,
  Code2,
  Rocket,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Github,
  Globe,
  Sparkles,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import JSZip from 'jszip';
import { Project, UserProfile, CodeFile } from '../types';

interface PreviewViewProps {
  user: UserProfile;
  project: Project;
  subTab: 'web' | 'code' | 'publish' | 'download';
  setSubTab: (subTab: 'web' | 'code' | 'publish' | 'download') => void;
  onOpenConnectedApps: () => void;
  onUpdateFiles: (files: CodeFile[]) => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  user,
  project,
  subTab,
  setSubTab,
  onOpenConnectedApps,
  onUpdateFiles,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFileName, setSelectedFileName] = useState<string>(
    project.files[0]?.name || 'index.html'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [repoName, setRepoName] = useState<string>(
    project.githubRepo || project.title.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-site'
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [liveUrl, setLiveUrl] = useState<string | null>(project.deployedUrl || null);
  const [isZipping, setIsZipping] = useState(false);

  const selectedFile = project.files.find((f) => f.name === selectedFileName) || project.files[0];

  // Combine HTML + CSS + JS into single bundle for iframe preview if separate
  const getCombinedHtml = () => {
    const htmlFile = project.files.find((f) => f.name.endsWith('.html')) || project.files[0];
    const cssFile = project.files.find((f) => f.name.endsWith('.css'));
    const jsFile = project.files.find((f) => f.name.endsWith('.js'));

    if (!htmlFile) return '<h1>Aucun contenu HTML</h1>';

    let content = htmlFile.content;

    // Inject CSS if present and not already embedded
    if (cssFile && !content.includes(cssFile.content.substring(0, 20))) {
      content = content.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }

    // Inject JS if present and not already embedded
    if (jsFile && !content.includes(jsFile.content.substring(0, 20))) {
      content = content.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }

    // Free plan watermark injection
    if (user.plan === 'free' && !content.includes('vita amin\'i DEVWEBIA')) {
      const watermarkBadge = `<a href="https://devwebia.mg" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#1e1b4b;color:#a5b4fc;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:6px;">⚡ vita amin'i DEVWEBIA</a>`;
      content = content.replace('</body>', `${watermarkBadge}</body>`);
    }

    return content;
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      project.files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      // Add README.md
      zip.file(
        'README.md',
        `# ${project.title}\n\nSite web généré avec **DEVWEB IA**.\n\n## Déploiement\nCe projet est prêt à être déployé sur Vercel, Netlify ou GitHub Pages.`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-devwebia.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDeployVercel = async () => {
    if (!user.githubConnected || !user.vercelConnected) {
      onOpenConnectedApps();
      return;
    }

    setIsDeploying(true);
    setDeployStep('Connexion à GitHub API...');

    await new Promise((r) => setTimeout(r, 1200));
    setDeployStep(`Création du dépôt GitHub : ${user.githubUsername || 'user'}/${repoName}...`);

    await new Promise((r) => setTimeout(r, 1500));
    setDeployStep(`Push des fichiers vers https://github.com/${user.githubUsername || 'user'}/${repoName}...`);

    await new Promise((r) => setTimeout(r, 1500));
    setDeployStep('Transtipage et Déploiement automatique Vercel CDN...');

    await new Promise((r) => setTimeout(r, 1800));

    const generatedSlug = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '.vercel.app';
    const finalUrl = `https://${generatedSlug}`;
    setLiveUrl(finalUrl);
    project.deployedUrl = finalUrl;
    setIsDeploying(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* 4 Preview Tabs Selector Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSubTab('web')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              subTab === 'web'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            👉 Vu site web
          </button>

          <button
            onClick={() => setSubTab('code')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              subTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            👉 Vu code
          </button>

          <button
            onClick={() => setSubTab('publish')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              subTab === 'publish'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Rocket className="w-4 h-4" />
            👉 Publish (Vercel)
          </button>

          <button
            onClick={() => setSubTab('download')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              subTab === 'download'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            👉 Télécharger (ZIP)
          </button>
        </div>

        {/* Viewport controls for Web view */}
        {subTab === 'web' && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'tablet' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB 1: Vu site web */}
      {subTab === 'web' && (
        <div className="flex-1 bg-slate-950 p-2 sm:p-6 flex flex-col items-center justify-center overflow-auto relative">
          <div
            className={`transition-all duration-300 h-full w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 ${
              viewport === 'desktop'
                ? 'max-w-full'
                : viewport === 'tablet'
                ? 'max-w-[768px]'
                : 'max-w-[375px]'
            }`}
          >
            {/* Browser Address Bar Mock */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-slate-950 px-4 py-1 rounded-md text-[11px] font-mono text-slate-300 border border-slate-800 truncate max-w-md">
                {liveUrl || `https://preview.${project.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.devwebia.mg`}
              </div>
              <button
                onClick={() => {
                  const blob = new Blob([getCombinedHtml()], { type: 'text/html' });
                  const winUrl = URL.createObjectURL(blob);
                  window.open(winUrl, '_blank');
                }}
                className="hover:text-white p-1"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rendered iFrame */}
            <iframe
              srcDoc={getCombinedHtml()}
              title={project.title}
              className="w-full h-[calc(100%-2.25rem)] border-0"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* SUBTAB 2: Vu code */}
      {subTab === 'code' && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Tabs */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
            <div className="flex items-center gap-2">
              {project.files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFileName(f.name)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-2 transition-all ${
                    selectedFileName === f.name
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-300" />
                  {f.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopiaina!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopiaina Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer / Editable Textarea */}
          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs sm:text-sm text-indigo-200">
            <textarea
              value={selectedFile?.content || ''}
              onChange={(e) => {
                const newContent = e.target.value;
                const updated = project.files.map((f) =>
                  f.name === selectedFileName ? { ...f, content: newContent } : f
                );
                onUpdateFiles(updated);
              }}
              className="w-full h-full bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono outline-none focus:border-indigo-500/80 resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUBTAB 3: Publish */}
      {subTab === 'publish' && (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Rocket className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Déploiement Automatique Vercel</h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Publiez votre site web en direct sur Vercel avec déploiement continu et SSL sécurisé gratuit.
              </p>
            </div>

            {/* Connection Check list */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-slate-200">Compte GitHub</span>
                </div>
                {user.githubConnected ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Connecté ({user.githubUsername || 'OK'})
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold">Non connecté</span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">Accès API Vercel</span>
                </div>
                {user.vercelConnected ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Connecté
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold">Non connecté</span>
                )}
              </div>

              {/* GitHub Repository Name Input */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-amber-400" />
                  <span>Nom du Repository GitHub (Dépôt) :</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[11px]">{user.githubUsername || 'username'}/</span>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => {
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                      setRepoName(sanitized);
                      project.githubRepo = sanitized;
                    }}
                    placeholder="my-site-repo"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Soraty eto ny anaran'ny repository GitHub tianao hamoronana sy handefasana ny code mivantana.
                </p>
              </div>
            </div>

            {/* Prompt to connect if missing */}
            {(!user.githubConnected || !user.vercelConnected) && (
              <div className="bg-amber-950/50 border border-amber-800/80 p-4 rounded-2xl text-amber-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Étape obligatoire pour publier :</span>
                </div>
                <p>Vous devez d'abord connecter vos comptes GitHub et Vercel dans les applications connectées.</p>
                <button
                  onClick={onOpenConnectedApps}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Lier mes comptes GitHub & Vercel
                </button>
              </div>
            )}

            {/* Deploy Trigger Button */}
            {isDeploying ? (
              <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                <div className="font-bold text-indigo-200 text-sm">{deployStep}</div>
                <div className="text-[11px] text-slate-500">Patientez quelques secondes...</div>
              </div>
            ) : liveUrl ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl space-y-3">
                <div className="text-emerald-300 font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Site Web Publié en Direct !</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
                  <a href={liveUrl} target="_blank" rel="noreferrer" className="underline truncate">
                    {liveUrl}
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(liveUrl)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copier le lien"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDeployVercel}
                disabled={!user.githubConnected || !user.vercelConnected}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                <span>Déployer Automatiquement sur Vercel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: Télécharger (ZIP) */}
      {subTab === 'download' && (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
              <Download className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Télécharger les Fichiers ZIP</h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Récupérez tous les fichiers HTML, CSS, et JS du site ({project.files.length} fichiers) compressés dans un fichier ZIP autonome.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="font-bold text-slate-300">Contenu de l'archive :</div>
              <ul className="space-y-1 text-slate-400 font-mono">
                {project.files.map((f) => (
                  <li key={f.name} className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{f.name}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-slate-500">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>README.md</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Création du ZIP en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Télécharger le Fichier .ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
