import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Obtiene todos los eventos ordenados por fecha, incluyendo sus categorías relacionadas
export const getEvents = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      event_categories (
      category_id:categories (*)
    )`,
    )
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const formatted = data.map((event) => ({
    ...event,
    categories: event.event_categories.map((ec: any) => ec.category),
  }));

  res.json(formatted);
};
