import axios from 'axios';
import { Application } from 'express';

import { attachIdempotencyKey } from './modules/task/idempotency';
import { registerRootRoutes } from './routes'; // index.ts
import { registerTaskRoutes } from './routes/task'; // index.ts

const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

// export to make the route converage testable
export function setupApp(app: Application, http = axios): void {
  // demo and home
  registerRootRoutes(app, http);

  // idempotency
  app.use(attachIdempotencyKey);

  // tasks
  registerTaskRoutes(app, http);

  // let webpack use the routes
  setupDev(app, developmentMode);
}
