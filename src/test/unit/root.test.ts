let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedGetPage = 'task/bodyHtml';
const expectedPageError = 'task/bodyHtml';

import { Request, Response, RouteHandler, TaskRestApiResponse, createMockApi, createMockApp } from './routes.test.base';

// testSubject with mocks by routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/root';

describe('task/ route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<string>>, []>;

  const spyResponse = { redirect: jest.fn(), render: jest.fn() } as unknown as Response;
  const spyRender = spyResponse.render as jest.Mock;
  const spyRedirect = spyResponse.redirect as jest.Mock;

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.Root.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
  });

  it('Render html response on successful backend call', async () => {
    // given
    const givenReq = {} as Request;
    const givenHtmlBody: string = 'Welcome';
    const givenResponseOk: TaskRestApiResponse<string> = {
      data: '<html><head></head><body>' + givenHtmlBody + '</body></html>',
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);
    const expectedRenderData = { bodyHtml: givenHtmlBody };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRender).toHaveBeenCalledWith(expectedGetPage, expectedRenderData);
    expect(spyRedirect).not.toHaveBeenCalled();
  });

  it('Show error when fail on backend call', async () => {
    // given
    const givenReq = {} as Request;
    const givenMsg = 'test errror message';

    const givenResponse: TaskRestApiResponse<string> = {
      data: givenMsg,
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponse);
    const expectedRenderData = { bodyHtml: 'test errror message' };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRedirect).not.toHaveBeenCalled();
    expect(spyRender).toHaveBeenCalledWith(expectedPageError, expectedRenderData);
  });

  it('Show error on fail parsing html', async () => {
    // given
    const givenReq = {} as Request;
    const givenForceCheerioParseErrorInput = {
      id: 666,
      title: 'Error',
      status: 'Initial',
      due: '2026-02-29T25:00:00Z',
    };

    const givenResponseNonString: TaskRestApiResponse<string> = {
      data: String(givenForceCheerioParseErrorInput),
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseNonString);

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRedirect).not.toHaveBeenCalled();
    expect(spyRender).toHaveBeenCalledWith(expectedPageError, expect.anything());
  });

  it('No render on Post', async () => {
    expect(testSubjectPost).toBeUndefined();
  });
});
