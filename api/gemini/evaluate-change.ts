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
    const deliverableTitle = req.body.deliverableTitle || req.body.deliverable?.title || 'Entregable';
    const publishDate = req.body.publishDate || req.body.deliverable?.publishDate || new Date().toISOString().split('T')[0];
    const changeDescription = req.body.changeDescription || req.body.changeRequest?.description || 'Ajuste general';
    const changeCategory = req.body.changeCategory || req.body.changeRequest?.category || 'visual';

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no configurada',
      });
    }

    const pubDate = new Date(publishDate);
    const now = new Date();
    const diffDays = Math.ceil((pubDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isWithinTMinus3 = diffDays <= 3 && diffDays >= 0;

    const prompt = `Evalúa la solicitud de cambio de un cliente bajo la regla de negocio T-3 (Ventana límite de 3 días antes de publicación).
- Entregable: ${deliverableTitle}
- Fecha de Publicación: ${publishDate} (Días restantes: ${diffDays})
- ¿Está dentro de la ventana de bloqueo T-3?: ${isWithinTMinus3 ? 'SÍ (VENTANA DE BLOQUEO ACTIVA)' : 'NO (A tiempo)'}
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
    console.error('Error in /api/gemini/evaluate-change:', error);
    res.status(500).json({ error: error.message || 'Error al evaluar solicitud de cambio' });
  }
}
