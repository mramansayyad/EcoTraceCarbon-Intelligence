import { db } from '../config/firebase-admin';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Default constants in case database read fails or is empty
export const DEFAULT_FACTORS = {
  car_petrol: 0.21,
  car_diesel: 0.17,
  car_ev: 0.05,
  flight_short: 0.255,
  flight_long: 0.195,
  bus: 0.089,
  metro: 0.031,
  train: 0.041,
  two_wheeler_petrol: 0.06,
  two_wheeler_electric: 0.015,
  
  beef: 6.61,
  lamb: 5.84,
  pork: 1.23,
  chicken: 0.69,
  fish: 0.39,
  vegetarian: 0.28,
  vegan: 0.15,
  dairy: 0.64,
  
  electricity_india: 0.71,
  lpg: 42.3,
  natural_gas: 2.04,
  
  clothing_item: 15.0,
  electronics_phone: 70.0,
  electronics_laptop: 300.0,
  online_delivery: 0.5
};

export async function getEmissionFactor(subcategory: string): Promise<number> {
  try {
    const doc = await db.collection('emission_factors').doc(subcategory).get();
    if (doc.exists) {
      const data = doc.data();
      if (data && typeof data.value === 'number') {
        return data.value;
      }
    }
  } catch (err) {
    console.warn(`Firestore read for emission factor ${subcategory} failed. Falling back to default.`);
  }
  
  const key = subcategory as keyof typeof DEFAULT_FACTORS;
  if (key in DEFAULT_FACTORS) {
    return DEFAULT_FACTORS[key];
  }
  throw new ValidationError(`Unknown emission subcategory: ${subcategory}`);
}

export async function calcCarEmission(km: number, type: string): Promise<number> {
  if (km < 0) throw new ValidationError('Distance cannot be negative');
  
  let subcategory = 'car_petrol';
  if (type === 'diesel') subcategory = 'car_diesel';
  else if (type === 'EV' || type === 'ev') subcategory = 'car_ev';
  else if (type !== 'petrol') {
    throw new ValidationError(`Invalid car fuel type: ${type}`);
  }

  const factor = await getEmissionFactor(subcategory);
  return km * factor;
}

export async function calcFlightEmission(km: number, cabin: string): Promise<number> {
  if (km < 0) throw new ValidationError('Distance cannot be negative');
  
  const isShort = km < 1500;
  const subcategory = isShort ? 'flight_short' : 'flight_long';
  const factor = await getEmissionFactor(subcategory);

  let multiplier = 1.0;
  if (cabin === 'business') multiplier = 1.5;
  else if (cabin === 'first') multiplier = 2.0;
  else if (cabin !== 'economy') {
    throw new ValidationError(`Invalid flight cabin class: ${cabin}`);
  }

  const rfMultiplier = isShort ? 1.0 : 2.7;
  return km * factor * rfMultiplier * multiplier;
}

export async function calcFoodEmission(type: string, servings: number): Promise<number> {
  if (servings < 0) throw new ValidationError('Servings cannot be negative');
  
  const allowed = ['beef', 'lamb', 'pork', 'chicken', 'fish', 'vegetarian', 'vegan', 'dairy'];
  if (!allowed.includes(type)) {
    throw new ValidationError(`Invalid food type: ${type}`);
  }

  const factor = await getEmissionFactor(type);
  return servings * factor;
}

export async function calcElectricityEmission(kwh: number, region: string): Promise<number> {
  if (kwh < 0) throw new ValidationError('Electricity consumption cannot be negative');
  
  const subcategory = region.toLowerCase() === 'india' ? 'electricity_india' : 'electricity_india';
  const factor = await getEmissionFactor(subcategory);
  return kwh * factor;
}

export async function calcShoppingEmission(type: string, count: number): Promise<number> {
  if (count < 0) throw new ValidationError('Shopping item count cannot be negative');
  
  let subcategory = 'clothing_item';
  if (type === 'phone') subcategory = 'electronics_phone';
  else if (type === 'laptop') subcategory = 'electronics_laptop';
  else if (type === 'delivery') subcategory = 'online_delivery';
  else if (type !== 'clothing') {
    throw new ValidationError(`Invalid shopping type: ${type}`);
  }

  const factor = await getEmissionFactor(subcategory);
  return count * factor;
}

export async function calculateActivityEmissions(
  category: 'transport' | 'food' | 'energy' | 'shopping',
  subcategory: string,
  value: number,
  details: any
): Promise<number> {
  if (value < 0) throw new ValidationError('Input value cannot be negative');

  switch (category) {
    case 'transport': {
      if (subcategory === 'car_petrol' || subcategory === 'car_diesel' || subcategory === 'car_ev' || subcategory === 'car') {
        const fuel = details.vehicleType || subcategory.replace('car_', '');
        return calcCarEmission(value, fuel);
      }
      if (subcategory.startsWith('flight')) {
        return calcFlightEmission(value, details.cabinClass || 'economy');
      }
      // Bus, train, metro, two-wheelers
      const factor = await getEmissionFactor(subcategory);
      return value * factor;
    }
    case 'food': {
      return calcFoodEmission(subcategory, value);
    }
    case 'energy': {
      if (subcategory === 'electricity') {
        return calcElectricityEmission(value, details.location || 'india');
      }
      // LPG cylinder or natural gas m3
      const factor = await getEmissionFactor(subcategory);
      return value * factor;
    }
    case 'shopping': {
      let type = 'clothing';
      if (subcategory === 'electronics_phone') type = 'phone';
      else if (subcategory === 'electronics_laptop') type = 'laptop';
      else if (subcategory === 'online_delivery') type = 'delivery';
      return calcShoppingEmission(type, value);
    }
    default:
      throw new ValidationError(`Invalid category: ${category}`);
  }
}
