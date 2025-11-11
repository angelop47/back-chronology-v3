import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Obtiene todos los eventos ordenados por fecha, incluyendo su categoría (por UUID) y el creador
export const getEvents = async (req: Request, res: Response) => {
  try {
    // Obtener todos los eventos
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    if (!events || events.length === 0) return res.json([]);

    // ✅ Obtener los UUIDs únicos de categoría
    const categoryIds = [...new Set(events.map((e) => e.category).filter(Boolean))];

    // ✅ Obtener los UUIDs únicos de usuarios (creadores)
    const clerkIds = [...new Set(events.map((e) => e.createdBy).filter(Boolean))];

    // ✅ Buscar categorías
    let categoriesMap = new Map();
    if (categoryIds.length > 0) {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .in('id', categoryIds);

      if (catError) throw catError;
      categoriesMap = new Map(categories.map((c) => [c.id, c]));
    }

    // ✅ Buscar usuarios
    let userMap = new Map();
    if (clerkIds.length > 0) {
      const { data: users, error: userError } = await supabase
        .from('clerk_users')
        .select('*')
        .in('clerk_id', clerkIds);

      if (userError) throw userError;
      userMap = new Map(users.map((u) => [u.clerk_id, u]));
    }

    // ✅ Formatear respuesta final
    const formatted = events.map((event) => ({
      ...event,
      category: categoriesMap.get(event.category) || null, // objeto completo de categoría
      createdBy: userMap.get(event.createdBy) || null, // datos del usuario creador
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      error: err.message || JSON.stringify(err, null, 2),
    });
  }
};
