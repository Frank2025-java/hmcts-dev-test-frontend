import * as path from 'path';
import axios from 'axios';

import { Application } from 'express';
import { globSync } from 'glob';

const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

// export to make the route converage testable
export function setupApp(app: Application, http = axios): void {
  globSync(__dirname + '/routes/**/*.+(ts|js)')
    .map(filename => {
      const full = path.resolve(filename);
      return require(full);
    })
    .filter(route => route && route.default)
    .forEach(route => route.default(app, http));

  setupDev(app, developmentMode);
}
