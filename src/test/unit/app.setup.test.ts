import type { Application } from 'express';
import mockAxios from 'axios';

// mockAxios to avoid making real HTTP requests during testing
jest.mock('axios');

jest.mock('../../main/routes', () => ({
  registerRootRoutes: jest.fn(),
}));
jest.mock('../../main/routes/task', () => ({
  registerTaskRoutes: jest.fn(),
}));
import { registerRootRoutes } from '../../main/routes';
import { registerTaskRoutes } from '../../main/routes/task';
const mockRegisterTaskRoutes = registerTaskRoutes as jest.Mock;
const mockRegisterRootRoutes = registerRootRoutes as jest.Mock;

// mock the development setup to avoid side effects during testing
jest.mock('../../main/development', () => ({
  setupDev: jest.fn(),
}));

import { setupApp } from '../../main/app.setup';

describe('App route setup', () => {
  const mockApp = {} as unknown as Application;

  it('Should register root routes', () => {
    setupApp(mockApp, mockAxios);

    expect(mockRegisterRootRoutes).toHaveBeenCalledWith(mockApp, mockAxios);
  });

  it('should register task routes', () => {
    setupApp(mockApp, mockAxios);

    expect(mockRegisterTaskRoutes).toHaveBeenCalledWith(mockApp, mockAxios);
  });

  it('Should propagate errors on register root routes', () => {
    // given
    mockRegisterRootRoutes.mockImplementation(() => {
      throw new Error('Route registration failure');
    });

    // when, then
    expect(() => setupApp(mockApp, mockAxios)).toThrow('Route registration failure');
  });

  it('Should propagate errors on register task routes', () => {
    // given
    mockRegisterTaskRoutes.mockImplementation(() => {
      throw new Error('Route registration failure');
    });

    // when, then
    expect(() => setupApp(mockApp, mockAxios)).toThrow('Route registration failure');
  });
});
