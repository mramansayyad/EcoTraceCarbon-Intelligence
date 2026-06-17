import { z } from 'zod';

export interface Goal {
  id?: string;
  uid: string;
  targetReductionPct: number; // e.g. 10 for 10%
  durationWeeks: number;      // 4, 8, 12 weeks
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'all';
  baselineWeekly: number;     // baseline average weekly kg CO2e
  targetWeekly: number;       // target average weekly kg CO2e
  status: 'active' | 'completed' | 'failed';
  createdAt: string;          // ISO DateTime
  endDate: string;            // ISO DateTime
}

export const GoalSchema = z.object({
  uid: z.string(),
  targetReductionPct: z.number().min(1, 'Target reduction must be at least 1%').max(100, 'Target reduction cannot exceed 100%'),
  durationWeeks: z.number().int().refine((val) => [4, 8, 12].includes(val), {
    message: 'Duration must be 4, 8, or 12 weeks',
  }),
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'all']),
  baselineWeekly: z.number().nonnegative(),
  targetWeekly: z.number().nonnegative(),
  status: z.enum(['active', 'completed', 'failed']).default('active'),
  createdAt: z.string().datetime(),
  endDate: z.string().datetime(),
});
