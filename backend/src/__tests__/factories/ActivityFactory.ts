import type { Activity, FoodActivity, TransportActivity } from '../../types/activity.js';
import { KgCO2e, Kilometers, UserId } from '../../types/units.js';

/** Builder pattern for creating test Activity objects without raw literals */
export class ActivityFactory {
  private static defaultTransport(): TransportActivity {
    return {
      kind: 'transport',
      mode: 'car_petrol',
      distanceKm: Kilometers(10),
      passengers: 1,
    };
  }

  private static defaultFood(): FoodActivity {
    return { kind: 'food', type: 'chicken', servings: 1 };
  }

  /** Create a transport activity with overrides */
  public static transport(overrides: Partial<TransportActivity> = {}): Activity {
    const input: TransportActivity = { ...ActivityFactory.defaultTransport(), ...overrides };
    return {
      id: 'test-activity-id',
      uid: UserId('testUid1234567890123456'),
      input,
      emissionKg: KgCO2e(2.1),
      timestamp: new Date('2025-01-15T10:00:00Z'),
    };
  }

  /** Create a food activity with overrides */
  public static food(overrides: Partial<FoodActivity> = {}): Activity {
    const input: FoodActivity = { ...ActivityFactory.defaultFood(), ...overrides };
    return {
      id: 'test-food-id',
      uid: UserId('testUid1234567890123456'),
      input,
      emissionKg: KgCO2e(0.69),
      timestamp: new Date('2025-01-15T12:00:00Z'),
    };
  }

  /** Create multiple activities for dashboard aggregate testing */
  public static week(uid = UserId('testUid1234567890123456')): readonly Activity[] {
    return Array.from({ length: 7 }, (_, i) => ({
      ...ActivityFactory.transport(),
      id: `activity-day-${i}`,
      uid,
      emissionKg: KgCO2e(2.1 + i * 0.5),
      timestamp: new Date(Date.now() - i * 86_400_000),
    }));
  }
}
