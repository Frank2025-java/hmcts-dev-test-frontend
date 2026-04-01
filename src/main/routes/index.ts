import { resolve } from 'path';

import axios from 'axios';
import { Application } from 'express';
import { globSync } from 'glob';

// index.ts is called from app.setup.ts to register the routes in this route directory
export function registerRootRoutes(app: Application, http = axios): void {
  // demo and home
  globSync(__dirname + '/*.ts')
    .filter(filename => !filename.endsWith('index.ts')) // avoid loading itself
    .map(filename => {
      const full = resolve(filename);
      return require(full);
    })
    .filter(route => route && route.default)
    .forEach(route => route.default(app, http));
}
