import request from 'supertest';
import { app } from '../../src/app.js';
import { getCommunityStats } from '../../src/services/communityService';

jest.mock('../../src/services/communityService', () => ({
  getCommunityStats: jest.fn()
}));

describe('community routes', () => {
  describe('GET /community', () => {
    it('returns 200 and community benchmarks', async () => {
      (getCommunityStats as jest.Mock).mockResolvedValueOnce({
        percentile: 75,
        leaderboard: [],
        benchmarks: {
          indiaWeeklyAvg: 36.5,
          globalWeeklyAvg: 90.4,
          carbonBudgetWeeklyTarget: 44.2
        }
      });

      const res = await request(app)
        .get('/community')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.percentile).toBe(75);
      expect(res.body.benchmarks.indiaWeeklyAvg).toBe(36.5);
    });
  });
});
