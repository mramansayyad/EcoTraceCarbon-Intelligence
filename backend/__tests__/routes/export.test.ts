import request from 'supertest';
import { app } from '../../src/app.js';
import { generateCSVString, generatePDFReportStream, uploadToGCS } from '../../src/services/exportService';
import { Readable } from 'stream';

jest.mock('../../src/services/exportService', () => ({
  generateCSVString: jest.fn(),
  generatePDFReportStream: jest.fn(),
  uploadToGCS: jest.fn()
}));

describe('export routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /export/csv', () => {
    it('returns direct CSV stream when stream=true', async () => {
      (generateCSVString as jest.Mock).mockResolvedValueOnce('col1,col2\nval1,val2');

      const res = await request(app)
        .get('/export/csv?stream=true')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('col1,col2');
    });

    it('returns signed URL on successful GCS upload', async () => {
      (generateCSVString as jest.Mock).mockResolvedValueOnce('col1,col2\nval1,val2');
      (uploadToGCS as jest.Mock).mockResolvedValueOnce('http://gcs-signed-url.com/csv');

      const res = await request(app)
        .get('/export/csv')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('http://gcs-signed-url.com/csv');
    });

    it('falls back to direct stream when GCS upload fails', async () => {
      (generateCSVString as jest.Mock).mockResolvedValueOnce('col1,col2\nval1,val2');
      (uploadToGCS as jest.Mock).mockRejectedValueOnce(new Error('GCS error'));

      const res = await request(app)
        .get('/export/csv')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('col1,col2');
    });
  });

  describe('GET /export/pdf', () => {
    it('returns direct PDF stream when stream=true', async () => {
      const mockStream = new Readable();
      mockStream.push('mock pdf data');
      mockStream.push(null);

      // Add end and pipe mock implementations
      (mockStream as any).pipe = jest.fn((dest) => {
        dest.write('mock pdf data');
        dest.end();
        return dest;
      });
      (mockStream as any).end = jest.fn();

      (generatePDFReportStream as jest.Mock).mockResolvedValueOnce(mockStream);

      const res = await request(app)
        .get('/export/pdf?stream=true')
        .set('Authorization', 'Bearer mock-token-user-123');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('returns signed URL on successful GCS upload', async () => {
      const mockStream = new Readable();
      mockStream.push('mock pdf data');
      mockStream.push(null);
      (mockStream as any).end = jest.fn();

      (generatePDFReportStream as jest.Mock).mockResolvedValueOnce(mockStream);
      (uploadToGCS as jest.Mock).mockResolvedValueOnce('http://gcs-signed-url.com/pdf');

      const res = await request(app)
        .get('/export/pdf')
        .set('Authorization', 'Bearer mock-token-user-123');

      // Wait a tiny bit for the async stream event handler to finish
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(res.status).toBe(200);
      expect(res.body.url).toBe('http://gcs-signed-url.com/pdf');
    });
  });
});
