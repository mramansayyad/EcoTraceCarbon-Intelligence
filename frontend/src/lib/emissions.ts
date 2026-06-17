export const CLIENT_FACTORS = {
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

export function calcCarEmission(km: number, type: string): number {
  if (km < 0) return 0;
  let factor = CLIENT_FACTORS.car_petrol;
  if (type === 'diesel') factor = CLIENT_FACTORS.car_diesel;
  else if (type === 'EV' || type === 'ev') factor = CLIENT_FACTORS.car_ev;
  return km * factor;
}

export function calcFlightEmission(km: number, cabin: string): number {
  if (km < 0) return 0;
  const isShort = km < 1500;
  const factor = isShort ? CLIENT_FACTORS.flight_short : CLIENT_FACTORS.flight_long;

  let multiplier = 1.0;
  if (cabin === 'business') multiplier = 1.5;
  else if (cabin === 'first') multiplier = 2.0;

  const rfMultiplier = isShort ? 1.0 : 2.7;
  return km * factor * rfMultiplier * multiplier;
}

export function calcFoodEmission(type: string, servings: number): number {
  if (servings < 0) return 0;
  const key = type as keyof typeof CLIENT_FACTORS;
  const factor = CLIENT_FACTORS[key] || 0;
  return servings * factor;
}

export function calcElectricityEmission(kwh: number): number {
  if (kwh < 0) return 0;
  return kwh * CLIENT_FACTORS.electricity_india;
}

export function calcShoppingEmission(type: string, count: number): number {
  if (count < 0) return 0;
  let factor = CLIENT_FACTORS.clothing_item;
  if (type === 'phone') factor = CLIENT_FACTORS.electronics_phone;
  else if (type === 'laptop') factor = CLIENT_FACTORS.electronics_laptop;
  else if (type === 'delivery') factor = CLIENT_FACTORS.online_delivery;
  return count * factor;
}

export function estimateEmissions(
  category: 'transport' | 'food' | 'energy' | 'shopping',
  subcategory: string,
  value: number,
  details: any
): number {
  if (value < 0) return 0;
  
  switch (category) {
    case 'transport': {
      if (subcategory === 'car_petrol' || subcategory === 'car_diesel' || subcategory === 'car_ev' || subcategory === 'car') {
        const fuel = details.vehicleType || subcategory.replace('car_', '');
        return calcCarEmission(value, fuel);
      }
      if (subcategory.startsWith('flight')) {
        return calcFlightEmission(value, details.cabinClass || 'economy');
      }
      const key = subcategory as keyof typeof CLIENT_FACTORS;
      const factor = CLIENT_FACTORS[key] || 0;
      return value * factor;
    }
    case 'food': {
      return calcFoodEmission(subcategory, value);
    }
    case 'energy': {
      if (subcategory === 'electricity') {
        return calcElectricityEmission(value);
      }
      const key = subcategory as keyof typeof CLIENT_FACTORS;
      const factor = CLIENT_FACTORS[key] || 0;
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
      return 0;
  }
}
