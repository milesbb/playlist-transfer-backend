import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '@routes/authRoutes';
import healthRoutes from '@routes/healthRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/playlist-transfer-api/health', healthRoutes);

app.use(errorHandler);

export default app;
