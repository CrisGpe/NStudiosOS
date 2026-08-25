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
    const brandName = req.body.brandName || 'Marca General';
    const brandIndustry = req.body.brandIndustry || req.body.industry || 'Audiovisual';
    const territoryName = req.body.territoryName || req.body.territory || 'Lifestyle & Storytelling';
    const territoryObjective = req.body.territoryObjective || req.body.briefPrompt || 'Generar engagement y conversión';
    const deliverableFormat = req.body.deliverableFormat || 'Video Vertical 9:16 (Reels/TikTok)';
    const count = req.body.count || 3;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en las variables de entorno.',
      });
    }

    const prompt = `Eres el Director Creativo Senior de CineFlow Studio.
Genera ${count} conceptos creativos audiovisuales innovadores y de alto impacto para la siguiente marca y territorio:
- Marca: ${brandName} (${brandIndustry})
- Territorio de Comunicación: ${territoryName}
- Objetivo del Territorio: ${territoryObjective}
- Formato Audiovisual: ${deliverableFormat}

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
    console.error('Error in /api/gemini/ideate:', error);
    res.status(500).json({ error: error.message || 'Error al generar ideas con Gemini' });
  }
}
