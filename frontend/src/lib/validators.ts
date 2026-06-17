import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const SignupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().default('India'),
  ageGroup: z.string().default('25-34'),
  weeklyTarget: z.preprocess(
    (val) => Number(val),
    z.number().positive('Weekly budget target must be a positive number')
  )
});

export const LogActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'shopping']),
  subcategory: z.string().min(1, 'Subcategory is required'),
  value: z.preprocess(
    (val) => Number(val),
    z.number().positive('Value must be a positive number').max(100000, 'Unrealistically high value')
  ),
  details: z.object({
    passengers: z.preprocess(
      (val) => (val ? Number(val) : undefined),
      z.number().int().min(1).max(10).optional()
    ),
    cabinClass: z.enum(['economy', 'business', 'first']).optional(),
    vehicleType: z.string().optional(),
    mealType: z.string().optional(),
    location: z.string().default('India').optional(),
    clothingType: z.string().optional(),
    deviceType: z.string().optional(),
  }).catchall(z.any()).default({}),
  timestamp: z.string().min(1, 'Date is required'),
});

export const GoalCreateSchema = z.object({
  targetReductionPct: z.preprocess(
    (val) => Number(val),
    z.number().min(1, 'Target reduction must be at least 1%').max(100, 'Target reduction cannot exceed 100%')
  ),
  durationWeeks: z.preprocess(
    (val) => Number(val),
    z.number().int().refine((val) => [4, 8, 12].includes(val), {
      message: 'Duration must be 4, 8, or 12 weeks',
    })
  ),
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'all']),
});
