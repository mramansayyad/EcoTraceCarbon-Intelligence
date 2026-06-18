import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import {
  createActivity,
  getActivities,
  getActivityById,
  deleteActivity
} from '../services/activityService';

const router = Router();

const CreateActivitySchema = z.object({
  body: z.object({
    category: z.enum(['transport', 'food', 'energy', 'shopping']),
    subcategory: z.string().min(1, 'Subcategory is required'),
    value: z.number().positive('Value must be a positive number'),
    details: z.object({}).catchall(z.any()).default({}),
    timestamp: z.string().datetime({ message: 'Timestamp must be a valid ISO DateTime string' }),
  })
});

// Create Activity Log
router.post('/', authMiddleware, validate(CreateActivitySchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const activity = await createActivity(uid, req.body);
    return res.status(201).json(activity);
  } catch (err) {
    next(err);
    return;
  }
});

// Get Activity Logs (paginated)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const limitVal = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const startAfter = req.query.startAfter as string | undefined;

    const activities = await getActivities(uid, limitVal, startAfter);
    return res.json(activities);
  } catch (err) {
    next(err);
    return;
  }
});

// Get Single Activity Log
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Activity ID is required' });
    }
    const activity = await getActivityById(id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    if (activity.uid !== uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this activity' });
    }

    return res.json(activity);
  } catch (err) {
    next(err);
    return;
  }
});

// Delete Activity Log
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Activity ID is required' });
    }
    await deleteActivity(id, uid);
    return res.json({ message: 'Activity successfully deleted' });
  } catch (err) {
    next(err);
    return;
  }
});

export default router;
