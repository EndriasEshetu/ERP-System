import { Router } from 'express';
import { categoryController } from './category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', (req, res) => categoryController.list(req, res));
categoryRouter.get('/:id', (req, res) => categoryController.getById(req, res));
categoryRouter.post('/', (req, res) => categoryController.create(req, res));
categoryRouter.put('/:id', (req, res) => categoryController.update(req, res));
categoryRouter.delete('/:id', (req, res) => categoryController.delete(req, res));
