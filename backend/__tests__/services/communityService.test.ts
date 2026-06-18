import { getCommunityStats } from '../../src/services/communityService';

const mockUsers = [
  { uid: 'user-1', displayName: 'Alice', baselineWeekly: 20.0 },
  { uid: 'user-2', displayName: 'Bob', baselineWeekly: 30.0 },
  { uid: 'user-3', displayName: 'Charlie', baselineWeekly: 40.0 },
  { uid: 'user-4', displayName: 'David', baselineWeekly: 50.0 }
];

const mockGet = jest.fn();

jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        get: mockGet
      }))
    }))
  }
}));

describe('communityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fallback median stats when no users exist', async () => {
    mockGet.mockResolvedValueOnce({ docs: [] });
    const stats = await getCommunityStats('user-1');
    expect(stats.percentile).toBe(50);
    expect(stats.leaderboard).toEqual([]);
    expect(stats.benchmarks.indiaWeeklyAvg).toBe(36.5);
  });

  it('calculates percentile and anonymizes leaderboard correctly', async () => {
    mockGet.mockResolvedValueOnce({
      docs: mockUsers.map(u => ({
        data: () => u
      }))
    });

    // Bob (user-2) has baselineWeekly = 30.0
    // David (50) and Charlie (40) have weekly emissions > Bob. That's 2 users.
    // Percentile = Math.round(2 / 4 * 100) = 50%
    const stats = await getCommunityStats('user-2');
    expect(stats.percentile).toBe(50);

    // Leaderboard sorted by baselineWeekly ascending
    // User-2 is Bob (isCurrentUser: true)
    // Other users are anonymized
    expect(stats.leaderboard[0]?.displayName).toBe('A***e');
    expect(stats.leaderboard[1]?.displayName).toBe('Bob'); // Current user, not anonymized
    expect(stats.leaderboard[1]?.isCurrentUser).toBe(true);
    expect(stats.leaderboard[2]?.displayName).toBe('C*****e');
    expect(stats.leaderboard[3]?.displayName).toBe('D***d');
  });
});
