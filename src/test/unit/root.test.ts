let testSubjectGet: Function;
let testSubjectPost: Function;

const expectedGetPage = 'task/bodyHtml';
const expectedPageError = 'task/bodyHtml';

import { createMockApp, createMockApi, TaskRestApiResponse } from './routes.test.base';

// tesSubject
import testSubject from '../../../src/main/routes/task/root';

describe('task/ route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<any>>, []>;
  let spyResponse: { redirect: jest.Mock; render: jest.Mock };

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.Root.call as jest.Mock;

    spyResponse = { redirect: jest.fn(), render: jest.fn() };
  });

  it('Render html response on successful backend call', async () => {
    // given
    const givenReq = {};
    const givenHtmlBody: string = 'Welcome';
    const givenResponseOk: TaskRestApiResponse<any> = {
      data: '<html><head></head><body>' + givenHtmlBody + '</body></html>',
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);
    const expectedRenderData = { bodyHtml: givenHtmlBody };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyResponse.render).toHaveBeenCalledWith(expectedGetPage, expectedRenderData);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
  });

  it('Show error when fail on backend call', async () => {
    // given
    const givenReq = {};
    const givenMsg = 'test errror message';

    const givenResponse: TaskRestApiResponse<String> = {
      data: givenMsg,
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponse);
    const expectedRenderData = { bodyHtml: 'test errror message' };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expect(spyResponse.render).toHaveBeenCalledWith(expectedPageError, expectedRenderData);
  });

  it('Show error on fail parsing html', async () => {
    // given
    const givenReq = {};
    const givenForceCheerioParseErrorInput = {
      id: 666,
      title: 'Error',
      status: 'Initial',
      due: '2026-02-29T25:00:00Z',
    };

    const givenResponseNonString: TaskRestApiResponse<any> = {
      data: givenForceCheerioParseErrorInput,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseNonString);

    const spyResponse = { redirect: jest.fn(), render: jest.fn() };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expect(spyResponse.render).toHaveBeenCalledWith(expectedPageError, expect.anything());
  });

  it('No render on Post', async () => {
    expect(testSubjectPost).toBeUndefined();
  });
});
