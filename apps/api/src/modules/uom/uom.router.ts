import { Router } from 'express';
import { uomController } from './uom.controller.js';

export const uomRouter = Router();

uomRouter.get('/', (req, res) => uomController.list(req, res));
uomRouter.get('/:id', (req, res) => uomController.getById(req, res));
uomRouter.post('/', (req, res) => uomController.create(req, res));
uomRouter.put('/:id', (req, res) => uomController.update(req, res));
uomRouter.delete('/:id', (req, res) => uomController.delete(req, res));
