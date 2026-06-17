import type { KgCO2e, Kilometers, KWh, UserId } from './units.js';

export type TransportMode =
  | 'car_petrol' | 'car_diesel' | 'car_ev'
  | 'flight_economy' | 'flight_business'
  | 'bus' | 'metro' | 'train' | 'two_wheeler_petrol' | 'two_wheeler_ev';

export type FoodType =
  | 'beef' | 'lamb' | 'pork' | 'chicken' | 'fish'
  | 'vegetarian' | 'vegan' | 'dairy_milk';

export type EnergyType = 'electricity' | 'lpg' | 'natural_gas';
export type ShoppingType = 'clothing' | 'electronics_phone' | 'electronics_laptop' | 'delivery';

/** Transport activity with distance-based calculation */
export interface TransportActivity {
  readonly kind: 'transport';
  readonly mode: TransportMode;
  readonly distanceKm: Kilometers;
  readonly passengers: number;
}

/** Food activity with serving-based calculation */
export interface FoodActivity {
  readonly kind: 'food';
  readonly type: FoodType;
  readonly servings: number;
}

/** Energy activity with consumption-based calculation */
export interface EnergyActivity {
  readonly kind: 'energy';
  readonly type: EnergyType;
  readonly quantity: KWh | number; // kWh for electricity, cylinders for LPG, m³ for gas
  readonly gridRegion: string;
}

/** Shopping activity with item-based calculation */
export interface ShoppingActivity {
  readonly kind: 'shopping';
  readonly type: ShoppingType;
  readonly quantity: number;
}

/** Discriminated union — exhaustive switch coverage enforced by TypeScript */
export type ActivityInput =
  | TransportActivity
  | FoodActivity
  | EnergyActivity
  | ShoppingActivity;

/** Persisted activity with computed emission and metadata */
export interface Activity {
  readonly id: string;
  readonly uid: UserId;
  readonly input: ActivityInput;
  readonly emissionKg: KgCO2e;
  readonly timestamp: Date;
  readonly notes?: string;
}

/** Type guard helpers */
export const isTransport = (a: ActivityInput): a is TransportActivity => a.kind === 'transport';
export const isFood = (a: ActivityInput): a is FoodActivity => a.kind === 'food';
export const isEnergy = (a: ActivityInput): a is EnergyActivity => a.kind === 'energy';
export const isShopping = (a: ActivityInput): a is ShoppingActivity => a.kind === 'shopping';
