let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

const expectedGetPageSucces = 'task/view.njk';
const expectedGetPageWarn = 'task/view.njk';

import {
  Request,
  Response,
  RouteHandler,
  TaskDto,
  TaskRestApiResponse,
  createMockApi,
  createMockApp,
  expectRenderWithWarning,
  fromBackendDto,
} from './routes.test.base';

// testSubject with fromBackendDto mocked by routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/view';

describe('task/view route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<TaskDto>>, []>;

  const spyResponse = { redirect: jest.fn(), render: jest.fn() } as unknown as Response;
  const spyRender = spyResponse.render as jest.Mock;
  const spyRedirect = spyResponse.redirect as jest.Mock;

  const fromBackendDtoMock = fromBackendDto as jest.Mock;

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.View.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
    fromBackendDtoMock.mockClear();
  });

  it('Display task on Get', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } } as unknown as Request;

    const givenResponseDto: TaskDto = {
      id: '1234',
      title: 'test title from form',
      description: '',
      due: '2026-12-31T23:59:59Z',
      status: 'Deleted',
    };
    fromBackendDtoMock.mockReturnValue(givenResponseDto);

    const givenResponseOk: TaskRestApiResponse<TaskDto> = {
      data: givenResponseDto,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);
    const expectedRenderData = { task: givenResponseDto };

    // when
    await testSubjectGet(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId);
    expect(spyRender).toHaveBeenCalledWith(expectedGetPageSucces, expectedRenderData);
    expect(spyRedirect).not.toHaveBeenCalled();
  });

  it('Stay on page when fail on backend', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } } as unknown as Request;
    const givenResponseFail: TaskRestApiResponse<TaskDto> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectGet(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedGetPageWarn, 'test errror message');
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } } as unknown as Request;

    const givenResponseOk: TaskRestApiResponse<TaskDto> = {
      data: {
        id: '1234',
        title: 'test title from form',
        description: '',
        due: '2026-12-31T23:59:59Z',
        status: 'Deleted',
      },
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    fromBackendDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectGet(givenRequest, spyResponse);

    // Ensure Create.call was never invoked
    expect(mockBackendCall).toHaveBeenCalledWith(givenId);
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedGetPageWarn, 'DTO failure');
  });

  it('No render on Post', async () => {
    expect(testSubjectPost).toBeUndefined();
  });
});
