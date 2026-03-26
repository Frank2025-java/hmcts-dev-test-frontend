import axios from 'axios';

import { resolve } from 'path';
import { Application } from 'express';
import { globSync } from 'glob';

import { TaskRestApi } from 'modules/task/backend';

// index.ts is called from app.setup.ts to register the routes in this route directory
export function registerTaskRoutes(app: Application, http = axios): void {
  const backendApi = TaskRestApi({ http });

  try {
    const taskRoutes = loadTaskRouteModules();
    taskRoutes.forEach(taskRoute => taskRoute(app, backendApi));
  } catch (error) {
    // display the error in the console to help with debugging, and ensure it's flushed before exiting
    console.error('Error setting up task routes:', error);
    process.stderr.write('Flushing stderr to ensure logs are visible before exiting...\n');
    throw error;
  }
}

// function to allow testing what is loaded
export function loadTaskRouteModules(): Function[] {
  return globSync(__dirname + '/*.ts')
    .map(filename => resolve(filename))
    .filter(f => !f.endsWith('index.ts'))
    .map(filename => require(filename))
    .filter(mod => mod && typeof mod.default === 'function')
    .map(mod => mod.default);
}
