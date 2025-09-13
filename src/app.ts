import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/playlist-transfer-api/health', healthRoutes);

app.use(errorHandler);

export default app;
