// src/controllers/Event/deleteEvent.ts
import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// 🗑️ Eliminar un evento
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Eliminar directamente el evento
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Evento eliminado con éxito ✅' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: String(err) });
  }
};
