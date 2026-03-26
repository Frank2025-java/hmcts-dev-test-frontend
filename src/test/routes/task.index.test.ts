import type { Application } from 'express';
import mockAxios from 'axios';
jest.mock('axios');

jest.mock('../../../src/main/modules/task/backend', () => ({
  TaskRestApi: jest.fn(),
}));

import { registerTaskRoutes } from '../../main/routes/task';

const expectedGetRoutes: string[]  = ['/task', '/task/create', '/task/list', '/task/view/:id'];
const expectedPostRoutes: string[]  = ['/task/create', '/task/delete/:id', '/task/update', '/task/updateStatus/:id/status'];
let actualGetRoutes: string[] = [];
let actualPostRoutes: string[] = [];
let handlers: Record<string, Function> = {};

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
        expect(handler.length).toBe(2);
      });
    });
  });
    

  // jest works on javascript which looses the type signature, but we can test on length
  describe('Task route signatures', () => {
  
    const freshModule = require('../../main/routes/task');
    const routes = freshModule.loadTaskRouteModules() as unknown as Function[];

  test.each(routes)
  ('Route %p should have 2 arguments', routeFn => {
    expect(typeof routeFn).toBe('function');
    expect(routeFn.length).toBe(2);
  });
});

