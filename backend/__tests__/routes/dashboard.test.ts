import request from 'supertest';
import { app } from '../../src/app.js';
import { getDashboardData } from '../../src/services/dashboardService';

jest.mock('../../src/services/dashboardService', () => ({
  getDashboardData: jest.fn()
}));

describe('dashboard routes', () => {
  describe('GET /dashboard', () => {
    it('returns 200 and dashboard data', async () => {
      (getDashboardData as jest.Mock).mockResolvedValueOnce({
        stats: {
          today: { value: 5.2, deltaPct: 10 },
          week: { value: 35.4, deltaPct: -5 },
          month: { value: 120.0, vsNationalAvgPct: -24 },
          streak: { days: 4 }
        },
        charts: {
          trend: [],
          categories: []
        },
        recentActivities: []
      });

      const res = await request(app)
        .get('/dashboard')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.stats.today.value).toBe(5.2);
      expect(res.body.stats.streak.days).toBe(4);
    });
  });
});
