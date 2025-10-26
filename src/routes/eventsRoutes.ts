import express from 'express';
import { getEvents, createEvent } from '../controllers/eventsController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Obtener eventos
router.get('/', getEvents);

// Crear evento con imagen
router.post('/', upload.array('files'), createEvent);

export default router;
