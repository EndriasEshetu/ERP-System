import { Router } from 'express';
import { warehouseController } from './warehouse.controller.js';

export const warehouseRouter = Router();

warehouseRouter.get('/', (req, res) => warehouseController.list(req, res));
warehouseRouter.get('/:id', (req, res) => warehouseController.getById(req, res));
warehouseRouter.post('/', (req, res) => warehouseController.create(req, res));
warehouseRouter.put('/:id', (req, res) => warehouseController.update(req, res));
warehouseRouter.delete('/:id', (req, res) => warehouseController.delete(req, res));
