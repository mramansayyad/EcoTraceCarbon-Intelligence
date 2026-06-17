import { describe, expect, it } from '@jest/globals';
import { EmissionCalculationError } from '../../errors/index.js';
import { ShoppingEmissionStrategy } from '../../strategies/ShoppingEmissionStrategy.js';

describe('ShoppingEmissionStrategy', () => {
  const strategy = new ShoppingEmissionStrategy();

  it('calculates clothing emissions correctly', () => {
    expect(strategy.calculate({
      kind: 'shopping',
      type: 'clothing',
      quantity: 3
    })).toBeCloseTo(45.0, 2);
  });

  it('calculates phone emissions correctly', () => {
    expect(strategy.calculate({
      kind: 'shopping',
      type: 'electronics_phone',
      quantity: 2
    })).toBeCloseTo(140.0, 2);
  });

  it('throws for negative quantity', () => {
    expect(() => strategy.calculate({
      kind: 'shopping',
      type: 'delivery',
      quantity: -1
    })).toThrow(EmissionCalculationError);
  });

  it('throws for unknown shopping type', () => {
    expect(() => strategy.calculate({
      kind: 'shopping',
      type: 'diamond' as any,
      quantity: 1
    })).toThrow(EmissionCalculationError);
  });
});
