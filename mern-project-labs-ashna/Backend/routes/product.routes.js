import express from 'express';
import {
  addCatalogProduct,
  listCatalogProducts,
  fetchCatalogProductById
} from '../controllers/catalog.controller.js';

const router = express.Router();

router.post('/', addCatalogProduct);
router.get('/', listCatalogProducts);
router.get('/:id', fetchCatalogProductById);

export default router;
