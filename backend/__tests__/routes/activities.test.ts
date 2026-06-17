import request from 'supertest';
console.log('EXPRESS TYPE AT TOP OF TEST:', typeof require('express'), require('express'));
import { app } from '../../src/app.js';
import { db } from '../../src/config/firebase-admin';

// Mock Firebase Admin
const mockAdd = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

const mockQuery: any = {
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  get: jest.fn()
};
mockQuery.where.mockReturnValue(mockQuery);
mockQuery.orderBy.mockReturnValue(mockQuery);
mockQuery.limit.mockReturnValue(mockQuery);

jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      add: mockAdd,
      doc: jest.fn(() => ({
        get: mockGet,
        set: mockSet,
        update: mockUpdate,
        delete: mockDelete
      })),
      ...mockQuery
    }))
  },
  auth: {
    verifyIdToken: jest.fn() // unused due to mock-token- prefix bypass
  }
}));

jest.mock('../../src/utils/pubsub', () => ({
  publishToTopic: jest.fn(async () => 'mock-msg-id')
}));

describe('activities routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /activities', () => {
    it('creates an activity and returns 201', async () => {
      mockAdd.mockResolvedValueOnce({ id: 'mock-activity-id' });
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ weeklyTarget: 44.0, streakDays: 0 })
      });
      mockQuery.get.mockResolvedValue({
        docs: []
      });

      const res = await request(app)
        .post('/activities')
        .set('Authorization', 'Bearer mock-token-user-123')
        .send({
          category: 'transport',
          subcategory: 'car_petrol',
          value: 100,
          details: { vehicleType: 'petrol' },
          timestamp: new Date().toISOString()
        });

      expect(res.status).toBe(201); // 201 Created
      expect(res.body.id).toBe('mock-activity-id');
      expect(res.body.kg_co2e).toBeCloseTo(21.0, 2);
    });

    it('returns 400 for validation errors (missing parameters)', async () => {
      const res = await request(app)
        .post('/activities')
        .set('Authorization', 'Bearer mock-token-user-123')
        .send({
          category: 'transport',
          value: 100
          // Missing subcategory and timestamp
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Validation Error');
    });
  });
});
