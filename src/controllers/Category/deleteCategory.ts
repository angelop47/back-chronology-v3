// src/controllers/Category/deleteCategory.ts
import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// 🗑️ Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Categoría eliminada con éxito ✅' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: String(err) });
  }
};
