import serverless from 'serverless-http';
import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export const handler = serverless(app);
