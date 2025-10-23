import { Request, Response } from 'express';
import { Event } from '../models/event';
import { supabase } from '../config/supabase';
import { getUUID } from '../plugins/get-id.plugin';

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
  const { title, date, description, createdAt, verified } = req.body;
  if (!title || !date) {
    return res.status(400).json({ message: 'Title and date are required' });
  }

  const newEvent: Event = {
    id: getUUID(),
    title,
    date,
    description,
    createdAt: new Date().toISOString(),
    verified: false,
  };

  const { data, error } = await supabase.from('events').insert([newEvent]).select('*'); // <--- esto asegura que se devuelvan los registros insertados

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data ? data[0] : null);
};
