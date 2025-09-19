import express from 'express';
import routers from '@controllers/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const allowedOrigins = [
  'https://localhost:5173',
  'http://localhost:5173',
  'https://github.com/milesbb/playlist-transfer-frontend',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.options(/.*/, (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    );
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    return res.sendStatus(204);
  } else {
    return res.sendStatus(403);
  }
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});
app.use(cookieParser());

app.use(express.json());

routers.forEach((router) => app.use(router.path, ...router.handlers));

app.use(errorHandler);

export default app;
