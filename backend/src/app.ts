const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { loggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

// Routers
import healthRouter from './routes/health';
import activitiesRouter from './routes/activities';
import dashboardRouter from './routes/dashboard';
import aiRouter from './routes/ai';
import goalsRouter from './routes/goals';
import communityRouter from './routes/community';
import exportRouter from './routes/export';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Adjust origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limit request payload to prevent DOS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global Request Logger
app.use(loggerMiddleware);

// Apply Global Rate Limiting
app.use(rateLimiter);

// Bind Routers
app.use('/health', healthRouter);
app.use('/activities', activitiesRouter);
app.use('/dashboard', dashboardRouter);
app.use('/ai', aiRouter);
app.use('/goals', goalsRouter);
app.use('/community', communityRouter);
app.use('/export', exportRouter);

// Global Error Handler
app.use(errorHandler);

export { app };
