import { Request, Response } from 'express';
import { Event } from '../../models/event';
import { supabase } from '../../config/supabase';
import { getUUID } from '../../plugins/get-id.plugin';
import { uploadToSupabase } from '../../services/uploadService';

// Crear un evento
export const createEvent = async (req: Request, res: Response) => {
  try {
    // ✅ Evita el error si req.body es undefined
    const { title, date, description, createdBy, category } = req.body || {};

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    if (!createdBy) {
      return res.status(400).json({ message: 'Missing createdBy (Clerk ID)' });
    }

    let imageUrls: string[] = [];

    // Subir imágenes (si existen)
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
      category: category || null,
      createdBy,
    };

    // Insertar en la base de datos
    const { data, error } = await supabase.from('events').insert([newEvent]).select('id');

    if (error) throw error;

    res.status(201).json({ message: 'Evento creado con éxito', id: data?.[0]?.id });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: String(err) });
  }
};
