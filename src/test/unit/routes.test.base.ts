import { Application, Request, Response } from 'express';

import type { TaskRestApiResponse } from '../../../src/main/modules/task/backend';
import { TaskRestApiClient } from '../../../src/main/modules/task/backend';
import { fromBackendDto, fromBackendDtoArray, toDto } from '../../../src/main/modules/task/mapper';
import type { TaskDto } from '../../../src/main/types/task.dto';

// Re-export
export { fromBackendDto, fromBackendDtoArray, toDto, Request, Response, TaskDto, TaskRestApiResponse };

// --- Mock the mapper globally for all route tests ---
jest.mock('../../../src/main/modules/task/mapper', () => ({
  toDto: jest.fn(),
  toDtoArray: jest.fn(),
  fromBackendDto: jest.fn(),
  fromBackendDtoArray: jest.fn(),
}));

export type RouteHandler = (req: Request, res: Response) => unknown;

// Factory: create a fresh mock Express app
export function createMockApp(capture: {
  getHandler?: (fn: RouteHandler) => void;
  postHandler?: (fn: RouteHandler) => void;
}): Application {
  const app = {
    get: jest.fn((path: string, handler: RouteHandler) => {
      capture.getHandler?.(handler);
      return app;
    }),
    post: jest.fn((path: string, handler: RouteHandler) => {
      capture.postHandler?.(handler);
      return app;
    }),
    use: jest.fn(),
  } as unknown as Application;

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
  spyRender: jest.Mock,
  expectedPage: string,
  expectedWarningSubstring: string
): void {
  expect(spyRender).toHaveBeenCalledWith(
    expectedPage,
    expect.objectContaining({
      warning: expect.anything(),
    })
  );

  const renderArgs = spyRender.mock.calls[0][1];
  const warning = renderArgs.warning;

  const warningText = warning instanceof Error ? warning.message : String(warning);

  expect(warningText).toContain(expectedWarningSubstring);
}
