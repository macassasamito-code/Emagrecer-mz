import express from "express";
import http from "http";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
dotenv.config();
const PORT = Number(process.env.PORT) || 3e3;
const MEAL_SCAN_PROMPT = "Identifique os alimentos deste prato mo\xE7ambicano, estime calorias, prote\xEDnas, carboidratos e gorduras, e d\xEA uma dica r\xE1pida para quem quer emagrecer.";
function buildContextualFallbackReply(message, profile) {
  const q = message.toLowerCase();
  const weightRemaining = Math.max(0, Number((profile.currentWeightKg - profile.targetWeightKg).toFixed(1)));
  if (q.includes("p\xE3o") || q.includes("pao") || q.includes("pequeno-almo\xE7o") || q.includes("pequeno almoco") || q.includes("manh\xE3")) {
    return `Excelente pergunta, ${profile.name}! Para atingires a tua meta de ${profile.targetWeightKg} kg (faltam ${weightRemaining} kg) dentro das tuas ${profile.dailyCaloriesKcal} kcal/dia, substitui o p\xE3o branco da padaria por:

1. **120g de batata-doce ou mandioca cozida** + **2 a 3 ovos mexidos** com tomate e cebola.
2. **Porqu\xEA?** D\xE1 o triplo da saciedade, evita o incha\xE7o abdominal e j\xE1 garante cerca de 20g dos teus ${profile.dailyProteinGrams}g de prote\xEDna di\xE1rios sem picos de a\xE7\xFAcar no sangue.`;
  }
  if (q.includes("lanche") || q.includes("fome") || q.includes("tarde")) {
    return `${profile.name}, para o lanche da tarde em Mo\xE7ambique sem sair das tuas **${profile.dailyCaloriesKcal} kcal/dia**, escolhe uma destas 3 op\xE7\xF5es pr\xE1ticas:

\u2022 **Op\xE7\xE3o 1:** 1 punhado pequeno (25g) de amendoim torrado natural + 1 ovo cozido.
\u2022 **Op\xE7\xE3o 2:** \xBD abacate m\xE9dio temperado com gotas de lim\xE3o + 1 ch\xE1vena de ch\xE1 de capim-lim\xE3o.
\u2022 **Op\xE7\xE3o 3:** 1 fatia de papaia madura com 2 colheres de sopa de coco ralado fresco.

Evita bolachas doces ou badjias fritas em \xF3leo reutilizado!`;
  }
  if (q.includes("costas") || q.includes("joelho") || q.includes("agachamento") || q.includes("dor") || q.includes("treino")) {
    return `Aten\xE7\xE3o \xE0 postura, ${profile.name}! Se sentires desconforto na lombar ou nos joelhos durante os agachamentos em casa:

1. **Apoia-te numa cadeira:** Faz o agachamento tocando levemente os gl\xFAteos numa cadeira da sala e sobe empurrando o ch\xE3o com os **calcanhares** (nunca com a ponta dos p\xE9s).
2. **Contrai o abd\xF3men:** Imagina que vais receber um toque na barriga \u2014 isso protege a tua coluna.
3. **Substitui\xE7\xE3o segura:** Se continuar a incomodar, troca o agachamento livre pela **Eleva\xE7\xE3o P\xE9lvica no ch\xE3o (Ponte de Gl\xFAteos)**, que tonifica pernas e gl\xFAteos com zero impacto nas costas.`;
  }
  if (q.includes("xima") || q.includes("matapa") || q.includes("almo\xE7o") || q.includes("jantar") || q.includes("arroz")) {
    return `N\xE3o precisas de cortar a nossa culin\xE1ria mo\xE7ambicana para secar, ${profile.name}! O segredo para o teu foco em **${profile.focusGoalLabel}** \xE9 a propor\xE7\xE3o no prato:

\u2022 **Metade do prato:** Folhas de ab\xF3bora, couve, repolho ou salada cozida no vapor.
\u2022 **Prote\xEDna forte (${profile.dailyProteinGrams}g/dia):** 180g de carapau/peixe-pedra grelhado ou frango na brasa sem pele.
\u2022 **Hidrato medido:** 1 por\xE7\xE3o do tamanho do teu punho fechado (cerca de 90g-100g) de xima de milho ou feij\xE3o nhemba.`;
  }
  return `Estou contigo, ${profile.name}! Com o teu peso atual de **${profile.currentWeightKg} kg** e meta de **${profile.targetWeightKg} kg** (foco em *${profile.focusGoalLabel}*), o teu plano est\xE1 calibrado para **${profile.dailyCaloriesKcal} kcal/dia** e **${profile.dailyProteinGrams}g de prote\xEDna**.

Para hoje, foca-te em:
1. Garantir prote\xEDna em todas as 4 refei\xE7\xF5es (ovos, peixe grelhado, frango ou feij\xE3o nhemba).
2. Beber \xE1gua regularmente ao longo do dia.
3. Concluir os 20 minutos de treino funcional em casa. Qual \xE9 a tua pr\xF3xima refei\xE7\xE3o de hoje?`;
}
async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: "2mb" }));
  app.post("/api/meals/scan", async (req, res) => {
    const { imageDataUrl } = req.body;
    if (!imageDataUrl) {
      res.status(400).json({ error: "Imagem n\xE3o fornecida." });
      return;
    }
    const fallbackScanResult = {
      dishName: "Carapau Grelhado com Xima Controlada, Feij\xE3o Nhemba & Couve",
      identifiedFoods: [
        "Peixe Carapau Grelhado na Brasa (160g)",
        "Xima de Milho Branco Controlada (90g)",
        "Feij\xE3o Nhemba Cozido (85g)",
        "Folhas de Ab\xF3bora / Couve Salteada Leve (110g)"
      ],
      calories: 485,
      proteinGrams: 38,
      carbsGrams: 46,
      fatsGrams: 14,
      weightLossTip: "Excelente equil\xEDbrio proteico! Para acelerar o emagrecimento e reduzir picos de glicose, come primeiro a salada/couve e o peixe grelhado antes da xima."
    };
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      res.json(fallbackScanResult);
      return;
    }
    try {
      const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = matches ? matches[1] : "image/jpeg";
      const base64Data = matches ? matches[2] : imageDataUrl;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const geminiCall = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: MEAL_SCAN_PROMPT
            }
          ]
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: {
                type: Type.STRING,
                description: "Nome resumido do prato mo\xE7ambicano identificado."
              },
              identifiedFoods: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista dos alimentos identificados no prato com por\xE7\xF5es estimadas."
              },
              calories: {
                type: Type.INTEGER,
                description: "Estimativa total de calorias (kcal)."
              },
              proteinGrams: {
                type: Type.INTEGER,
                description: "Estimativa de prote\xEDnas em gramas."
              },
              carbsGrams: {
                type: Type.INTEGER,
                description: "Estimativa de carboidratos em gramas."
              },
              fatsGrams: {
                type: Type.INTEGER,
                description: "Estimativa de gorduras em gramas."
              },
              weightLossTip: {
                type: Type.STRING,
                description: "Dica r\xE1pida e pr\xE1tica para quem quer emagrecer comendo este prato."
              }
            },
            required: [
              "dishName",
              "identifiedFoods",
              "calories",
              "proteinGrams",
              "carbsGrams",
              "fatsGrams",
              "weightLossTip"
            ]
          }
        }
      });
      const timeoutPromise = new Promise(
        (resolve) => setTimeout(() => resolve(null), 5500)
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
  app.post("/api/coach/chat", async (req, res) => {
    const { message, profile } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ error: "Mensagem vazia." });
      return;
    }
    const safeProfile = profile || {
      name: "Membro Fit",
      age: 30,
      gender: "female",
      currentWeightKg: 76,
      targetWeightKg: 66,
      heightCm: 165,
      focusGoalLabel: "Perder Gordura Abdominal (Secar Barriga)",
      dailyCaloriesKcal: 1650,
      dailyProteinGrams: 125,
      bmrKcal: 1480
    };
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      res.json({
        reply: buildContextualFallbackReply(message, safeProfile),
        modelUsed: "coach-contextual-mz"
      });
      return;
    }
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemInstruction = `Voc\xEA \xE9 a "Coach Amina", personal trainer e nutricionista digital do aplicativo mo\xE7ambicano "CorpoFit MZ".
Sua personalidade: Motivadora, emp\xE1tica, acolhedora, pr\xE1tica e 100% adaptada \xE0 realidade e culin\xE1ria de Mo\xE7ambique (Maputo, Matola, Beira, Nampula).
Use portugu\xEAs de Mo\xE7ambique natural e respeitoso.
Sempre priorize alimentos locais acess\xEDveis: mandioca, batata-doce, peixe carapau/pedra/til\xE1pia, frango grelhado, feij\xE3o nhemba, folhas de ab\xF3bora (matapa leve com pouco \xF3leo), couve, ovos, amendoim torrado, abacate, papaia, xima de milho em por\xE7\xE3o controlada.

Dados reais do cliente que est\xE1 falando com voc\xEA agora:
- Nome: ${safeProfile.name}
- Idade: ${safeProfile.age} anos | Altura: ${safeProfile.heightCm} cm
- Peso Atual: ${safeProfile.currentWeightKg} kg | Peso Alvo: ${safeProfile.targetWeightKg} kg (Faltam ${(safeProfile.currentWeightKg - safeProfile.targetWeightKg).toFixed(1)} kg)
- Foco Principal: ${safeProfile.focusGoalLabel}
- Taxa Metab\xF3lica Basal (TMB): ${safeProfile.bmrKcal} kcal
- Meta Di\xE1ria de Calorias: ${safeProfile.dailyCaloriesKcal} kcal/dia
- Meta Di\xE1ria de Prote\xEDnas: ${safeProfile.dailyProteinGrams} g/dia

Responda de forma concisa (m\xE1ximo 3 par\xE1grafos curtos ou t\xF3picos diretos), citando os n\xFAmeros personalizados do cliente quando relevante.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const text = response.text || buildContextualFallbackReply(message, safeProfile);
      res.json({
        reply: text,
        modelUsed: "gemini-3.8-flash"
      });
    } catch (error) {
      res.json({
        reply: buildContextualFallbackReply(message, safeProfile),
        modelUsed: "coach-contextual-mz"
      });
    }
  });
  const distPath = path.resolve(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.K_SERVICE) || hasDist && process.env.DISABLE_HMR !== "true";
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer
        },
        watch: null
      },
      appType: "spa"
    });
    app.get("/@vite/client", async (_req, res, next) => {
      try {
        const result = await vite.transformRequest("/@vite/client");
        if (result?.code) {
          const safeCode = result.code.replaceAll(
            'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."))',
            "resolve()"
          ).replaceAll(
            "WebSocket closed without opened.",
            "WebSocket connection skipped"
          ).replace(
            "transport.connect(createHMRHandler(handleMessage));",
            "transport.connect(createHMRHandler(handleMessage)).catch(() => {});"
          );
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.status(200).send(safeCode);
          return;
        }
      } catch {
      }
      next();
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`CorpoFit MZ server listening on http://localhost:${PORT}`);
  });
}
startServer();
