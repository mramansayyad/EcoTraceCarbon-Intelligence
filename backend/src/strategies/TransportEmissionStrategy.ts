import { EmissionCalculationError } from '../errors/index.js';
import type { TransportActivity, TransportMode } from '../types/activity.js';
import { KgCO2e, Kilometers } from '../types/units.js';
import type { EmissionStrategy } from './EmissionStrategy.js';

/** kg CO2e per passenger-kilometre. Source: IPCC AR6 WG3 Annex III Table A.III.2 */
const TRANSPORT_FACTORS: Readonly<Record<TransportMode, number>> = Object.freeze({
  car_petrol:           0.21,
  car_diesel:           0.17,
  car_ev:               0.053,   // India grid: 0.71 kg CO2e/kWh × 0.075 kWh/km EV consumption
  flight_economy:       0.255,   // <1500km; includes radiative forcing ×2.7 for short haul
  flight_business:      0.527,   // <1500km; ×2.7 RF × 2.07 cabin factor
  bus:                  0.089,
  metro:                0.031,
  train:                0.041,
  two_wheeler_petrol:   0.113,
  two_wheeler_ev:       0.027,
}) as Readonly<Record<TransportMode, number>>;

/** Long-haul flight factors (>1500km) — lower due to fuel efficiency at cruise */
const LONG_HAUL_FACTORS: Readonly<Partial<Record<TransportMode, number>>> = Object.freeze({
  flight_economy: 0.195,
  flight_business: 0.403,
}) as Readonly<Partial<Record<TransportMode, number>>>;

const LONG_HAUL_THRESHOLD_KM = 1_500;

/**
 * Calculates CO2e emissions for all transport modes.
 * Uses IPCC AR6 emission factors with radiative forcing for aviation.
 */
export class TransportEmissionStrategy implements EmissionStrategy<TransportActivity> {
  /**
   * @param input — Transport activity with mode, distance, and passenger count
   * @returns CO2e in kg per activity (total, divided by passengers for car)
   * @throws EmissionCalculationError if passengers < 1 for car modes
   */
  public calculate(input: TransportActivity): KgCO2e {
    this.validateInput(input);
    const factor = this.getEmissionFactor(input);
    const rawEmission = input.distanceKm * factor;
    const perPassenger = input.mode.startsWith('car_')
      ? rawEmission / input.passengers
      : rawEmission;
    return KgCO2e(perPassenger);
  }

  private getEmissionFactor(input: TransportActivity): number {
    const isLongHaulFlight =
      (input.mode === 'flight_economy' || input.mode === 'flight_business') &&
      input.distanceKm > LONG_HAUL_THRESHOLD_KM;
    const longHaulFactor = LONG_HAUL_FACTORS[input.mode];
    if (isLongHaulFlight && longHaulFactor !== undefined) return longHaulFactor;
    const factor = TRANSPORT_FACTORS[input.mode];
    if (factor === undefined) {
      throw new EmissionCalculationError(`Unknown transport mode: ${input.mode}`, 'transport');
    }
    return factor;
  }

  private validateInput(input: TransportActivity): void {
    Kilometers(input.distanceKm); // throws RangeError if invalid
    if (input.mode.startsWith('car_') && input.passengers < 1) {
      throw new EmissionCalculationError('Car must have ≥1 passenger', 'transport');
    }
  }
}
