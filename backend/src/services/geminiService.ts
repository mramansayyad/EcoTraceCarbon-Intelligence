import { getVertexAI, getModelName } from '../config/vertexai';
import { secrets } from '../config/secrets';
import { Activity } from '../models/Activity';

const SYSTEM_PROMPT = `You are EcoTrace AI, a climate science assistant embedded in a personal carbon tracking app. You have access to this user's emission data and must generate specific, actionable, encouraging insights. Never be preachy. Always be data-driven. Quote the user's actual numbers. Suggest one concrete action with an estimated CO2 saving. Keep responses under 3 sentences. Use a warm, peer-like tone — not corporate. If the user improved, celebrate it genuinely.`;

export interface UserAIContext {
  weekly_kg_co2e: number;
  top_category: 'transport' | 'food' | 'energy' | 'shopping';
  top_category_kg: number;
  vs_last_week_pct: number;
  vs_india_avg_pct: number;
  streak_days: number;
  recent_activities: Activity[];
  active_goals: any[];
}

/**
 * Scans output for PII patterns (emails/UIDs) and redacts them.
 */
export function sanitizeGeminiOutput(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Firestore/Firebase UIDs are typically 28 characters, alphanumeric
  const uidRegex = /\b[a-zA-Z0-9]{28}\b/g;

  let sanitized = text;
  
  if (emailRegex.test(sanitized)) {
    console.warn('PII Warning: Email address pattern found in Gemini response. Redacting.');
    sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');
  }
  
  if (uidRegex.test(sanitized)) {
    console.warn('PII Warning: UID pattern found in Gemini response. Redacting.');
    sanitized = sanitized.replace(uidRegex, '[REDACTED_UID]');
  }

  return sanitized;
}

export async function generateWeeklyInsights(context: UserAIContext): Promise<string> {
  const vertexAI = getVertexAI();
  const prompt = `Here is my carbon footprint context:\n${JSON.stringify(context, null, 2)}\nPlease generate my weekly carbon insight.`;

  if (vertexAI) {
    try {
      const model = vertexAI.preview.getGenerativeModel({ model: getModelName() });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] }
      });
      const resultText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return sanitizeGeminiOutput(resultText);
    } catch (err) {
      console.error('Vertex AI insights generation failed, trying developer API fallback', err);
    }
  }

  // Fallback to Developer API with direct HTTP POST
  return generateGeminiDeveloperAPIFallback(prompt, SYSTEM_PROMPT);
}

async function generateGeminiDeveloperAPIFallback(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = secrets.GEMINI_API_KEY;
  if (!apiKey) {
    return 'EcoTrace: Try carpooling or eating meatless meals this week to reduce your emissions! (AI API key missing)';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.7
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = (await response.json()) as any;
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return sanitizeGeminiOutput(resultText);
  } catch (err) {
    console.error('Fallback Gemini Developer API failed:', err);
    return 'EcoTrace Insight: Try riding a bicycle for short distance trips. Every kilometer saved is 0.21 kg of CO2e prevented.';
  }
}

/**
 * Handle streaming chat with Gemini (compatible with SSE)
 */
export async function streamChatWithGemini(
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: any) => void
): Promise<void> {
  // Add defensive sanitization on inputs
  const sanitizedHistory = history.map(item => ({
    role: item.role,
    parts: item.parts.map(p => ({ text: p.text.substring(0, 2000) })) // Limit to 2000 chars
  }));

  const vertexAI = getVertexAI();
  if (vertexAI) {
    try {
      const model = vertexAI.preview.getGenerativeModel({ model: getModelName() });
      const responseStream = await model.generateContentStream({
        contents: sanitizedHistory,
        systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] }
      });

      for await (const chunk of responseStream.stream) {
        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
        onChunk(sanitizeGeminiOutput(text));
      }
      onDone();
      return;
    } catch (err) {
      console.warn('Vertex AI Stream failed. Attempting Developer API Stream fallback', err);
    }
  }

  // Streaming Fallback
  await streamGeminiDeveloperAPIFallback(sanitizedHistory, onChunk, onDone, onError);
}

async function streamGeminiDeveloperAPIFallback(
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: any) => void
): Promise<void> {
  const apiKey = secrets.GEMINI_API_KEY;
  if (!apiKey) {
    onChunk('EcoTrace Chat Assistant is offline. Please configure GEMINI_API_KEY.');
    onDone();
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${apiKey}`;
  const requestBody = {
    contents: history,
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Readable stream not supported on fetch body');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // The stream returns JSON objects starting with [ and containing elements or chunks
      // We parse the stream buffer. Typically, Gemini returns objects wrapped in brackets:
      // [
      //   { ...chunk1 },
      //   { ...chunk2 }
      // ]
      // Or SSE lines. Let's parse JSON structures or lines.
      // A quick way is finding JSON boundary matches or parsing line-by-line if it's SSE format.
      // Gemini stream returns objects of the form:
      //   "candidates": [{"content": {"parts": [{"text": "..."}]}}]
      // Let's do simple regex extraction for parts text chunks to be extremely resilient.
      const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      let match;
      while ((match = regex.exec(buffer)) !== null) {
        try {
          // Unescape the JSON string match
          const textVal = JSON.parse(`"${match[1]}"`);
          onChunk(sanitizeGeminiOutput(textVal));
        } catch (e) {
          // Ignored
        }
      }
      // Keep only last part of buffer that might be cut in half
      if (buffer.length > 50000) {
        buffer = buffer.substring(buffer.length - 1000);
      }
    }

    onDone();
  } catch (err) {
    console.error('Fallback Developer Stream failed:', err);
    onError(err);
  }
}
