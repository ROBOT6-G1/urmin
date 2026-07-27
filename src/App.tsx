/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { PreviewView } from './components/PreviewView';
import { RechargeModal } from './components/RechargeModal';
import { ConnectedAppsModal } from './components/ConnectedAppsModal';
import { CustomDomainModal } from './components/CustomDomainModal';
import { SupportModal } from './components/SupportModal';
import { ReferralModal } from './components/ReferralModal';
import { FaqModal } from './components/FaqModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { GuideModal } from './components/GuideModal';
import { ProjectsHistoryModal } from './components/ProjectsHistoryModal';
import { GoogleSeoModal } from './components/GoogleSeoModal';
import { ProjectLocationModal } from './components/ProjectLocationModal';
import { AboutModal } from './components/AboutModal';
import { CustomAiKeyModal } from './components/CustomAiKeyModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { auth, onAuthStateChanged, db } from './lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

import {
  UserProfile,
  Project,
  ChatMessage,
  PaymentRequest,
  SupportTicket,
  GeminiApiKey,
  CodeFile,
  SystemPrompt,
} from './types';
import {
  getStoredUser,
  saveUser,
  getStoredProjects,
  saveProjects,
  getCurrentProject,
  setCurrentProjectId,
  getStoredPayments,
  savePayments,
  getStoredTickets,
  saveTickets,
  getStoredGeminiKeys,
  saveGeminiKeys,
  INITIAL_PROJECT_FILES,
  INITIAL_PROJECT,
} from './services/storage';
import { detectPendingReferralCode, applyReferralCode } from './services/referralService';
import {
  dbSyncUser,
  dbSaveUser,
  dbFetchUserProjects,
  dbSaveProject,
  dbDeleteProject,
  dbFetchPayments,
  dbSavePayment,
  dbFetchTickets,
  dbSaveTicket,
  dbAuditAndResetUnpaidProUsers,
  dbFetchAllUsers,
} from './services/firestoreService';

export default function App() {
  const [user, setUser] = useState<UserProfile>(getStoredUser);
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [currentProjectIdState, setCurrentProjectIdState] = useState<string>(
    () => getCurrentProject()?.id || ''
  );

  // Strictly filter projects by current logged-in user account for privacy
  const userProjects = useMemo(() => {
    if (!user) return projects;
    return projects.filter(
      (p) => (user.id && p.userId === user.id) || (user.email && p.userEmail && p.userEmail === user.email)
    );
  }, [projects, user?.id, user?.email]);

  const currentProject =
    userProjects.find((p) => p.id === currentProjectIdState) ||
    userProjects[0] ||
    projects[0] ||
    INITIAL_PROJECT;

  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [previewSubTab, setPreviewSubTab] = useState<'web' | 'code' | 'publish' | 'download'>('web');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: "Manao ahoana! Izaho no DEVWEB IA. Inona no tranonkala (site web) tianao havoakantsika androany? Soraty amin'ny teny Malagasy na Français ny fahaizanao na safidio amin'ireo fitaovana eto ambany.",
      timestamp: new Date().toISOString(),
      generatedCode: currentProject?.files || [],
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isConnectedAppsOpen, setIsConnectedAppsOpen] = useState(false);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGoogleSeoOpen, setIsGoogleSeoOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCustomAiKeyOpen, setIsCustomAiKeyOpen] = useState(false);
  const [rechargeInitialType, setRechargeInitialType] = useState<'credits' | 'ai_key_sub'>('credits');
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);

  // Detect Firebase password reset code in URL query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if ((mode === 'resetPassword' || mode === 'resetCode') && oobCode) {
      setResetOobCode(oobCode);
    }
  }, []);

  // Admin Data state
  const [payments, setPayments] = useState<PaymentRequest[]>(getStoredPayments);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets);
  const [geminiKeys, setGeminiKeys] = useState<GeminiApiKey[]>(getStoredGeminiKeys);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetch('/api/admin/prompts')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.prompts)) {
          setSystemPrompts(data.prompts);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddSystemPrompt = async (title: string, content: string) => {
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts)) {
        setSystemPrompts(data.prompts);
      }
    } catch (err) {
      console.error('Error adding system prompt:', err);
    }
  };

  const handleToggleSystemPrompt = async (id: string) => {
    try {
      const res = await fetch('/api/admin/prompts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts)) {
        setSystemPrompts(data.prompts);
      }
    } catch (err) {
      console.error('Error toggling system prompt:', err);
    }
  };

  const handleUpdateProjectContent = (projectId: string, files: CodeFile[], title: string, description: string) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          title,
          description,
          files,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    const target = updatedProjects.find((p) => p.id === projectId);
    if (target) {
      dbSaveProject(target).catch(console.error);
    }
  };

  // Sync Gemini Keys to LocalStorage and Backend Server
  useEffect(() => {
    saveGeminiKeys(geminiKeys);
    fetch('/api/admin/keys/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: geminiKeys }),
    }).catch((err) => {
      console.warn('Error syncing keys with server:', err);
    });

    if (user?.email === 'horlandobe@gmail.com') {
      const syncToFirestore = async () => {
        try {
          const docRef = doc(db, 'admin_config', 'gemini_keys');
          await setDoc(docRef, { keys: geminiKeys }, { merge: true });
        } catch (err) {
          console.warn('[DEVWEBIA] Error saving synced keys to Firestore from client:', err);
        }
      };
      syncToFirestore();
    }
  }, [geminiKeys, user?.email]);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        handleSwitchUser(fbUser.email, fbUser.displayName || 'Utilisateur Google');
      }
    });
    return () => unsubscribe();
  }, []);

  // Detect referral code from URL/localStorage on mount
  useEffect(() => {
    const pendingCode = detectPendingReferralCode();
    if (pendingCode && !user.referredBy && user.referralCode !== pendingCode) {
      applyReferralCode(user, pendingCode).then((res) => {
        if (res.success && res.updatedUser) {
          setUser(res.updatedUser);
        }
      });
    }
  }, []);

  useEffect(() => {
    saveUser(user);
    if (user && user.id && user.id !== 'usr_client_default') {
      dbSaveUser(user).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Synchronize all user and admin data from Firestore on mount / user ID changes and periodic sync
  useEffect(() => {
    const syncDatabaseData = async () => {
      if (!user?.id || user.id === 'usr_client_default') return;
      try {
        // A. Sync User Profile
        const syncedUser = await dbSyncUser(user);
        if (JSON.stringify(syncedUser) !== JSON.stringify(user)) {
          setUser(syncedUser);
        }

        // B. Sync Projects
        const dbProjects = await dbFetchUserProjects(user.id, user.email);
        const localProjs = getStoredProjects();
        const mergedMap = new Map<string, Project>();

        dbProjects.forEach((p) => {
          if (p && p.id) {
            mergedMap.set(p.id, p);
          }
        });

        localProjs.forEach((lp) => {
          if (!lp || !lp.id) return;
          const dbP = mergedMap.get(lp.id);
          if (!dbP) {
            mergedMap.set(lp.id, lp);
            dbSaveProject(lp).catch(console.error);
          } else {
            const dbTime = new Date(dbP.updatedAt || 0).getTime();
            const localTime = new Date(lp.updatedAt || 0).getTime();
            const dbFilesCount = Array.isArray(dbP.files) ? dbP.files.length : 0;
            const localFilesCount = Array.isArray(lp.files) ? lp.files.length : 0;
            if (localTime > dbTime || localFilesCount > dbFilesCount) {
              mergedMap.set(lp.id, lp);
              dbSaveProject(lp).catch(console.error);
            }
          }
        });

        const finalMergedProjects = Array.from(mergedMap.values());
        if (finalMergedProjects.length > 0) {
          setProjects(finalMergedProjects);
        }

        // C. Sync Payments
        const isAdmin = user.email === 'horlandobe@gmail.com' || user.email === 'eventuelleboutique@gmail.com';
        const dbPayments = await dbFetchPayments(user.id, user.email, isAdmin);
        if (dbPayments.length > 0) {
          setPayments((prev) => {
            const updated = [...dbPayments];
            prev.forEach((lp) => {
              if (!dbPayments.some((dp) => dp.id === lp.id)) {
                updated.push(lp);
                dbSavePayment(lp).catch((e) => console.error('Error uploading local payment to DB:', e));
              }
            });
            return updated;
          });
        }

        // D. Sync Tickets
        const dbTickets = await dbFetchTickets(user.id, user.email, isAdmin);
        if (dbTickets.length > 0) {
          setTickets((prev) => {
            const updated = [...dbTickets];
            prev.forEach((lt) => {
              if (!dbTickets.some((dt) => dt.id === lt.id)) {
                updated.push(lt);
                dbSaveTicket(lt).catch((e) => console.error('Error uploading local ticket to DB:', e));
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn('Firestore database sync failed:', err);
      }
    };

    syncDatabaseData();
    const syncInterval = setInterval(syncDatabaseData, 45000);
    const handleFocus = () => syncDatabaseData();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  // Ensure every user account has an isolated workspace project
  useEffect(() => {
    if (userProjects.length === 0 && user?.id) {
      const defaultUserProj: Project = {
        id: 'proj_' + Date.now(),
        userId: user.id,
        userEmail: user.email || '',
        isPrivate: true,
        title: 'Projet Privé ' + (user.name || 'Client'),
        description: 'Espace de travail privé sy sécurisé ho an\'i ' + (user.email || ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [
          {
            name: 'index.html',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <title>Espace Privé - ${user.name || 'Client'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
  <div class="text-center space-y-4 max-w-md">
    <div class="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
      🔒
    </div>
    <h1 class="text-3xl font-extrabold text-indigo-300">Espace Privé DEVWEBIA</h1>
    <p class="text-slate-400 text-sm">
      Tonga soa ${user.name || 'Client'}! Natsangana ny espace de travail privé-nao. Antsoy ny IA ao amin'ny Chat mba hamoronana ny site-nao.
    </p>
  </div>
</body>
</html>`,
          },
        ],
        versions: [],
      };
      setProjects((prev) => [defaultUserProj, ...prev]);
      setCurrentProjectIdState(defaultUserProj.id);
    }
  }, [user?.id, user?.email, userProjects.length]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  // Project Switching & History Management
  const handleSelectProject = (id: string) => {
    setCurrentProjectIdState(id);
    setCurrentProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setMessages([
        {
          id: 'msg_' + Date.now(),
          sender: 'ai',
          text: `Espace de travail ho an'ny site "${proj.title}" dia vonona. Nampidirina ireo fichiers ${proj.files.length} (${proj.files.map(f => f.name).join(', ')}). Inona no tiantsika hovaina na hanampiana amin'ity site ity?`,
          timestamp: new Date().toISOString(),
          generatedCode: proj.files,
        },
      ]);
    }
  };

  const handleModifyWithAI = (id: string) => {
    handleSelectProject(id);
    setActiveTab('chat');
  };

  const handlePreviewProject = (id: string) => {
    handleSelectProject(id);
    setActiveTab('preview');
    setPreviewSubTab('web');
  };

  const handlePublishProject = (id: string) => {
    handleSelectProject(id);
    setActiveTab('preview');
    setPreviewSubTab('publish');
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, title: newTitle, updatedAt: new Date().toISOString() };
          dbSaveProject(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  };

  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    const dupId = 'proj_' + Date.now();
    const duplicatedProj: Project = {
      ...target,
      id: dupId,
      title: `${target.title} (Kopiapo)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: JSON.parse(JSON.stringify(target.files)),
      versions: JSON.parse(JSON.stringify(target.versions || [])),
    };

    setProjects((prev) => [duplicatedProj, ...prev]);
    dbSaveProject(duplicatedProj).catch(console.error);
    handleSelectProject(dupId);
  };

  const handleDeleteProject = (id: string) => {
    dbDeleteProject(id).catch(console.error);

    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      saveProjects(remaining);

      if (remaining.length === 0) {
        const newId = 'proj_' + Date.now();
        const newProj: Project = {
          id: newId,
          userId: user.id,
          userEmail: user.email,
          title: 'Tranonkala Vaovao',
          description: 'Tranonkala namboarina tamin\'i DEVWEBIA',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          files: INITIAL_PROJECT_FILES,
          versions: [],
        };
        dbSaveProject(newProj).catch(console.error);
        setCurrentProjectIdState(newId);
        saveProjects([newProj]);
        return [newProj];
      } else {
        if (currentProjectIdState === id && remaining.length > 0) {
          handleSelectProject(remaining[0].id);
        }
        return remaining;
      }
    });
  };

  const handleNewProject = () => {
    const newId = 'proj_' + Date.now();
    const newProj: Project = {
      id: newId,
      userId: user.id,
      userEmail: user.email,
      isPrivate: true,
      title: `Projet Privé ${userProjects.length + 1}`,
      description: 'Site web privé namboarina tamin\'i DEVWEBIA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        {
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <title>Tranonkala Privé</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-extrabold text-indigo-400">Tranonkala Privé Vaovao</h1>
    <p class="text-slate-400">Toroy hevitra ao amin'i Chat IA ny momba ity site ity...</p>
  </div>
</body>
</html>`,
        },
      ],
      versions: [],
    };

    setProjects((prev) => [newProj, ...prev]);
    dbSaveProject(newProj).catch(console.error);
    setCurrentProjectIdState(newId);
    setCurrentProjectId(newId);
    setActiveTab('chat');
    setMessages([
      {
        id: 'msg_' + Date.now(),
        sender: 'ai',
        text: `Projet privé vaovao natsangana ho an'i ${user.email}! Hazavao eto ny tranonkala tianao namboarina...`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // AI Web Generation handler
  const handleSendMessage = async (text: string) => {
    const isUsingCustomKey = Boolean(user.useCustomKey && user.aiKeySubActive && user.customGeminiApiKey);

    if (!isUsingCustomKey && user.credits <= 0) {
      setRechargeInitialType('credits');
      setIsRechargeOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    let currentFilesList: CodeFile[] = [];
    if (Array.isArray(currentProject?.files)) {
      currentFilesList = currentProject.files;
    } else if (typeof currentProject?.files === 'string') {
      try {
        currentFilesList = JSON.parse(currentProject.files);
      } catch (e) {
        currentFilesList = [];
      }
    }

    try {
      const res = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          existingFiles: currentFilesList,
          userPlan: user.plan,
          customDomain: user.customDomain,
          clientFirebase: (user.firebaseConnected && user.firebaseApiKey && user.firebaseProjectId) ? {
            apiKey: user.firebaseApiKey,
            authDomain: user.firebaseAuthDomain || `${user.firebaseProjectId}.firebaseapp.com`,
            projectId: user.firebaseProjectId,
            storageBucket: user.firebaseStorageBucket || `${user.firebaseProjectId}.appspot.com`,
            databaseId: user.firebaseDatabaseId || '(default)',
          } : null,
          whatsappNumber: user.whatsappNumber || null,
          customGeminiApiKey: isUsingCustomKey ? user.customGeminiApiKey : null,
          customGeminiModel: user.customGeminiModel || 'gemini-3.6-flash',
          aiKeySubActive: Boolean(user.aiKeySubActive),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Deduct credit (0 if using custom key, 1 if using platform credits)
        const creditsToDeduct = isUsingCustomKey ? 0 : 1;
        setUser((prev) => {
          const newCredits = Math.max(0, prev.credits - creditsToDeduct);
          const updated = { ...prev, credits: newCredits };
          saveUser(updated);
          if (updated.id && updated.id !== 'usr_client_default') {
            dbSaveUser(updated).catch(console.error);
          }
          return updated;
        });

        if (data.files && data.files.length > 0) {
          // Smart file merging: preserve existing files that were not modified, and update/add returned files
          const newOrUpdatedFiles: CodeFile[] = data.files;

          const updatedProjects = projects.map((p) => {
            if (p.id === currentProject.id) {
              let autoTitle = p.title;
              if (data.siteTitle && data.siteTitle.trim()) {
                autoTitle = data.siteTitle.trim();
              } else if (p.title.startsWith('Projet Privé') || p.title.startsWith('Projet Vaovao')) {
                const idxFile = newOrUpdatedFiles.find((f) => f.name === 'index.html');
                if (idxFile) {
                  const match = idxFile.content.match(/<title>(.*?)<\/title>/i);
                  if (match && match[1] && match[1].trim() && !match[1].includes('Tranonkala Privé')) {
                    autoTitle = match[1].trim();
                  }
                }
              }

              // Smart merge with HTML normalization: retain non-html files, clean up old html files when new html is returned, and update index.html properly
              const mergedFilesMap = new Map<string, CodeFile>();
              let pExisting: CodeFile[] = [];
              if (Array.isArray(p.files)) {
                pExisting = p.files;
              } else if (typeof p.files === 'string') {
                try { pExisting = JSON.parse(p.files); } catch { pExisting = []; }
              }

              const hasNewHtml = newOrUpdatedFiles.some((f) => f && f.name && f.name.toLowerCase().endsWith('.html'));

              pExisting.forEach((f) => {
                if (f && f.name) {
                  const lower = f.name.trim().toLowerCase();
                  if (hasNewHtml && lower.endsWith('.html')) {
                    // Skip old html files to prevent stale file duplication and preview sync mismatch
                    return;
                  }
                  mergedFilesMap.set(lower, f);
                }
              });

              newOrUpdatedFiles.forEach((f) => {
                if (f && f.name) {
                  const lowerName = f.name.trim().toLowerCase();
                  if (lowerName.endsWith('.html')) {
                    mergedFilesMap.set('index.html', {
                      ...f,
                      name: 'index.html',
                      language: 'html'
                    });
                  } else {
                    mergedFilesMap.set(lowerName, f);
                  }
                }
              });
              const mergedFiles = Array.from(mergedFilesMap.values());

              return {
                ...p,
                title: autoTitle,
                description: data.explanation || p.description,
                files: mergedFiles,
                updatedAt: new Date().toISOString(),
                versions: [
                  ...p.versions,
                  {
                    id: 'v_' + Date.now(),
                    timestamp: new Date().toISOString(),
                    prompt: text,
                    files: mergedFiles,
                    summary: data.explanation || 'Mise à jour du site',
                  },
                ],
              };
            }
            return p;
          });

          setProjects(updatedProjects);
          const activeUpdatedProj = updatedProjects.find((p) => p.id === currentProject.id);
          if (activeUpdatedProj) {
            dbSaveProject(activeUpdatedProj).catch(console.error);
          }

          const aiMsg: ChatMessage = {
            id: 'msg_ai_' + Date.now(),
            sender: 'ai',
            text: data.explanation || 'Vita am-pahombiazana ny tranonkala!',
            timestamp: new Date().toISOString(),
            generatedCode: newOrUpdatedFiles,
            creditsDeducted: 1,
          };

          setMessages((prev) => [...prev, aiMsg]);

          // Auto switch to preview web tab after code generation
          setTimeout(() => {
            setActiveTab('preview');
            setPreviewSubTab('web');
          }, 800);
        } else {
          // Advisory / Troubleshooting / Conversation response (no code files generated)
          const aiMsg: ChatMessage = {
            id: 'msg_ai_' + Date.now(),
            sender: 'ai',
            text: data.explanation || 'Indro ny valinteny sy torohevitra momba ny tranonkalanao!',
            timestamp: new Date().toISOString(),
            creditsDeducted: 1,
          };

          setMessages((prev) => [...prev, aiMsg]);
        }
      } else {
        const errMsg: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          sender: 'ai',
          text: `Miala tsiny, nisy olana : ${data.details || 'Erreur inconnue'}`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      const errMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'ai',
        text: 'Nisy olana tamin\'ny fifandraisana amin\'ny serveur.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Payment Submission
  const handleSubmitPayment = (
    pay: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newPayment: PaymentRequest = {
      ...pay,
      id: 'pay_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [newPayment, ...prev]);
    dbSavePayment(newPayment).catch(console.error);
  };

  // Admin Actions
  const handleApprovePayment = async (paymentId: string) => {
    const p = payments.find((item) => item.id === paymentId);
    if (!p) return;

    const updatedPayment: PaymentRequest = {
      ...p,
      status: 'approved',
      verifiedAt: new Date().toISOString(),
    };

    setPayments((prev) =>
      prev.map((item) =>
        item.id === paymentId ? updatedPayment : item
      )
    );
    await dbSavePayment(updatedPayment).catch(console.error);

    // Credit target user reliably in Firestore across all matching records (userId and email)
    const addCredits = p.isProSubscription ? 15 : (p.creditsRequested || 40);
    try {
      const usersRef = collection(db, 'users');
      const cleanEmail = (p.userEmail || '').toLowerCase().trim();
      const docIdsToUpdate = new Set<string>();

      if (p.userId) {
        docIdsToUpdate.add(p.userId);
      }

      if (cleanEmail) {
        const qEmail = query(usersRef, where('email', '==', cleanEmail));
        const emailSnap = await getDocs(qEmail);
        emailSnap.forEach((d) => docIdsToUpdate.add(d.id));
      }

      if (docIdsToUpdate.size === 0 && p.userId) {
        docIdsToUpdate.add(p.userId);
      }

      for (const uid of docIdsToUpdate) {
        const targetDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(targetDocRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const currentCredits = userData.credits || 0;

        if (p.isAiKeySubscription) {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await setDoc(targetDocRef, { 
            id: uid,
            email: p.userEmail,
            aiKeySubActive: true, 
            aiKeySubExpiresAt: expiresAt 
          }, { merge: true });
        } else if (p.isProSubscription) {
          await setDoc(targetDocRef, { 
            id: uid,
            email: p.userEmail,
            plan: 'pro', 
            credits: currentCredits + 15 
          }, { merge: true });
        } else {
          await setDoc(targetDocRef, { 
            id: uid,
            email: p.userEmail,
            credits: currentCredits + addCredits 
          }, { merge: true });
        }
      }
    } catch (err) {
      console.error('Error crediting user in Firestore:', err);
    }

    // Update local state if it's the current user or matching email
    if (p.userId === user.id || (user.email && p.userEmail && user.email.toLowerCase() === p.userEmail.toLowerCase())) {
      setUser((prev) => {
        const updated = {
          ...prev,
          plan: p.isProSubscription ? 'pro' : prev.plan,
          credits: p.aiKeySubActive ? prev.credits : (prev.credits + addCredits),
          aiKeySubActive: p.isAiKeySubscription ? true : prev.aiKeySubActive,
        };
        saveUser(updated);
        dbSaveUser(updated).catch(console.error);
        return updated;
      });
    }

    // Update dbUsers state
    setDbUsers((prev) =>
      prev.map((u) => {
        if (u.id === p.userId || (u.email && p.userEmail && u.email.toLowerCase() === p.userEmail.toLowerCase())) {
          const updatedU = {
            ...u,
            credits: (u.credits || 0) + addCredits,
            plan: p.isProSubscription ? 'pro' : u.plan,
          };
          dbSaveUser(updatedU).catch(console.error);
          return updatedU;
        }
        return u;
      })
    );
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((item) => {
        if (item.id === paymentId) {
          const updated = { ...item, status: 'rejected' as const };
          dbSavePayment(updated).catch(console.error);
          return updated;
        }
        return item;
      })
    );
  };

  const handleToggleAiKeySub = (targetUserId: string, active: boolean) => {
    const expiresAt = active ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;
    const userRef = doc(db, 'users', targetUserId);
    setDoc(userRef, { aiKeySubActive: active, aiKeySubExpiresAt: expiresAt }, { merge: true }).catch(console.error);

    setDbUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, aiKeySubActive: active, aiKeySubExpiresAt: expiresAt } : u))
    );

    if (user.id === targetUserId) {
      setUser((prev) => {
        const updated = { ...prev, aiKeySubActive: active, aiKeySubExpiresAt: expiresAt };
        saveUser(updated);
        return updated;
      });
    }
  };

  const handleUpdateCustomAiKeySettings = (key: string, model: string, useKey: boolean) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        customGeminiApiKey: key,
        customGeminiModel: model,
        useCustomKey: useKey,
      };
      saveUser(updated);
      if (updated.id && updated.id !== 'usr_client_default') {
        dbSaveUser(updated).catch(console.error);
      }
      return updated;
    });
  };

  const handleUpdateUserCredits = (userId: string, newCredits: number) => {
    const userRef = doc(db, 'users', userId);
    setDoc(userRef, { credits: newCredits }, { merge: true }).catch(console.error);
    
    // Update local if it's the admin themselves
    if (userId === user.id) {
      setUser((prev) => ({ ...prev, credits: newCredits }));
    }
  };

  const handleToggleUserPlan = (userId: string) => {
    const userRef = doc(db, 'users', userId);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        const u = docSnap.data();
        const newPlan = u.plan === 'pro' ? 'free' : 'pro';
        setDoc(userRef, { plan: newPlan }, { merge: true }).catch(console.error);
        
        // Update local if it's the admin themselves
        if (userId === user.id) {
          setUser((prev) => ({ ...prev, plan: newPlan }));
        }
      }
    }).catch(console.error);
  };

  const handleRunAuditPro = async () => {
    const res = await dbAuditAndResetUnpaidProUsers(payments);
    const refreshedUsers = await dbFetchAllUsers();
    setDbUsers(refreshedUsers);
    return res;
  };

  const handleAddGeminiKey = (name: string, key: string) => {
    const newK: GeminiApiKey = {
      id: 'key_' + Date.now(),
      name,
      key,
      isActive: true,
      usageCount: 0,
    };
    setGeminiKeys((prev) => [...prev, newK]);
  };

  const handleToggleGeminiKey = (keyId: string) => {
    setGeminiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, isActive: !k.isActive } : k))
    );
  };

  const handleReplyTicket = (ticketId: string, replyText: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = {
            ...t,
            status: 'resolved' as const,
            reply: replyText,
            replyAt: new Date().toISOString(),
          };
          dbSaveTicket(updated).catch(console.error);
          return updated;
        }
        return t;
      })
    );
  };

  const defaultClientUser: UserProfile = {
    id: 'usr_client_default',
    email: 'client@devwebia.mg',
    name: 'Mpanjifa DEVWEBIA',
    plan: 'free',
    credits: 5, // 5 credits bonus ho an'ny membre vaovao
    storageUsedMb: 120,
    referralCode: 'DEVWEB-8921',
    referralsCount: 0,
    githubConnected: false,
    vercelConnected: false,
    firebaseConnected: false,
    createdAt: new Date().toISOString(),
  };

  const adminUser: UserProfile = {
    id: 'usr_admin',
    email: 'horlandobe@gmail.com',
    name: 'Admin Horlando',
    plan: 'pro',
    credits: 999,
    storageUsedMb: 50,
    referralCode: 'DEVWEB-0001',
    referralsCount: 0,
    githubConnected: false,
    vercelConnected: false,
    firebaseConnected: false,
    createdAt: new Date().toISOString(),
  };

  const allUsersList = useMemo(() => {
    const map = new Map<string, UserProfile>();
    dbUsers.forEach((u) => { if (u.email) map.set(u.email.toLowerCase(), u); });
    if (user?.email) map.set(user.email.toLowerCase(), user);
    map.set(adminUser.email.toLowerCase(), adminUser);
    map.set(defaultClientUser.email.toLowerCase(), defaultClientUser);
    return Array.from(map.values());
  }, [dbUsers, user, adminUser, defaultClientUser]);

  const handleSwitchUser = (email: string, name?: string) => {
    const isPro = email === 'horlandobe@gmail.com';
    const computedUserId = 'usr_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Retrieve previously stored user data to prevent wiping out tokens on reload/auth sync
    const stored = getStoredUser();
    const sameUser = stored && (stored.id === computedUserId || stored.email.toLowerCase() === email.toLowerCase());

    setUser((prev) => {
      // If it's a different user, we DO NOT want to inherit the previous user's tokens (like admin's Vercel/Github tokens)
      let existing = sameUser ? stored : defaultClientUser;
      
      // Force clear admin keys if they accidentally got saved to a non-admin account
      if (!isPro) {
        if (existing.firebaseProjectId === 'gen-lang-client-0344726942') existing.firebaseProjectId = '';
        if (existing.firebaseApiKey && existing.firebaseApiKey.includes('AIzaSyCik')) existing.firebaseApiKey = '';
        if (existing.firebaseAuthDomain === 'gen-lang-client-0344726942.firebaseapp.com') existing.firebaseAuthDomain = '';
        if (existing.firebaseDatabaseId === 'ai-studio-devwebia-6db382fa-ef8a-482c-8576-54c47d59c941') existing.firebaseDatabaseId = '';
        
        // Let's also clear Vercel/Github if it accidentally got saved, but we don't know the admin's exact strings for sure here,
        // Wait, if vercelToken or githubToken were inherited from the bug, they should be wiped if the user was using the same browser.
      }
      
      return {
        ...existing,
        id: computedUserId,
        email,
        name: name || existing.name || (isPro ? 'Admin Horlando' : 'Utilisateur DEVWEBIA'),
        plan: isPro ? 'pro' : (sameUser && stored.plan ? stored.plan : 'free'),
        credits: isPro ? 999 : (sameUser && stored.credits !== undefined ? stored.credits : 5),
        storageUsedMb: existing.storageUsedMb || 120,
        referralCode: existing.referralCode || ('DEVWEB-' + Math.floor(1000 + Math.random() * 9000)),
        referralsCount: existing.referralsCount !== undefined ? existing.referralsCount : 0,
        githubToken: existing.githubToken || '',
        githubUsername: existing.githubUsername || '',
        githubConnected: Boolean((existing.githubToken?.trim()) && (existing.githubUsername?.trim())),
        vercelToken: existing.vercelToken || '',
        vercelConnected: Boolean(existing.vercelToken?.trim()),
        firebaseProjectId: existing.firebaseProjectId || '',
        firebaseApiKey: existing.firebaseApiKey || '',
        firebaseAuthDomain: existing.firebaseAuthDomain || '',
        firebaseDatabaseId: existing.firebaseDatabaseId || '',
        firebaseConnected: Boolean((existing.firebaseProjectId?.trim()) && (existing.firebaseApiKey?.trim())),
        createdAt: existing.createdAt || new Date().toISOString(),
      };
    });
  };

  const handleSaveConnections = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updated };
      saveUser(nextUser);
      if (nextUser.id && nextUser.id !== 'usr_client_default') {
        dbSaveUser(nextUser).catch((err) =>
          console.warn('Error saving user connections to Firestore:', err)
        );
      }
      return nextUser;
    });
  };

  const handleUpdateProjectFiles = (
    projectIdOrFiles: string | CodeFile[],
    maybeFiles?: CodeFile[],
    maybeUrl?: string,
    lastDeployedAt?: string
  ) => {
    let targetProjectId = currentProject.id;
    let filesToSave: CodeFile[] = [];
    let urlToSave: string | undefined = undefined;

    if (typeof projectIdOrFiles === 'string') {
      targetProjectId = projectIdOrFiles;
      filesToSave = maybeFiles || [];
      urlToSave = maybeUrl;
    } else {
      filesToSave = projectIdOrFiles;
    }

    setProjects((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === targetProjectId) {
          const updatedProj: Project = {
            ...p,
            files: filesToSave,
            ...(urlToSave ? { deployedUrl: urlToSave, lastDeployedAt: lastDeployedAt || new Date().toISOString() } : {}),
            updatedAt: new Date().toISOString(),
          };
          if (user && user.id && user.id !== 'usr_client_default') {
            dbSaveProject(updatedProj).catch((err) =>
              console.warn('Error saving updated project files to Firestore:', err)
            );
          }
          return updatedProj;
        }
        return p;
      });
      saveProjects(updatedList);
      return updatedList;
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        previewSubTab={previewSubTab}
        setActiveTab={setActiveTab}
        setPreviewSubTab={setPreviewSubTab}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onNewProject={handleNewProject}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar
          user={user}
          projects={userProjects}
          currentProjectId={currentProject.id}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onOpenRecharge={() => {
            setRechargeInitialType('credits');
            setIsRechargeOpen(true);
          }}
          onOpenCustomAiKey={() => setIsCustomAiKeyOpen(true)}
          onOpenConnectedApps={() => setIsConnectedAppsOpen(true)}
          onOpenFaq={() => setIsFaqOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenReferral={() => setIsReferralOpen(true)}
          onOpenDomain={() => setIsDomainOpen(true)}
          onOpenGoogleSeo={() => setIsGoogleSeoOpen(true)}
          onOpenLocation={() => setIsLocationModalOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onLogout={() => setIsAuthOpen(true)}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onPreviewProject={handlePreviewProject}
          onPublishProject={handlePublishProject}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatView
              user={user}
              currentProject={currentProject}
              projects={userProjects}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSwitchToPreview={() => {
                setActiveTab('preview');
                setPreviewSubTab('web');
              }}
              onOpenRecharge={() => setIsRechargeOpen(true)}
              isGenerating={isGenerating}
              onUpdateFiles={handleUpdateProjectFiles}
            />
          ) : (
            <PreviewView
              user={user}
              project={currentProject}
              projects={userProjects}
              subTab={previewSubTab}
              setSubTab={setPreviewSubTab}
              onOpenConnectedApps={() => setIsConnectedAppsOpen(true)}
              onUpdateFiles={handleUpdateProjectFiles}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {resetOobCode && (
        <ResetPasswordModal
          oobCode={resetOobCode}
          isOpen={Boolean(resetOobCode)}
          onClose={() => setResetOobCode(null)}
          onSuccess={() => {
            setResetOobCode(null);
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsAuthOpen(true);
          }}
        />
      )}

      <RechargeModal
        user={user}
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        onSubmitPayment={handleSubmitPayment}
        initialType={rechargeInitialType}
      />

      <CustomAiKeyModal
        user={user}
        isOpen={isCustomAiKeyOpen}
        onClose={() => setIsCustomAiKeyOpen(false)}
        onUpdateUserKey={(key, useKey, model) => handleUpdateCustomAiKeySettings(key, model, useKey)}
        onOpenRechargeForAiKey={() => {
          setIsCustomAiKeyOpen(false);
          setRechargeInitialType('ai_key_sub');
          setIsRechargeOpen(true);
        }}
      />

      <ConnectedAppsModal
        user={user}
        isOpen={isConnectedAppsOpen}
        onClose={() => setIsConnectedAppsOpen(false)}
        onSaveConnections={handleSaveConnections}
      />

      <CustomDomainModal
        user={user}
        projects={userProjects}
        isOpen={isDomainOpen}
        onClose={() => setIsDomainOpen(false)}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onSendDomainToChat={(domainPrompt) => {
          setActiveTab('chat');
          handleSendMessage(domainPrompt);
        }}
      />

      <GoogleSeoModal
        user={user}
        projects={userProjects}
        isOpen={isGoogleSeoOpen}
        onClose={() => setIsGoogleSeoOpen(false)}
        onUpdateProjectFiles={handleUpdateProjectFiles}
        onOpenConnectedApps={() => {
          setIsGoogleSeoOpen(false);
          setIsConnectedAppsOpen(true);
        }}
        onSendSeoPromptToAI={(promptText) => {
          setIsGoogleSeoOpen(false);
          setActiveTab('chat');
          handleSendMessage(promptText);
        }}
      />

      <ProjectLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        projects={userProjects}
        currentProjectId={currentProject.id}
        onUpdateProjectFiles={handleUpdateProjectFiles}
        onSendLocationPromptToAI={(promptText) => {
          setIsLocationModalOpen(false);
          setActiveTab('chat');
          handleSendMessage(promptText);
        }}
      />

      <SupportModal
        user={user}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        tickets={tickets}
        onSubmitTicket={(ticket) => {
          const newTicket: SupportTicket = {
            ...ticket,
            id: 'tick_' + Date.now(),
            status: 'open',
            createdAt: new Date().toISOString(),
          };
          setTickets((prev) => [newTicket, ...prev]);
          dbSaveTicket(newTicket).catch(console.error);
        }}
      />

      <ReferralModal
        user={user}
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onUpdateUser={(updated) => setUser(updated)}
      />

      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <AdminPanelModal
        user={user}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        payments={payments}
        usersList={allUsersList}
        allProjects={projects}
        tickets={tickets}
        geminiKeys={geminiKeys}
        systemPrompts={systemPrompts}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateUserCredits={handleUpdateUserCredits}
        onToggleUserPlan={handleToggleUserPlan}
        onAddGeminiKey={handleAddGeminiKey}
        onToggleGeminiKey={handleToggleGeminiKey}
        onReplyTicket={handleReplyTicket}
        onAddSystemPrompt={handleAddSystemPrompt}
        onToggleSystemPrompt={handleToggleSystemPrompt}
        onUpdateProjectContent={handleUpdateProjectContent}
        onSelectProjectAndPreview={(projectId) => {
          handleSelectProject(projectId);
          setActiveTab('preview');
          setPreviewSubTab('web');
        }}
        onDeleteProject={handleDeleteProject}
        onRunAuditPro={handleRunAuditPro}
        onToggleAiKeySub={handleToggleAiKeySub}
      />

      <ProjectsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        projects={userProjects}
        currentProjectId={currentProject.id}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onModifyWithAI={handleModifyWithAI}
        onPreviewProject={handlePreviewProject}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenConnectedApps={() => setIsConnectedAppsOpen(true)}
      />

      <AuthModal
        user={user}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSwitchUser={handleSwitchUser}
      />
    </div>
  );
}
