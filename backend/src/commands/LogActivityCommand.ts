import type { ActivityRepository } from '../repositories/ActivityRepository.js';
import type { GeminiAiService } from '../services/GeminiAiService.js';
import type { PubSubService } from '../services/PubSubService.js';
import { EmissionStrategyFactory } from '../strategies/EmissionStrategyFactory.js';
import type { ActivityInput, Activity } from '../types/activity.js';
import type { UserId } from '../types/units.js';

export interface LogActivityResult {
  readonly activity: Activity;
  readonly instantInsight: string | null;
}

/**
 * Command encapsulating the full log-activity workflow:
 * 1. Calculate emission via appropriate strategy
 * 2. Persist to Firestore via repository
 * 3. Publish to Pub/Sub for async processing
 * 4. Generate instant Gemini insight (non-blocking)
 *
 * This class has a single responsibility: orchestrate the log-activity use case.
 */
export class LogActivityCommand {
  public constructor(
    private readonly activityRepo: ActivityRepository,
    private readonly geminiService: GeminiAiService,
    private readonly pubSubService: PubSubService,
  ) {}

  /**
   * Execute the log activity command.
   * @param uid — Authenticated user ID
   * @param input — Activity input data (pre-validated)
   * @param notes — Optional user notes
   * @returns The created activity and an optional instant AI insight
   */
  public async execute(
    uid: UserId,
    input: ActivityInput,
    notes?: string,
  ): Promise<LogActivityResult> {
    const emissionKg = EmissionStrategyFactory.calculate(input);
    const activity = await this.activityRepo.create(uid, { input, emissionKg, notes });
    void this.pubSubService.publish('activity-logged', { activityId: activity.id, uid });
    const instantInsight = await this.generateInstantInsight(activity).catch(() => null);
    return { activity, instantInsight };
  }

  private async generateInstantInsight(activity: Activity): Promise<string> {
    return this.geminiService.generateInstantInsight(activity);
  }
}
