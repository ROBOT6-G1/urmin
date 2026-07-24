import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Code2,
  Eye,
  AlertTriangle,
  ShoppingBag,
  Briefcase,
  Utensils,
  Globe,
  Newspaper,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Building2,
  GraduationCap,
  Users,
  Stethoscope,
  Home,
  Plane,
  Dumbbell,
  Scale,
  Wrench,
  Search,
  Check,
  AlertCircle,
  CheckSquare,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, Project, UserProfile, CodeFile } from '../types';
import { SiteWizardModal } from './SiteWizardModal';
import { SITE_CATEGORIES } from '../data/siteTemplates';

interface ChatViewProps {
  user: UserProfile;
  currentProject: Project;
  projects: Project[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onSwitchToPreview: () => void;
  onOpenRecharge: () => void;
  isGenerating: boolean;
  onUpdateFiles: (projectIdOrFiles: any, maybeFiles?: any, maybeUrl?: string, lastDeployedAt?: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  user,
  currentProject,
  projects,
  messages,
  onSendMessage,
  onSwitchToPreview,
  onOpenRecharge,
  isGenerating,
  onUpdateFiles,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedSeoProjectId, setSelectedSeoProjectId] = useState(currentProject?.id || '');
  const [seoTagInput, setSeoTagInput] = useState('');
  const [seoIsChecked, setSeoIsChecked] = useState(true);
  const [seoSuccessMessage, setSeoSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentProject?.id) {
      setSelectedSeoProjectId(currentProject.id);
    }
  }, [currentProject?.id]);

  const handleInjectSeoTag = async (tag: string, projId: string) => {
    if (!tag.trim()) {
      alert("Ampidiro ny balise de vérification azafady.");
      return;
    }
    if (!seoIsChecked) {
      alert("Mba jereo ilay checkbox fanekena azafady mba ahafahan'ny IA mampiditra azy.");
      return;
    }

    const targetProject = projects.find((p) => p.id === projId);
    if (!targetProject) {
      alert("Tsy hita ilay projet.");
      return;
    }

    let rawFiles = targetProject.files || [];
    if (typeof rawFiles === 'string') {
      try {
        rawFiles = JSON.parse(rawFiles);
      } catch (e) {
        rawFiles = [];
      }
    }
    const filesList = [...rawFiles];
    const indexFileIndex = filesList.findIndex((f: any) => f.name === 'index.html');

    let tagToInject = tag.trim();
    if (!tagToInject.startsWith('<meta') && !tagToInject.startsWith('<link')) {
      tagToInject = `<meta name="google-site-verification" content="${tagToInject}" />`;
    }

    if (indexFileIndex >= 0) {
      let content = filesList[indexFileIndex].content;
      if (content.includes('</head>')) {
        if (content.includes('google-site-verification')) {
          content = content.replace(/<meta[^>]*google-site-verification[^>]*>/i, tagToInject);
        } else {
          content = content.replace('</head>', `  ${tagToInject}\n</head>`);
        }
      } else {
        content = `<head>\n  ${tagToInject}\n</head>\n` + content;
      }
      filesList[indexFileIndex] = {
        ...filesList[indexFileIndex],
        content,
      };
    } else {
      filesList.push({
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>\n<html lang="mg">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  ${tagToInject}\n  <title>${targetProject.title}</title>\n</head>\n<body>\n  <div id="root"><h1>${targetProject.title}</h1></div>\n</body>\n</html>`,
      });
    }

    // Call onUpdateFiles to save locally
    onUpdateFiles(targetProject.id, filesList);

    setSeoSuccessMessage(`Tafiditra soa aman-tsara ny balise de vérification ao amin'ny index.html an'ny "${targetProject.title}"! Azonao atao ny manao "Mettre à jour" na "Publish" an'io projet io amin'ny alalan'ny interface.`);
    setSeoTagInput('');

    // Trigger AI sync message
    const promptMessage = `Nampidiriko tao amin'ny projet "${targetProject.title}" ity balise Google Search Console ity: ${tagToInject}. Tehirizo ao amin'ny index.html azafady mba tsy ho very ary asio fanazavana fohy milaza fa tafiditra izany. Conserve ny fichier hafa rehetra tsy hovana ary aza mamorona site vaovao.`;
    await onSendMessage(promptMessage);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    if (user.credits <= 0) {
      onOpenRecharge();
      return;
    }

    const text = promptInput;
    setPromptInput('');
    onSendMessage(text);
  };

  const handleQuickPrompt = (presetText: string) => {
    if (user.credits <= 0) {
      onOpenRecharge();
      return;
    }
    onSendMessage(presetText);
  };

  const handleGenerateFromWizard = (promptText: string) => {
    if (user.credits <= 0) {
      onOpenRecharge();
      return;
    }
    onSendMessage(promptText);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Banner / Project Info */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">{currentProject.title}</span>
          <span className="text-slate-500 hidden sm:inline">• {currentProject.files.length} Fichier(s)</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-bold text-xs shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Assistant 12 Modèles & 10 Options</span>
          </button>
          
          <button
            onClick={onSwitchToPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Mijery alalana (Preview)</span>
          </button>
        </div>
      </div>

      {/* Out of credits warning banner */}
      {user.credits <= 0 && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-3 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>Lany crédit !</strong> Tsy afaka mamorona site intsony ilay IA. Mividia crédit mba hitohizana.
            </span>
          </div>
          <button
            onClick={onOpenRecharge}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg shadow-sm whitespace-nowrap transition-all"
          >
            Mividy Crédit izao
          </button>
        </div>
      )}

      {/* Main Discussion Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar max-w-4xl mx-auto w-full">
        {/* Welcome Card if first message */}
        {messages.length === 0 && (
          <div className="text-center py-8 px-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Inona no tranonkala tianao havoakan'i DEVWEB IA?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mampiasa ny <strong>Assistant Modèles (12 Types de Sites & 10 Options)</strong> mba hanamboarana site feno miaraka amin'ny réponse sélectionnée (IA) na réponse libre.
              </p>

              <button
                onClick={() => setIsWizardOpen(true)}
                className="mt-4 px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-indigo-500/20 inline-flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>SOKAFY NY ASSISTANT MODÈLES (12 SITES)</span>
              </button>
            </div>

            {/* Quick Categories Presets */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Ireo Modèles 12 azo fidiana (Miaraka amin'ny options 10)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-left text-xs">
                {SITE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setIsWizardOpen(true)}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-950/80 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-2.5 group"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                    <span className="font-bold truncate text-[11px] text-slate-200 group-hover:text-white">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {!isUser && (msg.text.toLowerCase().includes('search console') || msg.text.toLowerCase().includes('google-site-verification') || msg.text.toLowerCase().includes('site-verification') || msg.text.toLowerCase().includes('balise')) && (
                  <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-3.5">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-[11px]">
                      <Search className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Fitaovana fampidirana Balise Google SEO (IA)</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ampidiro eto ambany ny balise de vérification HTML azonao avy amin'ny Google Search Console mba hampidirana azy mivantana ao amin'ny <code className="text-indigo-300">index.html</code>.
                    </p>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Projet tiana hampidirana :
                      </label>
                      <select
                        value={selectedSeoProjectId}
                        onChange={(e) => setSelectedSeoProjectId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium outline-none focus:border-indigo-500 text-xs"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Balise Google site-verification (HTML Tag) :
                      </label>
                      <textarea
                        rows={2}
                        placeholder='Ohatra: <meta name="google-site-verification" content="..." />'
                        value={seoTagInput}
                        onChange={(e) => setSeoTagInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={seoIsChecked}
                        onChange={(e) => setSeoIsChecked(e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Manome alalana an'i DEVWEB IA hampiditra an'ity balise ity ao amin'ny fichier index.html an'ity projet voafidy ity.</span>
                    </label>

                    {seoSuccessMessage && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-start gap-1.5 leading-relaxed">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{seoSuccessMessage}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleInjectSeoTag(seoTagInput, selectedSeoProjectId)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Ampidiro ao amin'ny Code index.html (IA)</span>
                    </button>
                  </div>
                )}

                {/* Generated Code Badge Notification */}
                {msg.generatedCode && msg.generatedCode.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{msg.generatedCode.length} Fichier(s) namboarina!</span>
                    </div>
                    <button
                      onClick={onSwitchToPreview}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Jereo amin'ny Preview</span>
                    </button>
                  </div>
                )}

                {/* Token / Credit Info */}
                {msg.creditsDeducted ? (
                  <div className="text-[11px] text-slate-500 text-right font-mono pt-1">
                    ⚡ -{msg.creditsDeducted} Crédit (~15,000 Tokens)
                  </div>
                ) : null}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>DEVWEB IA dia eo am-panoratana ny code tranonkalanao...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Fixed Input Box */}
      <div className="p-4 bg-slate-900 border-t border-slate-800/80">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                user.credits > 0
                  ? 'Manorata prompt ho an\'i IA (ohatra: Ampio section témoignage sy mode sombre amin\'ity site ity...)'
                  : 'Lany crédit ianao! Mividia crédit afahanao manao site Web...'
              }
              disabled={isGenerating || user.credits <= 0}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 rounded-2xl py-3 pl-4 pr-14 text-sm text-white placeholder-slate-500 resize-none outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim() || user.credits <= 0}
              className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white shadow-md disabled:text-slate-600 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> 1 crédit = 15,000 tokens
            </span>
            <span>Appuyez sur Entrée pour envoyer</span>
          </div>
        </form>
      </div>

      {/* Interactive Site Generator Wizard Modal */}
      <SiteWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onGenerateSite={handleGenerateFromWizard}
      />
    </div>
  );
};
