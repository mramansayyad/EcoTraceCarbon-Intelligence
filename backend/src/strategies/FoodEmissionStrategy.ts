import { EmissionCalculationError } from '../errors/index.js';
import type { FoodActivity, FoodType } from '../types/activity.js';
import { KgCO2e } from '../types/units.js';
import type { EmissionStrategy } from './EmissionStrategy.js';

/** kg CO2e per serving. Source: Poore & Nemecek (2018), Science. */
const FOOD_FACTORS: Readonly<Record<FoodType, number>> = Object.freeze({
  beef:        6.61,
  lamb:        5.84,
  pork:        1.23,
  chicken:     0.69,
  fish:        0.39,
  vegetarian:  0.28,
  vegan:       0.15,
  dairy_milk:  0.64,
}) as Readonly<Record<FoodType, number>>;

/** Maximum reasonable servings per log entry */
const MAX_SERVINGS = 20;

/**
 * Calculates CO2e emissions for food/dietary activities.
 * Uses life-cycle analysis factors from peer-reviewed research.
 */
export class FoodEmissionStrategy implements EmissionStrategy<FoodActivity> {
  /**
   * @param input — Food activity with type and number of servings
   * @returns Total CO2e for all servings in kg
   * @throws EmissionCalculationError for unknown food type or invalid servings
   */
  public calculate(input: FoodActivity): KgCO2e {
    if (input.servings <= 0 || input.servings > MAX_SERVINGS) {
      throw new EmissionCalculationError(
        `Servings must be 1–${MAX_SERVINGS}, got ${input.servings}`,
        'food',
      );
    }
    const factor = FOOD_FACTORS[input.type];
    if (factor === undefined) {
      throw new EmissionCalculationError(`Unknown food type: ${input.type}`, 'food');
    }
    return KgCO2e(factor * input.servings);
  }
}
