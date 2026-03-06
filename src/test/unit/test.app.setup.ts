import type { Application } from 'express';
import axios from 'axios';

import { setupApp } from '../../main/app.setup';

const { setupDev } = require('../../main/development');

jest.mock('../../main/development', () => ({
  setupDev: jest.fn(),
}));

jest.mock('axios');

const expectedGetRoutes = ['/','/demo'];
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
    setupApp(testSubject, axios);

    expect(actualGetRoutes.sort()).toEqual(expectedGetRoutes);

    expect(setupDev).toHaveBeenCalledWith(testSubject, expect.any(Boolean));
  });
});
