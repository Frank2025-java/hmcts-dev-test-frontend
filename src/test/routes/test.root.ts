import axios from 'axios';

import { config } from '../../main/modules/variables';
import testSubject from '../../main/routes/task/root';
import { routePath } from '../../main/routes/task/root';

const expectedTemplate = 'task/bodyHtml';
const expectedApiUrl = `${config.backendUrl}/task/`;

const testBody = 'Hello, World!';
const testHtml = '<html><body>' + testBody + '</body></html>';
const testResponse = { data: testHtml };

// make mockAxios having a mock implementation
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

// Suppress console.log during tests to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});

/* eslint-disable jest/expect-expect */
describe('Task Root Module', () => {
  let mockApp: any;
  let testSubjectHandler: any;
  let actualRoutePath: string;
  let appGetMock: jest.Mock;
  let getResponseMock: any;

  const req = {} as any;

  beforeEach(() => {
    // Fake Express app with only .get()
    appGetMock = jest.fn();
    mockApp = { get: appGetMock };
    getResponseMock = mockAxios.get;

    // Set up the app with the route using the mocked axios
    testSubject(mockApp, mockAxios);

    // Extract the handler passed to app.get('/xxx', handler)
    testSubjectHandler = appGetMock.mock.calls[0][1];
  });

  it('should use route path', async () => {
    actualRoutePath = appGetMock.mock.calls[0][0];

    expect(actualRoutePath).toBe(routePath);
  });

  it('Should render page on success', async () => {
    getResponseMock.mockResolvedValue(testResponse);
    const expectedRenderData = { bodyHtml: testBody };

    const res = { render: jest.fn() } as any;
    await testSubjectHandler(req, res);

    expect(mockAxios.get).toHaveBeenCalledWith(expectedApiUrl);
    expect(res.render).toHaveBeenCalledWith(expectedTemplate, expectedRenderData);
  });

  it('Should log and render error page on API failure', async () => {
    const testError = 'API request failed';
    const testErrorObj = new Error(testError);
    const expectedRenderData = { error: testError };

    getResponseMock.mockRejectedValue(testErrorObj);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = { render: jest.fn() } as any;
    await testSubjectHandler(req, res);

    expect(mockAxios.get).toHaveBeenCalledWith(expectedApiUrl);
    expect(res.render).toHaveBeenCalledWith(expectedTemplate, expectedRenderData);
    expect(consoleSpy).toHaveBeenCalledWith('Error making request:', testErrorObj);
  });
});
