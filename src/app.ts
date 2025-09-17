import express from 'express';
import routers from '@controllers/index';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

routers.forEach((router) => app.use(router.path, ...router.handlers));

app.use(errorHandler);

export default app;
