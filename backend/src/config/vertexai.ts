import { VertexAI } from '@google-cloud/vertexai';

let vertexAIInstance: VertexAI | null = null;

export function getVertexAI(): VertexAI | null {
  if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Return null to signify fallback to direct Gemini HTTP API during local development
    return null;
  }
  
  if (!vertexAIInstance) {
    const project = process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614';
    const location = process.env.GCP_LOCATION || 'us-central1'; // Vertex AI location
    try {
      vertexAIInstance = new VertexAI({ project, location });
    } catch (err) {
      console.warn('Vertex AI SDK initialization failed, will fallback to Gemini Developer API', err);
      return null;
    }
  }
  return vertexAIInstance;
}

export function getModelName(): string {
  return 'gemini-1.5-pro';
}
