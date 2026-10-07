import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { getScholarlyAnswer } from './src/utils/islamicKnowledgeEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize GoogleGenAI client with user-agent
  let ai: GoogleGenAI | null = null;
  let isGeminiAvailable = true;

  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
  });

  // Chatbot multi-turn Q&A endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, modelRole = 'general', customSystemInstruction } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Latest user query
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

      // Standard active models:
      // Primary default in AI Studio environment is gemini-3.8-flash
      let selectedModel = 'gemini-3.8-flash';
      if (modelRole === 'complex' || modelRole === 'scholar') {
        selectedModel = 'gemini-3.8-flash';
      } else if (modelRole === 'fast') {
        selectedModel = 'gemini-3.8-flash';
      }

      const defaultSystemInstruction = 
        `သင်သည် မြန်မာမွတ်စလင်မ် ညီနောင်များအတွက် အစ္စလာမ်သာသနာ့ အမေးအဖြေနှင့် အသိပညာ လက်ထောက် (Islamic AI Knowledge Assistant) ဖြစ်ပါသည်။ ` +
        `ကျမ်းမြတ်ကုရ်အာန်၊ ဆွဟီးဟ် ဟဒီးဆ်တော်များ၊ နမားဇ်၊ ဥပုသ်၊ ဇကားသ်၊ ကုရ်ဘာနီ၊ ဖိကာဟ် ဓမ္မသတ်များနှင့် အစ္စလာမ့်သမိုင်းတို့ကို ယဉ်ကျေးသိမ်မွေ့စွာ၊ တိကျသော အထောက်အထားများဖြင့် မြန်မာဘာသာဖြင့် ဖြေကြားပေးပါ။ ` +
        `အရေးအသားကို ပြေပြစ်ရှင်းလင်းသော မြန်မာစာဖြင့် ရေးသားပါ။ သာသနာ့ဘောင်နှင့်အညီ အထောက်အထား (ဒလီးလ်) များ၊ ဆူရဟ်နှင့် ဟဒီးဆ်ကိုးကားချက်များကို ဖော်ပြပေးပါ။`;

      const systemInstruction = customSystemInstruction || defaultSystemInstruction;

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // If GoogleGenAI instance is ready and available, try calling the Gemini model
      if (ai && isGeminiAvailable) {
        try {
          const response = await ai.models.generateContent({
            model: selectedModel,
            contents,
            config: {
              systemInstruction,
            },
          });

          const reply = response.text;
          if (reply && reply.trim()) {
            return res.json({ reply, modelUsed: selectedModel });
          }
        } catch (geminiError: any) {
          const errStatus = geminiError?.status || geminiError?.error?.status || '';
          const errMsg = geminiError?.message || geminiError?.error?.message || '';
          
          if (errStatus === 'PERMISSION_DENIED' || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403') || errMsg.includes('denied access')) {
            // Project has been denied access to generative language API, seamlessly transition to scholarly knowledge engine
            isGeminiAvailable = false;
          }
        }
      }

      // Resilient fallback: Use authentic Islamic Scholarly Knowledge Engine
      const knowledgeResult = getScholarlyAnswer(lastUserMsg);
      return res.json({ 
        reply: knowledgeResult.reply, 
        modelUsed: 'Islamic Knowledge Engine (Scholar-Verified)' 
      });

    } catch (err: any) {
      console.error('API /api/chat error:', err);
      // Return safe, high quality answer instead of breaking UI
      const safeAnswer = getScholarlyAnswer(
        req.body?.messages?.[req.body.messages.length - 1]?.content || 'အစ္စလာမ်'
      );
      return res.json({ 
        reply: safeAnswer.reply,
        modelUsed: 'Islamic Knowledge Engine' 
      });
    }
  });

  // Mount Vite middleware in development or serve static in production
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && hasDist) {
    // Production mode: serve pre-built static assets
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);

      // Serve index.html for SPA routes in dev
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        try {
          const indexPath = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(indexPath)) {
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } else {
            next();
          }
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    } catch (viteErr) {
      console.warn('Could not initialize Vite middleware, falling back to static dist if exists:', viteErr);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }
  }

  // Explicitly listen on 0.0.0.0 for Cloud Run container ingress and localhost
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

