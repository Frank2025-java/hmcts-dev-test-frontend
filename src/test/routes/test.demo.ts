import { config } from '../../main/modules/variables';
import axios from 'axios';

import testSubject from '../../main/routes/demo';
const expectedRoute = 'demo';
const expectedApiUrl = `${config.demoUrl}/get-example-case`;
const testData = { caseId: '12345' };
const testResponse = { data: testData };
const expectedData = { example: testData };
const testError = new Error('Simulate network error');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

/* eslint-disable jest/expect-expect */
describe('Demo page', () => {
  let app: any;
  let getMock: jest.Mock;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Fake Express app with only .get()
    getMock = jest.fn();
    app = { get: getMock };
  });

  it('Should Render page with API response on success', async () => {
    mockedAxios.get.mockResolvedValue(testResponse);

    testSubject(app, mockedAxios);

    // Extract the handler passed to app.get('/demo', handler)
    const handler = getMock.mock.calls[0][1];

    const req = {} as any;
    const res = { render: jest.fn() } as any;

    await handler(req, res);

    expect(mockedAxios.get).toHaveBeenCalledWith(expectedApiUrl);
    expect(res.render).toHaveBeenCalledWith(expectedRoute, expectedData);
  });

  it('Should Render page on API failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockedAxios.get.mockRejectedValue(testError);

    testSubject(app, mockedAxios);

    // Extract the handler passed to app.get('/demo', handler)
    const handler = getMock.mock.calls[0][1];

    const req = {} as any;
    const res = { render: jest.fn() } as any;

    await handler(req, res);

    expect(mockedAxios.get).toHaveBeenCalledWith(expectedApiUrl);
    // error is logged but a blank page is rendered, so we check for empty data
    expect(res.render).toHaveBeenCalledWith(expectedRoute, {});
    expect(consoleSpy).toHaveBeenCalledWith('Error making request:', expect.any(Error));
  });
});
