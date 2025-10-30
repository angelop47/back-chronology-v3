// src/controllers/Category/createCategory.ts
import { Request, Response } from 'express';
import { Category } from '../../models/category';
import { supabase } from '../../config/supabase';
import { getUUID } from '../../plugins/get-id.plugin';

// Crea una nueva categoría y la almacena en la base de datos
export const createCategory = async (req: Request, res: Response) => {
  // Valida que los campos requeridos estén presentes
  const { name, description } = req.body || {};
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  const newCategory: Category = {
    id: getUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('categories').insert([newCategory]).select('*'); // <--- esto asegura que se devuelvan los registros insertados

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data ? data[0] : null);
};
