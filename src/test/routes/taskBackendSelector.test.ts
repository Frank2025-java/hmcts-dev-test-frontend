import { Application } from 'express';
import type { Request, Response } from 'express';

jest.mock('../../main/modules/task/backendUrl', () => ({
  getBackend: jest.fn() as jest.MockedFunction<() => string>,
  setBackend: jest.fn() as jest.MockedFunction<(url: string) => void>,
}));
// eslint-disable-next-line import/order
import { setBackend } from '../../main/modules/task/backendUrl';
const mockedSetBackend = setBackend as jest.MockedFunction<(url: string) => void>;

// testSubject with backendUrl mocked, so it will use the mocked setBackend
// eslint-disable-next-line import/order
import testSubject, { routePath } from '../../main/routes/taskBackendSelector';

describe('Route Task Backend Selector Module', () => {
  let actualRoutePath: string;
  let testSubjectHandler: (req: Request, res: Response) => unknown;

  const appGetMock: jest.Mock = jest.fn();
  const appPostMock: jest.Mock = jest.fn();

  // Fake Express app
  const mockApp = { get: appGetMock, post: appPostMock } as unknown as Application;

  const mockResponse = {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(), // for chaining .status().json()
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Set up the app with the route
    testSubject(mockApp);

    // Extract what passed to app.post('/xxx', handler)
    actualRoutePath = appPostMock.mock.calls[0][0];
    testSubjectHandler = appPostMock.mock.calls[0][1];
  });

  test('Should only have a post route', async () => {
    expect(appGetMock).not.toHaveBeenCalled();
    expect(appPostMock).toHaveBeenCalledTimes(1);
    expect(actualRoutePath).toBe(routePath);
  });

  test('Should redirect to task list', async () => {
    // given
    const givenUrl = 'http://example.com';
    const givenRequest = { body: { backend: givenUrl } } as unknown as Request;

    // when
    await testSubjectHandler(givenRequest, mockResponse);

    // then
    expect(mockedSetBackend).toHaveBeenCalledWith(givenUrl);
    expect(mockResponse.render).not.toHaveBeenCalled();
    expect(mockResponse.redirect).toHaveBeenCalledWith('/task/list');
  });

  test('Should throw and display an error', async () => {
    // given
    const givenUrl = 'http://example.com';
    const givenRequest = { body: { backend: givenUrl } } as unknown as Request;
    const givenError = 'Test Fail';
    mockedSetBackend.mockImplementation(() => {
      throw new Error(givenError);
    });

    // when
    await testSubjectHandler(givenRequest, mockResponse);

    // then
    expect(mockedSetBackend).toHaveBeenCalledWith(givenUrl);
    expect(mockResponse.render).not.toHaveBeenCalled();
    expect(mockResponse.redirect).not.toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({ error: givenError });
  });
});
