import { getDashboardData } from '../../src/services/dashboardService';

const mockActivities = [
  {
    category: 'transport',
    subcategory: 'car_petrol',
    value: 50,
    kg_co2e: 10.5,
    timestamp: new Date().toISOString() // Today
  },
  {
    category: 'food',
    subcategory: 'beef',
    value: 1,
    kg_co2e: 6.61,
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // Yesterday
  },
  {
    category: 'energy',
    subcategory: 'electricity',
    value: 100,
    kg_co2e: 71.0,
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // This week
  }
];

jest.mock('../../src/config/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(async () => ({
          exists: true,
          data: () => ({ streakDays: 3, weeklyTarget: 44.0 })
        }))
      })),
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            get: jest.fn(async () => ({
              docs: mockActivities.map(act => ({
                id: 'mock-act-id',
                data: () => act
              }))
            }))
          }))
        }))
      })),
      get: jest.fn(async () => ({
        docs: [
          { data: () => ({ baselineWeekly: 30.0 }) },
          { data: () => ({ baselineWeekly: 50.0 }) }
        ]
      }))
    }))
  }
}));

describe('dashboardService', () => {
  it('correctly aggregates dashboard data including daily, weekly, monthly totals', async () => {
    const data = await getDashboardData('test-uid');

    expect(data.stats.today.value).toBeCloseTo(10.5, 2);
    expect(data.stats.streak.days).toBe(3);
    
    // Category checks
    const transportCat = data.charts.categories.find(c => c.category === 'transport');
    expect(transportCat).toBeDefined();
    expect(transportCat!.value).toBe(10.5);

    const foodCat = data.charts.categories.find(c => c.category === 'food');
    expect(foodCat).toBeDefined();
    expect(foodCat!.value).toBe(6.61);

    expect(data.recentActivities.length).toBe(3);
  });
});
