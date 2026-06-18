import request from 'supertest';
import { app } from '../../src/app.js';
import { createGoal, getGoals, getGoalProgress } from '../../src/services/goalService';

jest.mock('../../src/services/goalService', () => ({
  createGoal: jest.fn(),
  getGoals: jest.fn(),
  getGoalProgress: jest.fn()
}));

const mockGoal = {
  id: 'goal-123',
  uid: 'user-123',
  targetReductionPct: 15,
  durationWeeks: 8,
  category: 'energy',
  baselineWeekly: 40.0,
  targetWeekly: 34.0,
  status: 'active',
  createdAt: new Date().toISOString(),
  endDate: new Date().toISOString()
};

describe('goals routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /goals', () => {
    it('creates a goal and returns 201', async () => {
      (createGoal as jest.Mock).mockResolvedValueOnce(mockGoal);

      const res = await request(app)
        .post('/goals')
        .set('Authorization', 'Bearer mock-token-user-123')
        .send({
          targetReductionPct: 15,
          durationWeeks: 8,
          category: 'energy'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('goal-123');
      expect(res.body.category).toBe('energy');
    });

    it('returns 400 for validation errors', async () => {
      const res = await request(app)
        .post('/goals')
        .set('Authorization', 'Bearer mock-token-user-123')
        .send({
          targetReductionPct: -5, // invalid
          durationWeeks: 5, // invalid (must be 4, 8, or 12)
          category: 'invalid-category'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  describe('GET /goals', () => {
    it('returns user goals list', async () => {
      (getGoals as jest.Mock).mockResolvedValueOnce([mockGoal]);

      const res = await request(app)
        .get('/goals')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe('goal-123');
    });
  });

  describe('GET /goals/:id/progress', () => {
    it('returns goal weekly progress logs', async () => {
      const mockProgress = [
        { weekIndex: 1, startDate: '2026-06-01', endDate: '2026-06-07', target: 34.0, actual: 30.0 }
      ];
      (getGoalProgress as jest.Mock).mockResolvedValueOnce(mockProgress);

      const res = await request(app)
        .get('/goals/goal-123/progress')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].actual).toBe(30.0);
    });
  });
});
