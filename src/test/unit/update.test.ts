let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedGetPage = 'task/view.njk';
const expectedNextPageWarn = expectedGetPage;
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
  toDto,
} from './routes.test.base';

// testSubject with toDto mocked by routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/update';

describe('task/update route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<TaskDto>>, []>;

  const spyResponse = { redirect: jest.fn(), render: jest.fn() } as unknown as Response;
  const spyRender = spyResponse.render as jest.Mock;
  const spyRedirect = spyResponse.redirect as jest.Mock;

  const toDtoMock = toDto as jest.Mock;

  const testDto: TaskDto = {
    id: '123',
    title: 'Test Task',
    description: null,
    status: 'Initial',
    due: '2026-12-31T23:59:59Z',
  };

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.Update.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
    toDtoMock.mockClear();
  });

  it('No render on Get', async () => {
    expect(testSubjectGet).toBeUndefined();
  });

  it('Redirect on Post to List when successful Update', async () => {
    // given
    const givenReq = {
      body: {
        id: '123',
        title: 'test title from form',
        description: '',
        due: '2026-12-31T23:59:59Z',
        status: 'Deleted',
      },
    } as unknown as Request;
    const givenDto = testDto;
    toDtoMock.mockReturnValue(givenDto);

    const givenResponseOk: TaskRestApiResponse<TaskDto> = {
      data: testDto,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenDto, expectedIdempotencyKey);
    expect(spyRedirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyRender).not.toHaveBeenCalled();
  });

  it('Passing Idempotency Key on Post', async () => {
    // given
    const givenIdempotencyKey = 'test-idempotency-key';
    const givenReq = { body: testDto, idempotencyKey: givenIdempotencyKey } as unknown as Request;
    toDtoMock.mockReturnValue(testDto);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expect.anything(), givenIdempotencyKey);
  });

  it('Stay on page when fail on backend', async () => {
    // given
    const givenReq = { body: {} } as unknown as Request;
    const givenDto = testDto;
    toDtoMock.mockReturnValue(givenDto);

    const givenResponseFail: TaskRestApiResponse<TaskDto> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenDto, expectedIdempotencyKey);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'test errror message');
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenReq = { body: {} } as unknown as Request;
    toDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // Ensure Create.call was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'DTO failure');
  });
});
