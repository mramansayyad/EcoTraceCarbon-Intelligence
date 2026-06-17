import { EmissionCalculationError } from '../errors/index.js';
import type { ShoppingActivity, ShoppingType } from '../types/activity.js';
import { KgCO2e } from '../types/units.js';
import type { EmissionStrategy } from './EmissionStrategy.js';

/** kg CO2e per item or action. Source: emissionService default constants. */
const SHOPPING_FACTORS: Readonly<Record<ShoppingType, number>> = Object.freeze({
  clothing:           15.0,  // 15 kg CO2e per clothing item
  electronics_phone:  70.0,  // 70 kg CO2e per phone
  electronics_laptop: 300.0, // 300 kg CO2e per laptop
  delivery:           0.5,   // 0.5 kg CO2e per delivery
}) as Readonly<Record<ShoppingType, number>>;

/**
 * Calculates CO2e emissions for shopping purchases and deliveries.
 */
export class ShoppingEmissionStrategy implements EmissionStrategy<ShoppingActivity> {
  /**
   * @param input — Shopping activity with type and quantity
   * @returns Total CO2e in kg
   * @throws EmissionCalculationError if quantity is negative or type is unknown
   */
  public calculate(input: ShoppingActivity): KgCO2e {
    if (input.quantity < 0) {
      throw new EmissionCalculationError(
        `Quantity must be non-negative, got ${input.quantity}`,
        'shopping',
      );
    }
    const factor = SHOPPING_FACTORS[input.type];
    if (factor === undefined) {
      throw new EmissionCalculationError(`Unknown shopping type: ${input.type}`, 'shopping');
    }
    return KgCO2e(factor * input.quantity);
  }
}
