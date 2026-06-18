import { createGoal, getGoals, getGoalProgress } from '../../src/services/goalService';
import { ValidationError } from '../../src/services/emissionService';

const mockActivities = [
  { category: 'transport', kg_co2e: 10.0, timestamp: new Date().toISOString() },
  { category: 'transport', kg_co2e: 14.0, timestamp: new Date().toISOString() }
];

const mockGoal = {
  uid: 'test-uid',
  targetReductionPct: 10,
  durationWeeks: 4,
  category: 'transport',
  baselineWeekly: 6.0,
  targetWeekly: 5.4,
  status: 'active',
  createdAt: new Date().toISOString(),
  endDate: new Date().toISOString()
};

const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockCommit = jest.fn();

const mockQuery: any = {
  where: jest.fn(),
  orderBy: jest.fn(),
  get: jest.fn()
};
mockQuery.where.mockReturnValue(mockQuery);
mockQuery.orderBy.mockReturnValue(mockQuery);

jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: mockGet
      })),
      ...mockQuery
    })),
    batch: jest.fn(() => ({
      update: mockUpdate,
      set: mockSet,
      commit: mockCommit
    }))
  }
}));

describe('goalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('successfully creates a goal with fallback baseline when no activities logged', async () => {
      mockQuery.get.mockResolvedValueOnce({ docs: [] }); // activities empty
      mockQuery.get.mockResolvedValueOnce({ docs: [] }); // active goals empty
      mockCommit.mockResolvedValueOnce(undefined);

      const goal = await createGoal('test-uid', {
        targetReductionPct: 10,
        durationWeeks: 4,
        category: 'transport'
      });

      expect(goal.baselineWeekly).toBe(15.0); // Fallback transport baseline
      expect(goal.targetWeekly).toBe(13.5); // 15 * 0.9
      expect(goal.status).toBe('active');
    });

    it('calculates baseline from activities and deactivates existing active goals', async () => {
      mockQuery.get.mockResolvedValueOnce({
        docs: mockActivities.map(act => ({
          data: () => act
        }))
      }); // activities: total 24.0 over 4 weeks -> 6.0 baseline
      
      mockQuery.get.mockResolvedValueOnce({
        docs: [
          { ref: 'mock-ref-1' }
        ]
      }); // active goals to deactivate
      mockCommit.mockResolvedValueOnce(undefined);

      const goal = await createGoal('test-uid', {
        targetReductionPct: 10,
        durationWeeks: 4,
        category: 'transport'
      });

      expect(goal.baselineWeekly).toBe(6.0);
      expect(goal.targetWeekly).toBe(5.4);
      expect(mockUpdate).toHaveBeenCalledWith('mock-ref-1', expect.objectContaining({ status: 'failed' }));
    });
  });

  describe('getGoals', () => {
    it('fetches user goals', async () => {
      mockQuery.get.mockResolvedValueOnce({
        docs: [
          { id: 'goal-id-1', data: () => mockGoal }
        ]
      });

      const goals = await getGoals('test-uid');
      expect(goals.length).toBe(1);
      expect(goals[0]?.id).toBe('goal-id-1');
    });
  });

  describe('getGoalProgress', () => {
    it('throws error if goal not found or permission denied', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      await expect(getGoalProgress('invalid-id', 'test-uid')).rejects.toThrow(ValidationError);

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ ...mockGoal, uid: 'other-uid' })
      });
      await expect(getGoalProgress('goal-id', 'test-uid')).rejects.toThrow(ValidationError);
    });

    it('calculates weekly progress correctly', async () => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - 10); // 10 days ago

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ ...mockGoal, createdAt: createdAt.toISOString() })
      });

      const goalActs = [
        { category: 'transport', kg_co2e: 5.0, timestamp: new Date(createdAt.getTime() + 2 * 24 * 3600 * 1000).toISOString() }, // Week 1
        { category: 'transport', kg_co2e: 8.0, timestamp: new Date(createdAt.getTime() + 8 * 24 * 3600 * 1000).toISOString() }  // Week 2
      ];

      mockQuery.get.mockResolvedValueOnce({
        docs: goalActs.map(act => ({
          data: () => act
        }))
      });

      const progress = await getGoalProgress('goal-id', 'test-uid');
      expect(progress.length).toBe(4);
      expect(progress[0]?.actual).toBe(5.0);
      expect(progress[1]?.actual).toBe(8.0);
      expect(progress[2]?.actual).toBe(0.0);
    });
  });
});
