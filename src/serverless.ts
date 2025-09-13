import serverless from 'serverless-http';
import app from './app.js';
import config from './config/config.js';

app.listen(config.port, () => {
  console.log(`Serverless API running on port ${config.port}`);
});

export const handler = serverless(app);
