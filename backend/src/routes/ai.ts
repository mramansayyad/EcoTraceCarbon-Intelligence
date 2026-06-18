import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { generateWeeklyInsights, streamChatWithGemini } from '../services/geminiService';
import { getDashboardData } from '../services/dashboardService';
import { db } from '../config/firebase-admin';

const router = Router();

const ChatRequestSchema = z.object({
  body: z.object({
    history: z.array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(
          z.object({
            text: z.string().max(2000, 'Message is too long')
          })
        )
      })
    ).max(20, 'History cannot exceed 20 turns')
  })
});

// GET /ai/insights - Get or generate current AI insights
router.get('/insights', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const uid = req.user!.uid;
    
    // Check if we already have a generated insight stored in the user profile that is fresh (< 24 hours old)
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.lastInsight && userData?.lastInsightGeneratedAt) {
        const generatedAt = new Date(userData.lastInsightGeneratedAt);
        const hoursAge = (Date.now() - generatedAt.getTime()) / (1000 * 3600);
        if (hoursAge < 24) {
          return res.json({ insight: userData.lastInsight });
        }
      }
    }

    // Otherwise, collect context from dashboardService and request new insight from Gemini
    const dashboard = await getDashboardData(uid);
    const totalWeekEmissions = dashboard.stats.week.value;
    const sortedCategories = [...dashboard.charts.categories].sort((a, b) => b.value - a.value);
    const firstCategory = sortedCategories[0];
    const topCategory = firstCategory ? (firstCategory.category as 'transport' | 'food' | 'energy' | 'shopping') : 'transport';
    const topCategoryKg = firstCategory ? firstCategory.value : 0;
    
    // Fetch active goals
    const goalsSnapshot = await db.collection('goals')
      .where('uid', '==', uid)
      .where('status', '==', 'active')
      .get();
    const activeGoals = goalsSnapshot.docs.map(doc => doc.data());

    const context = {
      weekly_kg_co2e: totalWeekEmissions,
      top_category: topCategory,
      top_category_kg: topCategoryKg,
      vs_last_week_pct: dashboard.stats.week.deltaPct,
      vs_india_avg_pct: dashboard.stats.month.vsNationalAvgPct,
      streak_days: dashboard.stats.streak.days,
      recent_activities: dashboard.recentActivities.slice(0, 5),
      active_goals: activeGoals
    };

    const insight = await generateWeeklyInsights(context);

    // Save insight to user profile
    await userRef.update({
      lastInsight: insight,
      lastInsightGeneratedAt: new Date().toISOString()
    });

    return res.json({ insight });
  } catch (err) {
    next(err);
    return;
  }
});

// POST /ai/chat - Streaming SSE assistant
router.post('/chat', authMiddleware, validate(ChatRequestSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const history = req.body.history;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on Cloud Run/Nginx proxies
    res.flushHeaders();

    await streamChatWithGemini(
      history,
      (textChunk) => {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      },
      () => {
        res.write('data: [DONE]\n\n');
        res.end();
      },
      (err) => {
        console.error('Streaming chat failed midway:', err);
        res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`);
        res.end();
      }
    );
  } catch (err) {
    next(err);
  }
});

export default router;
