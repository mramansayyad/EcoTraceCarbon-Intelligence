import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { createGoal, getGoals, getGoalProgress } from '../services/goalService';

const router = Router();

const CreateGoalSchema = z.object({
  body: z.object({
    targetReductionPct: z.number().min(1, 'Target reduction must be at least 1%').max(100, 'Target reduction cannot exceed 100%'),
    durationWeeks: z.number().int().refine((val) => [4, 8, 12].includes(val), {
      message: 'Duration must be 4, 8, or 12 weeks',
    }),
    category: z.enum(['transport', 'food', 'energy', 'shopping', 'all']),
  })
});

// Create a goal
router.post('/', authMiddleware, validate(CreateGoalSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const goal = await createGoal(uid, req.body);
    return res.status(201).json(goal);
  } catch (err) {
    next(err);
    return;
  }
});

// Get user goals
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const goals = await getGoals(uid);
    return res.json(goals);
  } catch (err) {
    next(err);
    return;
  }
});

// Get progress for a specific goal
router.get('/:id/progress', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Goal ID is required' });
    }
    const progress = await getGoalProgress(id, uid);
    return res.json(progress);
  } catch (err) {
    next(err);
    return;
  }
});

export default router;
