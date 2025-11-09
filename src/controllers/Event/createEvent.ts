// src/controllers/Event/createEvent.ts
import { Request, Response } from 'express';
import { Event } from '../../models/event';
import { supabase } from '../../config/supabase';
import { getUUID } from '../../plugins/get-id.plugin';
import { uploadToSupabase } from '../../services/uploadService';

// Crear un evento
export const createEvent = async (req: Request, res: Response) => {
  try {
    // ✅ Evita el error si req.body es undefined
    const { title, date, description, createdBy } = req.body || {};
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }
    if (!createdBy) return res.status(400).json({ message: 'Missing createdBy (Clerk ID)' });
    let imageUrls: string[] = [];

    let { categories } = req.body;

    // Parsear categorías si vienen como string
    if (typeof categories === 'string') {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = [];
      }
    }

    // Procesa y sube las imágenes adjuntas al evento a Supabase
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToSupabase(file.path, file.originalname, file.mimetype);
        imageUrls.push(url);
      }
    }

    // Crear el objeto del evento
    const newEvent: Event = {
      id: getUUID(),
      title,
      date,
      description,
      createdAt: new Date().toISOString(),
      verified: false,
      imageUrl: imageUrls,
      createdBy, // <- Clerk ID (user_xxx)
    };

    // Insertar evento en la base de datos
    const { data: insertedEvents, error: insertError } = await supabase
      .from('events')
      .insert([newEvent])
      .select('id');

    if (insertError) throw insertError;

    const eventId = insertedEvents?.[0]?.id;

    // Si existen categorías, insertar relaciones
    if (categories && Array.isArray(categories) && eventId) {
      const eventCategories = categories.map((catId: string) => ({
        event_id: eventId,
        category_id: catId,
      }));

      const { error: relationError } = await supabase
        .from('event_categories')
        .insert(eventCategories);

      if (relationError) throw relationError;
    }

    // Respuesta final
    res.status(201).json({ message: 'Evento creado con éxito', id: eventId });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: String(err) });
  }
};
