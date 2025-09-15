import express from 'express';
// import cookieParser from 'cookie-parser';
import routers from '@controllers/index';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// app.use(cookieParser());

routers.forEach((router) => app.use(router.path, ...router.handlers));

app.use(errorHandler);

export default app;
