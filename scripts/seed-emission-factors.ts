import * as admin from 'firebase-admin';

// Initialize Firebase Admin for Seeding
const projectId = process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614';
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId
  });
}
const db = admin.firestore();

const factors = [
  // TRANSPORT (kg CO2e per km)
  {
    category: 'transport',
    subcategory: 'car_petrol',
    value: 0.21,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'car_diesel',
    value: 0.17,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'car_ev',
    value: 0.05,
    unit: 'km',
    source: 'EPA AP-42 / Grid Adjusted',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'flight_short',
    value: 0.255,
    unit: 'km',
    source: 'EPA AP-42 / IPCC Short Haul (<1500km)',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'flight_long',
    value: 0.195,
    unit: 'km',
    source: 'EPA AP-42 / IPCC Long Haul (>1500km)',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'bus',
    value: 0.089,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'metro',
    value: 0.031,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'train',
    value: 0.041,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'two_wheeler_petrol',
    value: 0.06,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'transport',
    subcategory: 'two_wheeler_electric',
    value: 0.015,
    unit: 'km',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },

  // FOOD (kg CO2e per serving)
  {
    category: 'food',
    subcategory: 'beef',
    value: 6.61,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'lamb',
    value: 5.84,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'pork',
    value: 1.23,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'chicken',
    value: 0.69,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'fish',
    value: 0.39,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'vegetarian',
    value: 0.28,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'vegan',
    value: 0.15,
    unit: 'serving',
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'food',
    subcategory: 'dairy',
    value: 0.64,
    unit: 'serving', // 250ml Glass
    source: 'IPCC AR6 / Our World in Data',
    updatedAt: new Date().toISOString()
  },

  // ENERGY (kg CO2e per unit)
  {
    category: 'energy',
    subcategory: 'electricity_india',
    value: 0.71, // kg CO2e/kWh
    unit: 'kWh',
    source: 'CO2 baseline database for Indian Power Sector',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'energy',
    subcategory: 'lpg',
    value: 42.3, // per 14.2kg cylinder
    unit: 'cylinder',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'energy',
    subcategory: 'natural_gas',
    value: 2.04, // per cubic meter
    unit: 'm3',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  },

  // SHOPPING (kg CO2e per item/spend)
  {
    category: 'shopping',
    subcategory: 'clothing_item',
    value: 15.0,
    unit: 'item',
    source: 'Our World in Data',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'shopping',
    subcategory: 'electronics_phone',
    value: 70.0,
    unit: 'item',
    source: 'Apple Product Environmental Reports',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'shopping',
    subcategory: 'electronics_laptop',
    value: 300.0,
    unit: 'item',
    source: 'Dell Product Carbon Footprint Reports',
    updatedAt: new Date().toISOString()
  },
  {
    category: 'shopping',
    subcategory: 'online_delivery',
    value: 0.5,
    unit: 'package',
    source: 'EPA AP-42',
    updatedAt: new Date().toISOString()
  }
];

async function seed() {
  console.log('Seeding emission factors...');
  const batch = db.batch();
  for (const factor of factors) {
    const docRef = db.collection('emission_factors').doc(factor.subcategory);
    batch.set(docRef, factor, { merge: true });
  }
  await batch.commit();
  console.log('Successfully seeded all emission factors!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
