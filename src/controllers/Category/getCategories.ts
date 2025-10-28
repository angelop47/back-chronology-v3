import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Obtner todas las categorías
export const getCategories = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });

  res.json(data ?? []);
};
