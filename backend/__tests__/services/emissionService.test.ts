import {
  calcCarEmission,
  calcFlightEmission,
  calcFoodEmission,
  calcElectricityEmission,
  ValidationError
} from '../../src/services/emissionService';

// Mock Firebase Admin so database reads fail gracefully and fall back to local constants
jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(async () => ({
          exists: false,
          data: () => null
        }))
      }))
    }))
  }
}));

describe('emissionService calculations', () => {
  describe('calcCarEmission', () => {
    it('calculates petrol emissions correctly', async () => {
      const result = await calcCarEmission(100, 'petrol');
      expect(result).toBeCloseTo(21.0, 2); // 100 * 0.21 = 21
    });

    it('calculates EV emissions correctly', async () => {
      const result = await calcCarEmission(100, 'EV');
      expect(result).toBeCloseTo(5.0, 2); // 100 * 0.05 = 5
    });

    it('throws error for negative distance', async () => {
      await expect(calcCarEmission(-100, 'petrol')).rejects.toThrow(ValidationError);
    });

    it('throws error for invalid fuel type', async () => {
      await expect(calcCarEmission(100, 'plasma')).rejects.toThrow(ValidationError);
    });
  });

  describe('calcFlightEmission', () => {
    it('calculates short-haul economy emissions', async () => {
      const result = await calcFlightEmission(500, 'economy');
      expect(result).toBeCloseTo(127.5, 2); // 500 * 0.255 = 127.5
    });

    it('calculates long-haul business emissions with RF and cabin multiplier', async () => {
      const result = await calcFlightEmission(2000, 'business');
      // 2000 * 0.195 * 2.7 * 1.5 = 1579.5
      expect(result).toBeCloseTo(1579.5, 2);
    });

    it('throws error for negative distance', async () => {
      await expect(calcFlightEmission(-500, 'economy')).rejects.toThrow(ValidationError);
    });

    it('throws error for invalid cabin class', async () => {
      await expect(calcFlightEmission(500, 'pilot-seat')).rejects.toThrow(ValidationError);
    });
  });

  describe('calcFoodEmission', () => {
    it('calculates beef servings emissions', async () => {
      const result = await calcFoodEmission('beef', 2);
      expect(result).toBeCloseTo(13.22, 2); // 2 * 6.61 = 13.22
    });

    it('calculates vegan servings emissions', async () => {
      const result = await calcFoodEmission('vegan', 3);
      expect(result).toBeCloseTo(0.45, 2); // 3 * 0.15 = 0.45
    });

    it('throws error for negative servings', async () => {
      await expect(calcFoodEmission('beef', -1)).rejects.toThrow(ValidationError);
    });

    it('throws error for invalid food type', async () => {
      await expect(calcFoodEmission('pizza', 1)).rejects.toThrow(ValidationError);
    });
  });

  describe('calcElectricityEmission', () => {
    it('calculates India region electricity emissions', async () => {
      const result = await calcElectricityEmission(50, 'india');
      expect(result).toBeCloseTo(35.5, 2); // 50 * 0.71 = 35.5
    });

    it('throws error for negative kWh', async () => {
      await expect(calcElectricityEmission(-50, 'india')).rejects.toThrow(ValidationError);
    });
  });
});
