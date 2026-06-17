import { describe, it, expect } from '@jest/globals';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { activityResponseSchema } from '../schemas/activityResponse.schema.js';

const ajv = new Ajv({ strict: true });
addFormats(ajv);
const validate = ajv.compile(activityResponseSchema);

describe('Activity API Contract', () => {
  it('validates a successful activity creation response', () => {
    const response = {
      id: 'abc123',
      emissionKg: 21.5,
      input: { kind: 'transport', mode: 'car_petrol', distanceKm: 100, passengers: 1 },
      timestamp: '2025-01-15T10:00:00.000Z',
      instantInsight: 'Your commute emitted 21.5 kg CO₂e. Try carpooling tomorrow.',
    };
    expect(validate(response)).toBe(true);
  });

  it('rejects response with negative emissionKg', () => {
    const response = { id: 'abc123', emissionKg: -1, timestamp: '2025-01-15T10:00:00.000Z' };
    expect(validate(response)).toBe(false);
  });
});
