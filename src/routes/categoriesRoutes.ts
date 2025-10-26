import express from 'express';
import { getCategories, createCategory } from '../controllers/categoriesController';

const router = express.Router();

// Obtener categorias
router.get('/', getCategories);

// Crear nueva categoria
router.post('/', createCategory);

export default router;
