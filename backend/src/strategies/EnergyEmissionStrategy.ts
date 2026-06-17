import { EmissionCalculationError } from '../errors/index.js';
import type { EnergyActivity, EnergyType } from '../types/activity.js';
import { KgCO2e } from '../types/units.js';
import type { EmissionStrategy } from './EmissionStrategy.js';

/** kg CO2e per unit of energy. Source: emissionService default constants. */
const ENERGY_FACTORS: Readonly<Record<EnergyType, number>> = Object.freeze({
  electricity: 0.71, // India grid: 0.71 kg CO2e/kWh
  lpg:         42.3, // 42.3 kg CO2e per cylinder
  natural_gas: 2.04, // 2.04 kg CO2e per m3
}) as Readonly<Record<EnergyType, number>>;

/**
 * Calculates CO2e emissions for energy utilities.
 * Supports electricity, LPG cylinders, and natural gas.
 */
export class EnergyEmissionStrategy implements EmissionStrategy<EnergyActivity> {
  /**
   * @param input — Energy activity with type, quantity, and region
   * @returns Total CO2e in kg
   * @throws EmissionCalculationError if quantity is negative or type is unknown
   */
  public calculate(input: EnergyActivity): KgCO2e {
    if (input.quantity < 0) {
      throw new EmissionCalculationError(
        `Quantity must be non-negative, got ${input.quantity}`,
        'energy',
      );
    }
    const factor = ENERGY_FACTORS[input.type];
    if (factor === undefined) {
      throw new EmissionCalculationError(`Unknown energy type: ${input.type}`, 'energy');
    }
    return KgCO2e(factor * input.quantity);
  }
}
