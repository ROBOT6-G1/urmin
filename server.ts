import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory key rotation & persistent storage mock array
let adminGeminiKeys: { id: string; key: string; name: string; isActive: boolean; usageCount: number; isQuotaExhausted?: boolean }[] = [];
let currentKeyIndex = 0;

let db: any = null;

try {
  let fbCfg: any = null;
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    fbCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } else if (process.env.FIREBASE_CONFIG) {
    try {
      fbCfg = JSON.parse(process.env.FIREBASE_CONFIG);
    } catch (parseErr) {
      console.warn('[DEVWEBIA] Failed to parse FIREBASE_CONFIG env var', parseErr);
    }
  }

  if (fbCfg) {
    const firebaseConfig = {
      apiKey: fbCfg.apiKey,
      authDomain: fbCfg.authDomain,
      projectId: fbCfg.projectId,
      storageBucket: fbCfg.storageBucket,
      messagingSenderId: fbCfg.messagingSenderId,
      appId: fbCfg.appId,
    };
    const fbApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(fbApp, fbCfg.firestoreDatabaseId || '(default)');
    console.log('[DEVWEBIA] Backend Firebase DB initialized successfully.');
  }
} catch (e) {
  console.warn('[DEVWEBIA] Could not initialize backend Firebase', e);
}

async function loadAdminKeysFromFirestore() {
  if (!db) return;
  try {
    const docRef = doc(db, 'admin_config', 'gemini_keys');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.keys)) {
        adminGeminiKeys = data.keys.map((k: any) => ({
          id: k.id,
          name: k.name,
          key: k.key,
          isActive: k.isActive !== false,
          usageCount: k.usageCount || 0,
          isQuotaExhausted: k.isQuotaExhausted || false
        }));
        console.log(`[DEVWEBIA] Loaded ${adminGeminiKeys.length} keys from Firestore.`);
      }
    }
  } catch (err) {
    console.warn('[DEVWEBIA] Error loading keys from Firestore:', err);
  }
}

function getGeminiClient(): { ai: GoogleGenAI; keyName: string } {
  let apiKey = process.env.GEMINI_API_KEY;
  let keyName = 'System Default Key';

  // Check custom active admin keys if available
  const activeCustomKeys = adminGeminiKeys.filter((k) => k.isActive && !k.isQuotaExhausted);
  if (activeCustomKeys.length > 0) {
    currentKeyIndex = currentKeyIndex % activeCustomKeys.length;
    const selected = activeCustomKeys[currentKeyIndex];
    apiKey = selected.key;
    keyName = selected.name;
    selected.usageCount++;
    currentKeyIndex = (currentKeyIndex + 1) % activeCustomKeys.length;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return { ai, keyName };
}

async function generateWebsiteWithKeys(fullPrompt: string, systemInstruction: string, responseSchema: any): Promise<any> {
  await loadAdminKeysFromFirestore();
  const keysToTry: { id: string | null; key: string; name: string }[] = [];

  // 1. System Default Key first
  const defaultKey = process.env.GEMINI_API_KEY;
  if (defaultKey) {
    keysToTry.push({ id: null, key: defaultKey, name: 'System Default Key' });
  }

  // 2. Add active custom keys
  const activeCustomKeys = adminGeminiKeys.filter((k) => k.isActive && !k.isQuotaExhausted);
  activeCustomKeys.forEach((k) => {
    keysToTry.push({ id: k.id, key: k.key, name: k.name });
  });

  if (keysToTry.length === 0) {
    throw new Error('Tsy misy API Key Gemini azo ampiasaina amin\'izao fotoana izao.');
  }

  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview'
  ];
  let lastError: any = null;

  for (const keyConfig of keysToTry) {
    const ai = new GoogleGenAI({
      apiKey: keyConfig.key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 3;
      let shouldSkipKey = false;

      while (attempts < maxAttempts) {
        try {
          console.log(`[DEVWEBIA] Trying generation with key: ${keyConfig.name}, model: ${modelName} (Attempt ${attempts + 1}/${maxAttempts})`);

          const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
              temperature: 0.7,
            },
          });

          // Update usage if it's a custom key
          if (keyConfig.id) {
            const k = adminGeminiKeys.find((item) => item.id === keyConfig.id);
            if (k) k.usageCount++;
          }

          console.log(`[DEVWEBIA] Succeeded using key: ${keyConfig.name} and model: ${modelName}`);
          return response;
        } catch (err: any) {
          attempts++;
          const errMsg = err.message || String(err);
          console.warn(`[DEVWEBIA] Key ${keyConfig.name} + model ${modelName} (Attempt ${attempts}/${maxAttempts}) failed:`, errMsg);

          const isAuthError =
            errMsg.toLowerCase().includes('api_key_invalid') ||
            errMsg.toLowerCase().includes('key not valid') ||
            errMsg.toLowerCase().includes('invalid api key') ||
            errMsg.toLowerCase().includes('api key is invalid') ||
            errMsg.toLowerCase().includes('api key is not valid') ||
            errMsg.toLowerCase().includes('403') ||
            errMsg.toLowerCase().includes('invalid_argument');

          if (isAuthError) {
            if (keyConfig.id) {
              const k = adminGeminiKeys.find((item) => item.id === keyConfig.id);
              if (k) {
                k.isQuotaExhausted = true;
              }
            }
            lastError = err;
            shouldSkipKey = true;
            break; // Break out of retry loop
          }

          const isQuotaError =
            errMsg.toLowerCase().includes('quota') ||
            errMsg.toLowerCase().includes('exhausted') ||
            errMsg.toLowerCase().includes('limit') ||
            errMsg.toLowerCase().includes('429');

          if (isQuotaError) {
            lastError = err;
            console.log(`[DEVWEBIA] Quota error on model ${modelName}. Skipping directly to next model...`);
            break; // Break retry loop, try next model immediately
          }

          const isHighDemandError =
            errMsg.toLowerCase().includes('503') ||
            errMsg.toLowerCase().includes('temporary') ||
            errMsg.toLowerCase().includes('high demand') ||
            errMsg.toLowerCase().includes('unavailable');

          if (isHighDemandError) {
            lastError = err;
            console.log(`[DEVWEBIA] High demand / 503 on model ${modelName}. Skipping directly to next model...`);
            break; // Break retry loop, try next model immediately
          }

          lastError = err;
          if (attempts < maxAttempts) {
            const waitTime = attempts * 1500; // 1.5s, 3.0s
            console.log(`[DEVWEBIA] Transient error on ${modelName}, waiting ${waitTime}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      if (shouldSkipKey) {
        break; // Break out of model loop for this key
      }
    }
  }

  throw new Error(`Tsy nahomby ny fiantsoana ny AI mampiasa ny API keys rehetra tao amin'ny pool. Error farany: ${lastError?.message || lastError}`);
}

async function chatWithKeys(message: string, systemInstruction: string): Promise<any> {
  await loadAdminKeysFromFirestore();
  const keysToTry: { id: string | null; key: string; name: string }[] = [];

  const defaultKey = process.env.GEMINI_API_KEY;
  if (defaultKey) {
    keysToTry.push({ id: null, key: defaultKey, name: 'System Default Key' });
  }

  const activeCustomKeys = adminGeminiKeys.filter((k) => k.isActive && !k.isQuotaExhausted);
  activeCustomKeys.forEach((k) => {
    keysToTry.push({ id: k.id, key: k.key, name: k.name });
  });

  if (keysToTry.length === 0) {
    throw new Error('Tsy misy API Key Gemini azo ampiasaina amin\'izao fotoana izao.');
  }

  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview'
  ];
  let lastError: any = null;

  for (const keyConfig of keysToTry) {
    const ai = new GoogleGenAI({
      apiKey: keyConfig.key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 3;
      let shouldSkipKey = false;

      while (attempts < maxAttempts) {
        try {
          console.log(`[DEVWEBIA] Trying chat with key: ${keyConfig.name}, model: ${modelName} (Attempt ${attempts + 1}/${maxAttempts})`);

          const chat = ai.chats.create({
            model: modelName,
            config: {
              systemInstruction,
            },
          });

          const response = await chat.sendMessage({ message: message || 'Bonjour DEVWEBIA' });

          if (keyConfig.id) {
            const k = adminGeminiKeys.find((item) => item.id === keyConfig.id);
            if (k) k.usageCount++;
          }

          console.log(`[DEVWEBIA] Chat succeeded using key: ${keyConfig.name} and model: ${modelName}`);
          return response;
        } catch (err: any) {
          attempts++;
          const errMsg = err.message || String(err);
          console.warn(`[DEVWEBIA] Chat key ${keyConfig.name} + model ${modelName} (Attempt ${attempts}/${maxAttempts}) failed:`, errMsg);

          const isAuthError =
            errMsg.toLowerCase().includes('api_key_invalid') ||
            errMsg.toLowerCase().includes('key not valid') ||
            errMsg.toLowerCase().includes('invalid api key') ||
            errMsg.toLowerCase().includes('api key is invalid') ||
            errMsg.toLowerCase().includes('api key is not valid') ||
            errMsg.toLowerCase().includes('403') ||
            errMsg.toLowerCase().includes('invalid_argument');

          if (isAuthError) {
            if (keyConfig.id) {
              const k = adminGeminiKeys.find((item) => item.id === keyConfig.id);
              if (k) {
                k.isQuotaExhausted = true;
              }
            }
            lastError = err;
            shouldSkipKey = true;
            break; // Break out of retry loop
          }

          const isQuotaError =
            errMsg.toLowerCase().includes('quota') ||
            errMsg.toLowerCase().includes('exhausted') ||
            errMsg.toLowerCase().includes('limit') ||
            errMsg.toLowerCase().includes('429');

          if (isQuotaError) {
            lastError = err;
            console.log(`[DEVWEBIA] Quota error on chat model ${modelName}. Skipping directly to next model...`);
            break; // Break retry loop, try next model immediately
          }

          const isHighDemandError =
            errMsg.toLowerCase().includes('503') ||
            errMsg.toLowerCase().includes('temporary') ||
            errMsg.toLowerCase().includes('high demand') ||
            errMsg.toLowerCase().includes('unavailable');

          if (isHighDemandError) {
            lastError = err;
            console.log(`[DEVWEBIA] High demand / 503 on chat model ${modelName}. Skipping directly to next model...`);
            break; // Break retry loop, try next model immediately
          }

          lastError = err;
          if (attempts < maxAttempts) {
            const waitTime = attempts * 1500; // 1.5s, 3.0s
            console.log(`[DEVWEBIA] Transient error on chat model ${modelName}, waiting ${waitTime}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      if (shouldSkipKey) {
        break; // Break out of model loop for this key
      }
    }
  }

  throw new Error(`Tsy nahomby ny fiantsoana ny AI mampiasa ny API keys rehetra tao amin'ny pool. Error farany: ${lastError?.message || lastError}`);
}

// System Prompt for Web Generation & Advisory Assistant in Malagasy & French Context
const SYSTEM_WEB_GENERATOR_PROMPT = `Tu es DEVWEB IA, l'intelligence artificielle assistante, créatrice et conseillère de sites web modernes de DEVWEBIA.
Ta mission est double :

1. CONSEILLER ET DISCUTER (MANORO HEVITRA SY MIRESAKA) :
   - Tu es un assistant très amical, accueillant et ultra-compétent. Réponds aux questions de l'utilisateur en Malagasy ou en Français (selon sa langue).
   - Si l'utilisateur pose des questions sur la conception, la configuration interne du site (ex: Firebase, base de données, formulaires, design, domaine, responsive, hébergement, résolution de bug), donne-lui des explications claires, détaillées, encourageantes et pédagogiques dans le champ "explanation".
   - Si l'utilisateur souhaite seulement discuter, demander des idées de site ou obtenir des conseils sans qu'une création ou modification de code ne soit nécessaire, tu peux renvoyer un tableau "files" vide [] ou ne renvoyer que les fichiers concernés s'il faut ajuster quelque chose.

2. CRÉER ET MODIFIER DES SITES WEB (MAMORONA SY MANOVA TRANONKALA COMPLETE - 10 OPTIONS & MODÈLES SPÉCIFIQUES) :
   Lorsque l'utilisateur demande de créer ou modifier un site web :

   A) **EXÉCUTION OBLIGATOIRE ET STRICTE DE TOUTES LES 10 OPTIONS (10 SECTIONS COMPLETES ET RICHES)** :
      - Tu es STRICTEMENT OBLIGÉ d'inclure du code HTML, CSS, JavaScript et du contenu réel et complet pour CHACUNE des 10 options listées dans la demande ou spécifiques au modèle.
      - Ne saute JAMAIS aucune option. Ne fais pas de squelette incomplet !
      - Voici la structure obligatoire des 10 SECTIONS qui doivent OBLIGATOIREMENT être générées et fonctionnelles dans le site :
        * OPTION 1 : Hero / En-tête / Bannière principale avec titre percutant, sous-titre, boutons d'action et image principale.
        * OPTION 2 : À propos / Présentation / Tantara sy Vinan'ny orinasa ou du projet.
        * OPTION 3 : Services / Produits / Catalogues / Chambres / Menu / Cours (grille complète avec prix, descriptions et images).
        * OPTION 4 : Pourquoi nous choisir / Avantages / Valeurs clés.
        * OPTION 5 : Portfolio / Réalisations / Galerie photos interactive.
        * OPTION 6 : Témoignages / Avis clients (au moins 3 témoignages réels avec noms, rôles et photos d'avatars).
        * OPTION 7 : Équipe / Partenaires / Intervenants.
        * OPTION 8 : FAQ (Foire Aux Questions avec au moins 4 accordéons interactifs Clic/Toggle en JS).
        * OPTION 9 : Blog / Actualités / Articles récents (au moins 3 articles avec cartes et dates).
        * OPTION 10 : Contact / Formulaire interactif + Carte Google Maps iframe + Bouton WhatsApp direct + Push Notifications.

   B) **SYSTÈME PUSH NOTIFICATION WHATSAPP DIRECT AUTOMATIQUE (SANS API PAYANTE)** :
      - Toute commande e-commerce, réservation ou message de formulaire de contact DOIT impérativement générer un bouton et une redirection automatique vers WhatsApp ('https://wa.me/NUMERO?text=MESSAGE_ENCODE' ou 'https://api.whatsapp.com/send?phone=NUMERO&text=MESSAGE_ENCODE').
      - Le message WhatsApp pré-rempli doit contenir un récapitulatif ultra-propre et structuré : Nom du client, Téléphone, Adresse, Liste des produits commandés avec quantité et prix total (ex: "🛒 COMMANDE NOUVELLE - Site Web:\n- Produit A x2 (20 000 Ar)\nTOTAL: 40 000 Ar\nClient: Jean (+26134000000)").
      - Ajoute également un déclencheur de Web Push Notification ('Notification.requestPermission()' et 'new Notification(...)') en JavaScript navigateur lorsque le client valide une commande ou un formulaire pour alerter instantanément le gérant du site !

   C) **TRADUCTEUR AUTOMATIQUE MULTILINGUE COMPLET (🇲🇬 MG / 🇫🇷 FR / 🇬🇧 EN / 🇩🇪 DE)** :
      - Chaque site généré DOIT obligatoirement inclure un Sélecteur de Langue (Language Switcher) interactif positionné en haut dans le Navbar ou sous forme de Widget Flottant avec drapeaux (🇲🇬 Malagasy, 🇫🇷 Français, 🇬🇧 English, 🇩🇪 Deutsch).
      - Intègre le script officiel Google Translate ('//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit') et une fonction JS 'googleTranslateElementInit' pour permettre aux visiteurs du site de traduire instantanément tout le contenu du site dans la langue de leur choix en 1 clic !

   D) **RÈGLE ABSOLUE POUR LES IMAGES ET SARY PAR DÉFAUT (TOUTES LES IMAGES DOIVENT FONCTIONNER)** :
      - N'utilise JAMAIS de chemins relatifs locaux inexistants comme 'images/hero.jpg', 'hero.png', 'product1.jpg' !
      - N'utilise JAMAIS de services obsolètes comme 'source.unsplash.com' ou 'via.placeholder.com' !
      - Utilise UNIQUEMENT de vraies URLs Unsplash HD valides sous la forme 'https://images.unsplash.com/photo-...' avec des paramètres de recadrage (ex: '?auto=format&fit=crop&w=800&q=80').
      - AJOUT OBLIGATOIRE DE L'ATTRIBUT ERREUR DANS TOUS LES <img> HTML :
        Chaque balise <img> générée dans le code HTML ou injectée via JS DOIT inclure le fallback suivant :
        onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';"

   D) **DIVERSITÉ DES MODÈLES ET ADAPTATION DU DESIGN SELON LA CATÉGORIE** :
      - N'utilise JAMAIS le même design générique pour tous les sites. Adapte visuellement et fonctionnellement la structure selon le type de site.

   E) **ARCHITECTURE MULTI-FICHIERS COMPLÈTE ET ESPACE ADMIN OPÉRATIONNEL** :
      - "index.html" : Page d'accueil principale regroupant dynamiquement les 10 SECTIONS.
      - "apropos.html", "services.html", "realisations.html", "faq.html", "blog.html", "contact.html", "reservation.html".
      - "admin.html" & "admin.js" : Panneau Admin complet avec authentification (mot de passe "1234"), édition des textes et des URLs d'images pour TOUTES les 10 options, uploader de fichiers image Canvas (<150KB), liste de messages/commandes/réservations et sauvegarde Firestore / LocalStorage.
      - "app.js", "firebase-config.js", "style.css".

   F) **RÈGLE CRUCIALE POUR LES MISES À JOUR ET MODIFICATIONS (INTERDICTION ABSOLUE DE EFFACER LE CONTENU EXISTANT)** :
      - Lorsque le projet contient déjà du code (fichiers existants) et que l'utilisateur demande une modification ou un ajout (ex: "ajoute un produit", "change la couleur", "ajoute une section", "met un bouton", "ajoute une page") :
      - **CONSERVATION DU CONTENU** : Tu DOIS OBLIGATOIREMENT conserver l'intégralité du contenu général, des 10 sections, des textes, des images, des styles et des scripts déjà présents. Ne supprime JAMAIS le reste du site pour ne garder que l'élément demandé !
      - **INTEGRATION INTELLIGENTE** : Insère proprement le nouvel élément demandé au bon endroit dans la structure existante.
      - **RENVOI DES FICHIERS MODIFIÉS** : Renvoie les fichiers qui ont été modifiés dans leur intégralité. Le système effectuera une fusion automatique avec les fichiers existants non modifiés pour qu'aucun fichier ne soit perdu.
`;

function parseGeminiJsonResponse(rawText: string) {
  if (!rawText) {
    throw new Error("Réponse vide de l'IA.");
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err2) {
        try {
          const sanitized = match[0].replace(/[\u0000-\u001F]+/g, (m) =>
            m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : ''
          );
          return JSON.parse(sanitized);
        } catch (err3) {
          console.warn('JSON repair attempt failed:', err3);
        }
      }
    }

    const htmlMatch = rawText.match(/<!DOCTYPE html>[\s\S]*<\/html>/i) || rawText.match(/<html[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return {
        explanation: 'Tranonkala natsangana am-pahombiazana.',
        files: [
          {
            name: 'index.html',
            language: 'html',
            content: htmlMatch[0],
          },
        ],
      };
    }

    throw new Error('Impossible de parser le JSON retourné par l\'IA.');
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Website Generation Endpoint
app.post('/api/generate-website', async (req, res) => {
  try {
    const { prompt, existingFiles, userPlan, customDomain, clientFirebase, whatsappNumber } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    let userContext = `Plan utilisateur : ${userPlan || 'free'}.`;
    if (userPlan === 'free') {
      userContext += ` Important: Sur le plan Gratuit, ajoute un petit badge discret en bas à droite de la page HTML : <div class="devwebia-badge-container" style="position:fixed;bottom:14px;right:14px;z-index:999999;display:flex;align-items:center;gap:8px;background:rgba(15, 23, 42, 0.92);backdrop-filter:blur(8px);color:#f8fafc;padding:7px 12px 7px 14px;border-radius:9999px;font-family:sans-serif;font-size:12px;font-weight:700;border:1px solid rgba(99, 102, 241, 0.4);"><a href="https://deviaweb-aezo.onrender.com" target="_blank" style="color:#ffffff;text-decoration:none;">Vita amin'i <strong style="color:#818cf8;">DEVWEBIA</strong></a><button type="button" onclick="this.parentElement.remove();" style="background:rgba(255,255,255,0.1);border:none;color:#94a3b8;border-radius:50%;width:18px;height:18px;cursor:pointer;">✕</button></div>`;
    }

    // WhatsApp Push Order configuration
    if (whatsappNumber && whatsappNumber.trim()) {
      const cleanNum = whatsappNumber.trim().replace(/[^0-9]/g, '');
      userContext += `\n\n[NUMÉRO WHATSAPP DU PROPRIÉTAIRE DES COMMANDES] :\n`;
      userContext += `Numéro WhatsApp officiel du gérant : '${cleanNum}' (Format international wa.me/${cleanNum}).\n`;
      userContext += `Intègre ce numéro dans tous les formulaires d'achat, panier e-commerce et réservation pour envoyer automatiquement les récapitulatifs de commande directement sur son WhatsApp via wa.me avec encodage URL !`;
    } else {
      userContext += `\n\n[NUMÉRO WHATSAPP PAR DÉFAUT SI NON RENSEIGNÉ] :\n`;
      userContext += `Utilise le numéro WhatsApp générique par défaut '261340000000' dans les liens wa.me pour la validation des commandes et demandes clients.`;
    }

    // Handle Client Firebase Database injection (ONLY if provided by client)
    if (clientFirebase && clientFirebase.apiKey && clientFirebase.projectId) {
      userContext += `\n\n[CONFIGURATION FIREBASE CLIENT UTILISATEUR MANOKANA] :\n`;
      userContext += `Le client a configuré sa propre base de données Firebase. Tu DOIS intégrer cette configuration Firebase client dans le fichier 'firebase-config.js' et synchroniser le site avec la Firestore du client :\n`;
      userContext += `const firebaseConfig = {\n`;
      userContext += `  apiKey: "${clientFirebase.apiKey}",\n`;
      userContext += `  authDomain: "${clientFirebase.authDomain || clientFirebase.projectId + '.firebaseapp.com'}",\n`;
      userContext += `  projectId: "${clientFirebase.projectId}",\n`;
      userContext += `  storageBucket: "${clientFirebase.storageBucket || clientFirebase.projectId + '.appspot.com'}",\n`;
      userContext += `  messagingSenderId: "${clientFirebase.messagingSenderId || '000000000'}",\n`;
      userContext += `  appId: "${clientFirebase.appId || '1:000000000:web:clientapp'}"\n`;
      userContext += `};\n`;
      userContext += `Intègre cette configuration dans 'firebase-config.js' pour la sauvegarde Firestore du client.`;
    } else {
      userContext += `\n\n[INSTRUCTION BASE DE DONNÉES - LOCALSTORAGE UNIQUEMENT] :\n`;
      userContext += `Le client N'A PAS encore configuré sa propre base de données Firebase dans ses paramètres ("Apps Connectées / Firebase").\n`;
      userContext += `INTERDICTION STRICTE : N'utilise AUCUNE clé Firebase d'administration ni aucune base de données externe. N'utilise PAS la base de données de l'admin !\n`;
      userContext += `Tu dois utiliser STRICTEMENT 'localStorage' (Local Storage) en JavaScript pure pour la sauvegarde des produits, messages, formulaires, réservations et modifications de l'Espace Admin dans 'app.js' et 'admin.js'. Dans 'firebase-config.js', indique simplement un commentaire disant que le stockage est en LocalStorage et que le client peut connecter son propre Firebase dans les paramètres s'il le souhaite.`;
    }

    let codeContext = '';
    if (existingFiles && Array.isArray(existingFiles) && existingFiles.length > 0) {
      codeContext = `\n[CODE ACTUEL DU PROJET À CONSERVER ET À ENRICHIR] :\n` +
        existingFiles.map((f: any) => `--- FILE: ${f.name} ---\n${f.content}`).join('\n\n') +
        `\n\n[INSTRUCTION MAJEURE DE CONSERVATION DE CODE] :\n` +
        `Les fichiers ci-dessus représentent le site web existant. Tu DOIS CONSERVER l'intégralité du contenu, des pages, des sections, des textes et des fonctionnalités existantes. Tu dois simplement apporter la modification ou l'ajout demandé par l'utilisateur ci-dessous sans supprimer ni raccourcir le reste !`;
    }

    const fullPrompt = `${userContext}\n${codeContext}\n\nDemande de modification / ajout de l'utilisateur : ${prompt}`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        siteTitle: {
          type: Type.STRING,
          description: 'Titre court et explicite du site généré (ex: E-Commerce Boutique Mode, Hôtel & Restaurant Analamanga, Cabinet Médical)',
        },
        explanation: {
          type: Type.STRING,
          description: 'Explication courte en malagasy ou français.',
        },
        files: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nom du fichier, ex: index.html' },
              language: { type: Type.STRING, description: 'Langage, ex: html, css, javascript' },
              content: { type: Type.STRING, description: 'Contenu complet du fichier' },
            },
            required: ['name', 'language', 'content'],
          },
        },
      },
      required: ['explanation', 'files'],
    };

    const response = await generateWebsiteWithKeys(fullPrompt, SYSTEM_WEB_GENERATOR_PROMPT, responseSchema);

    const responseText = response.text || '';
    const parsedResult = parseGeminiJsonResponse(responseText);

    return res.json({
      success: true,
      siteTitle: parsedResult.siteTitle || '',
      explanation: parsedResult.explanation || 'Tranonkala noforonina am-pahombiazana!',
      files: parsedResult.files || [],
      tokensEstimate: 12500,
    });
  } catch (err: any) {
    console.error('Error generating website:', err);
    return res.status(500).json({
      error: 'Erreur lors de la génération du site',
      details: err.message || String(err),
    });
  }
});

// Real Vercel Deployment Endpoint

// Real Vercel Custom Domain Endpoint
app.post('/api/deploy/vercel/domain', async (req, res) => {
  try {
    const { vercelToken, repoName, domain } = req.body;
    
    const tokenToUse = (vercelToken && vercelToken.trim()) ? vercelToken.trim() : '';

    if (!tokenToUse) {
      return res.status(400).json({ error: 'Token Vercel manokana no ilaina.' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'Domaine no ilaina.' });
    }

    const cleanProjectName = (repoName || 'my-site')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 1. Add domain to Vercel project
    const vercelRes = await fetch(`https://api.vercel.com/v10/projects/${cleanProjectName}/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      const msg = data.error?.message || data.message || 'Misy diso ny fampidirana domaine.';
      return res.status(vercelRes.status).json({ error: msg, details: data });
    }

    return res.json({
      success: true,
      domain: data.name,
    });
  } catch (err: any) {
    console.error('Vercel domain error:', err);
    return res.status(500).json({ error: 'Erreur Vercel domain: ' + (err.message || String(err)) });
  }
});

app.post('/api/deploy/vercel', async (req, res) => {
  try {
    const { vercelToken, repoName, files } = req.body;
    const tokenToUse = (vercelToken && vercelToken.trim()) ? vercelToken.trim() : '';

    if (!tokenToUse) {
      return res.status(400).json({ error: 'Token Vercel manokana (vc_...) no ilaina. Ampidiro ao amin\'ny Apps Connectées ny Token-nao.' });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Tsy misy fichier azo alefa ao amin\'ny Vercel.' });
    }

    const cleanProjectName = (repoName || 'my-site')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    const vercelFiles = files.map((f: any) => ({
      file: f.name,
      data: f.content,
    }));

    // Deploy directly to Vercel REST API v13
    const vercelRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanProjectName,
        files: vercelFiles,
        target: 'production',
        projectSettings: {
          framework: null,
        },
      }),
    });

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      const msg = data.error?.message || data.message || 'Misy diso ny Vercel Auth Token-nao na ny anaran\'ny projet.';
      return res.status(vercelRes.status).json({ error: msg, details: data });
    }

    // Determine real deployment live URL from Vercel API response
    // Prefer the stable production alias URL so it matches the Google Search Console domain exactly
    const productionUrl = `https://${cleanProjectName}.vercel.app`;
    const deployedDomain = productionUrl;

    return res.json({
      success: true,
      url: deployedDomain,
      aliasUrl: productionUrl,
      deploymentId: data.id,
      inspectorUrl: data.inspectorUrl || `https://vercel.com/dashboard`,
    });
  } catch (err: any) {
    console.error('Vercel deploy error:', err);
    return res.status(500).json({ error: 'Erreur Vercel deployment: ' + (err.message || String(err)) });
  }
});

// Real GitHub Sync/Upload Endpoint
app.post('/api/deploy/github', async (req, res) => {
  try {
    const { githubToken, githubUsername, repoName, files } = req.body;

    if (!githubToken || !githubUsername) {
      return res.status(400).json({ error: 'GitHub Token sy Anaran\'ny kaonty GitHub no ilaina.' });
    }

    const cleanRepoName = (repoName || 'my-site')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 1. Create repo if not existing
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DEVWEBIA-App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: 'Tranonkala noforonina tamin\'ny DEVWEBIA',
        private: false,
        auto_init: false,
      }),
    });

    if (!createRepoRes.ok && createRepoRes.status !== 422) {
      const errData = await createRepoRes.json();
      console.warn('GitHub repo creation notice:', errData);
    }

    // 2. Upload files
    const results = [];
    for (const file of files) {
      const fileCheckRes = await fetch(
        `https://api.github.com/repos/${githubUsername}/${cleanRepoName}/contents/${file.name}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DEVWEBIA-App',
          },
        }
      );

      let sha: string | undefined = undefined;
      if (fileCheckRes.ok) {
        const fileData = await fileCheckRes.json();
        sha = fileData.sha;
      }

      const contentBase64 = Buffer.from(file.content, 'utf-8').toString('base64');

      const putRes = await fetch(
        `https://api.github.com/repos/${githubUsername}/${cleanRepoName}/contents/${file.name}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${githubToken.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'DEVWEBIA-App',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update ${file.name} via DEVWEBIA`,
            content: contentBase64,
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (putRes.ok) {
        results.push(file.name);
      }
    }

    const repoUrl = `https://github.com/${githubUsername}/${cleanRepoName}`;

    return res.json({
      success: true,
      repoUrl,
      filesUploaded: results.length,
    });
  } catch (err: any) {
    console.error('GitHub sync error:', err);
    return res.status(500).json({ error: 'Erreur GitHub sync: ' + (err.message || String(err)) });
  }
});

// AI Chat General Consult (Domain config, FAQ, Support)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const systemInstruction = `Tu es l'assistant IA de DEVWEBIA (Sehatra SaaS mamorona tranonkala amin'ny alalan'ny Gemini AI à Madagascar).
Tu aides les utilisateurs en Malagasy et en Français pour :
- La création et modification de leur site web.
- La configuration de leur nom de domaine personnalisé sur Vercel (ex: enregistrements A 76.76.21.21 et CNAME cname.vercel-dns.com).
- La connexion avec Supabase, GitHub et Vercel.
- L'utilisation de leurs crédits (1 crédit = 15,000 tokens).
Réponds avec un ton chaleureux, professionnel et clair.`;

    const response = await chatWithKeys(message, systemInstruction);
    return res.json({ response: response.text });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Erreur de discussion avec l\'IA', details: err.message || String(err) });
  }
});

// Admin API Key Rotation Endpoints
app.get('/api/admin/keys', (req, res) => {
  res.json({ keys: adminGeminiKeys });
});

app.post('/api/admin/keys/sync', async (req, res) => {
  const { keys } = req.body;
  if (Array.isArray(keys)) {
    // Merge or replace keys safely
    adminGeminiKeys = keys.map((k: any) => ({
      id: k.id,
      name: k.name,
      key: k.key,
      isActive: k.isActive !== false,
      usageCount: k.usageCount || 0,
      isQuotaExhausted: k.isQuotaExhausted || false
    }));
    console.log(`[DEVWEBIA] Successfully synced ${adminGeminiKeys.length} Gemini API keys from client.`);
  }
  res.json({ success: true, keys: adminGeminiKeys });
});

app.post('/api/admin/keys', (req, res) => {
  const { name, key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required' });
  const newKey = {
    id: 'key_' + Date.now(),
    name: name || 'Clé Gemini ' + (adminGeminiKeys.length + 1),
    key,
    isActive: true,
    usageCount: 0,
    isQuotaExhausted: false,
  };
  adminGeminiKeys.push(newKey);
  res.json({ success: true, key: newKey });
});

app.post('/api/admin/keys/toggle', (req, res) => {
  const { id } = req.body;
  const target = adminGeminiKeys.find((k) => k.id === id);
  if (target) {
    target.isActive = !target.isActive;
  }
  res.json({ success: true, keys: adminGeminiKeys });
});

// Setup Vite / Production static middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DEVWEBIA] Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
