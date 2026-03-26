import { Application } from 'express';
import { TaskRestApiClient } from '../../../src/main/modules/task/backend';

// --- Mock the mapper globally for all route tests ---
import { toDto, toDtoArray } from '../../../src/main/modules/task/mapper';
jest.mock('../../../src/main/modules/task/mapper', () => ({
  toDto: jest.fn(),
  toDtoArray: jest.fn(),
}));

import type { TaskDto } from '../../../src/main/types/task.dto';

import type { TaskRestApiResponse } from '../../../src/main/modules/task/backend';

// Re-export
export { toDto, toDtoArray, TaskDto, TaskRestApiResponse };

// Factory: create a fresh mock Express app
export function createMockApp(capture: { getHandler?: (fn: Function) => void; postHandler?: (fn: Function) => void }) {
  const app: any = {
    get: jest.fn((path: any, ...handlers: any[]) => {
      capture.getHandler?.(handlers[0]);
      return app;
    }),
    post: jest.fn((path: any, ...handlers: any[]) => {
      capture.postHandler?.(handlers[0]);
      return app;
    }),
  };

  return app as unknown as Application;
}

// Factory: create a fresh mock TaskRestApiClient
export function createMockApi(): TaskRestApiClient {
  return {
    Create: { call: jest.fn() },
    Update: { call: jest.fn() },
    Delete: { call: jest.fn() },
    Root: { call: jest.fn() },
    List: { call: jest.fn() },
    UpdateStatus: { call: jest.fn() },
    View: { call: jest.fn() },
  };
}

// helper for the warning message on a page
export function expectRenderWithWarning(
  spyResponse: { render: jest.Mock },
  expectedPage: string,
  expectedWarningSubstring: string
) {
  expect(spyResponse.render).toHaveBeenCalledWith(
    expectedPage,
    expect.objectContaining({
      warning: expect.anything(),
    })
  );

  const renderArgs = spyResponse.render.mock.calls[0][1];
  const warning = renderArgs.warning;

  const warningText = warning instanceof Error ? warning.message : String(warning);

  expect(warningText).toContain(expectedWarningSubstring);
}
