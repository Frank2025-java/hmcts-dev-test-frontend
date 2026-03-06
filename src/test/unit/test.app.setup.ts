import type { Application } from 'express';
import mockAxios from 'axios';

import { setupApp } from '../../main/app.setup';

const { setupDev } = require('../../main/development');

jest.mock('../../main/development', () => ({
  setupDev: jest.fn(),
}));

// mockAxios is used in the task route, so we need to mock it here to avoid making real HTTP requests during testing
jest.mock('axios');

const expectedGetRoutes = ['/', '/demo', '/task'];
let actualGetRoutes: string[] = [];

const testSubject = {
  get: jest.fn((path, handler) => {
    actualGetRoutes.push(path);
  }),
  post: jest.fn(),
  use: jest.fn(),
} as unknown as Application;

describe('App route setup', () => {
  it('should cover all routes', () => {
    setupApp(testSubject, mockAxios);

    expect(actualGetRoutes.sort()).toEqual(expectedGetRoutes);

    expect(setupDev).toHaveBeenCalledWith(testSubject, expect.any(Boolean));
  });
});
