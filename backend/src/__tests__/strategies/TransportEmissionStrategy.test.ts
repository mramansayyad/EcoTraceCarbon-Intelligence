import { describe, expect, it } from '@jest/globals';
import { EmissionCalculationError } from '../../errors/index.js';
import { TransportEmissionStrategy } from '../../strategies/TransportEmissionStrategy.js';
import { Kilometers } from '../../types/units.js';
import { ActivityFactory } from '../factories/ActivityFactory.js';

describe('TransportEmissionStrategy', () => {
  const strategy = new TransportEmissionStrategy();

  describe('car emissions', () => {
    it('calculates petrol car at 21g/km per passenger', () => {
      const input = (ActivityFactory.transport({ mode: 'car_petrol', distanceKm: Kilometers(100) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(21.0, 2);
    });
    it('divides by passenger count for carpooling', () => {
      const input = (ActivityFactory.transport({ mode: 'car_petrol', distanceKm: Kilometers(100), passengers: 2 }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(10.5, 2);
    });
    it('throws for zero passengers', () => {
      const input = (ActivityFactory.transport({ mode: 'car_petrol', passengers: 0 }).input) as import('../../types/activity.js').TransportActivity;
      expect(() => strategy.calculate(input)).toThrow(EmissionCalculationError);
    });
  });

  describe('flight emissions — long haul vs short haul', () => {
    it('uses short-haul factor for flights under 1500km', () => {
      const input = (ActivityFactory.transport({ mode: 'flight_economy', distanceKm: Kilometers(800) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(204.0, 1);
    });
    it('uses long-haul factor for flights over 1500km', () => {
      const input = (ActivityFactory.transport({ mode: 'flight_economy', distanceKm: Kilometers(2000) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(390.0, 1);
    });
    it('applies higher factor for business class', () => {
      const economy = (ActivityFactory.transport({ mode: 'flight_economy', distanceKm: Kilometers(2000) }).input) as import('../../types/activity.js').TransportActivity;
      const business = (ActivityFactory.transport({ mode: 'flight_business', distanceKm: Kilometers(2000) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(business)).toBeGreaterThan(strategy.calculate(economy));
    });
    it('uses boundary value 1500km as short haul (boundary test)', () => {
      const input = (ActivityFactory.transport({ mode: 'flight_economy', distanceKm: Kilometers(1500) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(382.5, 1);
    });
  });

  describe('EV emissions', () => {
    it('calculates EV at India grid factor', () => {
      const input = (ActivityFactory.transport({ mode: 'car_ev', distanceKm: Kilometers(100) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(input)).toBeCloseTo(5.3, 1);
    });
    it('EV has lower emissions than petrol for same distance', () => {
      const ev = (ActivityFactory.transport({ mode: 'car_ev', distanceKm: Kilometers(100) }).input) as import('../../types/activity.js').TransportActivity;
      const petrol = (ActivityFactory.transport({ mode: 'car_petrol', distanceKm: Kilometers(100) }).input) as import('../../types/activity.js').TransportActivity;
      expect(strategy.calculate(ev)).toBeLessThan(strategy.calculate(petrol));
    });
  });

  describe('validation boundaries & unknown modes', () => {
    it('throws for unknown transport mode', () => {
      const input = { kind: 'transport' as const, mode: 'rocket' as any, distanceKm: Kilometers(10), passengers: 1 };
      expect(() => strategy.calculate(input)).toThrow(EmissionCalculationError);
    });
  });

  describe('branded type validation', () => {
    it('throws RangeError for negative distance', () => {
      expect(() => Kilometers(-10)).toThrow(RangeError);
    });
    it('throws RangeError for zero distance', () => {
      expect(() => Kilometers(0)).toThrow(RangeError);
    });
    it('throws RangeError for Earth-circumference distance', () => {
      expect(() => Kilometers(50_000)).toThrow(RangeError);
    });
  });
});
