import serverless from 'serverless-http';
import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`Serverless API running on port ${config.port}`);
});

exports.handler = serverless(app);
