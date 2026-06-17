import { z } from 'zod';

export interface Activity {
  id?: string;
  uid: string;
  category: 'transport' | 'food' | 'energy' | 'shopping';
  subcategory: string;
  value: number; // e.g. distance, servings, kWh, count
  details: {
    passengers?: number;       // transport
    cabinClass?: 'economy' | 'business' | 'first'; // flight
    vehicleType?: 'petrol' | 'diesel' | 'EV' | 'electric' | 'two_wheeler_petrol' | 'two_wheeler_electric';
    mealType?: string;         // food
    location?: string;         // energy
    clothingType?: string;     // shopping
    deviceType?: string;       // shopping
    [key: string]: any;
  };
  kg_co2e: number;
  timestamp: string; // ISO DateTime
  createdAt: string; // ISO DateTime
}

export const ActivitySchema = z.object({
  uid: z.string(),
  category: z.enum(['transport', 'food', 'energy', 'shopping']),
  subcategory: z.string(),
  value: z.number().positive('Value must be a positive number').max(100000, 'Value is unrealistically high'),
  details: z.object({
    passengers: z.number().int().min(1).max(10).optional(),
    cabinClass: z.enum(['economy', 'business', 'first']).optional(),
    vehicleType: z.string().optional(),
    mealType: z.string().optional(),
    location: z.string().optional(),
    clothingType: z.string().optional(),
    deviceType: z.string().optional(),
  }).catchall(z.any()),
  kg_co2e: z.number().nonnegative().max(10000, 'Calculated emission exceeds reasonable threshold (10,000 kg CO2e)'),
  timestamp: z.string().datetime(),
});
