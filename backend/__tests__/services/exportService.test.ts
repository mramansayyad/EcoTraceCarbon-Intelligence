import { generateCSVString, generatePDFReportStream, uploadToGCS } from '../../src/services/exportService';
import PDFDocument from 'pdfkit';

const mockActivities = [
  { category: 'transport', subcategory: 'car_petrol', value: 100, kg_co2e: 21.0, timestamp: '2026-06-18T12:00:00Z', details: { vehicleType: 'petrol' } }
];

const mockGet = jest.fn();
const mockSave = jest.fn();
const mockGetSignedUrl = jest.fn();
const mockFileFn = jest.fn(() => ({
  save: mockSave,
  getSignedUrl: mockGetSignedUrl
}));

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
    }))
  },
  storage: {
    bucket: jest.fn(() => ({
      file: mockFileFn
    }))
  }
}));

jest.mock('../../src/services/dashboardService', () => ({
  getDashboardData: jest.fn(async () => ({
    stats: {
      today: { value: 0, deltaPct: 0 },
      week: { value: 0, deltaPct: 0 },
      month: { value: 10.0, vsNationalAvgPct: 15.0 },
      streak: { days: 5 }
    },
    charts: {
      categories: [],
      trend: []
    },
    recentActivities: mockActivities
  }))
}));

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCSVString', () => {
    it('generates a CSV containing activity logs', async () => {
      mockQuery.get.mockResolvedValueOnce({
        docs: mockActivities.map(act => ({
          data: () => act
        }))
      });

      const csv = await generateCSVString('test-uid');
      expect(csv).toContain('Timestamp,Category,Subcategory,Value,Details,Emissions (kg CO2e)');
      expect(csv).toContain('transport,car_petrol,100');
    });
  });

  describe('generatePDFReportStream', () => {
    it('creates a PDFKit document stream', async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ displayName: 'Alice' })
      });

      const doc = await generatePDFReportStream('test-uid');
      expect(doc).toBeInstanceOf(PDFDocument);
      
      // Consume the stream to ensure it works
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      const streamFinished = new Promise<void>((resolve, reject) => {
        doc.on('end', () => resolve());
        doc.on('error', err => reject(err));
      });

      doc.end();
      await streamFinished;
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('uploadToGCS', () => {
    it('saves content and returns signed URL', async () => {
      mockSave.mockResolvedValueOnce(undefined);
      mockGetSignedUrl.mockResolvedValueOnce(['http://signed-url.com']);

      const url = await uploadToGCS('test-uid', 'export.csv', 'content', 'text/csv');
      expect(url).toBe('http://signed-url.com');
      expect(mockSave).toHaveBeenCalledWith('content', expect.any(Object));
      expect(mockFileFn).toHaveBeenCalledWith('test-uid/export.csv');
    });
  });
});
