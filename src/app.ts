import express from 'express';
import routers from '@controllers/index';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://github.com/milesbb/playlist-transfer-frontend',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

routers.forEach((router) => app.use(router.path, ...router.handlers));

app.use(errorHandler);

export default app;
