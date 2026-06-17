import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export const goalNudge = onSchedule('0 9 * * *', async (event) => {
  console.log('Running daily goal tracking nudges check...');
  
  try {
    const activeGoalsSnap = await db.collection('goals')
      .where('status', '==', 'active')
      .get();
    
    console.log(`Analyzing ${activeGoalsSnap.size} active goals for nudging...`);
    
    for (const goalDoc of activeGoalsSnap.docs) {
      const goal = goalDoc.data();
      const uid = goal.uid;
      
      // Check last activity log date for this user
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      if (!userSnap.exists) continue;

      const userData = userSnap.data();
      const lastActiveStr = userData?.lastActiveDate;
      
      if (lastActiveStr) {
        const lastActive = new Date(lastActiveStr);
        const daysDiff = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff >= 3) {
          console.warn(`[NUDGE] User ${uid} hasn't logged activities for ${Math.floor(daysDiff)} days. Sending nudge alert...`);
          // Here, we would trigger standard notification alerts (logs mock target)
          await db.collection('notifications').add({
            uid,
            type: 'nudge_inactivity',
            message: "You haven't logged any carbon activities in the last 3 days! Keep up the habit to track your goals.",
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
    }
    console.log('Completed daily goal tracking nudges checks.');
  } catch (err) {
    console.error('Error processing goal nudges:', err);
  }
});
