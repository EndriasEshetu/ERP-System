import { Router } from 'express';
import { supplierController } from './supplier.controller.js';

export const supplierRouter = Router();

supplierRouter.get('/', (req, res) => supplierController.list(req, res));
supplierRouter.get('/:id', (req, res) => supplierController.getById(req, res));
supplierRouter.post('/', (req, res) => supplierController.create(req, res));
supplierRouter.put('/:id', (req, res) => supplierController.update(req, res));
supplierRouter.delete('/:id', (req, res) => supplierController.delete(req, res));
