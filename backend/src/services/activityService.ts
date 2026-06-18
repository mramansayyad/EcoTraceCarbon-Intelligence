import { db } from '../config/firebase-admin';
import { Activity, ActivitySchema } from '../models/Activity';
import { calculateActivityEmissions, ValidationError } from './emissionService';
import { publishToTopic } from '../utils/pubsub';
import { toISODateString } from '../utils/dateHelpers';

export async function createActivity(uid: string, activityData: Omit<Activity, 'uid' | 'kg_co2e' | 'createdAt'>): Promise<Activity> {
  // Validate schema
  const parsed = ActivitySchema.omit({ uid: true, kg_co2e: true }).parse(activityData);
  
  // Validate timestamp (max 30 days backdated)
  const timestamp = new Date(parsed.timestamp);
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  if (timestamp < thirtyDaysAgo) {
    throw new ValidationError('Activities cannot be backdated by more than 30 days');
  }
  if (timestamp > now) {
    throw new ValidationError('Activities cannot be logged for future dates');
  }

  // Calculate emissions
  const kg_co2e = await calculateActivityEmissions(parsed.category, parsed.subcategory, parsed.value, parsed.details || {});

  const activity: Activity = {
    uid,
    category: parsed.category,
    subcategory: parsed.subcategory,
    value: parsed.value,
    details: (parsed.details || {}) as any,
    kg_co2e,
    timestamp: parsed.timestamp,
    createdAt: new Date().toISOString()
  };

  // Save to Firestore
  const docRef = await db.collection('activities').add(activity);
  activity.id = docRef.id;

  // Publish to Pub/Sub topic for downstream processing (async)
  await publishToTopic('activities', {
    activityId: activity.id,
    uid,
    category: activity.category,
    kg_co2e,
    timestamp: activity.timestamp
  });

  // Update User Streak & lastActiveDate
  await updateStreakAndActivityDate(uid, activity.timestamp);

  return activity;
}

export async function getActivities(uid: string, limitVal: number = 10, startAfterDocId?: string): Promise<Activity[]> {
  let query = db.collection('activities')
    .where('uid', '==', uid)
    .orderBy('timestamp', 'desc')
    .limit(limitVal);

  if (startAfterDocId) {
    const startAfterDoc = await db.collection('activities').doc(startAfterDocId).get();
    if (startAfterDoc.exists) {
      query = query.startAfter(startAfterDoc);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const doc = await db.collection('activities').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Activity;
}

export async function deleteActivity(id: string, uid: string): Promise<void> {
  const docRef = db.collection('activities').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new ValidationError('Activity not found');
  }
  const data = doc.data() as Activity;
  if (data.uid !== uid) {
    throw new ValidationError('Permission denied: You do not own this activity');
  }

  await docRef.delete();
  
  // Recalculate streak after deletion
  await updateStreakAndActivityDate(uid, data.timestamp);
}

/**
 * Recalculates streak and updates lastActiveDate in user profile.
 * Streak counts consecutive days where total emissions logged are under the daily target.
 */
export async function updateStreakAndActivityDate(uid: string, activityTimestamp: string): Promise<void> {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  let userData;
  if (!userDoc.exists) {
    // If user profile doesn't exist, create a basic one
    const defaultProfile = {
      uid,
      displayName: 'EcoTracker',
      email: '',
      country: 'India',
      ageGroup: '25-34',
      weeklyTarget: 44.0,
      baselineWeekly: 44.0,
      streakDays: 0,
      lastActiveDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await userRef.set(defaultProfile);
    userData = defaultProfile;
  } else {
    userData = userDoc.data()!;
  }
  const weeklyTarget = userData.weeklyTarget || 44.0;
  const dailyTarget = weeklyTarget / 7;

  // Retrieve activities of the past 35 days to calculate streaks
  const thirtyFiveDaysAgo = new Date();
  thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

  const snapshot = await db.collection('activities')
    .where('uid', '==', uid)
    .where('timestamp', '>=', thirtyFiveDaysAgo.toISOString())
    .get();

  const activities = snapshot.docs.map(d => d.data() as Activity);

  // Group emissions by date string (YYYY-MM-DD)
  const dailyEmissions: { [date: string]: number } = {};
  
  // Initialize map with all dates in the past 35 days to today
  const today = new Date();
  for (let i = 0; i <= 35; i++) {
    const temp = new Date();
    temp.setDate(today.getDate() - i);
    dailyEmissions[toISODateString(temp)] = 0;
  }

  activities.forEach(act => {
    const dateStr = toISODateString(new Date(act.timestamp));
    if (dailyEmissions[dateStr] !== undefined) {
      dailyEmissions[dateStr] += act.kg_co2e;
    }
  });

  // Calculate Streak
  let streak = 0;
  let checkDate = new Date(); // Start checking from today

  // If they have exceeded target today, streak is 0. But if they haven't exceeded today,
  // we check if they were under target today (or if they haven't logged anything today yet, we check yesterday).
  const todayStr = toISODateString(checkDate);
  const todayEmissions = dailyEmissions[todayStr] || 0;

  if (todayEmissions === 0) {
    // No logs today, check starting from yesterday to maintain streak
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Iterate backwards and count consecutive days under target
  while (true) {
    const dateStr = toISODateString(checkDate);
    const emissions = dailyEmissions[dateStr];
    
    if (emissions === undefined) {
      break; // Out of range of our 35-day retrieval
    }

    if (emissions < dailyTarget) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; // Exceeded target, stop streak counting
    }
  }

  // Update profile
  await userRef.update({
    streakDays: streak,
    lastActiveDate: toISODateString(new Date(activityTimestamp)),
    updatedAt: new Date().toISOString()
  });
}
