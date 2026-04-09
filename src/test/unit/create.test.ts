let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedGetPage = 'task/create.njk';
const expectedNextPageWarn = expectedGetPage;
const expectedNextPageSuccess = '/task/list';

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
import testSubject from '../../../src/main/routes/task/create';

describe('task/create route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<TaskDto>>, []>;

  const spyResponse = { redirect: jest.fn(), render: jest.fn() } as unknown as Response;
  const spyRender = spyResponse.render as jest.Mock;
  const spyRedirect = spyResponse.redirect as jest.Mock;

  const toDtoMock = toDto as jest.Mock;

  const testDto: TaskDto = {
    title: 'Test Task',
    description: 'A task for testing',
    status: 'Initial',
    due: '2024-12-31T23:59:59Z',
  };

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.Create.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
    toDtoMock.mockClear();
  });

  it('Render Page on Get', async () => {
    // given
    const givenReq = { body: {} } as Request;

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(spyRender).toHaveBeenCalledWith(expectedGetPage);
  });

  it('Redirect on Post to List when successful Create', async () => {
    // given
    const givenReq = { body: {} } as Request;
    const expectedReqDto = testDto;
    toDtoMock.mockReturnValue(expectedReqDto);

    const givenResponseOk: TaskRestApiResponse<TaskDto> = {
      data: testDto,
      status: 201,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expectedReqDto);
    expect(spyRedirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyRender).not.toHaveBeenCalled();
  });

  it('Stay on page when fail on Create', async () => {
    // given
    const givenReq = { body: {} } as Request;
    const expectedReqDto = testDto;
    toDtoMock.mockReturnValue(expectedReqDto);

    const givenResponseFailMsg = 'test errror message';
    const givenResponseFail: TaskRestApiResponse<TaskDto> = {
      data: givenResponseFailMsg,
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expectedReqDto);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, givenResponseFailMsg);
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenReq = { body: {} } as Request;
    toDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // then Create was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'DTO failure');
  });
});
