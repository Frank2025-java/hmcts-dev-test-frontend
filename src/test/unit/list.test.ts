let testSubjectGet: RouteHandler;
let testSubjectPost: RouteHandler;

//const expectedGetPage = 'task/list.njk';
const expectedNextPageWarn = 'task/list.njk';
const expectedNextPageSuccess = 'task/list';

import {
  Request,
  Response,
  RouteHandler,
  TaskDto,
  TaskRestApiResponse,
  createMockApi,
  createMockApp,
  expectRenderWithWarning,
  fromBackendDtoArray,
} from './routes.test.base';

// tesSubject with fromBackendDtoArray mocked by routes.test.base
// eslint-disable-next-line import/order
import testSubject from '../../../src/main/routes/task/list';

describe('task/list route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<TaskDto[]>>, []>;

  const spyResponse = { redirect: jest.fn(), render: jest.fn() } as unknown as Response;
  const spyRender = spyResponse.render as jest.Mock;
  const spyRedirect = spyResponse.redirect as jest.Mock;

  const mockFromBackendDtoArray = fromBackendDtoArray as jest.Mock;

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.List.call as jest.Mock;

    spyRender.mockClear();
    spyRedirect.mockClear();
    mockFromBackendDtoArray.mockClear();
  });

  it('Render List response on successful get-all-tasks', async () => {
    // given
    const givenReq = {} as Request;
    const givenDtos: TaskDto[] = [
      { id: '2', title: 'Test task 2', description: 'Something', due: '2025-01-01T10:00:00Z', status: 'Initial' },
      { id: '1', title: 'Test task 1', description: '', due: '2025-02-01T10:00:00Z', status: 'Initial' },
      { id: '3', title: 'Test task 3', description: null, due: '2025-03-01T10:00:00Z', status: 'Deleted' },
    ];
    const givenResponseOk: TaskRestApiResponse<TaskDto[]> = {
      data: givenDtos,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);
    mockFromBackendDtoArray.mockReturnValue(givenDtos);

    const expectedRenderData = {
      tasks: [
        { id: '1', title: 'Test task 1', description: '', due: '2025-02-01T10:00:00Z', status: 'Initial' },
        { id: '2', title: 'Test task 2', description: 'Something', due: '2025-01-01T10:00:00Z', status: 'Initial' },
        { id: '3', title: 'Test task 3', description: null, due: '2025-03-01T10:00:00Z', status: 'Deleted' },
      ],
      statusOptions: ['Initial', 'Deleted'],
    };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRender).toHaveBeenCalledWith(expectedNextPageSuccess, expectedRenderData);
    expect(spyRedirect).not.toHaveBeenCalled();
  });

  it('Render List response of single item on successful get-all-tasks', async () => {
    // given
    const givenReq = {} as Request;
    const givenDtos: TaskDto[] = [
      { id: '1', title: 'Test task 1', description: '', due: '2025-02-01T10:00:00Z', status: 'Initial' },
    ];
    const givenResponseSingleItem: TaskRestApiResponse<TaskDto[]> = {
      data: givenDtos,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseSingleItem);
    mockFromBackendDtoArray.mockReturnValue(givenDtos);

    const expectedRenderData = {
      tasks: givenDtos,
      statusOptions: ['Initial', 'Deleted'],
    };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRender).toHaveBeenCalledWith(expectedNextPageSuccess, expectedRenderData);
    expect(spyRedirect).not.toHaveBeenCalled();
  });

  it('Render List response no items error on get-all-tasks', async () => {
    // given
    const givenReq = {} as Request;
    const givenResponseNone: TaskRestApiResponse<TaskDto[]> = {
      data: 'none found!',
      status: 400,
    };
    mockBackendCall.mockResolvedValue(givenResponseNone);

    const expectedRenderData = {
      tasks: [],
      statusOptions: ['Initial', 'Deleted'],
    };

    // Suppress console to keep output clean
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRender).toHaveBeenCalledWith(expectedNextPageSuccess, expectedRenderData);
    expect(spyRedirect).not.toHaveBeenCalled();
  });

  it('Stay on List when fail on get-all-tasks', async () => {
    // given
    const givenReq = {} as Request;

    const givenResponse: TaskRestApiResponse<TaskDto[]> = {
      data: 'test errror message',
      status: 500,
    };

    mockBackendCall.mockResolvedValue(givenResponse);

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, 'test errror message');
  });

  it('Stay on List when fail on TaskDto parsing', async () => {
    // given
    const givenReq = {} as Request;
    const givenDtos: TaskDto[] = [
      { id: '1', title: 'Test task 1', description: '', due: '2025-02-29T25:00:00Z', status: 'Initial' },
    ];
    const givenResponseSingleItem: TaskRestApiResponse<TaskDto[]> = {
      data: givenDtos,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseSingleItem);
    mockFromBackendDtoArray.mockImplementation(() => {
      throw new Error('29 of feb issue');
    });

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRedirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyRender, expectedNextPageWarn, '29 of feb issue');
  });

  it('Ignoring missing id', async () => {
    // given
    const givenReq = {} as Request;
    const givenDtosWithoutIds: TaskDto[] = [
      { title: 'Test task 2', description: null, due: '2025-01-01T10:00:00Z', status: 'Deleted' },
      { title: 'Test task 1', description: '', due: '2025-02-01T10:00:00Z', status: 'Initial' },
    ];
    const givenResponseUnexpected: TaskRestApiResponse<TaskDto[]> = {
      data: givenDtosWithoutIds,
      status: 200,
    };

    const expectedRenderData = {
      tasks: givenDtosWithoutIds,
      statusOptions: ['Initial', 'Deleted'],
    };

    mockBackendCall.mockResolvedValue(givenResponseUnexpected);
    mockFromBackendDtoArray.mockReturnValue(givenDtosWithoutIds);

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith();
    expect(spyRedirect).not.toHaveBeenCalled();
    expect(spyRender).toHaveBeenCalledWith(expectedNextPageSuccess, expectedRenderData);
  });

  it('No render on Post', async () => {
    expect(testSubjectPost).toBeUndefined();
  });
});
