import { db } from '../config/firebase-admin';
import { Activity } from '../models/Activity';
import { UserProfile } from '../models/UserProfile';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getDaysAgo, toISODateString } from '../utils/dateHelpers';

export interface DashboardData {
  stats: {
    today: {
      value: number;
      deltaPct: number; // vs yesterday
    };
    week: {
      value: number;
      deltaPct: number; // vs last week
    };
    month: {
      value: number;
      vsNationalAvgPct: number; // India avg: 1.9 tCO2e/year = 158.3 kg/month
    };
    streak: {
      days: number;
    };
  };
  charts: {
    trend: Array<{ date: string; value: number; rollingAvg: number }>;
    categories: Array<{ category: string; value: number; percentage: number }>;
  };
  recentActivities: Activity[];
}

export async function getDashboardData(uid: string): Promise<DashboardData> {
  const now = new Date();
  
  // 1. Fetch user profile for streak and targets
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? (userDoc.data() as UserProfile) : { streakDays: 0, weeklyTarget: 44.0 };
  const streakDays = userData.streakDays || 0;

  // 2. Fetch activities of past 30 days
  const thirtyDaysAgo = getDaysAgo(30);
  const activitiesSnapshot = await db.collection('activities')
    .where('uid', '==', uid)
    .where('timestamp', '>=', thirtyDaysAgo.toISOString())
    .orderBy('timestamp', 'desc')
    .get();

  const activities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));

  // 3. Today's and Yesterday's emissions
  const todayStr = toISODateString(now);
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = toISODateString(yesterday);

  let todaySum = 0;
  let yesterdaySum = 0;

  // 4. Weekly emissions (This week vs Last week)
  const startOfThisWeek = getStartOfWeek();
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  let thisWeekSum = 0;
  let lastWeekSum = 0;

  // 5. Monthly emissions
  const startOfThisMonth = getStartOfMonth();
  let thisMonthSum = 0;

  // 6. Category breakdown
  const categorySums: { [cat: string]: number } = { transport: 0, food: 0, energy: 0, shopping: 0 };

  // 7. Trend chart (past 30 days)
  const trendMap: { [dateStr: string]: number } = {};
  for (let i = 0; i < 30; i++) {
    const tempDate = new Date();
    tempDate.setDate(now.getDate() - i);
    trendMap[toISODateString(tempDate)] = 0;
  }

  activities.forEach(act => {
    const actDate = new Date(act.timestamp);
    const actDateStr = toISODateString(actDate);
    const kg = act.kg_co2e;

    // Daily totals
    if (actDateStr === todayStr) {
      todaySum += kg;
    } else if (actDateStr === yesterdayStr) {
      yesterdaySum += kg;
    }

    // Weekly totals
    if (actDate >= startOfThisWeek) {
      thisWeekSum += kg;
    } else if (actDate >= startOfLastWeek && actDate <= endOfLastWeek) {
      lastWeekSum += kg;
    }

    // Monthly totals
    if (actDate >= startOfThisMonth) {
      thisMonthSum += kg;
    }

    // Category accumulation
    if (categorySums[act.category] !== undefined) {
      categorySums[act.category] += kg;
    }

    // Trend accumulation
    if (trendMap[actDateStr] !== undefined) {
      trendMap[actDateStr] += kg;
    }
  });

  // Calculate Deltas
  const todayDeltaPct = yesterdaySum > 0 ? ((todaySum - yesterdaySum) / yesterdaySum) * 100 : 0;
  const weekDeltaPct = lastWeekSum > 0 ? ((thisWeekSum - lastWeekSum) / lastWeekSum) * 100 : 0;

  // National average month: India avg is ~158.3 kg CO2e / month
  const nationalAvgMonth = 158.3;
  const vsNationalAvgPct = ((thisMonthSum - nationalAvgMonth) / nationalAvgMonth) * 100;

  // Format category chart array
  const totalEmissions = Object.values(categorySums).reduce((a, b) => a + b, 0);
  const categories = Object.keys(categorySums).map(cat => ({
    category: cat,
    value: parseFloat(categorySums[cat].toFixed(2)),
    percentage: totalEmissions > 0 ? parseFloat(((categorySums[cat] / totalEmissions) * 100).toFixed(1)) : 0
  }));

  // Format trend chart array with rolling average
  const sortedDates = Object.keys(trendMap).sort();
  const trend = sortedDates.map((date, idx) => {
    // 7-day rolling average
    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, idx - 6); i <= idx; i++) {
      sum += trendMap[sortedDates[i]];
      count++;
    }
    return {
      date,
      value: parseFloat(trendMap[date].toFixed(2)),
      rollingAvg: parseFloat((sum / count).toFixed(2))
    };
  });

  // Get recent 10 activities for feed
  const recentActivities = activities.slice(0, 10);

  return {
    stats: {
      today: { value: parseFloat(todaySum.toFixed(2)), deltaPct: parseFloat(todayDeltaPct.toFixed(1)) },
      week: { value: parseFloat(thisWeekSum.toFixed(2)), deltaPct: parseFloat(weekDeltaPct.toFixed(1)) },
      month: { value: parseFloat(thisMonthSum.toFixed(2)), vsNationalAvgPct: parseFloat(vsNationalAvgPct.toFixed(1)) },
      streak: { days: streakDays }
    },
    charts: {
      trend,
      categories
    },
    recentActivities
  };
}

export async function getCommunityPercentile(uid: string, weeklyEmissions: number): Promise<number> {
  try {
    const allUsersSnapshot = await db.collection('users').get();
    const allUsers = allUsersSnapshot.docs.map(doc => doc.data() as UserProfile);
    
    if (allUsers.length <= 1) return 50; // default median
    
    // For this calculation, retrieve all weekly emissions from activity tables or baseline values.
    // Let's assume we compare this user's weekly target / current weekly emissions vs others.
    // If we count how many users have higher emissions than this user:
    let countUnder = 0;
    allUsers.forEach(user => {
      const userWeekly = user.baselineWeekly || 44.0;
      if (userWeekly > weeklyEmissions) {
        countUnder++;
      }
    });

    const percentile = (countUnder / allUsers.length) * 100;
    return Math.round(percentile);
  } catch (err) {
    console.error('Failed to compute community percentile, returning median fallback', err);
    return 50;
  }
}
