import mockAxios from 'axios';
import type { Application } from 'express';

jest.mock('axios');

import { registerRootRoutes } from '../../main/routes';

const expectedGetRoutes: string[] = ['/', '/demo'];
const expectedPostRoutes: string[] = ['/select-task-backend'];
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

describe('Root routes registration', () => {
  beforeEach(() => {
    actualGetRoutes = [];
    actualPostRoutes = [];
    handlers = {};

    registerRootRoutes(mockApp, mockAxios);
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
