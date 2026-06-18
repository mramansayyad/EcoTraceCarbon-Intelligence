import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  try {
    let decodedToken;
    
    // In test environment, allow direct mock bypass if header matches mock structure
    if (process.env.NODE_ENV === 'test' && token.startsWith('mock-token-')) {
      decodedToken = {
        uid: token.replace('mock-token-', ''),
        email: 'mock-user@example.com'
      };
    } else {
      decodedToken = await auth.verifyIdToken(token);
    }

    req.user = decodedToken;

    // Check if req.body contains a uid, and if so, prevent mismatches
    if (req.body && req.body.uid && req.body.uid !== decodedToken.uid) {
      return res.status(403).json({ error: 'Forbidden: Token UID mismatch with request body UID' });
    }

    next();
    return;
  } catch (err: any) {
    console.error('Firebase token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized: Expired or invalid token' });
  }
}
