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
} from './services/storage';

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

  // Admin Data state
  const [payments, setPayments] = useState<PaymentRequest[]>(getStoredPayments);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets);
  const [geminiKeys, setGeminiKeys] = useState<GeminiApiKey[]>([]);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        handleSwitchUser(fbUser.email, fbUser.displayName || 'Utilisateur Google');
      }
    });
    return () => unsubscribe();
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

  // Project Switching
  const handleSelectProject = (id: string) => {
    setCurrentProjectIdState(id);
    setCurrentProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setMessages([
        {
          id: 'msg_' + Date.now(),
          sender: 'ai',
          text: `Projet privé "${proj.title}" dia vonona. Inona no tiantsika hovaina amin'ity site ity?`,
          timestamp: new Date().toISOString(),
          generatedCode: proj.files,
        },
      ]);
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

      if (data.success && data.files && data.files.length > 0) {
        // Deduct 1 credit
        const newCredits = Math.max(0, user.credits - 1);
        const updatedUser = { ...user, credits: newCredits };
        setUser(updatedUser);

        // Update Project files
        const updatedFiles: CodeFile[] = data.files;
        const updatedProjects = projects.map((p) => {
          if (p.id === currentProject.id) {
            return {
              ...p,
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

        // Auto switch to preview web tab after completion
        setTimeout(() => {
          setActiveTab('preview');
          setPreviewSubTab('web');
        }, 800);
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

  const handleSwitchUser = (email: string, name?: string) => {
    const isPro = email === 'horlandobe@gmail.com';
    const computedUserId = 'usr_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setUser({
      id: computedUserId,
      email,
      name: name || (isPro ? 'Admin Horlando' : 'Utilisateur DEVWEBIA'),
      plan: isPro ? 'pro' : 'free',
      credits: isPro ? 999 : 15,
      storageUsedMb: 120,
      referralCode: 'DEVWEB-' + Math.floor(1000 + Math.random() * 9000),
      referralsCount: isPro ? 12 : 2,
      githubConnected: isPro,
      vercelConnected: isPro,
      firebaseConnected: true,
      createdAt: new Date().toISOString(),
    });
  };

  const handleUpdateProjectFiles = (updatedFiles: CodeFile[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProject.id
          ? { ...p, files: updatedFiles, updatedAt: new Date().toISOString() }
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
          onOpenAdmin={() => setIsAdminOpen(true)}
          onLogout={() => setIsAuthOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatView
              user={user}
              currentProject={currentProject}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSwitchToPreview={() => {
                setActiveTab('preview');
                setPreviewSubTab('web');
              }}
              onOpenRecharge={() => setIsRechargeOpen(true)}
              isGenerating={isGenerating}
            />
          ) : (
            <PreviewView
              user={user}
              project={currentProject}
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

      <SupportModal
        user={user}
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
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
      />

      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />

      <AdminPanelModal
        user={user}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        payments={payments}
        usersList={[user]}
        geminiKeys={geminiKeys}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateUserCredits={handleUpdateUserCredits}
        onToggleUserPlan={handleToggleUserPlan}
        onAddGeminiKey={handleAddGeminiKey}
        onToggleGeminiKey={handleToggleGeminiKey}
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
