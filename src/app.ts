// src/app.ts
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Register all application routes
registerRoutes(app);

export default app;
