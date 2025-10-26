import { Request, Response } from 'express';
import { Category } from '../models/category';
import { supabase } from '../config/supabase';
import { getUUID } from '../plugins/get-id.plugin';

// Obtner todas las categorías
export const getCategories = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });

  res.json(data ?? []);
};

// Crear una nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body || {};
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  const newCategory: Category = {
    id: getUUID(),
    name,
    description,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('categories').insert([newCategory]).select('*'); // <--- esto asegura que se devuelvan los registros insertados

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data ? data[0] : null);
};
