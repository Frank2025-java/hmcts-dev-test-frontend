import { config } from '../../main/modules/variables';
import axios from 'axios';

import testSubject from '../../main/routes/demo';
import { routePath } from '../../main/routes/demo';

const expectedTemplate = 'demo/home';
const expectedApiUrl = `${config.demoUrl}/get-example-case`;
const testData = { caseId: '12345' };
const testResponse = { data: testData };
const expectedData = { example: testData };
const testError = new Error('Simulate network error');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Suppress console.log during tests to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});

/* eslint-disable jest/expect-expect */
describe('Route Demo Module', () => {
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
    getResponseMock = mockedAxios.get;

    // Set up the app with the route using the mocked axios
    testSubject(mockApp, mockedAxios);

    // Extract the handler passed to app.get('/xxx', handler)
    testSubjectHandler = appGetMock.mock.calls[0][1];
  });

  it('should use route path', async () => {
    actualRoutePath = appGetMock.mock.calls[0][0];

    expect(actualRoutePath).toBe(routePath);
  });

  it('Should render page with API response on success', async () => {
    getResponseMock.mockResolvedValue(testResponse);

    const res = { render: jest.fn() } as any;

    await testSubjectHandler(req, res);

    expect(getResponseMock).toHaveBeenCalledWith(expectedApiUrl);
    expect(res.render).toHaveBeenCalledWith(expectedTemplate, expectedData);
  });

  it('Should log and render blank page on API failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    getResponseMock.mockRejectedValue(testError);

    const res = { render: jest.fn() } as any;
    await testSubjectHandler(req, res);

    expect(getResponseMock).toHaveBeenCalledWith(expectedApiUrl);
    expect(res.render).toHaveBeenCalledWith(expectedTemplate, {});
    expect(consoleSpy).toHaveBeenCalledWith('Error making request:', expect.any(Error));
  });
});
