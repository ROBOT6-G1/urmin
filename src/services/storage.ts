import {
  UserProfile,
  Project,
  ChatMessage,
  PaymentRequest,
  SupportTicket,
  GeminiApiKey,
  CodeFile,
} from '../types';

const STORAGE_KEYS = {
  USER: 'devwebia_user_v2',
  PROJECTS: 'devwebia_projects_v2',
  CURRENT_PROJECT: 'devwebia_current_project_v2',
  PAYMENTS: 'devwebia_payments_v2',
  TICKETS: 'devwebia_tickets_v2',
  GEMINI_KEYS: 'devwebia_gemini_keys_v2',
  ALL_USERS: 'devwebia_all_users_v2',
};

// Initial default user
const DEFAULT_USER: UserProfile = {
  id: 'usr_default_1',
  email: 'client@devwebia.mg',
  name: 'Mpanjifa DEVWEBIA',
  plan: 'free',
  credits: 15, // 15 credits initial bonus
  storageUsedMb: 120, // 120MB used out of 1000MB
  referralCode: 'DEVWEB-8921',
  referralsCount: 2,
  githubConnected: false,
  vercelConnected: false,
  firebaseConnected: true,
  createdAt: new Date().toISOString(),
};

// Initial sample project for immediate visual preview
const INITIAL_PROJECT_FILES: CodeFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mantoa Madagascar - Artisant & Produits Locaux</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
  <!-- Navbar -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">M</div>
        <span class="font-extrabold text-2xl tracking-tight text-slate-900">Mantoa<span class="text-emerald-600">.mg</span></span>
      </div>
      <nav class="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
        <a href="#hero" class="hover:text-emerald-600 transition-colors">Fandraisana</a>
        <a href="#produits" class="hover:text-emerald-600 transition-colors">Vokatra</a>
        <a href="#histoire" class="hover:text-emerald-600 transition-colors">Tantara</a>
        <a href="#contact" class="hover:text-emerald-600 transition-colors">Mifandray</a>
      </nav>
      <div class="flex items-center gap-4">
        <button onclick="alert('Panier vide pour le moment')" class="relative p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
        </button>
        <a href="#produits" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all">
          Mividy
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
          <i class="fa-solid fa-gem text-amber-400"></i>
          Vokatra Gasy 100% Natiora
        </div>
        <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          Kanto sy Hanitra Avy Amin'ny <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Tany Madagascar</span>
        </h1>
        <p class="text-slate-300 text-lg leading-relaxed max-w-xl">
          Tadiavo ireo mofomamy, vanille, kanto vita amin'ny rafia sy vokatra voajanahary indrindra namboarin'ireo mpanao tanana malagasy.
        </p>
        <div class="flex flex-wrap items-center gap-4 pt-4">
          <a href="#produits" class="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
            Zahavo ny Vokatra <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a href="#histoire" class="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/10 transition-all">
            Ny Tantanay
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-square rounded-3xl bg-slate-800 border border-white/10 overflow-hidden shadow-2xl relative group">
          <img src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80" alt="Vanille Madagascar" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <span class="text-emerald-400 font-bold text-sm">Gousse de Vanille Bourbon</span>
            <p class="text-white text-xl font-extrabold">Vanille voajanahary avy any Sambava</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <section id="produits" class="py-20 px-6 max-w-7xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
      <h2 class="text-3xl font-extrabold text-slate-900">Ireo Vokatra Mainti-Molaly</h2>
      <p class="text-slate-600">Safidio ny kalitao avo indrindra namboarina tamim-pitiavana.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Card 1 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
          <span class="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">Top Vente</span>
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900">Vanille Bourbon 250g</h3>
          <p class="text-slate-600 text-sm">Gousses supérieures parfumées pour pâtisseries d'exception.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600">45 000 Ar</span>
            <button onclick="alert('Vanille ajoutée au panier!')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Hividy
            </button>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900">Sachet Rafia Handcrafted</h3>
          <p class="text-slate-600 text-sm">Sac fait main 100% raphia naturel tressé par nos artisanes.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600">35 000 Ar</span>
            <button onclick="alert('Sac en Rafia ajouté!')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Hividy
            </button>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover">
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900">Miel Sauvage d'Eucalyptus 500g</h3>
          <p class="text-slate-600 text-sm">Miel pur bio récolté dans les forêts préservées de la côte Est.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600">28 000 Ar</span>
            <button onclick="alert('Miel ajouté!')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Hividy
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">M</div>
        <span class="font-bold text-xl text-white">Mantoa Madagascar</span>
      </div>
      <p class="text-sm text-slate-500">&copy; 2026 Mantoa.mg. Noforonina tamin'ny DEVWEBIA.</p>
    </div>
  </footer>

  <a href="https://devwebia.mg" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#1e1b4b;color:#a5b4fc;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:6px;">⚡ vita amin'i DEVWEBIA</a>
</body>
</html>`,
  },
];

const INITIAL_PROJECT: Project = {
  id: 'proj_sample_1',
  userId: 'usr_default_1',
  userEmail: 'client@devwebia.mg',
  isPrivate: true,
  title: 'Mantoa Madagascar (E-Commerce)',
  description: 'Tranonkala fivarotana vokatra gasy sy vanille namboarina tamin\'i DEVWEBIA',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  files: INITIAL_PROJECT_FILES,
  versions: [
    {
      id: 'v1',
      timestamp: new Date().toISOString(),
      prompt: 'Mamorona site e-commerce fivarotana vokatra gasy (vanille, rafia, tantely)',
      files: INITIAL_PROJECT_FILES,
      summary: 'Site E-commerce feno amin\'ny teny Malagasy',
    },
  ],
};

export function getStoredUser(): UserProfile {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  return JSON.parse(data);
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getStoredProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([INITIAL_PROJECT]));
    return [INITIAL_PROJECT];
  }
  return JSON.parse(data);
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function getCurrentProject(): Project {
  const projects = getStoredProjects();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  if (currentId) {
    const found = projects.find((p) => p.id === currentId);
    if (found) return found;
  }
  return projects[0] || INITIAL_PROJECT;
}

export function setCurrentProjectId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, id);
}

export function getStoredPayments(): PaymentRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  if (!data) {
    const defaultPayments: PaymentRequest[] = [
      {
        id: 'pay_101',
        userId: 'usr_default_1',
        userEmail: 'client@devwebia.mg',
        amountAr: 2000,
        creditsRequested: 10,
        provider: 'mvola',
        senderPhone: '0341234567',
        transactionRef: 'MV260724.0912.B12',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(defaultPayments));
    return defaultPayments;
  }
  return JSON.parse(data);
}

export function savePayments(payments: PaymentRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

export function getStoredTickets(): SupportTicket[] {
  const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
  if (!data) {
    const defaultTickets: SupportTicket[] = [
      {
        id: 'tick_1',
        userId: 'usr_default_1',
        userEmail: 'client@devwebia.mg',
        subject: 'Fampiasana domaine vercel',
        message: 'Manao ahoana, aiza no ahitana ireo DNS records ho ani Vercel?',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(defaultTickets));
    return defaultTickets;
  }
  return JSON.parse(data);
}

export function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
}

export function calculateCreditPrice(credits: number): { amountAr: number } {
  // 5 credits = 1000ar
  // Price = (credits / 5) * 1000
  const packs = Math.ceil(credits / 5);
  return { amountAr: Math.max(1000, packs * 1000) };
}
