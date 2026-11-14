import { Router, Request, Response } from 'express';
import { ApiResponse, HTTP_STATUS } from '@erp/shared';
import { env } from '../../config/env.config.js';
import { checkDatabaseConnection } from '../../database/prisma.service.js';

export const healthRouter = Router();

export interface HealthStatusData {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: 'CONNECTED' | 'DISCONNECTED';
}

healthRouter.get('/', async (_req: Request, res: Response<ApiResponse<HealthStatusData>>) => {
  const isDbConnected = await checkDatabaseConnection();

  const data: HealthStatusData = {
    status: isDbConnected ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '0.1.0',
    database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
  };

  const response: ApiResponse<HealthStatusData> = {
    success: true,
    message: isDbConnected
      ? 'ERP API is healthy and operational'
      : 'ERP API is running with degraded database connectivity',
    data,
  };

  const statusCode = isDbConnected ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
  res.status(statusCode).json(response);
});

