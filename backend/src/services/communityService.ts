import { db } from '../config/firebase-admin';
import { UserProfile } from '../models/UserProfile';

export interface LeaderboardEntry {
  displayName: string;
  weekly_kg_co2e: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface CommunityBenchmarks {
  percentile: number;
  leaderboard: LeaderboardEntry[];
  benchmarks: {
    indiaWeeklyAvg: number;     // 36.5 kg CO2e
    globalWeeklyAvg: number;    // 90.4 kg CO2e
    carbonBudgetWeeklyTarget: number; // 44.2 kg CO2e (1.5°C path)
  };
}

export async function getCommunityStats(uid: string): Promise<CommunityBenchmarks> {
  const usersSnapshot = await db.collection('users').orderBy('baselineWeekly', 'asc').get();
  const allUsers = usersSnapshot.docs.map(doc => doc.data() as UserProfile);

  // Fallback if there are no users seeded
  if (allUsers.length === 0) {
    return {
      percentile: 50,
      leaderboard: [],
      benchmarks: {
        indiaWeeklyAvg: 36.5,
        globalWeeklyAvg: 90.4,
        carbonBudgetWeeklyTarget: 44.2
      }
    };
  }

  // Find current user's weekly average (fallback to 44 if not set)
  const currentUserDoc = allUsers.find(u => u.uid === uid);
  const currentUserEmissions = currentUserDoc ? (currentUserDoc.baselineWeekly || 44.0) : 44.0;

  // Calculate Percentile: lower emissions = higher percentile
  // e.g. if current user has lower emissions than 80% of users, they are in the 80th percentile.
  let usersWorseThanMe = 0;
  allUsers.forEach(user => {
    const userEmissions = user.baselineWeekly || 44.0;
    if (userEmissions > currentUserEmissions) {
      usersWorseThanMe++;
    }
  });
  
  const percentile = Math.round((usersWorseThanMe / allUsers.length) * 100);

  // Build Anonymous Leaderboard (sorted ascending, lowest footprint first)
  const leaderboard: LeaderboardEntry[] = allUsers.map((user, idx) => {
    // Anonymize if user did not set a displayName or to protect PII generally
    const rawName = user.displayName || 'EcoTrace User';
    const anonymizedName = rawName.substring(0, 1) + '*'.repeat(Math.max(3, rawName.length - 2)) + rawName.substring(rawName.length - 1);
    
    return {
      displayName: user.uid === uid ? rawName : anonymizedName,
      weekly_kg_co2e: parseFloat((user.baselineWeekly || 44.0).toFixed(2)),
      rank: idx + 1,
      isCurrentUser: user.uid === uid
    };
  });

  return {
    percentile,
    leaderboard: leaderboard.slice(0, 50), // Return top 50
    benchmarks: {
      indiaWeeklyAvg: 36.5,
      globalWeeklyAvg: 90.4,
      carbonBudgetWeeklyTarget: 44.2
    }
  };
}
