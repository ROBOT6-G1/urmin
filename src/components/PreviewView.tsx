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
  AlertTriangle,
} from 'lucide-react';
import JSZip from 'jszip';
import { Project, UserProfile, CodeFile } from '../types';

interface PreviewViewProps {
  user: UserProfile;
  project: Project;
  projects?: Project[];
  subTab: 'web' | 'code' | 'publish' | 'download';
  setSubTab: (subTab: 'web' | 'code' | 'publish' | 'download') => void;
  onOpenConnectedApps: () => void;
  onUpdateFiles: (projectIdOrFiles: any, maybeFiles?: any, maybeUrl?: string, lastDeployedAt?: string) => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  user,
  project,
  projects,
  subTab,
  setSubTab,
  onOpenConnectedApps,
  onUpdateFiles,
}) => {
  // Normalize project.files safely
  let rawFiles = project.files || [];
  if (typeof rawFiles === 'string') {
    try {
      rawFiles = JSON.parse(rawFiles);
    } catch (e) {
      rawFiles = [];
    }
  }
  const files: any[] = Array.isArray(rawFiles) && rawFiles.length > 0 ? rawFiles : [
    { name: 'index.html', path: 'index.html', content: `<!DOCTYPE html><html><head><title>${project.title}</title></head><body><div id="root"><h1>${project.title}</h1></div></body></html>` }
  ];

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFileName, setSelectedFileName] = useState<string>(
    files[0]?.name || 'index.html'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [repoName, setRepoName] = useState<string>(
    project.githubRepo || project.title.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-site'
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [deployError, setDeployError] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(project.deployedUrl || null);
  const [isZipping, setIsZipping] = useState(false);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);

  const handleUpdateSpecificProject = async (p: Project) => {
    if (!user.vercelToken || !user.vercelToken.trim()) {
      alert("Token Vercel manokana (vc_...) no ilaina mba hahafahana manao publication mivantana. Ampidiro ao amin'ny Apps Connectées ny Token Vercel-nao.");
      onOpenConnectedApps();
      return;
    }

    setUpdatingProjectId(p.id);

    try {
      let pRawFiles = p.files || [];
      if (typeof pRawFiles === 'string') {
        try { pRawFiles = JSON.parse(pRawFiles); } catch (e) { pRawFiles = []; }
      }
      const pFiles = Array.isArray(pRawFiles) && pRawFiles.length > 0 ? pRawFiles : [
        { name: 'index.html', path: 'index.html', content: `<!DOCTYPE html><html><head><title>${p.title}</title></head><body><div id="root"><h1>${p.title}</h1></div></body></html>` }
      ];

      const pRepoName = p.githubRepo || p.title.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-site';

      // 1. Sync to GitHub
      if (user.githubToken && user.githubUsername) {
        await fetch('/api/deploy/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubToken: user.githubToken,
            githubUsername: user.githubUsername,
            repoName: pRepoName,
            files: pFiles,
          }),
        });
      }

      // 2. Deploy to Vercel
      const vercelRes = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vercelToken: user.vercelToken,
          repoName: pRepoName,
          files: pFiles,
        }),
      });

      const vercelData = await vercelRes.json();
      if (!vercelRes.ok || !vercelData.success) {
        throw new Error(vercelData.error || 'Tsy nahatomombana ny déploiement Vercel.');
      }

      const finalUrl = vercelData.url || vercelData.aliasUrl;
      
      p.deployedUrl = finalUrl;
      p.lastDeployedAt = new Date().toISOString();
      p.githubRepo = pRepoName;

      // Update in global state
      onUpdateFiles(p.id, pFiles, finalUrl, new Date().toISOString());

      if (p.id === project.id) {
        setLiveUrl(finalUrl);
      }

      alert("Tafakatra soa aman-tsara ny mise à jour ho an'ny projet: " + p.title);
    } catch (err: any) {
      console.error('Error updating specific project:', err);
      alert("Nisy olana tamin'ny mise à jour: " + (err.message || String(err)));
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const selectedFile = files.find((f: any) => f && f.name === selectedFileName) || files[0];

  // Combine HTML + CSS + JS into single bundle for iframe preview if separate
  const getCombinedHtml = () => {
    const htmlFile = files.find((f: any) => f && f.name && f.name.endsWith('.html')) || files[0];
    const cssFile = files.find((f: any) => f && f.name && f.name.endsWith('.css'));
    const jsFile = files.find((f: any) => f && f.name && f.name.endsWith('.js'));

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

      files.forEach((file: any) => {
        if (file && file.name) {
          zip.file(file.name, file.content || '');
        }
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
    if (!user.vercelToken || !user.vercelToken.trim()) {
      setDeployError('Token Vercel manokana (vc_...) no ilaina mba hahafahana manao publication mivantana. Ampidiro ao amin\'ny kaonty connectés ny Token Vercel-nao.');
      onOpenConnectedApps();
      return;
    }

    if (!user.githubConnected || !user.vercelConnected) {
      onOpenConnectedApps();
      return;
    }

    setIsDeploying(true);
    setDeployError(null);

    try {
      // Step 1: Sync and push repository files to GitHub if token is set
      if (user.githubToken && user.githubUsername) {
        setDeployStep(`Mampifandray sy mandefa ny fichier ao amin'ny GitHub (${user.githubUsername}/${repoName})...`);
        const ghRes = await fetch('/api/deploy/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubToken: user.githubToken,
            githubUsername: user.githubUsername,
            repoName,
            files,
          }),
        });

        const ghData = await ghRes.json();
        if (!ghRes.ok) {
          console.warn('Notice sync GitHub:', ghData);
        }
      }

      // Step 2: Deploy to Vercel via backend API
      setDeployStep('Manatanteraka ny Déploiement Réel amin\'ny Vercel CDN...');
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
        throw new Error(vercelData.error || 'Tsy nahatomombana ny déploiement ao amin\'ny Vercel.');
      }

      const finalUrl = vercelData.url || vercelData.aliasUrl;
      setLiveUrl(finalUrl);
      project.deployedUrl = finalUrl;
      project.lastDeployedAt = new Date().toISOString();
      project.githubRepo = repoName;
      onUpdateFiles(project.id, files, finalUrl, new Date().toISOString());
    } catch (err: any) {
      console.error('Deployment error:', err);
      setDeployError(err.message || 'Misy olana tamin\'ny publication mivantana.');
    } finally {
      setIsDeploying(false);
    }
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
              {files.map((f: any) => f && f.name && (
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
                const updated = files.map((f: any) =>
                  f && f.name === selectedFileName ? { ...f, content: newContent } : f
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
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" /> Connecté ({user.githubUsername || 'OK'})
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/30">
                    ✕ Non connecté
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">Accès API Vercel</span>
                </div>
                {user.vercelConnected ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" /> Connecté
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/30">
                    ✕ Non connecté
                  </span>
                )}
              </div>

              {/* Direct token generator links */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-400">Lien direct hangalana token :</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 font-bold text-[11px] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Maka GitHub Token ↗</span>
                  </a>
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[11px] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Maka Vercel Token ↗</span>
                  </a>
                </div>
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
              <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl text-amber-200 text-xs space-y-3 shadow-lg">
                <div className="font-bold flex items-center gap-2 text-amber-300 text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span>Étape obligatoire pour la publication :</span>
                </div>
                <p className="leading-relaxed">
                  Mbola tsy connectés ny kaontinao <strong>GitHub</strong> sy <strong>Vercel</strong>. Tsy maintsy manao connexion an'ireo ianao aloha vao afaka manao publication direct amin'ny Vercel.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenConnectedApps}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Lier mes comptes GitHub & Vercel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Deploy Error Alert */}
            {deployError && (
              <div className="bg-rose-950/80 border border-rose-500/60 p-4 rounded-2xl text-rose-200 text-xs space-y-2.5 shadow-lg">
                <div className="font-bold flex items-center gap-2 text-rose-300 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Olana tamin'ny publication Vercel :</span>
                </div>
                <p className="leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-rose-300">
                  {deployError}
                </p>
                <button
                  onClick={onOpenConnectedApps}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Manamarina / Hanova ny Vercel Auth Token</span>
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

            {/* List of all deployed links across projects */}
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-800 text-left">
              <div className="text-xs font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Liens efa déployer rehetra amin'ny projetao :</span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(projects || [project]).map((p) => {
                  const url = p.deployedUrl || `https://${(p.githubRepo || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-'))}.vercel.app`;
                  
                  // Calculate live update status based on updatedAt and lastDeployedAt timestamps
                  const isDeployed = !!p.deployedUrl;
                  const isUpToDate = isDeployed && p.lastDeployedAt && new Date(p.lastDeployedAt) >= new Date(p.updatedAt);

                  return (
                    <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="truncate space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-200 truncate max-w-[120px] block">{p.title}</span>
                          {isDeployed ? (
                            isUpToDate ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                                à jour
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
                                mettre à jour
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold">
                              Non publié
                            </span>
                          )}
                        </div>
                        <a href={url} target="_blank" rel="noreferrer" className="text-cyan-400 font-mono text-[11px] hover:underline truncate block">
                          {url}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {isDeployed && !isUpToDate && (
                          <button
                            onClick={() => handleUpdateSpecificProject(p)}
                            disabled={updatingProjectId === p.id}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            title="Mettre à jour le projet"
                          >
                            {updatingProjectId === p.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Mise à jour...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3" />
                                <span>Mettre à jour</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            alert("Kopie soa aman-tsara: " + url);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                          title="Kopiaina"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Sokafy"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
