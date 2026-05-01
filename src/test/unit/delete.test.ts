let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedNextPageWarn = 'task/list.njk';
const expectedNextPageSuccess = '/task/list';
const expectedIdempotencyKey = undefined;

import {
  Request,
  Response,
  RouteHandler,
  TaskRestApiResponse,
  createMockApi,
  createMockApp,
  expectRenderWithWarning,
} from './routes.test.base';

// tesSubject with mocks from routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/delete';

describe('task/delete route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<void>>, []>;

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

    mockBackendCall = mockApi.Delete.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
  });

  it('No render on Get', async () => {
    expect(testSubjectGet).toBeUndefined();
  });

  it('Stay on List when successful delete', async () => {
    // given
    const givenId = '1234';
    const givenReq = { body: {}, params: { id: givenId } } as unknown as Request;

    const givenResponseOk: TaskRestApiResponse<void> = {
      data: '',
      status: 204,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, expectedIdempotencyKey);
    expect(spyRedirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyRender).not.toHaveBeenCalled();
  });

  it('Passing Idempotency Key on Post', async () => {
    // given
    const givenIdempotencyKey = 'test-key-123';
    const givenReq = { body: {}, params: { id: '1234' }, idempotencyKey: givenIdempotencyKey } as unknown as Request;

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expect.anything(), givenIdempotencyKey);
  });

  it('Stay on List when fail on delete', async () => {
    // given
    const givenId = '1234';
    const givenReq = { body: {}, params: { id: givenId } } as unknown as Request;

    const givenResponseFail: TaskRestApiResponse<void> = {
      data: 'test errror message',
      status: 500,
    };

    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, expectedIdempotencyKey);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'test errror message');
  });

  it('Stays of List when error because id undefined', async () => {
    // given
    const givenReq = { body: {} } as unknown as Request;
    const expectedError = "Cannot destructure property 'id' of 'req.params' as it is undefined.";

    // when, then propagate error
    testSubjectPost(givenReq, spyResponse);

    // Ensure call was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, expectedError);
  });
});
