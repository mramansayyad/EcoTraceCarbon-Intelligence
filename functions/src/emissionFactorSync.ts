import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Default values to synchronize/reset
const EMISSION_FACTORS_DEFAULTS = [
  { subcategory: 'car_petrol', value: 0.21, unit: 'kg CO2e/km' },
  { subcategory: 'car_diesel', value: 0.17, unit: 'kg CO2e/km' },
  { subcategory: 'car_ev', value: 0.05, unit: 'kg CO2e/km' },
  { subcategory: 'flight_short', value: 0.255, unit: 'kg CO2e/km' },
  { subcategory: 'flight_long', value: 0.195, unit: 'kg CO2e/km' },
  { subcategory: 'bus', value: 0.089, unit: 'kg CO2e/km' },
  { subcategory: 'metro', value: 0.031, unit: 'kg CO2e/km' },
  { subcategory: 'train', value: 0.041, unit: 'kg CO2e/km' },
  { subcategory: 'two_wheeler_petrol', value: 0.06, unit: 'kg CO2e/km' },
  { subcategory: 'two_wheeler_electric', value: 0.015, unit: 'kg CO2e/km' },
  { subcategory: 'beef', value: 6.61, unit: 'kg CO2e/serving' },
  { subcategory: 'lamb', value: 5.84, unit: 'kg CO2e/serving' },
  { subcategory: 'pork', value: 1.23, unit: 'kg CO2e/serving' },
  { subcategory: 'chicken', value: 0.69, unit: 'kg CO2e/serving' },
  { subcategory: 'fish', value: 0.39, unit: 'kg CO2e/serving' },
  { subcategory: 'vegetarian', value: 0.28, unit: 'kg CO2e/serving' },
  { subcategory: 'vegan', value: 0.15, unit: 'kg CO2e/serving' },
  { subcategory: 'dairy', value: 0.64, unit: 'kg CO2e/serving' },
  { subcategory: 'electricity_india', value: 0.71, unit: 'kg CO2e/kWh' },
  { subcategory: 'lpg', value: 42.3, unit: 'kg CO2e/cylinder' },
  { subcategory: 'natural_gas', value: 2.04, unit: 'kg CO2e/m3' },
  { subcategory: 'clothing_item', value: 15.0, unit: 'kg CO2e/item' },
  { subcategory: 'electronics_phone', value: 70.0, unit: 'kg CO2e/device' },
  { subcategory: 'electronics_laptop', value: 300.0, unit: 'kg CO2e/device' },
  { subcategory: 'online_delivery', value: 0.5, unit: 'kg CO2e/package' }
];

export const emissionFactorSync = onSchedule('0 0 * * 0', async (event) => {
  console.log('Running scheduled emission factor synchronization...');
  
  try {
    const batch = db.batch();
    
    EMISSION_FACTORS_DEFAULTS.forEach((factor) => {
      const docRef = db.collection('emission_factors').doc(factor.subcategory);
      batch.set(docRef, {
        value: factor.value,
        unit: factor.unit,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    });

    await batch.commit();
    console.log('Successfully synchronized all default emission factors.');
  } catch (err) {
    console.error('Error synchronizing emission factors:', err);
  }
});
