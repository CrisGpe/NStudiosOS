import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// ==========================================
// API Endpoints: Health & System
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CineFlow AV Production Engine",
    rbacRoles: ["webadmin", "director", "colaborador", "cliente"],
    version: "2.4.0",
  });
});

// ==========================================
// API Endpoints: Gemini AI Intelligence
// ==========================================

// 1. AI Idea Generator & Trend Grounding (using Search Grounding)
app.post("/api/gemini/ideate", async (req, res) => {
  try {
    const { brandName, brandIndustry, territoryName, territoryObjective, deliverableFormat, count = 3 } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no está configurada en las variables de entorno.",
      });
    }

    const prompt = `Eres el Director Creativo Senior de CineFlow Studio.
Genera ${count} conceptos creativos audiovisuales innovadores y de alto impacto para la siguiente marca y territorio:
- Marca: ${brandName || "Marca General"} (${brandIndustry || "Audiovisual"})
- Territorio de Comunicación: ${territoryName || "Lifestyle & Storytelling"}
- Objetivo del Territorio: ${territoryObjective || "Generar engagement y conversión"}
- Formato Audiovisual: ${deliverableFormat || "Video Vertical 9:16 (Reels/TikTok)"}

Para cada idea incluye:
1. Título llamativo
2. Logline / Gancho inicial (primeros 3 segundos)
3. Concepto narrativo audiovisual
4. Requerimientos visuales y de iluminación sugeridos
5. Call to Action (CTA)

Responde en formato JSON estructurado con el array "ideas":
[
  {
    "title": "...",
    "hook": "...",
    "concept": "...",
    "visualStyle": "...",
    "callToAction": "...",
    "recommendedGear": ["..."]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/ideate:", error);
    res.status(500).json({ error: error.message || "Error al generar ideas con Gemini" });
  }
});

// 2. AI Technical Guide Auto-Compiler (using Thinking Mode)
app.post("/api/gemini/technical-guide", async (req, res) => {
  try {
    const { title, brandName, territoryName, format, shootLocation, equipmentAvailable } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no está configurada.",
      });
    }

    const prompt = `Eres el Director de Fotografía (DP) y Supervisor Técnico Audiovisual de CineFlow Studio.
Construye una GUÍA TÉCNICA AUDIOVISUAL RIGUROSA para el siguiente entregable:
- Título del Entregable: ${title || "Comercial de Marca"}
- Marca: ${brandName || "Cliente"}
- Territorio: ${territoryName || "General"}
- Formato de Entrega: ${format || "9:16 Vertical UHD"}
- Locación de Rodaje: ${shootLocation || "Estudio / Exterior"}
- Equipos en Inventario disponibles: ${JSON.stringify(equipmentAvailable || [])}

Estructura la respuesta en JSON con:
{
  "aspectRatios": ["9:16", "1:1"],
  "frameRate": "24fps (Cine) / 60fps (B-Roll SlowMo)",
  "colorSpace": "Sony S-Log3 / S-Gamut3.Cine o Canon Log 3",
  "audioSpecs": "Microfonía Lavalier 32-bit Float + Boom Shotgun direccional (-18dB target)",
  "lightingScheme": "Key Light difuso 45° a 5600K, Rim Light 3200K cálido, Hair Light sutil",
  "shotlist": [
    { "shotNumber": 1, "description": "Plano detalle producto con lente macro", "cameraAngle": "Macro Low Angle", "movement": "Push-in lento", "durationSec": 3 },
    { "shotNumber": 2, "description": "Plano medio actor principal interactuando", "cameraAngle": "Eye Level", "movement": "Estático con trípode", "durationSec": 4 },
    { "shotNumber": 3, "description": "Plano general dinámico con iluminación de acento", "cameraAngle": "Wide Angle", "movement": "Gimbal Orbit", "durationSec": 5 }
  ],
  "equipmentList": ["Sony FX6", "Sony GM 24-70mm f/2.8", "Sennheiser MKH 416", "Aputure 300d II"],
  "exportTargets": ["Instagram Reels (1080x1920 H.264)", "TikTok HQ (1080x1920)", "YouTube Shorts", "Master ProRes 422HQ"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/technical-guide:", error);
    res.status(500).json({ error: error.message || "Error al compilar guía técnica" });
  }
});

// 3. AI Change Request Evaluator (T-3 Policy & Impact Analysis)
app.post("/api/gemini/evaluate-change", async (req, res) => {
  try {
    const { deliverableTitle, publishDate, changeDescription, changeCategory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY no configurada",
      });
    }

    const pubDate = new Date(publishDate);
    const now = new Date();
    const diffDays = Math.ceil((pubDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isWithinTMinus3 = diffDays <= 3 && diffDays >= 0;

    const prompt = `Evalúa la solicitud de cambio de un cliente bajo la regla de negocio T-3 (Ventana límite de 3 días antes de publicación).
- Entregable: ${deliverableTitle}
- Fecha de Publicación: ${publishDate} (Días restantes: ${diffDays})
- ¿Está dentro de la ventana de bloqueo T-3?: ${isWithinTMinus3 ? "SÍ (VENTANA DE BLOQUEO ACTIVA)" : "NO (A tiempo)"}
- Categoría de cambio: ${changeCategory}
- Descripción del cambio solicitado: ${changeDescription}

Genera un dictamen técnico en JSON:
{
  "isBlockedByT3": ${isWithinTMinus3},
  "riskLevel": "Bajo" | "Medio" | "Crítico",
  "technicalImpactSummary": "...",
  "recommendedAction": "Aprobar" | "Rechazar" | "Requiere Override del Director de Proyecto con Sobrecosto",
  "estimatedDelayHours": 12,
  "directorNoteSuggestion": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/evaluate-change:", error);
    res.status(500).json({ error: error.message || "Error al evaluar solicitud de cambio" });
  }
});

// ==========================================
// Vite Middleware & Static Serving Setup
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CineFlow Production Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
