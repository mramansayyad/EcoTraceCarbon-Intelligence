import { createActivity, getActivities, deleteActivity } from '../../src/services/activityService';
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
  }
}));

jest.mock('../../src/utils/pubsub', () => ({
  publishToTopic: jest.fn(async () => 'mock-msg-id')
}));

describe('activityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivity', () => {
    it('successfully logs an activity and updates streak', async () => {
      mockAdd.mockResolvedValueOnce({ id: 'new-activity-id' });
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ weeklyTarget: 44.0, streakDays: 0 })
      });
      mockQuery.get.mockResolvedValue({
        docs: []
      });

      const activityData = {
        category: 'transport' as const,
        subcategory: 'car_petrol',
        value: 50,
        details: { vehicleType: 'petrol' as const },
        timestamp: new Date().toISOString()
      };

      const result = await createActivity('test-uid', activityData);

      expect(result.id).toBe('new-activity-id');
      expect(result.kg_co2e).toBeCloseTo(10.5, 2); // 50 * 0.21 = 10.5
      expect(mockAdd).toHaveBeenCalled();
    });

    it('rejects activities backdated > 30 days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      
      const activityData = {
        category: 'transport' as const,
        subcategory: 'car_petrol',
        value: 50,
        details: { vehicleType: 'petrol' as const },
        timestamp: oldDate.toISOString()
      };


      await expect(createActivity('test-uid', activityData)).rejects.toThrow(
        'Activities cannot be backdated by more than 30 days'
      );
    });
  });
});
