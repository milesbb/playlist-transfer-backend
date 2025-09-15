import health, { healthRoutePath } from './health';
import users, { usersRoutePath } from './users';

const routes = [
  {
    path: healthRoutePath,
    handlers: [health],
  },
  {
    path: usersRoutePath,
    handlers: [users],
  },
];

const basePath = 'playlist-transfer-api';

export default routes.concat(
  routes.map((route) => {
    return { path: `/${basePath}${route.path}`, handlers: route.handlers };
  }),
);
