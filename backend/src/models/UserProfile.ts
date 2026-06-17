import { z } from 'zod';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  country: string;
  ageGroup: string;
  weeklyTarget: number;
  baselineWeekly: number;
  streakDays: number;
  lastActiveDate: string | null; // e.g. "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

export const UserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.string().min(1, 'Display name cannot be empty'),
  email: z.string().email('Invalid email address'),
  country: z.string().default('India'),
  ageGroup: z.string().default('25-34'),
  weeklyTarget: z.number().nonnegative().default(44.0), // ~2300 kg CO2e / 52 weeks = ~44.2 kg/week
  baselineWeekly: z.number().nonnegative().default(44.0),
  streakDays: z.number().int().nonnegative().default(0),
  lastActiveDate: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
