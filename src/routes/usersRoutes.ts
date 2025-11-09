// src/routes/usersRoutes.ts
import express from 'express';
import { getUsers } from '../controllers/User/index';

const router = express.Router();

router.get('/', getUsers);

export default router;
