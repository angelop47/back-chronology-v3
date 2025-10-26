import { Request, Response } from 'express';
import { Event } from '../models/event';
import { supabase } from '../config/supabase';
import { getUUID } from '../plugins/get-id.plugin';
import { uploadToSupabase } from '../services/uploadService';

// Obtener todos los eventos
export const getEvents = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('events') // solo el nombre de la tabla como string
    .select('*')
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data ?? []);
};

// Crear un evento
export const createEvent = async (req: Request, res: Response) => {
  try {
    // ✅ Evita el error si req.body es undefined
    const { title, date, description } = req.body || {};
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }
    let imageUrls: string[] = [];
    if (req.file) {
      const url = await uploadToSupabase(req.file.path, req.file.originalname, req.file.mimetype);
      imageUrls.push(url);
    }

    const newEvent: Event = {
      id: getUUID(),
      title,
      date,
      description,
      createdAt: new Date().toISOString(),
      verified: false,
      imageUrl: imageUrls,
    };

    const { data, error } = await supabase.from('events').insert([newEvent]).select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data ? data[0] : null);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: String(err) });
  }
};
