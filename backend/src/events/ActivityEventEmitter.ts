import { EventEmitter } from 'node:events';

import type { Activity } from '../types/activity.js';
import type { UserId } from '../types/units.js';

export interface ActivityEvents {
  'activity:created': [activity: Activity];
  'activity:deleted': [activityId: string, uid: UserId];
  'goal:progress': [uid: UserId, progressPct: number];
}

/**
 * Typed event emitter for activity lifecycle events.
 * Decouples activity creation from downstream effects (cache invalidation,
 * leaderboard updates, goal progress checks).
 */
export class ActivityEventEmitter extends EventEmitter {
  public override emit<K extends keyof ActivityEvents>(
    event: K,
    ...args: ActivityEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  public override on<K extends keyof ActivityEvents>(
    event: K,
    listener: (...args: ActivityEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}

/** Singleton event emitter — one instance per Cloud Run container */
export const activityEvents = new ActivityEventEmitter();
