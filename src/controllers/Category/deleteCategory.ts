// src/controllers/Category/deleteCategory.ts
import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Eliminar una categoria
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error: relError } = await supabase
      .from('event_categories')
      .delete()
      .eq('category_id', id);

    if (relError) throw relError;

    const { error: categoryError } = await supabase.from('categories').delete().eq('id', id);

    if (categoryError) throw categoryError;

    res.json({ message: 'Cagoria eliminada con exito' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: String(err) });
  }
};
