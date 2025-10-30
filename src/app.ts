// src/app.ts
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';
import { errorHandler, requestLogger } from './middlewares';

dotenv.config();

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Register all application routes
registerRoutes(app);

app.use(errorHandler);

export default app;
