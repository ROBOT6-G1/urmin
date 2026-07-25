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
import { AboutModal } from './components/AboutModal';
import { auth, onAuthStateChanged, db } from './lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import {
  UserProfile,
  Project,
  ChatMessage,
  PaymentRequest,
  SupportTicket,
  GeminiApiKey,
  CodeFile,
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
} from './services/firestoreService';

export default function App() {
  const [user, setUser] = useState<UserProfile>(getStoredUser);
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [currentProjectIdState, setCurrentProjectIdState] = useState<string>(
    () => getCurrentProject().id
  );

  // Strictly filter projects by current logged-in user account for privacy
  const userProjects = useMemo(() => {
    return projects.filter(
      (p) => p.userId === user.id || (p.userEmail && p.userEmail === user.email)
    );
  }, [projects, user.id, user.email]);

  const currentProject =
    userProjects.find((p) => p.id === currentProjectIdState) || userProjects[0] || projects[0];

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
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Admin Data state
  const [payments, setPayments] = useState<PaymentRequest[]>(getStoredPayments);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets);
  const [geminiKeys, setGeminiKeys] = useState<GeminiApiKey[]>(getStoredGeminiKeys);

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

  // Synchronize all user and admin data from Firestore on mount / user ID changes
  useEffect(() => {
    const syncDatabaseData = async () => {
      if (!user.id || user.id === 'usr_client_default') return;
      try {
        // A. Sync User Profile
        const syncedUser = await dbSyncUser(user);
        if (JSON.stringify(syncedUser) !== JSON.stringify(user)) {
          setUser(syncedUser);
        }

        // B. Sync Projects
        const dbProjects = await dbFetchUserProjects(user.id, user.email);
        if (dbProjects.length > 0) {
          setProjects((prev) => {
            // Keep DB projects and any local ones that are not in DB yet
            const updated = [...dbProjects];
            prev.forEach((localProj) => {
              const isUserProj = localProj.userId === user.id || localProj.userEmail === user.email;
              if (isUserProj && !dbProjects.some((dp) => dp.id === localProj.id)) {
                updated.push(localProj);
                dbSaveProject(localProj).catch((e) => console.error('Error uploading local project to DB:', e));
              }
            });
            return updated;
          });
        } else {
          // If no projects in Firestore but user has local projects, upload them
          const userLocalProjs = projects.filter(
            (p) => p.userId === user.id || p.userEmail === user.email
          );
          for (const localProj of userLocalProjs) {
            await dbSaveProject(localProj);
          }
        }

        // C. Sync Payments
        const isAdmin = user.email === 'horlandobe@gmail.com';
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
  }, [user.id]);

  // Ensure every user account has an isolated workspace project
  useEffect(() => {
    if (userProjects.length === 0) {
      const defaultUserProj: Project = {
        id: 'proj_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        isPrivate: true,
        title: 'Projet Privé ' + (user.name || 'Client'),
        description: 'Espace de travail privé sy sécurisé ho an\'i ' + user.email,
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
  <title>Espace Privé - ${user.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6">
  <div class="text-center space-y-4 max-w-md">
    <div class="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
      🔒
    </div>
    <h1 class="text-3xl font-extrabold text-indigo-300">Espace Privé DEVWEBIA</h1>
    <p class="text-slate-400 text-sm">
      Tonga soa ${user.name}! Natsangana ny espace de travail privé-nao. Antsoy ny IA ao amin'ny Chat mba hamoronana ny site-nao.
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
  }, [user.id, user.email, userProjects.length]);

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
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    dbDeleteProject(id).catch(console.error);
    if (currentProjectIdState === id && remaining.length > 0) {
      handleSelectProject(remaining[0].id);
    }
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
    if (user.credits <= 0) {
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

    try {
      const res = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          existingFiles: currentProject.files,
          userPlan: user.plan,
          customDomain: user.customDomain,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Deduct 1 credit using functional state update and immediately persist
        setUser((prev) => {
          const newCredits = Math.max(0, prev.credits - 1);
          const updated = { ...prev, credits: newCredits };
          saveUser(updated);
          if (updated.id && updated.id !== 'usr_client_default') {
            dbSaveUser(updated).catch(console.error);
          }
          return updated;
        });

        if (data.files && data.files.length > 0) {
          // Update Project files & intelligent site title
          const updatedFiles: CodeFile[] = data.files;

          const updatedProjects = projects.map((p) => {
            if (p.id === currentProject.id) {
              let autoTitle = p.title;
              if (data.siteTitle && data.siteTitle.trim()) {
                autoTitle = data.siteTitle.trim();
              } else if (p.title.startsWith('Projet Privé') || p.title.startsWith('Projet Vaovao')) {
                const idxFile = updatedFiles.find((f) => f.name === 'index.html');
                if (idxFile) {
                  const match = idxFile.content.match(/<title>(.*?)<\/title>/i);
                  if (match && match[1] && match[1].trim() && !match[1].includes('Tranonkala Privé')) {
                    autoTitle = match[1].trim();
                  }
                }
              }

              return {
                ...p,
                title: autoTitle,
                description: data.explanation || p.description,
                files: updatedFiles,
                updatedAt: new Date().toISOString(),
                versions: [
                  ...p.versions,
                  {
                    id: 'v_' + Date.now(),
                    timestamp: new Date().toISOString(),
                    prompt: text,
                    files: updatedFiles,
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
            generatedCode: updatedFiles,
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
  const handleApprovePayment = (paymentId: string) => {
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
    dbSavePayment(updatedPayment).catch(console.error);

    // Credit target user
    const userRef = doc(db, 'users', p.userId);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        const targetUser = docSnap.data();
        if (p.isProSubscription) {
          setDoc(userRef, { plan: 'pro', credits: (targetUser.credits || 0) + 15 }, { merge: true }).catch(console.error);
        } else {
          setDoc(userRef, { credits: (targetUser.credits || 0) + p.creditsRequested }, { merge: true }).catch(console.error);
        }
        
        // Also update local state if the admin is somehow approving their own payment
        if (p.userId === user.id) {
          setUser((prev) => ({
            ...prev,
            plan: p.isProSubscription ? 'pro' : prev.plan,
            credits: prev.credits + (p.isProSubscription ? 15 : p.creditsRequested)
          }));
        }
      }
    }).catch(console.error);
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
    githubConnected: true,
    vercelConnected: true,
    firebaseConnected: true,
    createdAt: new Date().toISOString(),
  };

  const allUsersList = Array.from(
    new Map([
      [user.email.toLowerCase(), user],
      [adminUser.email.toLowerCase(), adminUser],
      [defaultClientUser.email.toLowerCase(), defaultClientUser],
    ]).values()
  );

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
        githubConnected: Boolean(existing.githubToken || existing.githubUsername || isPro),
        githubToken: existing.githubToken || '',
        githubUsername: existing.githubUsername || '',
        vercelConnected: Boolean(existing.vercelToken || isPro),
        vercelToken: existing.vercelToken || '',
        firebaseConnected: Boolean(existing.firebaseProjectId && existing.firebaseApiKey),
        firebaseProjectId: existing.firebaseProjectId || '',
        firebaseApiKey: existing.firebaseApiKey || '',
        firebaseAuthDomain: existing.firebaseAuthDomain || '',
        firebaseDatabaseId: existing.firebaseDatabaseId || '',
        createdAt: existing.createdAt || new Date().toISOString(),
      };
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

    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProjectId
          ? {
              ...p,
              files: filesToSave,
              ...(urlToSave ? { deployedUrl: urlToSave, lastDeployedAt: lastDeployedAt || new Date().toISOString() } : {}),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
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
          onOpenRecharge={() => setIsRechargeOpen(true)}
          onOpenConnectedApps={() => setIsConnectedAppsOpen(true)}
          onOpenFaq={() => setIsFaqOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenReferral={() => setIsReferralOpen(true)}
          onOpenDomain={() => setIsDomainOpen(true)}
          onOpenGoogleSeo={() => setIsGoogleSeoOpen(true)}
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
      <RechargeModal
        user={user}
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        onSubmitPayment={handleSubmitPayment}
      />

      <ConnectedAppsModal
        user={user}
        isOpen={isConnectedAppsOpen}
        onClose={() => setIsConnectedAppsOpen(false)}
        onSaveConnections={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
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
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateUserCredits={handleUpdateUserCredits}
        onToggleUserPlan={handleToggleUserPlan}
        onAddGeminiKey={handleAddGeminiKey}
        onToggleGeminiKey={handleToggleGeminiKey}
        onReplyTicket={handleReplyTicket}
        onSelectProjectAndPreview={(projectId) => {
          handleSelectProject(projectId);
          setActiveTab('preview');
          setPreviewSubTab('web');
        }}
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
