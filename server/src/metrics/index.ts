import client from 'prom-client';
import { Request, Response } from 'express';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users',
});

export const projectsTotal = new client.Gauge({
  name: 'projects_total',
  help: 'Total number of projects',
  labelNames: ['status'],
});

export const tasksTotal = new client.Gauge({
  name: 'tasks_total',
  help: 'Total number of tasks',
  labelNames: ['status'],
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeUsers);
register.registerMetric(projectsTotal);
register.registerMetric(tasksTotal);

// Metrics endpoint
export const metricsHandler = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export { register };
