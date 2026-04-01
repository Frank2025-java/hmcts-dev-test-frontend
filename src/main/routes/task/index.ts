import { resolve } from 'path';

import axios from 'axios';
import { Application, Router } from 'express';
import { globSync } from 'glob';

import { TaskRestApi, TaskRestApiClient } from 'modules/task/backend';

// index.ts is called from app.setup.ts to register the routes in this route directory
export function registerTaskRoutes(app: Application, http = axios): void {
  const backendApi = TaskRestApi({ http });

  try {
    const taskRoutes = loadTaskRouteModules();
    taskRoutes.forEach(taskRoute => taskRoute(app, backendApi));
  } catch (error) {
    // display the error in the console to help with debugging, and ensure it's flushed before exiting
    // eslint-disable-next-line no-console
    console.error('Error setting up task routes:', error);
    process.stderr.write('Flushing stderr to ensure logs are visible before exiting...\n');
    throw error;
  }
}

export type TaskRouteModule = (app: Application, backend: TaskRestApiClient) => Router;

// function to allow testing what is loaded
export function loadTaskRouteModules(): TaskRouteModule[] {
  return findTaskRouteFiles()
    .map(filename => require(filename))
    .filter(mod => mod && typeof mod.default === 'function')
    .map(mod => mod.default);
}

// function to allow testing what files are present
export function findTaskRouteFiles(): string[] {
  return globSync(__dirname + '/*.ts')
    .map(filename => resolve(filename))
    .filter(f => !f.endsWith('index.ts'))
    .filter(f => !f.endsWith('error.ts'));
}
