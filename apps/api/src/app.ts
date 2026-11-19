import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ApiErrorResponse, HTTP_STATUS } from '@erp/shared';
import { env } from './config/env.config.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { tenantContext } from './middleware/tenant.middleware.js';

// Routers
import { healthRouter } from './modules/health/health.router.js';
import { uomRouter } from './modules/uom/uom.router.js';
import { categoryRouter } from './modules/categories/category.router.js';
import { productRouter } from './modules/products/product.router.js';
import { warehouseRouter } from './modules/warehouses/warehouse.router.js';
import { inventoryRouter } from './modules/inventory/inventory.router.js';
import { supplierRouter } from './modules/suppliers/supplier.router.js';
import { purchaseRouter } from './modules/purchases/purchase.router.js';
import { notificationRouter } from './modules/notifications/notification.router.js';
import { dashboardRouter } from './modules/dashboard/dashboard.router.js';

export function createApp(): Express {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parsers with size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request logging
  app.use(requestLogger);

  // Multi-tenancy Scoping Middleware (applies to all downstream routes)
  app.use(tenantContext);

  // API Routes (Developer B Modules)
  app.use(`${env.API_PREFIX}/health`, healthRouter);
  app.use(`${env.API_PREFIX}/uom`, uomRouter);
  app.use(`${env.API_PREFIX}/categories`, categoryRouter);
  app.use(`${env.API_PREFIX}/products`, productRouter);
  app.use(`${env.API_PREFIX}/warehouses`, warehouseRouter);
  app.use(`${env.API_PREFIX}/inventory`, inventoryRouter);
  app.use(`${env.API_PREFIX}/suppliers`, supplierRouter);
  app.use(`${env.API_PREFIX}/purchases`, purchaseRouter);
  app.use(`${env.API_PREFIX}/notifications`, notificationRouter);
  app.use(`${env.API_PREFIX}/dashboard`, dashboardRouter);

  // 404 Not Found Handler
  app.use((req: Request, res: Response<ApiErrorResponse>) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      errors: [
        {
          message: 'Resource not found',
          code: 'NOT_FOUND',
        },
      ],
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
