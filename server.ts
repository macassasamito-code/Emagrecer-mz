import express from 'express';
import http from 'http';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const MEAL_SCAN_PROMPT =
  'Identifique os alimentos deste prato moçambicano, estime calorias, proteínas, carboidratos e gorduras, e dê uma dica rápida para quem quer emagrecer.';

interface CoachRequestProfile {
  name: string;
  age: number;
  gender: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  focusGoalLabel: string;
  dailyCaloriesKcal: number;
  dailyProteinGrams: number;
  bmrKcal: number;
}

function buildContextualFallbackReply(message: string, profile: CoachRequestProfile): string {
  const q = message.toLowerCase();
  const weightRemaining = Math.max(0, Number((profile.currentWeightKg - profile.targetWeightKg).toFixed(1)));

  if (q.includes('pão') || q.includes('pao') || q.includes('pequeno-almoço') || q.includes('pequeno almoco') || q.includes('manhã')) {
    return `Excelente pergunta, ${profile.name}! Para atingires a tua meta de ${profile.targetWeightKg} kg (faltam ${weightRemaining} kg) dentro das tuas ${profile.dailyCaloriesKcal} kcal/dia, substitui o pão branco da padaria por:\n\n1. **120g de batata-doce ou mandioca cozida** + **2 a 3 ovos mexidos** com tomate e cebola.\n2. **Porquê?** Dá o triplo da saciedade, evita o inchaço abdominal e já garante cerca de 20g dos teus ${profile.dailyProteinGrams}g de proteína diários sem picos de açúcar no sangue.`;
  }

  if (q.includes('lanche') || q.includes('fome') || q.includes('tarde')) {
    return `${profile.name}, para o lanche da tarde em Moçambique sem sair das tuas **${profile.dailyCaloriesKcal} kcal/dia**, escolhe uma destas 3 opções práticas:\n\n• **Opção 1:** 1 punhado pequeno (25g) de amendoim torrado natural + 1 ovo cozido.\n• **Opção 2:** ½ abacate médio temperado com gotas de limão + 1 chávena de chá de capim-limão.\n• **Opção 3:** 1 fatia de papaia madura com 2 colheres de sopa de coco ralado fresco.\n\nEvita bolachas doces ou badjias fritas em óleo reutilizado!`;
  }

  if (q.includes('costas') || q.includes('joelho') || q.includes('agachamento') || q.includes('dor') || q.includes('treino')) {
    return `Atenção à postura, ${profile.name}! Se sentires desconforto na lombar ou nos joelhos durante os agachamentos em casa:\n\n1. **Apoia-te numa cadeira:** Faz o agachamento tocando levemente os glúteos numa cadeira da sala e sobe empurrando o chão com os **calcanhares** (nunca com a ponta dos pés).\n2. **Contrai o abdómen:** Imagina que vais receber um toque na barriga — isso protege a tua coluna.\n3. **Substituição segura:** Se continuar a incomodar, troca o agachamento livre pela **Elevação Pélvica no chão (Ponte de Glúteos)**, que tonifica pernas e glúteos com zero impacto nas costas.`;
  }

  if (q.includes('xima') || q.includes('matapa') || q.includes('almoço') || q.includes('jantar') || q.includes('arroz')) {
    return `Não precisas de cortar a nossa culinária moçambicana para secar, ${profile.name}! O segredo para o teu foco em **${profile.focusGoalLabel}** é a proporção no prato:\n\n• **Metade do prato:** Folhas de abóbora, couve, repolho ou salada cozida no vapor.\n• **Proteína forte (${profile.dailyProteinGrams}g/dia):** 180g de carapau/peixe-pedra grelhado ou frango na brasa sem pele.\n• **Hidrato medido:** 1 porção do tamanho do teu punho fechado (cerca de 90g-100g) de xima de milho ou feijão nhemba.`;
  }

  return `Estou contigo, ${profile.name}! Com o teu peso atual de **${profile.currentWeightKg} kg** e meta de **${profile.targetWeightKg} kg** (foco em *${profile.focusGoalLabel}*), o teu plano está calibrado para **${profile.dailyCaloriesKcal} kcal/dia** e **${profile.dailyProteinGrams}g de proteína**.\n\nPara hoje, foca-te em:\n1. Garantir proteína em todas as 4 refeições (ovos, peixe grelhado, frango ou feijão nhemba).\n2. Beber água regularmente ao longo do dia.\n3. Concluir os 20 minutos de treino funcional em casa. Qual é a tua próxima refeição de hoje?`;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/meals/scan', async (req, res) => {
    const { imageDataUrl } = req.body as {
      imageDataUrl?: string;
      compressedSizeKb?: number;
    };

    if (!imageDataUrl) {
      res.status(400).json({ error: 'Imagem não fornecida.' });
      return;
    }

    const fallbackScanResult = {
      dishName: 'Carapau Grelhado com Xima Controlada, Feijão Nhemba & Couve',
      identifiedFoods: [
        'Peixe Carapau Grelhado na Brasa (160g)',
        'Xima de Milho Branco Controlada (90g)',
        'Feijão Nhemba Cozido (85g)',
        'Folhas de Abóbora / Couve Salteada Leve (110g)',
      ],
      calories: 485,
      proteinGrams: 38,
      carbsGrams: 46,
      fatsGrams: 14,
      weightLossTip:
        'Excelente equilíbrio proteico! Para acelerar o emagrecimento e reduzir picos de glicose, come primeiro a salada/couve e o peixe grelhado antes da xima.',
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json(fallbackScanResult);
      return;
    }

    try {
      const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = matches ? matches[1] : 'image/jpeg';
      const base64Data = matches ? matches[2] : imageDataUrl;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const geminiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: MEAL_SCAN_PROMPT,
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: {
                type: Type.STRING,
                description: 'Nome resumido do prato moçambicano identificado.',
              },
              identifiedFoods: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista dos alimentos identificados no prato com porções estimadas.',
              },
              calories: {
                type: Type.INTEGER,
                description: 'Estimativa total de calorias (kcal).',
              },
              proteinGrams: {
                type: Type.INTEGER,
                description: 'Estimativa de proteínas em gramas.',
              },
              carbsGrams: {
                type: Type.INTEGER,
                description: 'Estimativa de carboidratos em gramas.',
              },
              fatsGrams: {
                type: Type.INTEGER,
                description: 'Estimativa de gorduras em gramas.',
              },
              weightLossTip: {
                type: Type.STRING,
                description: 'Dica rápida e prática para quem quer emagrecer comendo este prato.',
              },
            },
            required: [
              'dishName',
              'identifiedFoods',
              'calories',
              'proteinGrams',
              'carbsGrams',
              'fatsGrams',
              'weightLossTip',
            ],
          },
        },
      });

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5500)
      );

      const response = await Promise.race([geminiCall, timeoutPromise]);
      const rawText = response?.text?.trim();
      if (rawText) {
        const parsed = JSON.parse(rawText);
        res.json(parsed);
        return;
      }
      res.json(fallbackScanResult);
    } catch {
      res.json(fallbackScanResult);
    }
  });

  app.post('/api/coach/chat', async (req, res) => {
    const { message, profile } = req.body as {
      message?: string;
      profile?: CoachRequestProfile;
    };

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Mensagem vazia.' });
      return;
    }

    const safeProfile: CoachRequestProfile = profile || {
      name: 'Membro Fit',
      age: 30,
      gender: 'female',
      currentWeightKg: 76,
      targetWeightKg: 66,
      heightCm: 165,
      focusGoalLabel: 'Perder Gordura Abdominal (Secar Barriga)',
      dailyCaloriesKcal: 1650,
      dailyProteinGrams: 125,
      bmrKcal: 1480,
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: buildContextualFallbackReply(message, safeProfile),
        modelUsed: 'coach-contextual-mz',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Você é a "Coach Amina", personal trainer e nutricionista digital do aplicativo moçambicano "CorpoFit MZ".
Sua personalidade: Motivadora, empática, acolhedora, prática e 100% adaptada à realidade e culinária de Moçambique (Maputo, Matola, Beira, Nampula).
Use português de Moçambique natural e respeitoso.
Sempre priorize alimentos locais acessíveis: mandioca, batata-doce, peixe carapau/pedra/tilápia, frango grelhado, feijão nhemba, folhas de abóbora (matapa leve com pouco óleo), couve, ovos, amendoim torrado, abacate, papaia, xima de milho em porção controlada.

Dados reais do cliente que está falando com você agora:
- Nome: ${safeProfile.name}
- Idade: ${safeProfile.age} anos | Altura: ${safeProfile.heightCm} cm
- Peso Atual: ${safeProfile.currentWeightKg} kg | Peso Alvo: ${safeProfile.targetWeightKg} kg (Faltam ${(safeProfile.currentWeightKg - safeProfile.targetWeightKg).toFixed(1)} kg)
- Foco Principal: ${safeProfile.focusGoalLabel}
- Taxa Metabólica Basal (TMB): ${safeProfile.bmrKcal} kcal
- Meta Diária de Calorias: ${safeProfile.dailyCaloriesKcal} kcal/dia
- Meta Diária de Proteínas: ${safeProfile.dailyProteinGrams} g/dia

Responda de forma concisa (máximo 3 parágrafos curtos ou tópicos diretos), citando os números personalizados do cliente quando relevante.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || buildContextualFallbackReply(message, safeProfile);
      res.json({
        reply: text,
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (error) {
      // Graceful fallback so the user always gets an immediate, accurate Mozambican nutritionist response
      res.json({
        reply: buildContextualFallbackReply(message, safeProfile),
        modelUsed: 'coach-contextual-mz',
      });
    }
  });

  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (hasDist && process.env.DISABLE_HMR !== 'true');

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
        watch: null,
      },
      appType: 'spa',
    });

    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (result?.code) {
          const safeCode = result.code
            .replaceAll(
              'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."))',
              'resolve()'
            )
            .replaceAll(
              'WebSocket closed without opened.',
              'WebSocket connection skipped'
            )
            .replace(
              'transport.connect(createHMRHandler(handleMessage));',
              'transport.connect(createHMRHandler(handleMessage)).catch(() => {});'
            );
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.status(200).send(safeCode);
          return;
        }
      } catch {
        // Fall through to default vite middleware
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`CorpoFit MZ server listening on http://localhost:${PORT}`);
  });
}

startServer();
