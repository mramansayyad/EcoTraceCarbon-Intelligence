import { describe, expect, it } from '@jest/globals';
import { EmissionCalculationError } from '../../errors/index.js';
import { FoodEmissionStrategy } from '../../strategies/FoodEmissionStrategy.js';
import { ActivityFactory } from '../factories/ActivityFactory.js';

describe('FoodEmissionStrategy', () => {
  const strategy = new FoodEmissionStrategy();

  it('calculates beef emissions correctly', () => {
    const input = (ActivityFactory.food({ type: 'beef', servings: 2 }).input) as import('../../types/activity.js').FoodActivity;
    expect(strategy.calculate(input)).toBeCloseTo(13.22, 2);
  });

  it('calculates vegan emissions correctly', () => {
    const input = (ActivityFactory.food({ type: 'vegan', servings: 4 }).input) as import('../../types/activity.js').FoodActivity;
    expect(strategy.calculate(input)).toBeCloseTo(0.60, 2);
  });

  it('throws for negative servings', () => {
    const input = (ActivityFactory.food({ type: 'chicken', servings: -1 }).input) as import('../../types/activity.js').FoodActivity;
    expect(() => strategy.calculate(input)).toThrow(EmissionCalculationError);
  });

  it('throws for excessive servings (> 20)', () => {
    const input = (ActivityFactory.food({ type: 'chicken', servings: 25 }).input) as import('../../types/activity.js').FoodActivity;
    expect(() => strategy.calculate(input)).toThrow(EmissionCalculationError);
  });

  it('throws for unknown food type', () => {
    const input = { kind: 'food' as const, type: 'pizza' as any, servings: 2 };
    expect(() => strategy.calculate(input)).toThrow(EmissionCalculationError);
  });
});
