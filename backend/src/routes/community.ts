import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { getCommunityStats } from '../services/communityService';

const router = Router();

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const stats = await getCommunityStats(uid);
    return res.json(stats);
  } catch (err) {
    next(err);
    return;
  }
});

export default router;
