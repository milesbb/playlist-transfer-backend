import express from 'express';
import routers from '@controllers/index';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://github.com/milesbb/playlist-transfer-frontend',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

routers.forEach((router) => app.use(router.path, ...router.handlers));

app.use(errorHandler);

export default app;
