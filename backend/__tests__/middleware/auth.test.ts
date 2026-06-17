import express from 'express';
import request from 'supertest';
import { authMiddleware } from '../../src/middleware/auth';
import type { AuthenticatedRequest } from '../../src/middleware/auth';
import { auth } from '../../src/config/firebase-admin';

// Mock Firebase Admin
jest.mock('../../src/config/firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn()
  }
}));

describe('authMiddleware', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/test-auth', authMiddleware, (req: AuthenticatedRequest, res) => {
      res.json({ uid: req.user?.uid });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access with a valid token', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
      uid: 'user-123',
      email: 'user@example.com'
    });

    const res = await request(app)
      .post('/test-auth')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('user-123');
  });

  it('rejects requests with missing Authorization header', async () => {
    const res = await request(app).post('/test-auth');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Missing or invalid authorization header');
  });

  it('rejects requests with invalid authorization format', async () => {
    const res = await request(app)
      .post('/test-auth')
      .set('Authorization', 'Basic user:pass');
    expect(res.status).toBe(401);
  });

  it('rejects requests when Firebase token verification fails', async () => {
    (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

    const res = await request(app)
      .post('/test-auth')
      .set('Authorization', 'Bearer bad-token');

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Expired or invalid token');
  });

  it('rejects access when token UID mismatches request body UID', async () => {
    (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce({
      uid: 'user-123',
      email: 'user@example.com'
    });

    const res = await request(app)
      .post('/test-auth')
      .set('Authorization', 'Bearer valid-token')
      .send({ uid: 'user-456' }); // Body UID mismatches

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Token UID mismatch');
  });
});
