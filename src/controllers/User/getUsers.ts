// src/controllers/User/getUsers.ts
import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

// Obtiene todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('clerk_users').select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};
