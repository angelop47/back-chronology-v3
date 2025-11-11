// src/routes/eventsRoutes.ts
import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/Event/index';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Obtener eventos
router.get('/', getEvents);

// Crear evento con imagen
router.post('/', upload.array('files'), createEvent);

// Eliminar evento
router.delete('/:id', deleteEvent);

export default router;
