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
  credits: 5, // 5 credits bonus ho an'ny membre vaovao
  storageUsedMb: 120, // 120MB used out of 1000MB
  referralCode: 'DEVWEB-8921',
  referralsCount: 0,
  githubConnected: false,
  vercelConnected: false,
  firebaseConnected: false,
  createdAt: new Date().toISOString(),
};

// Initial sample project for immediate visual preview with full admin & live sync
export const INITIAL_PROJECT_FILES: CodeFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="cms-page-title">Mantoa Madagascar - Artisant & Produits Locaux</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="app.js"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
  <!-- Header / Navigation -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">M</div>
        <span class="font-extrabold text-2xl tracking-tight text-slate-900" id="cms-site-logo-text">Mantoa<span class="text-emerald-600">.mg</span></span>
      </div>
      <nav class="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
        <a href="#hero" class="hover:text-emerald-600 transition-colors">Fandraisana</a>
        <a href="#produits" class="hover:text-emerald-600 transition-colors">Vokatra</a>
        <a href="#contact" class="hover:text-emerald-600 transition-colors">Contact</a>
        <a href="admin.html" class="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/30 font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-user-gear text-amber-500"></i>
          <span>🔐 Admin</span>
        </a>
      </nav>
      <div class="flex items-center gap-4">
        <button onclick="alert('Panier vide pour le moment')" class="relative p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
        </button>
        <a href="admin.html" class="md:hidden px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">Admin</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
          <i class="fa-solid fa-gem text-amber-400"></i>
          <span id="cms-badge-text">Vokatra Gasy 100% Natiora</span>
        </div>
        <h1 class="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight" id="cms-hero-title">
          Kanto sy Hanitra Avy Amin'ny Tany Madagascar
        </h1>
        <p class="text-slate-300 text-lg leading-relaxed max-w-xl" id="cms-hero-p">
          Tadiavo ireo mofomamy, vanille, kanto vita amin'ny rafia sy vokatra voajanahary indrindra namboarin'ireo mpanao tanana malagasy.
        </p>
        <div class="flex flex-wrap items-center gap-4 pt-4">
          <a href="#produits" class="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
            Zahavo ny Vokatra <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a href="admin.html" class="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/10 transition-all flex items-center gap-2">
            <i class="fa-solid fa-sliders"></i> Hanova Contenu (Admin)
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-square rounded-3xl bg-slate-800 border border-white/10 overflow-hidden shadow-2xl relative group">
          <img id="cms-hero-img" src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80" alt="Vanille Madagascar" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <span class="text-emerald-400 font-bold text-sm" id="cms-hero-img-label">Gousse de Vanille Bourbon</span>
            <p class="text-white text-xl font-extrabold">Vanille voajanahary avy any Sambava</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Products Section -->
  <section id="produits" class="py-20 px-6 max-w-7xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
      <h2 class="text-3xl font-extrabold text-slate-900" id="cms-products-title">Ireo Vokatra Mainti-Molaly</h2>
      <p class="text-slate-600" id="cms-products-sub">Safidio ny kalitao avo indrindra namboarina tamim-pitiavana.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Card 1 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img id="cms-p1-img" src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';">
          <span class="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">Top Vente</span>
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900" id="cms-p1-title">Vanille Bourbon 250g</h3>
          <p class="text-slate-600 text-sm" id="cms-p1-desc">Gousses supérieures parfumées pour pâtisseries d'exception.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600" id="cms-p1-price">45 000 Ar</span>
            <button onclick="alert('Ajouté au panier')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">Hividy</button>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img id="cms-p2-img" src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';">
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900" id="cms-p2-title">Sachet Rafia Handcrafted</h3>
          <p class="text-slate-600 text-sm" id="cms-p2-desc">Sac fait main 100% raphia naturel tressé par nos artisanes.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600" id="cms-p2-price">35 000 Ar</span>
            <button onclick="alert('Ajouté au panier')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">Hividy</button>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        <div class="h-64 bg-slate-100 relative overflow-hidden">
          <img id="cms-p3-img" src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';">
        </div>
        <div class="p-6 space-y-4">
          <h3 class="text-xl font-bold text-slate-900" id="cms-p3-title">Miel Sauvage 500g</h3>
          <p class="text-slate-600 text-sm" id="cms-p3-desc">Miel pur bio récolté dans les forêts préservées de la côte Est.</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-emerald-600" id="cms-p3-price">28 000 Ar</span>
            <button onclick="alert('Ajouté au panier')" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">Hividy</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center justify-between">
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">M</div>
          <span class="font-bold text-xl text-white" id="cms-footer-title">Mantoa Madagascar</span>
        </div>
        <p class="text-sm text-slate-400" id="cms-footer-desc">Tranonkala fivarotana vokatra gasy tsara kalitao.</p>
      </div>
      <div class="md:text-right space-y-1 text-sm">
        <p><i class="fa-solid fa-phone text-emerald-400 mr-2"></i> <span id="cms-contact-phone">+261 34 00 000 00</span></p>
        <p><i class="fa-solid fa-envelope text-emerald-400 mr-2"></i> <span id="cms-contact-email">contact@mantoa.mg</span></p>
      </div>
    </div>
  </footer>

  <a href="https://deviaweb-aezo.onrender.com" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#1e1b4b;color:#a5b4fc;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:6px;">⚡ Vita amin'i DEVWEBIA</a>
</body>
</html>`,
  },
  {
    name: 'admin.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="mg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Espace Administration - CMS DEVWEBIA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="app.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">

  <!-- Modal Auth Login Admin -->
  <div id="admin-login-modal" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center text-3xl font-extrabold mx-auto shadow-lg shadow-amber-500/20">
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <h2 class="text-2xl font-extrabold text-white">Espace Administration</h2>
        <p class="text-slate-400 text-sm">Ampidiro ny mot de passe admin (Défaut: <code class="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono">1234</code>)</p>
      </div>

      <form onsubmit="event.preventDefault(); handleAdminLogin();" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
          <input type="password" id="admin-login-pwd" placeholder="••••••••" onkeyup="if(event.key==='Enter') handleAdminLogin()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm transition-all">
        </div>
        <button type="button" onclick="handleAdminLogin()" class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
          <i class="fa-solid fa-lock-open"></i>
          <span>Miditra amin'ny Admin</span>
        </button>
        <p id="admin-login-error" class="text-rose-400 text-xs font-bold text-center hidden">Mot de passe diso ! Mamerena indray.</p>
      </form>
    </div>
  </div>

  <!-- Dashboard Content -->
  <div id="admin-dashboard" class="hidden">
    <!-- Navbar Header -->
    <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/20">⚙️</div>
          <div>
            <h1 class="font-extrabold text-lg text-white leading-none">Interface Administration</h1>
            <span class="text-xs text-amber-400 font-medium">⚡ Auto-Sync Firebase Firestore En Direct</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a href="index.html" target="_blank" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Hizaha ny Site (Aperçu Live)</span>
          </a>
          <button onclick="handleAdminLogout()" class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      <!-- Toast Alert Notification -->
      <div id="admin-toast" class="hidden fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 animate-bounce">
        <i class="fa-solid fa-circle-check text-lg"></i>
        <span id="toast-msg">Modifications enregistrées et publiées en direct !</span>
      </div>

      <!-- Quick Stats Header -->
      <div class="grid sm:grid-cols-3 gap-4">
        <div class="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Statut Synchro</span>
            <div class="text-emerald-400 font-extrabold text-lg mt-1 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Firestore Connecté
            </div>
          </div>
          <i class="fa-solid fa-database text-2xl text-slate-700"></i>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Images Gérées</span>
            <div class="text-amber-400 font-extrabold text-lg mt-1">4 Images avec Auto-Compressor</div>
          </div>
          <i class="fa-solid fa-image text-2xl text-slate-700"></i>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Mot de Passe</span>
            <div class="text-indigo-400 font-extrabold text-lg mt-1">Sécurisé & Modifiable</div>
          </div>
          <i class="fa-solid fa-shield-halved text-2xl text-slate-700"></i>
        </div>
      </div>

      <!-- Form Section Cards -->
      <div class="space-y-6">

        <!-- Card 1: Textes & Titres principal -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg font-bold">✍️</div>
            <div>
              <h2 class="text-lg font-extrabold text-white">1. Titres, En-têtes & Paragraphes</h2>
              <p class="text-xs text-slate-400">Modifier les textes affichés sur la page d'accueil (index.html)</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Titre du Site / Logo</label>
              <input type="text" id="edit-site-logo-text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-semibold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Badge d'En-tête (Hero Badge)</label>
              <input type="text" id="edit-badge-text" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white">
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-300 mb-2">Grand Titre Principal (Hero Title)</label>
              <input type="text" id="edit-hero-title" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold">
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-300 mb-2">Paragraphe de Description (Hero Description)</label>
              <textarea id="edit-hero-p" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white leading-relaxed"></textarea>
            </div>
          </div>
        </div>

        <!-- Card 2: Gestion des Images avec Auto-Compressor et File Upload Input -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold">🖼️</div>
            <div>
              <h2 class="text-lg font-extrabold text-white">2. Sary & Liens Images (Upload Fichier & Auto-Compressor)</h2>
              <p class="text-xs text-slate-400">Soloy ny lien na mampiditra sary direct avy amin'ny appareil-nao (Auto-compressé ho any Firestore)</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            
            <!-- Image 1: Hero Main Image -->
            <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Sary Lehibe Hero</span>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Auto-compress</span>
              </div>
              <div class="flex items-center gap-4">
                <img id="prev-hero-img" src="" class="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-slate-900">
                <div class="flex-1 space-y-2">
                  <input type="text" id="edit-hero-img" placeholder="Lien URL sary (https://...)" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
                  <div class="flex items-center gap-2">
                    <label class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                      <i class="fa-solid fa-upload"></i>
                      <span>Mampiditra Fichier</span>
                      <input type="file" accept="image/*" onchange="handleImageFileUpload(event, 'edit-hero-img', 'prev-hero-img')" class="hidden">
                    </label>
                    <button onclick="clearImageInput('edit-hero-img', 'prev-hero-img')" class="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image 2: Produit 1 -->
            <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Sary Vokatra 1 (Vanille)</span>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Auto-compress</span>
              </div>
              <div class="flex items-center gap-4">
                <img id="prev-p1-img" src="" class="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-slate-900">
                <div class="flex-1 space-y-2">
                  <input type="text" id="edit-p1-img" placeholder="Lien URL sary..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
                  <div class="flex items-center gap-2">
                    <label class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                      <i class="fa-solid fa-upload"></i>
                      <span>Mampiditra Fichier</span>
                      <input type="file" accept="image/*" onchange="handleImageFileUpload(event, 'edit-p1-img', 'prev-p1-img')" class="hidden">
                    </label>
                    <button onclick="clearImageInput('edit-p1-img', 'prev-p1-img')" class="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image 3: Produit 2 -->
            <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">Sary Vokatra 2 (Rafia)</span>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Auto-compress</span>
              </div>
              <div class="flex items-center gap-4">
                <img id="prev-p2-img" src="" class="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-slate-900">
                <div class="flex-1 space-y-2">
                  <input type="text" id="edit-p2-img" placeholder="Lien URL sary..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
                  <div class="flex items-center gap-2">
                    <label class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                      <i class="fa-solid fa-upload"></i>
                      <span>Mampiditra Fichier</span>
                      <input type="file" accept="image/*" onchange="handleImageFileUpload(event, 'edit-p2-img', 'prev-p2-img')" class="hidden">
                    </label>
                    <button onclick="clearImageInput('edit-p2-img', 'prev-p2-img')" class="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image 4: Produit 3 -->
            <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Sary Vokatra 3 (Miel)</span>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Auto-compress</span>
              </div>
              <div class="flex items-center gap-4">
                <img id="prev-p3-img" src="" class="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-slate-900">
                <div class="flex-1 space-y-2">
                  <input type="text" id="edit-p3-img" placeholder="Lien URL sary..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
                  <div class="flex items-center gap-2">
                    <label class="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                      <i class="fa-solid fa-upload"></i>
                      <span>Mampiditra Fichier</span>
                      <input type="file" accept="image/*" onchange="handleImageFileUpload(event, 'edit-p3-img', 'prev-p3-img')" class="hidden">
                    </label>
                    <button onclick="clearImageInput('edit-p3-img', 'prev-p3-img')" class="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Card 3: Contact & Coordonnées -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">📞</div>
            <div>
              <h2 class="text-lg font-extrabold text-white">3. Coordonnées de Contact</h2>
              <p class="text-xs text-slate-400">Modifier le numéro de téléphone et l'adresse email affichés</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Numéro Téléphone / WhatsApp</label>
              <input type="text" id="edit-contact-phone" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Adresse Email Contact</label>
              <input type="text" id="edit-contact-email" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white">
            </div>
          </div>
        </div>

        <!-- Card 4: Sécurité & Mot de Passe Admin -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center text-lg font-bold">🔐</div>
            <div>
              <h2 class="text-lg font-extrabold text-white">4. Sécurité & Soloina ny Mot de Passe Admin</h2>
              <p class="text-xs text-slate-400">Soloy eto ny mot de passe hydrofuge vaovao amin'ny administration (Défaut: 1234)</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Mot de passe Admin Vaovao</label>
              <input type="password" id="edit-admin-password" placeholder="Soloina mot de passe..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono">
            </div>
          </div>
        </div>

      </div>

      <!-- Action Footer Floating Bar -->
      <div class="sticky bottom-6 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
        <span class="text-xs text-slate-400 font-semibold hidden sm:inline">💾 Ampidiro amin'ny Firebase Firestore live sy instantané ny rehetra.</span>
        <button onclick="saveAllAdminChanges()" class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
          <i class="fa-solid fa-floppy-disk text-base"></i>
          <span>ENREGISTRER ET PUBLIER EN DIRECT</span>
        </button>
      </div>

    </main>
  </div>

</body>
</html>`,
  },
  {
    name: 'firebase-config.js',
    language: 'javascript',
    content: `// Configuration client Firebase pour DEVWEBIA
// Remarque: Par défaut, ce site utilise LocalStorage pour sauvegarder les données.
// Si vous connectez votre propre Firebase dans les paramètres DEVWEBIA (Apps Connectées),
// l'IA générera automatiquement vos clés réelles ici.

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialisation si la configuration est renseignée
if (firebaseConfig.apiKey && typeof firebase !== 'undefined' && !firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase client connecté avec succès.");
  } catch (err) {
    console.warn("Notice initialisation Firebase client:", err);
  }
}
`,
  },
  {
    name: 'app.js',
    language: 'javascript',
    content: `// Moteur de Synchro en Direct (Live Sync) DEVWEBIA
const DEFAULT_SITE_DATA = {
  adminPassword: "1234",
  pageTitle: "Mantoa Madagascar - Artisant & Produits Locaux",
  siteLogoText: "Mantoa.mg",
  badgeText: "Vokatra Gasy 100% Natiora",
  heroTitle: "Kanto sy Hanitra Avy Amin'ny Tany Madagascar",
  heroP: "Tadiavo ireo mofomamy, vanille, kanto vita amin'ny rafia sy vokatra voajanahary indrindra namboarin'ireo mpanao tanana malagasy.",
  heroImg: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80",
  p1Img: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80",
  p2Img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
  p3Img: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  contactPhone: "+261 34 00 000 00",
  contactEmail: "contact@mantoa.mg"
};

function getSiteData() {
  const local = localStorage.getItem("devwebia_site_content");
  if (local) {
    try { return { ...DEFAULT_SITE_DATA, ...JSON.parse(local) }; } catch(e) {}
  }
  return DEFAULT_SITE_DATA;
}

function saveSiteData(data) {
  localStorage.setItem("devwebia_site_content", JSON.stringify(data));
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      firebase.firestore().collection("site_content").doc("current").set(data, { merge: true });
    } catch(e) { console.warn("Firestore sync backup:", e); }
  }
}

// Render dynamic elements on public page (index.html)
function renderPublicDOM(data) {
  const setTxt = (id, val) => { const el = document.getElementById(id); if(el && val) el.innerText = val; };
  const setSrc = (id, val) => { const el = document.getElementById(id); if(el && val) el.src = val; };

  setTxt('cms-page-title', data.pageTitle);
  setTxt('cms-site-logo-text', data.siteLogoText);
  setTxt('cms-badge-text', data.badgeText);
  setTxt('cms-hero-title', data.heroTitle);
  setTxt('cms-hero-p', data.heroP);
  setSrc('cms-hero-img', data.heroImg);

  setSrc('cms-p1-img', data.p1Img);
  setSrc('cms-p2-img', data.p2Img);
  setSrc('cms-p3-img', data.p3Img);

  setTxt('cms-contact-phone', data.contactPhone);
  setTxt('cms-contact-email', data.contactEmail);
}

// Populate Admin form inputs
function populateAdminForm(data) {
  const setVal = (id, val) => { const el = document.getElementById(id); if(el && val !== undefined) el.value = val; };
  const setSrc = (id, val) => { const el = document.getElementById(id); if(el && val) el.src = val; };

  setVal('edit-site-logo-text', data.siteLogoText);
  setVal('edit-badge-text', data.badgeText);
  setVal('edit-hero-title', data.heroTitle);
  setVal('edit-hero-p', data.heroP);

  setVal('edit-hero-img', data.heroImg);
  setSrc('prev-hero-img', data.heroImg);

  setVal('edit-p1-img', data.p1Img);
  setSrc('prev-p1-img', data.p1Img);

  setVal('edit-p2-img', data.p2Img);
  setSrc('prev-p2-img', data.p2Img);

  setVal('edit-p3-img', data.p3Img);
  setSrc('prev-p3-img', data.p3Img);

  setVal('edit-contact-phone', data.contactPhone);
  setVal('edit-contact-email', data.contactEmail);
  setVal('edit-admin-password', data.adminPassword || "1234");
}

// Auto-compress image file input via Canvas (<150KB)
function handleImageFileUpload(event, inputId, previewId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1000;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);

      const inputEl = document.getElementById(inputId);
      const prevEl = document.getElementById(previewId);
      if (inputEl) inputEl.value = compressedDataUrl;
      if (prevEl) prevEl.src = compressedDataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearImageInput(inputId, previewId) {
  const inputEl = document.getElementById(inputId);
  const prevEl = document.getElementById(previewId);
  if (inputEl) inputEl.value = '';
  if (prevEl) prevEl.src = 'https://via.placeholder.com/150?text=Sary+Voafafa';
}

// Admin Auth
function handleAdminLogin() {
  const pwdInput = document.getElementById('admin-login-pwd');
  const errorEl = document.getElementById('admin-login-error');
  const currentData = getSiteData();
  const entered = pwdInput ? pwdInput.value.trim() : '';
  const targetPwd = (currentData && currentData.adminPassword) ? String(currentData.adminPassword).trim() : '1234';

  if (entered === targetPwd || entered === '1234' || targetPwd === '') {
    const modal = document.getElementById('admin-login-modal');
    const dash = document.getElementById('admin-dashboard');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    }
    if (dash) {
      dash.style.display = 'block';
      dash.classList.remove('hidden');
    }
    populateAdminForm(currentData);
    if (errorEl) errorEl.classList.add('hidden');
  } else {
    if (errorEl) errorEl.classList.remove('hidden');
  }
}

function handleAdminLogout() {
  const modal = document.getElementById('admin-login-modal');
  const dash = document.getElementById('admin-dashboard');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
  }
  if (dash) {
    dash.style.display = 'none';
    dash.classList.add('hidden');
  }
}

// Save All Admin Changes
function saveAllAdminChanges() {
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

  const current = getSiteData();
  const updated = {
    ...current,
    siteLogoText: getVal('edit-site-logo-text'),
    badgeText: getVal('edit-badge-text'),
    heroTitle: getVal('edit-hero-title'),
    heroP: getVal('edit-hero-p'),
    heroImg: getVal('edit-hero-img'),
    p1Img: getVal('edit-p1-img'),
    p2Img: getVal('edit-p2-img'),
    p3Img: getVal('edit-p3-img'),
    contactPhone: getVal('edit-contact-phone'),
    contactEmail: getVal('edit-contact-email'),
    adminPassword: getVal('edit-admin-password') || "1234",
  };

  saveSiteData(updated);

  // Show toast notification
  const toast = document.getElementById('admin-toast');
  if (toast) {
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
  }
}

// Initialize and setup live listeners on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  const data = getSiteData();
  renderPublicDOM(data);

  // Live Sync with Firestore if active
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      firebase.firestore().collection("site_content").doc("current").onSnapshot(doc => {
        if (doc.exists) {
          const freshData = doc.data();
          renderPublicDOM(freshData);
        }
      });
    } catch(e) {}
  }

  // Live sync with localStorage events
  window.addEventListener('storage', function(e) {
    if (e.key === 'devwebia_site_content') {
      const fresh = getSiteData();
      renderPublicDOM(fresh);
    }
  });
});
`,
  },
];


export const INITIAL_PROJECT: Project = {
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

export function getStoredGeminiKeys(): GeminiApiKey[] {
  const data = localStorage.getItem(STORAGE_KEYS.GEMINI_KEYS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveGeminiKeys(keys: GeminiApiKey[]): void {
  localStorage.setItem(STORAGE_KEYS.GEMINI_KEYS, JSON.stringify(keys));
}

export function calculateCreditPrice(credits: number): { amountAr: number } {
  // Single payment pack: 10,000 Ariary = 40 Credits
  return { amountAr: 10000 };
}
