import { PubSub } from '@google-cloud/pubsub';

let pubsubClient: PubSub | null = null;

export async function publishToTopic(topicName: string, data: any): Promise<string> {
  const isProd = process.env.NODE_ENV === 'production' || process.env.USE_PUBSUB === 'true';
  
  if (!isProd) {
    // For local development/testing without real Pub/Sub credentials
    console.log(`[Pub/Sub Mock] Publish to "${topicName}":`, JSON.stringify(data));
    return `mock-msg-${Date.now()}`;
  }

  try {
    if (!pubsubClient) {
      const projectId = process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614';
      pubsubClient = new PubSub({ projectId });
    }
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubsubClient.topic(topicName).publishMessage({ data: dataBuffer });
    return messageId;
  } catch (err) {
    console.error(`Pub/Sub publish to "${topicName}" failed:`, err);
    // Return mock ID so request does not block/fail outright
    return `fallback-msg-${Date.now()}`;
  }
}
