import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function sanitizeJsonString(text: string): string {
  if (!text) return '{}';
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const title = req.body.title || req.body.deliverable?.title || 'Comercial de Marca';
    const brandName = req.body.brandName || req.body.deliverable?.brandName || 'Cliente';
    const territoryName = req.body.territoryName || req.body.deliverable?.territoryName || 'General';
    const format = req.body.format || req.body.deliverable?.format || '9:16 Vertical UHD';
    const shootLocation = req.body.shootLocation || req.body.styleNotes || 'Estudio / Exterior';
    const equipmentAvailable = req.body.equipmentAvailable || req.body.deliverable?.equipmentReservedIds || [];

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada.',
      });
    }

    const prompt = `Eres el Director de Fotografía (DP) y Supervisor Técnico Audiovisual de CineFlow Studio.
Construye una GUÍA TÉCNICA AUDIOVISUAL RIGUROSA para el siguiente entregable:
- Título del Entregable: ${title}
- Marca: ${brandName}
- Territorio: ${territoryName}
- Formato de Entrega: ${format}
- Locación de Rodaje: ${shootLocation}
- Equipos en Inventario disponibles: ${JSON.stringify(equipmentAvailable)}

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
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = sanitizeJsonString(response.text || '{}');
    const parsed = JSON.parse(responseText);
    res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/technical-guide:', error);
    res.status(500).json({ error: error.message || 'Error al compilar guía técnica' });
  }
}
