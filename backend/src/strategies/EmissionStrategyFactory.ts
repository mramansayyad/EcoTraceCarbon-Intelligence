import type { ActivityInput } from '../types/activity.js';
import type { KgCO2e } from '../types/units.js';
import type { EmissionStrategy } from './EmissionStrategy.js';
import { EnergyEmissionStrategy } from './EnergyEmissionStrategy.js';
import { FoodEmissionStrategy } from './FoodEmissionStrategy.js';
import { ShoppingEmissionStrategy } from './ShoppingEmissionStrategy.js';
import { TransportEmissionStrategy } from './TransportEmissionStrategy.js';

type ActivityKind = ActivityInput['kind'];
type StrategyMap = { readonly [K in ActivityKind]: EmissionStrategy<Extract<ActivityInput, { kind: K }>> };

/**
 * Factory that creates and caches emission strategy instances.
 * Follows the Factory + Strategy pattern combination for clean extensibility.
 * To add a new activity category, add a new strategy and register it here.
 */
export class EmissionStrategyFactory {
  private static readonly strategies: StrategyMap = {
    transport: new TransportEmissionStrategy(),
    food:      new FoodEmissionStrategy(),
    energy:    new EnergyEmissionStrategy(),
    shopping:  new ShoppingEmissionStrategy(),
  } as const;

  /**
   * Calculate CO2e for any activity using the appropriate strategy.
   * @param input — Any activity input (discriminated union)
   * @returns CO2e in kg
   */
  public static calculate(input: ActivityInput): KgCO2e {
    const strategy = EmissionStrategyFactory.strategies[input.kind] as
      EmissionStrategy<typeof input>;
    return strategy.calculate(input);
  }

  /**
   * Check if a strategy exists for the given kind.
   * Used for validation before attempting calculation.
   */
  public static supports(kind: string): kind is ActivityKind {
    return kind in EmissionStrategyFactory.strategies;
  }
}
