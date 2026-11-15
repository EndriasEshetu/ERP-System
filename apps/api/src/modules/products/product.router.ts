import { Router } from 'express';
import { productController } from './product.controller.js';

export const productRouter = Router();

productRouter.get('/', (req, res) => productController.list(req, res));
productRouter.get('/:id', (req, res) => productController.getById(req, res));
productRouter.post('/', (req, res) => productController.create(req, res));
productRouter.put('/:id', (req, res) => productController.update(req, res));
productRouter.delete('/:id', (req, res) => productController.delete(req, res));
