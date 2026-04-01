import { basename, resolve } from 'path';

import mockAxios from 'axios';
import type { Application } from 'express';
import { globSync } from 'glob';

jest.mock('axios');

jest.mock('../../../src/main/modules/task/backend', () => ({
  TaskRestApi: jest.fn(),
}));

import { TaskRouteModule, registerTaskRoutes } from '../../main/routes/task';

const expectedGetRoutes: string[] = ['/task', '/task/create', '/task/list', '/task/view/:id'];
const expectedPostRoutes: string[] = [
  '/task/create',
  '/task/delete/:id',
  '/task/update',
  '/task/updateStatus/:id/status',
];
let actualGetRoutes: string[] = [];
let actualPostRoutes: string[] = [];
let handlers: Record<string, (req: Request, res: Response) => unknown> = {};

const mockApp = {
  get: jest.fn((path, handler) => {
    actualGetRoutes.push(path);
    handlers[path] = handler;
    return mockApp;
  }),
  post: jest.fn((path, handler) => {
    actualPostRoutes.push(path);
    handlers[path] = handler;
    return mockApp;
  }),
  use: jest.fn(),
} as unknown as Application;

describe('Task routes registration', () => {
  beforeEach(() => {
    actualGetRoutes = [];
    actualPostRoutes = [];
    handlers = {};

    registerTaskRoutes(mockApp, mockAxios);
  });

  it('Should cover all Get routes', () => {
    expect(actualGetRoutes.sort()).toEqual(expectedGetRoutes);
  });

  it('Should cover all Post routes', () => {
    expect(actualPostRoutes.sort()).toEqual(expectedPostRoutes);
  });

  it('Should have only handlers with 2 argumens', () => {
    Object.values(handlers).forEach(handler => {
      expect(handler).toHaveLength(2);
    });
  });
});

// jest works on javascript which looses the type signature, but we can test on length
describe('Task route signatures', () => {
  const freshModule = require('../../main/routes/task');
  const routes: TaskRouteModule[] = freshModule.loadTaskRouteModules();

  test.each(routes)('Route %p should have 2 arguments', routeFn => {
    expect(typeof routeFn).toBe('function');
    expect(routeFn).toHaveLength(2);
  });
});

describe('Task route unit tests', () => {
  const freshModule = require('../../main/routes/task');
  const routeFiles: string[] = freshModule.findTaskRouteFiles();
  const unitDir = resolve(__dirname, '..', 'unit');
  const actualUnitTests = globSync('*.test.ts', {
    cwd: unitDir,
    absolute: true,
  }).map(f => basename(f, '.test.ts'));

  test.each(routeFiles)('Route file %p should have unit test', filePath => {
    const expectedUnitTestFileName = basename(filePath, '.ts');
    expect(actualUnitTests).toContain(expectedUnitTestFileName);
  });
});
