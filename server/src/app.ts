import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { morganStream } from './utils/logger';
import { generalLimiter } from './middlewares/rateLimit';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { metricsHandler, httpRequestDuration, httpRequestTotal } from './metrics';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import projectsRoutes from './modules/projects/projects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import timesheetsRoutes from './modules/timesheets/timesheets.routes';
import billingRoutes from './modules/billing/billing.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import activitiesRoutes from './modules/activities/activities.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  ...env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: morganStream }));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode.toString() },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });
  });
  
  next();
});

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activitiesRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
