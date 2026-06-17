import { z } from 'zod';

export interface EmissionFactor {
  category: string;       // 'transport' | 'food' | 'energy' | 'shopping'
  subcategory: string;    // e.g. 'car_petrol', 'beef', 'electricity_india'
  value: number;          // kg CO2e per unit
  unit: string;           // e.g. 'km', 'serving', 'kWh', 'item'
  source: string;         // 'EPA AP-42' | 'IPCC AR6' | etc.
  updatedAt: string;      // ISO string
}

export const EmissionFactorSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
  value: z.number().nonnegative(),
  unit: z.string(),
  source: z.string(),
  updatedAt: z.string().datetime()
});
