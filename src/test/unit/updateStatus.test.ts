let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedNextPageWarn = 'task/list.njk';
const expectedNextPageSuccess = '/task/list';
const expectedIdempotencyKey = undefined;

import {
  Request,
  Response,
  RouteHandler,
  TaskDto,
  TaskRestApiResponse,
  createMockApi,
  createMockApp,
  expectRenderWithWarning,
} from './routes.test.base';

// testSubject with mocks from routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/updateStatus';

describe('task/updateStatus route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<TaskDto>>, []>;

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

    mockBackendCall = mockApi.UpdateStatus.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
  });

  it('No render on Get', async () => {
    expect(testSubjectGet).toBeUndefined();
  });

  it('Stay on List when successful updateStatus', async () => {
    // given
    const givenId = '1234';
    const givenStatus = 'Deleted';
    const givenRequest = { body: { status: givenStatus }, params: { id: givenId } } as unknown as Request;

    const givenResponseOk: TaskRestApiResponse<TaskDto> = {
      data: '',
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    // when
    await testSubjectPost(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, givenStatus, expectedIdempotencyKey);
    expect(spyRedirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyRender).not.toHaveBeenCalled();
  });

  it('Passing Idempotency Key on Post', async () => {
    // given
    const givenIdempotencyKey = 'test-idempotency-key';
    const givenRequest = {
      body: { status: 'Deleted' },
      params: { id: '1234' },
      idempotencyKey: givenIdempotencyKey,
    } as unknown as Request;

    // when
    await testSubjectPost(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expect.anything(), expect.anything(), givenIdempotencyKey);
  });

  it('Stay on List when fail on updateStatus', async () => {
    // given
    const givenId = '1234';
    const givenStatus = 'Deleted';
    const givenRequest = { body: { status: givenStatus }, params: { id: givenId } } as unknown as Request;

    const givenResponseFail: TaskRestApiResponse<TaskDto> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, givenStatus, expectedIdempotencyKey);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'test errror message');
  });

  it('Stay on List on error when id undefined', async () => {
    // given -- expected "Cannot destructure property 'id' of 'req.params' as it is undefined."
    const givenReq = { body: {} } as unknown as Request;

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // Ensure call was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'req.params');
  });
});
