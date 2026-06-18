import request from 'supertest';
import { app } from '../../src/app.js';

// Mock Firebase Admin
const mockUpdate = jest.fn();
const mockGet = jest.fn();

jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: mockGet,
        update: mockUpdate
      })),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            get: jest.fn(async () => ({
              docs: []
            }))
          })),
          get: jest.fn(async () => ({
            docs: []
          }))
        }))
      }))
    }))
  }
}));

jest.mock('../../src/services/geminiService', () => ({
  generateWeeklyInsights: jest.fn(async () => 'Mocked Gemini Carbon Advice: Try carpooling!')
}));

describe('ai routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /ai/insights', () => {
    it('returns cached insights if they are fresh (< 24 hours old)', async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 2); // 2 hours old

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          lastInsight: 'Use public transit to save 5kg CO2e.',
          lastInsightGeneratedAt: yesterday.toISOString()
        })
      });

      const res = await request(app)
        .get('/ai/insights')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.insight).toBe('Use public transit to save 5kg CO2e.');
    });

    it('generates and returns new insights if cache is stale or missing', async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          lastInsight: 'Use public transit.',
          lastInsightGeneratedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString() // 30 hours old (stale)
        })
      });

      // Mock user doc read during updateStreak in getDashboardData or update
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ streakDays: 2, weeklyTarget: 44.0 })
      });

      const res = await request(app)
        .get('/ai/insights')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.insight).toBe('Mocked Gemini Carbon Advice: Try carpooling!');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
