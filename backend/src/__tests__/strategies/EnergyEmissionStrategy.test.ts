import { describe, expect, it } from '@jest/globals';
import { EmissionCalculationError } from '../../errors/index.js';
import { EnergyEmissionStrategy } from '../../strategies/EnergyEmissionStrategy.js';

describe('EnergyEmissionStrategy', () => {
  const strategy = new EnergyEmissionStrategy();

  it('calculates electricity emissions correctly', () => {
    expect(strategy.calculate({
      kind: 'energy',
      type: 'electricity',
      quantity: 100,
      gridRegion: 'india'
    })).toBeCloseTo(71.0, 2);
  });

  it('calculates LPG emissions correctly', () => {
    expect(strategy.calculate({
      kind: 'energy',
      type: 'lpg',
      quantity: 2,
      gridRegion: 'india'
    })).toBeCloseTo(84.6, 2);
  });

  it('throws for negative quantity', () => {
    expect(() => strategy.calculate({
      kind: 'energy',
      type: 'electricity',
      quantity: -50,
      gridRegion: 'india'
    })).toThrow(EmissionCalculationError);
  });

  it('throws for unknown energy type', () => {
    expect(() => strategy.calculate({
      kind: 'energy',
      type: 'coal' as any,
      quantity: 10,
      gridRegion: 'india'
    })).toThrow(EmissionCalculationError);
  });
});
