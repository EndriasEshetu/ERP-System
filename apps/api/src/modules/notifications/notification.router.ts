import { Router } from 'express';
import { notificationController } from './notification.controller.js';

export const notificationRouter = Router();

notificationRouter.get('/', (req, res) => notificationController.list(req, res));
notificationRouter.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));
notificationRouter.post('/read-all', (req, res) => notificationController.markAllAsRead(req, res));
notificationRouter.post('/trigger-check', (req, res) => notificationController.triggerLowStockCheck(req, res));
