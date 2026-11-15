import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';

export const inventoryRouter = Router();

inventoryRouter.get('/levels', (req, res) => inventoryController.getStockLevels(req, res));
inventoryRouter.get('/movements', (req, res) => inventoryController.getStockMovements(req, res));
inventoryRouter.post('/movements', (req, res) => inventoryController.recordMovement(req, res));
inventoryRouter.post('/adjust', (req, res) => inventoryController.adjustStock(req, res));
inventoryRouter.post('/check-availability', (req, res) => inventoryController.checkAvailability(req, res));
