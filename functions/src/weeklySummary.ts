import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export const weeklySummary = onMessagePublished('weekly-summary', async (event) => {
  console.log('Received weekly-summary event. Processing summaries...');
  
  try {
    const usersSnap = await db.collection('users').get();
    const batch = db.batch();

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      
      // Calculate last 7 days of emissions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activitiesSnap = await db.collection('activities')
        .where('uid', '==', uid)
        .where('timestamp', '>=', sevenDaysAgo.toISOString())
        .get();

      let totalWeeklyEmissions = 0;
      activitiesSnap.docs.forEach((doc) => {
        totalWeeklyEmissions += doc.data().kg_co2e || 0;
      });

      console.log(`User ${uid} weekly emissions: ${totalWeeklyEmissions.toFixed(2)} kg CO2e`);

      // Save baseline weekly or update user profile with latest summary stats
      const userRef = db.collection('users').doc(uid);
      batch.update(userRef, {
        baselineWeekly: parseFloat(totalWeeklyEmissions.toFixed(2)),
        lastSummaryCalculatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
    console.log('Successfully completed weekly summaries updates for all users.');
  } catch (err) {
    console.error('Error processing weekly summaries:', err);
  }
});
