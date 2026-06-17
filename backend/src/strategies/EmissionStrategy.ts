import type { ActivityInput } from '../types/activity.js';
import type { KgCO2e } from '../types/units.js';

/**
 * Contract for all emission calculation strategies.
 * Each activity category implements its own strategy.
 * @template T — The specific ActivityInput subtype this strategy handles
 */
export interface EmissionStrategy<T extends ActivityInput> {
  /**
   * Calculate CO2e emissions for the given activity input.
   * @param input — The activity data (type-narrowed to T)
   * @returns Calculated CO2e in kilograms
   * @throws EmissionCalculationError if calculation is not possible
   */
  calculate(input: T): KgCO2e;
}
