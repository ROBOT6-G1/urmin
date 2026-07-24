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
import { auth, onAuthStateChanged } from './lib/firebase';

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
  }, [geminiKeys]);

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
  }, [user]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

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
      prev.map((p) => (p.id === id ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p))
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
    handleSelectProject(dupId);
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
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
        // Deduct 1 credit
        const newCredits = Math.max(0, user.credits - 1);
        const updatedUser = { ...user, credits: newCredits };
        setUser(updatedUser);

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
  };

  // Admin Actions
  const handleApprovePayment = (paymentId: string) => {
    const p = payments.find((item) => item.id === paymentId);
    if (!p) return;

    setPayments((prev) =>
      prev.map((item) =>
        item.id === paymentId ? { ...item, status: 'approved', verifiedAt: new Date().toISOString() } : item
      )
    );

    // Credit target user or current user
    if (p.isProSubscription) {
      setUser((prev) => ({
        ...prev,
        plan: 'pro',
        credits: prev.credits + 15,
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        credits: prev.credits + p.creditsRequested,
      }));
    }
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((item) => (item.id === paymentId ? { ...item, status: 'rejected' } : item))
    );
  };

  const handleUpdateUserCredits = (userId: string, newCredits: number) => {
    setUser((prev) => ({ ...prev, credits: newCredits }));
  };

  const handleToggleUserPlan = (userId: string) => {
    setUser((prev) => ({ ...prev, plan: prev.plan === 'pro' ? 'free' : 'pro' }));
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
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              reply: replyText,
              replyAt: new Date().toISOString(),
            }
          : t
      )
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
    referralsCount: 2,
    githubConnected: false,
    vercelConnected: false,
    firebaseConnected: true,
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
    referralsCount: 50,
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
      const existing = sameUser ? stored : prev;
      return {
        ...existing,
        id: computedUserId,
        email,
        name: name || existing.name || (isPro ? 'Admin Horlando' : 'Utilisateur DEVWEBIA'),
        plan: isPro ? 'pro' : (existing.plan || 'free'),
        credits: isPro ? 999 : (existing.credits || 15),
        storageUsedMb: existing.storageUsedMb || 120,
        referralCode: existing.referralCode || ('DEVWEB-' + Math.floor(1000 + Math.random() * 9000)),
        referralsCount: existing.referralsCount || (isPro ? 12 : 2),
        githubConnected: Boolean(existing.githubToken || existing.githubUsername || existing.githubConnected || isPro),
        githubToken: existing.githubToken,
        githubUsername: existing.githubUsername,
        vercelConnected: Boolean(existing.vercelToken || existing.vercelConnected || isPro),
        vercelToken: existing.vercelToken,
        firebaseConnected: true,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
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
        isOpen={isDomainOpen}
        onClose={() => setIsDomainOpen(false)}
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
        onSubmitTicket={(ticket) =>
          setTickets((prev) => [
            {
              ...ticket,
              id: 'tick_' + Date.now(),
              status: 'open',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ])
        }
      />

      <ReferralModal
        user={user}
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onUpdateUser={(updated) => setUser(updated)}
      />

      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />

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
