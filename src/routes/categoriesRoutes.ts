// src/routes/categoriesRoutes.ts
import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/Category/index';

const router = express.Router();

// Obtener categorias
router.get('/', getCategories);

// Crear nueva categoria
router.post('/', createCategory);

// Eliminar Categoria
router.delete('/:id', deleteCategory);

export default router;
