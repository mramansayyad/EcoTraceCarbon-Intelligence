import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { getDashboardData } from '../services/dashboardService';

const router = Router();

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const dashboardData = await getDashboardData(uid);
    return res.json(dashboardData);
  } catch (err) {
    next(err);
  }
});

export default router;
