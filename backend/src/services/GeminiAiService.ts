import { getVertexAI, getModelName } from '../config/vertexai.js';
import { secrets } from '../config/secrets.js';
import type { Activity } from '../types/activity.js';
import { sanitizeGeminiOutput } from './geminiService.js';

/**
 * Service to interact with Gemini LLM.
 */
export class GeminiAiService {
  /**
   * Generates a rapid, contextual carbon insight for a newly logged activity.
   * Uses Vertex AI with developer key fallback.
   * @param activity — The logged activity
   * @returns Actionable tip string
   */
  public async generateInstantInsight(activity: Activity): Promise<string> {
    const prompt = `The user just logged this carbon activity: ${JSON.stringify(activity.input)}. It emitted ${activity.emissionKg} kg CO2e. Generate a 1-sentence actionable tip to reduce footprint for this specific category. Keep it brief under 20 words. No email addresses or IDs.`;
    const systemPrompt = 'You are EcoTrace AI, a friendly data-driven climate science assistant.';

    const vertexAI = getVertexAI();
    if (vertexAI) {
      try {
        const model = vertexAI.preview.getGenerativeModel({ model: getModelName() });
        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
        });
        const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return sanitizeGeminiOutput(text.trim());
      } catch (err) {
        // Fall through to HTTP developer key API
      }
    }

    return this.generateFallback(prompt, systemPrompt);
  }

  private async generateFallback(prompt: string, systemPrompt: string): Promise<string> {
    const apiKey = secrets.GEMINI_API_KEY;
    if (!apiKey) {
      return 'EcoTrace: Great job logging! Consider carpooling or buying local to reduce emissions.';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { maxOutputTokens: 100, temperature: 0.5 }
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = (await response.json()) as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return sanitizeGeminiOutput(text.trim());
    } catch (err) {
      return 'EcoTrace: Try switching off appliances when not in use to save energy.';
    }
  }
}
