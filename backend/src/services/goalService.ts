import { db } from '../config/firebase-admin';
import { Goal, GoalSchema } from '../models/Goal';
import { Activity } from '../models/Activity';
import { ValidationError } from './emissionService';
import { getDaysAgo } from '../utils/dateHelpers';

export async function createGoal(
  uid: string,
  goalData: { targetReductionPct: number; durationWeeks: number; category: 'transport' | 'food' | 'energy' | 'shopping' | 'all' }
): Promise<Goal> {
  // 1. Calculate baseline weekly emissions over the last 4 weeks (28 days)
  const fourWeeksAgo = getDaysAgo(28);
  const activitiesSnapshot = await db.collection('activities')
    .where('uid', '==', uid)
    .where('timestamp', '>=', fourWeeksAgo.toISOString())
    .get();

  const activities = activitiesSnapshot.docs.map(doc => doc.data() as Activity);

  // Filter activities by goal category if it is not 'all'
  const filteredActivities = goalData.category === 'all'
    ? activities
    : activities.filter(act => act.category === goalData.category);

  const totalEmissions = filteredActivities.reduce((sum, act) => sum + act.kg_co2e, 0);
  
  // Weekly average
  let baselineWeekly = totalEmissions / 4;

  // Sensible default baselines in case user has no logging history yet
  if (baselineWeekly === 0) {
    const fallbacks = {
      transport: 15.0,
      food: 10.0,
      energy: 12.0,
      shopping: 7.0,
      all: 44.0
    };
    baselineWeekly = fallbacks[goalData.category];
  }

  const targetWeekly = baselineWeekly * (1 - goalData.targetReductionPct / 100);

  const createdAt = new Date();
  const endDate = new Date();
  endDate.setDate(createdAt.getDate() + goalData.durationWeeks * 7);

  const goal: Goal = {
    uid,
    targetReductionPct: goalData.targetReductionPct,
    durationWeeks: goalData.durationWeeks,
    category: goalData.category,
    baselineWeekly: parseFloat(baselineWeekly.toFixed(2)),
    targetWeekly: parseFloat(targetWeekly.toFixed(2)),
    status: 'active',
    createdAt: createdAt.toISOString(),
    endDate: endDate.toISOString()
  };

  // Validate schema
  GoalSchema.parse(goal);

  // Deactivate any existing active goals in the same category
  const activeGoalsSnapshot = await db.collection('goals')
    .where('uid', '==', uid)
    .where('category', '==', goalData.category)
    .where('status', '==', 'active')
    .get();
  
  const batch = db.batch();
  activeGoalsSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'failed', updatedAt: new Date().toISOString() });
  });

  const docRef = db.collection('goals').doc();
  batch.set(docRef, goal);
  await batch.commit();

  goal.id = docRef.id;
  return goal;
}

export async function getGoals(uid: string): Promise<Goal[]> {
  const snapshot = await db.collection('goals')
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
}

export interface GoalProgressWeek {
  weekIndex: number;
  startDate: string;
  endDate: string;
  target: number;
  actual: number;
}

export async function getGoalProgress(goalId: string, uid: string): Promise<GoalProgressWeek[]> {
  const goalDoc = await db.collection('goals').doc(goalId).get();
  if (!goalDoc.exists) {
    throw new ValidationError('Goal not found');
  }
  const goal = goalDoc.data() as Goal;
  if (goal.uid !== uid) {
    throw new ValidationError('Permission denied: You do not own this goal');
  }

  // Fetch all activities between goal creation date and end date (or today if not completed)
  const activitiesSnapshot = await db.collection('activities')
    .where('uid', '==', uid)
    .where('timestamp', '>=', goal.createdAt)
    .get();

  const activities = activitiesSnapshot.docs.map(doc => doc.data() as Activity);

  const progress: GoalProgressWeek[] = [];
  const start = new Date(goal.createdAt);

  for (let i = 0; i < goal.durationWeeks; i++) {
    const weekStart = new Date(start.getTime() + i * 7 * 24 * 3600 * 1000);
    const weekEnd = new Date(start.getTime() + (i + 1) * 7 * 24 * 3600 * 1000);

    const weekActs = activities.filter(act => {
      const actDate = new Date(act.timestamp);
      const inTimeRange = actDate >= weekStart && actDate < weekEnd;
      const matchesCategory = goal.category === 'all' || act.category === goal.category;
      return inTimeRange && matchesCategory;
    });

    const actualEmissions = weekActs.reduce((sum, act) => sum + act.kg_co2e, 0);

    progress.push({
      weekIndex: i + 1,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      target: goal.targetWeekly,
      actual: parseFloat(actualEmissions.toFixed(2))
    });
  }

  return progress;
}
