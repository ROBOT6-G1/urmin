import React, { useState, useMemo } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, Sparkles, Send, Search, BookOpen, CreditCard, Users, Code, Globe, ShieldCheck } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  id: number;
  category: 'general' | 'credits' | 'referral' | 'features' | 'deployment' | 'security';
  q: string;
  a: string;
  tags: string[];
}

const FAQS: FaqItem[] = [
  // Category 1: Présentation et Généralités
  {
    id: 1,
    category: 'general',
    q: "Inona no atao hoe DEVWEBIA ary iza no afaka mampiasa azy?",
    a: "DEVWEBIA dia sehatra SaaS IA noforonina manokana ho an'ny mpamorona tranonkala, mpandraharaha, e-commerçants ary créateurs de contenu eto Madagasikara sy maneran-tany. Miasa amin'ny alalan'ny Gemini AI mba hamoronana tranonkala feno, responsive sy miasa avy hatrany ao anatin'ny segondra vitsy fotsiny amin'ny alalan'ny feo na soratra.",
    tags: ['devwebia', 'présentation', 'ia', 'saas', 'malagasy'],
  },
  {
    id: 2,
    category: 'general',
    q: "Moa ve mila mahay coding (HTML, CSS, JS) aho vao afaka mampiasa DEVWEBIA?",
    a: "Tsy mila mahay coding mihitsy ianao! Ampidiro amin'ny fiteny frantsay na malagasy ny hevitrao sy ny mombamomba ny tetikasanao, dia ny Inteligensa Artifisialy ihany no manoratra ny kaody feno, mandamina ny layout, ary mametraka ny sary sy ny endrika kanto ho anao.",
    tags: ['coding', 'débutant', 'no-code', 'facile'],
  },
  {
    id: 3,
    category: 'general',
    q: "Inona avy ireo karazana tranonkala (sites) azo foronina ao amin'i DEVWEBIA?",
    a: "Azonao foronina avokoa ny tranonkala E-commerce (boutique en ligne mifandray amin'ny Mvola/WhatsApp), Portfolios fampisehoana asa, Landing Pages varotra, Blogs fizarana lahatsoratra, Sites vitrines ho an'ny fandraharahana sy fikambanana, ary web apps mifandray amin'ny database.",
    tags: ['e-commerce', 'portfolio', 'landing page', 'blog', 'site web'],
  },

  // Category 2: Crédits IA & Tarification
  {
    id: 4,
    category: 'credits',
    q: "Ahoana no fomba fiasan'ny systeme Crédit WEB IA?",
    a: "Ny 1 Crédit dia mitovy amin'ny hery fiasana 15,000 tokens amin'ny Inteligensa Artifisialy. Isaky ny mamorona tranonkala vaovao na manao fanitsiana lehibe amin'ny alalan'ny AI ianao dia analana 1 Crédit ny kaontinao. Ny fanaovana prévisualisation sy ny fizahana ny kaody dia maimaimpoana hatrany.",
    tags: ['crédit', 'token', 'tarifs', 'ia'],
  },
  {
    id: 5,
    category: 'credits',
    q: "Ahoana no fomba fividianana Crédits sy fandoavana vola (Mvola, Airtel, Orange)?",
    a: "Afaka mividy Crédits amin'ny fomba tsotra sy haingana ianao amin'ny alalan'ny Mobile Money (Mvola, Orange Money, Airtel Money). Mandehana ao amin'ny fizarana 'Recharger Crédits' ao amin'ny menio, fidio ny pack (5 Crédits = 1,000 Ar, 30 Crédits = 5,000 Ar, 100 Crédits = 15,000 Ar), ary mandefasa ny vola amin'ny 0323911654 (RAVELOMANANTSOA URMIN).",
    tags: ['mvola', 'orange money', 'airtel money', 'recharge', 'paiement'],
  },
  {
    id: 6,
    category: 'credits',
    q: "Manao ahoana ny faharetan'ny validation amin'ny fividianana Crédits?",
    a: "Rehefa voarain'ny Admin ny fampandrenesana fandoavana vola sy ny laharana transaction dia ampidirina mDirect ao amin'ny kaontinao ny Crédits ao anatin'ny 1 hatramin'ny 15 minitra raha be indrindra.",
    tags: ['validation', 'délai', 'recharge', 'admin'],
  },
  {
    id: 7,
    category: 'credits',
    q: "Inona no mahasamihafa ny Plan Gratuit sy ny Plan Pro?",
    a: "Plan Gratuit (0 Ar): 5 Crédits bonus amin'ny fidirana voalohany, logo 'Vita amin'i DEVWEBIA' eo amin'ny footera, ary 1Go de stockage. Plan Pro (5,000 Ar / volana): Miala tanteraka ny watermark DEVWEBIA, fahafahana mampiasa Domaine Personnalisé (.com, .mg), accès amin'ny Firebase Firestore, 10Go de stockage, ary +15 Crédits bonus isam-bolana.",
    tags: ['plan gratuit', 'plan pro', 'abonnement', 'watermark'],
  },

  // Category 3: Parrainage & Affiliation
  {
    id: 8,
    category: 'referral',
    q: "Ahoana no fiasan'ny Programme de Parrainage?",
    a: "Isaky ny manana kaonty ao amin'i DEVWEBIA ianao dia mahazo Code Parrain sy Rohy Parrainage manokana. Rehefa misy namana na mpanjifa misoratra anarana amin'ny codera dia mahazo +5 Crédits bonus izy, ary ianao koa mahazo +5 Crédits bonus isaky ny filleul vaovao!",
    tags: ['parrainage', 'code parrain', 'bonus', 'filleul'],
  },
  {
    id: 9,
    category: 'referral',
    q: "Aiza no ahitako ny lisitry ny Filleuls vaovao niditra tamin'ny codera?",
    a: "Mandehana ao amin'ny menio 'Parrainage (+5 Crédits)'. Ao no ahitanao ny Code Parrain-ao, ny rohy azonao zaraina amin'ny Facebook na WhatsApp, ny isan'ny Filleuls tena izy (Réel) efa nisoratra anarana, ary ny lisitry ny daty sy imailaka miafina ho fiarovana ny fiainana manokana.",
    tags: ['liste filleuls', 'réel', 'historique', 'statistiques'],
  },
  {
    id: 10,
    category: 'referral',
    q: "Azo ampiasaina imbetsaka ve ny Code Parrain manokana?",
    a: "Eny, azo zaraina amin'ny olona tsy voafetra ny Code Parrain-ao. Izany hoe raha manana filleuls 20 ianao dia mahazo +100 Crédits bonus maimaimpoana ao amin'ny kaontinao!",
    tags: ['illimité', 'partage', 'facebook', 'whatsapp'],
  },

  // Category 4: Fonctionnalités IA & Code
  {
    id: 11,
    category: 'features',
    q: "Inona no dikan'ny 'Génération par Feo' sy 'Génération par Sary'?",
    a: "Feo (Vocal): Afaka tsindriana ny mikrofona amin'ny Chat dia miteny amin'ny fiteny malagasy na frantsay ianao hamatsiana am-bava ny zavatra tianao havoakan'ny IA. Sary (Image to Code): Afaka ampidirina ao amin'ny Chat ny sary na maquette dia adikain'ny IA ho tranonkala marina izany.",
    tags: ['vocal', 'sary', 'maquette', 'ia', 'multimodal'],
  },
  {
    id: 12,
    category: 'features',
    q: "Azo alaina sy hovaina ve ny kaody feno (Source Code) amin'ny HTML / React / Tailwind?",
    a: "Eny tanteraka! Manana Code Editor feno ao anatin'ny DEVWEBIA ianao. Afaka jerena am-poto-kevitra ny kaody (Code View), hovaina mDirect ny soratra na ny fahasarotana, ary afaka atao 'Export ZIP' mba hankanesana amin'ny VS Code na hamoahana izany amin'ny servera hafa.",
    tags: ['code source', 'export zip', 'react', 'tailwind', 'html'],
  },
  {
    id: 13,
    category: 'features',
    q: "Moa ve miasa amin'ny finday sy tablette ny tranonkala vao foronina?",
    a: "Eny, ny kaody rehetra foronin'i DEVWEBIA dia miaraka amin'ny Tailwind CSS Responsive Design, izany hoe mifanaraka ho azy amin'ny finday (Mobile First), tablette sy kompitera lehibe.",
    tags: ['responsive', 'mobile', 'tablette', 'design'],
  },

  // Category 5: Déploiement & SEO
  {
    id: 14,
    category: 'deployment',
    q: "Ahoana no fomba hamoahana (Publish/Deploy) ny tranonkala amin'ny internet?",
    a: "Misy fomba roa lehibe: 1. Déploiement direct amin'ny Vercel / GitHub: Connecteo ny kaontinao ao amin'ny 'Applications Connectées' dia tsindrio ny 'Publish'. 2. Exportation / Téléchargement ZIP: TélécharGeo ny fichier ZIP feno dia ampidiro amin'ny cPanel, Hostinger, LWS na servera tianao.",
    tags: ['déploiement', 'publish', 'vercel', 'github', 'lws', 'cpanel'],
  },
  {
    id: 15,
    category: 'deployment',
    q: "Ahoana no fomba fampiasana Domaine Personnalisé (ohatra: www.nyboutiqueko.mg)?",
    a: "Ao amin'ny menio 'Domaine Personnalisé', ampidiro ny anarana domaine tianao (ohatra: www.ny-orinasa.mg). Homentsika anao ny CNAME sy DNS records mba hampifandray azy amin'ny servera Vercel na CloudRun amin'ny alalan'ny SSL (HTTPS) maimaimpoana.",
    tags: ['domaine', 'dns', 'cname', 'mg', 'com', 'ssl'],
  },
  {
    id: 16,
    category: 'deployment',
    q: "Moa ve mahazo Referencement SEO sy Google Indexation ny tranonkala?",
    a: "Eny! Manana modal 'Google SEO & Meta' manokana i DEVWEBIA izay mamorona ho azy ny Meta Title, Meta Description, OpenGraph Image ho an'ny Facebook, ary Sitemap XML mba hahitana haingana ny tranonkalanao ao amin'ny Google Search.",
    tags: ['seo', 'google', 'meta tags', 'opengraph', 'sitemap'],
  },

  // Category 6: Sécurité & Support
  {
    id: 17,
    category: 'security',
    q: "Aiza no tehirizina ny angon-drakitra (Data & Storage) ary azo antoka ve?",
    a: "Ny angon-drakitrao sy ny tetikasanao dia tehirizina ao amin'ny Google Cloud Platform sy Firebase Firestore vatsian'ny security rules sy encryption avo lenta. Tsy misy olon-kafa afaka mikitika ny tetikasanao.",
    tags: ['sécurité', 'firebase', 'google cloud', 'données'],
  },
  {
    id: 18,
    category: 'security',
    q: "Inona no atao raha misy diso na tsy mifanaraka amin'ny eritreritro ny valinteny navoakan'ny IA?",
    a: "Azonao atao ny manoratra ao amin'ny Chat fanitsiana mazava (ohatra: 'Ovay ho loko mena ny bouton ary ampidiro ity sary ity'). Ny IA dia mahatadidy ny resaka teo aloha (Context Memory) ary hanitsy izany am-pahasalamana.",
    tags: ['chat', 'fanitsiana', 'context', 'ia'],
  },
  {
    id: 19,
    category: 'security',
    q: "Ahoana no fizotrany raha mila fanampiana teknika mDirect amin'ny olona (Support Client) aho?",
    a: "Azonao atao ny manindry ny menio 'Support & Fanampiana' ao amin'ny Sidebar. Afaka mandefa hafatra mDirect amin'ny WhatsApp na imailaka support ianao na mifandray amin'ny Technicien amin'ny 0323911654.",
    tags: ['support', 'whatsapp', 'téléphone', 'aide'],
  },
  {
    id: 20,
    category: 'security',
    q: "Azo atao ve ny manafoana na manova ny kaonty amin'ny fotoana rehetra?",
    a: "Eny, afaka miala na manavao ny kaontinao (Upgrading to Pro / Downgrading) ianao amin'ny fotoana rehetra avy ao amin'ny Profil na amin'ny alalan'ny mifandray amin'ny Support Client.",
    tags: ['profil', 'compte', 'modification', 'résiliation'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tohina rehetra (20)', icon: BookOpen },
  { id: 'general', label: 'Généralités', icon: HelpCircle },
  { id: 'credits', label: 'Crédits & Mvola', icon: CreditCard },
  { id: 'referral', label: 'Parrainage', icon: Users },
  { id: 'features', label: 'Fonctionnalités IA', icon: Code },
  { id: 'deployment', label: 'Déploiement & SEO', icon: Globe },
  { id: 'security', label: 'Sécurité & Support', icon: ShieldCheck },
];

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  // Filter FAQs by category and search query
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const qLower = faq.q.toLowerCase();
      const aLower = faq.a.toLowerCase();
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        qLower.includes(queryLower) ||
        aLower.includes(queryLower) ||
        faq.tags.some((t) => t.includes(queryLower));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Atsatry ny FAQ DEVWEBIA: ${customQuestion}` }),
      });
      const data = await res.json();
      setAiAnswer(data.response || "Miala tsiny, nisy olana kely tamin'ny valinteny.");
    } catch (err) {
      setAiAnswer("Tsy afaka namaly teo no ho eo ilay IA. Mba andramo indray.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            FAQ / Fanontaniana Matetika (20)
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ireo valin'ny fanontaniana 20 matetika apetraky ny mpanjifa sy ny mpampiasa ao amin'i DEVWEBIA.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hikaroka fanontaniana na teny lakile (ohatra: Mvola, Vercel, Parrainage, Code)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Fafana
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accordion List */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 text-xs">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800/80">
              <p className="font-semibold text-slate-300">Tsy hita amin'ny fikarohana io fanontaniana io.</p>
              <p className="text-xs text-slate-500 mt-1">
                Andramo ampidirina eto ambany amin'ny AI ny fanontanianao manokana.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpenFaq = openIndex === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-slate-950 border rounded-2xl overflow-hidden transition-all ${
                    isOpenFaq ? 'border-emerald-500/40 bg-slate-950/90' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpenFaq ? null : faq.id)}
                    className="w-full p-3.5 text-left font-bold text-slate-200 flex items-start justify-between gap-3 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-[11px] font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        #{faq.id}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    {isOpenFaq ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                  {isOpenFaq && (
                    <div className="px-3.5 pb-3.5 text-slate-300 text-xs leading-relaxed border-t border-slate-900 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* AI Generator FAQ search feature */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Manana fanontaniana hafa amin'i DEVWEBIA? Anontanio mivantana i IA :</span>
          </div>

          <form onSubmit={handleAskAi} className="flex gap-2">
            <input
              type="text"
              placeholder="Soraty eto ny fanontanianao manokana..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isAsking || !customQuestion.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Namaly</span>
            </button>
          </form>

          {isAsking && <div className="text-slate-400 animate-pulse text-[11px]">Efa am-pamaliana ny IA...</div>}

          {aiAnswer && (
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-200 leading-relaxed text-xs">
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
