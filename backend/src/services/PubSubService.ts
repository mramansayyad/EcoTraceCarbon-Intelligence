import { publishToTopic } from '../utils/pubsub.js';

export class PubSubService {
  /**
   * Publishes an event to a GCP Pub/Sub topic.
   * Delegates to the underlying utility functions.
   */
  public async publish(topic: string, data: Record<string, unknown>): Promise<void> {
    await publishToTopic(topic, data);
  }
}
