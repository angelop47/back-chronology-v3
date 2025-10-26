// // src/controllers/filesController.ts
// import { Request, Response } from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import { supabase } from '../config/supabase';

// const upload = multer({ dest: 'uploads/' });

// export const uploadFile = async (req: Request, res: Response) => {
//   try {
//     const filePath = req.file?.path;
//     const fileName = req.file?.originalname;

//     if (!filePath || !fileName) return res.status(400).json({ error: 'No se envió el archivo' });

//     const fileBuffer = fs.readFileSync(filePath);

//     const { data, error } = await supabase.storage
//       .from('uploads')
//       .upload(`uploads/${fileName}`, fileBuffer, {
//         contentType: req.file?.mimetype || 'application/octet-stream',
//         upsert: true,
//       });

//     fs.unlinkSync(filePath); // borra el temporal

//     if (error) return res.status(500).json({ error: error.message });
//     res.json({ message: 'Archivo subido correctamente', data });
//   } catch (err) {
//     res.status(500).json({ error: String(err) });
//   }
// };

// export { upload };
