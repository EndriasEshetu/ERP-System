import { Router } from 'express';
import { purchaseController } from './purchase.controller.js';

export const purchaseRouter = Router();

purchaseRouter.get('/', (req, res) => purchaseController.list(req, res));
purchaseRouter.get('/:id', (req, res) => purchaseController.getById(req, res));
purchaseRouter.post('/', (req, res) => purchaseController.create(req, res));
purchaseRouter.patch('/:id/status', (req, res) => purchaseController.updateStatus(req, res));
purchaseRouter.post('/receive', (req, res) => purchaseController.receiveGoods(req, res));
