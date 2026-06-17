import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export interface Secrets {
  GEMINI_API_KEY: string;
  MAPS_API_KEY: string;
  ELECTRICITY_MAP_KEY: string;
}

export const secrets: Secrets = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  MAPS_API_KEY: process.env.MAPS_API_KEY || '',
  ELECTRICITY_MAP_KEY: process.env.ELECTRICITY_MAP_KEY || '',
};

export async function loadSecrets(): Promise<Secrets> {
  const isProd = process.env.NODE_ENV === 'production' || process.env.USE_SECRET_MANAGER === 'true';
  if (isProd) {
    try {
      const client = new SecretManagerServiceClient();
      const projectId = process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614';
      
      const [gemini] = await client.accessSecretVersion({
        name: `projects/${projectId}/secrets/gemini-api-key/versions/latest`,
      });
      secrets.GEMINI_API_KEY = gemini.payload?.data?.toString() || '';

      try {
        const [maps] = await client.accessSecretVersion({
          name: `projects/${projectId}/secrets/maps-api-key/versions/latest`,
        });
        secrets.MAPS_API_KEY = maps.payload?.data?.toString() || '';
      } catch (err) {
        console.warn('Maps API Key secret accessor failed, using local/env value');
      }

      try {
        const [electricity] = await client.accessSecretVersion({
          name: `projects/${projectId}/secrets/electricity-map-key/versions/latest`,
        });
        secrets.ELECTRICITY_MAP_KEY = electricity.payload?.data?.toString() || '';
      } catch (err) {
        console.warn('Electricity Map API Key secret accessor failed, using local/env value');
      }
    } catch (err) {
      console.error('Failed to load secrets from Secret Manager', err);
    }
  }
  return secrets;
}
