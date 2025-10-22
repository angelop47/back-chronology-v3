import { Request, Response } from 'express';
import { Event } from '../models/event';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los eventos
export const getEvents = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('events') // solo el nombre de la tabla como string
    .select('*')
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data ?? []); // TypeScript sabe que data puede ser Event[]
};

// Crear un evento
export const createEvent = async (req: Request, res: Response) => {
  const { title, date } = req.body;
  if (!title || !date) {
    return res.status(400).json({ message: 'Title and date are required' });
  }

  const newEvent: Event = {
    id: uuidv4(),
    title,
    date,
  };

  const { data, error } = await supabase.from('events').insert([newEvent]).select('*'); // <--- esto asegura que se devuelvan los registros insertados

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data ? data[0] : null);
};
