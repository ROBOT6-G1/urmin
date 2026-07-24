import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory key rotation & persistent storage mock array
let adminGeminiKeys: { id: string; key: string; name: string; isActive: boolean; usageCount: number; isQuotaExhausted?: boolean }[] = [];
let currentKeyIndex = 0;

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

// System Prompt for Web Generation in Malagasy & French Context
const SYSTEM_WEB_GENERATOR_PROMPT = `Tu es DEVWEB IA, un générateur expert de sites web modernes, responsive, esthétiques et fonctionnels.
Ta mission est de créer ou modifier des tranonkala (sites web) complets selon la demande de l'utilisateur.

DIRECTIVES CRUCIALES POUR LE CODE GÉNÉRÉ :
1. Génère toujours du code prêt à être exécuté immédiatement dans un navigateur (HTML5 + Tailwind CSS v3/v4 via CDN/classes + JavaScript ES6+ interactif).
2. Fournis un site Web complet et ultra-soigné (Layout professionnel, typography élégante, animations fluides, boutons interactifs, modals, données réalistes, responsive mobile/desktop).
3. Tu dois TOUJOURS structurer ton code sous forme de fichiers ou d'un fichier HTML bundle principal autonome avec styles et scripts intégrés si nécessaire.
4. Si l'utilisateur demande une modification d'un site existant, prends en compte le code précédent et applique les modifications de manière chirurgicale.
5. Inclus toujours des effets visuels modernes (Smooth transition, Hover effects, Font Awesome ou Lucide icons SVGs, gradients subtils, shadow-lg, dark/light theme si approprié).
6. Ne laisse aucun placeholder 'Lorem Ipsum' générique si un contenu réel est demandé, crée du texte pertinent et attrayant.
7. ACCÈS BASE DE DONNÉES FIREBASE : Tu as accès à la base de données Firebase du client (Firestore, Firebase Auth avec Google, Storage). Si le site nécessite une authentification, une sauvegarde de données, un panier, ou des secrets, tu peux intégrer les scripts Firebase CDN (firebase-app, firebase-auth, firebase-firestore, firebase-storage) avec la configuration Firebase du projet.
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
    const { prompt, existingFiles, userPlan, customDomain } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const { ai } = getGeminiClient();

    let userContext = `Plan utilisateur : ${userPlan || 'free'}.`;
    if (userPlan === 'free') {
      userContext += ` Important: Sur le plan Gratuit, ajoute un petit badge discret en bas à droite de la page HTML : <a href="https://devwebia.mg" target="_blank" style="position:fixed;bottom:12px;right:12px;background:#1e1b4b;color:#a5b4fc;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;text-decoration:none;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:6px;">⚡ vita amin'i DEVWEBIA</a>`;
    }

    let codeContext = '';
    if (existingFiles && Array.isArray(existingFiles) && existingFiles.length > 0) {
      codeContext = `\nVoici le code actuel du projet à modifier ou enrichir :\n` +
        existingFiles.map((f: any) => `--- FILE: ${f.name} ---\n${f.content}`).join('\n\n');
    }

    const fullPrompt = `${userContext}\n${codeContext}\n\nDemande de l'utilisateur : ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_WEB_GENERATOR_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
        },
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    const parsedResult = parseGeminiJsonResponse(responseText);

    return res.json({
      success: true,
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

// AI Chat General Consult (Domain config, FAQ, Support)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const { ai } = getGeminiClient();

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction: `Tu es l'assistant IA de DEVWEBIA (Sehatra SaaS mamorona tranonkala amin'ny alalan'ny Gemini AI à Madagascar).
Tu aides les utilisateurs en Malagasy et en Français pour :
- La création et modification de leur site web.
- La configuration de leur nom de domaine personnalisé sur Vercel (ex: enregistrements A 76.76.21.21 et CNAME cname.vercel-dns.com).
- La connexion avec Supabase, GitHub et Vercel.
- L'utilisation de leurs crédits (1 crédit = 15,000 tokens).
Réponds avec un ton chaleureux, professionnel et clair.`,
      },
    });

    const response = await chat.sendMessage({ message: message || 'Bonjour DEVWEBIA' });
    return res.json({ response: response.text });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Erreur de discussion avec l\'IA' });
  }
});

// Admin API Key Rotation Endpoints
app.get('/api/admin/keys', (req, res) => {
  res.json({ keys: adminGeminiKeys });
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

startServer();
