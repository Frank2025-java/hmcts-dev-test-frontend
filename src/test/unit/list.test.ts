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
import testSubject, { sortForDisplay } from '../../../src/main/routes/task/list';

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
      { id: '1', title: 'Test task 1', description: '', due: '2025-02-01T10:00:00.000+00:00', status: 'Initial' },
      { id: '3', title: 'Test task 3', description: null, due: '2025-04-01T10:00:00.000+01:00', status: 'Deleted' },
    ];
    const givenResponseOk: TaskRestApiResponse<TaskDto[]> = {
      data: givenDtos,
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);
    mockFromBackendDtoArray.mockReturnValue(givenDtos);

    const expectedRenderData = {
      tasks: [
        { id: '1', title: 'Test task 1', description: '', due: '2025-02-01T10:00:00.000Z', status: 'Initial' },
        { id: '2', title: 'Test task 2', description: 'Something', due: '2025-01-01T10:00:00.000Z', status: 'Initial' },
        { id: '3', title: 'Test task 3', description: null, due: '2025-04-01T09:00:00.000Z', status: 'Deleted' },
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

describe('task/list sort for displaying', () => {
  it('Sort on ids when all ids are numeric', async () => {
    // given
    const givenDtos: TaskDto[] = [
      { id: '2', title: 'Test task 2', description: null, due: '2025-01-01T10:00:00.000Z', status: 'Initial' },
      { id: '1', title: 'Test task 1', description: '', due: '2025-01-01T10:00:00.000Z', status: 'Initial' },
      { id: '3', title: 'Test task 3', description: null, due: '2025-01-01T10:00:00.000Z', status: 'Deleted' },
    ];
    const actual: TaskDto[] = structuredClone(givenDtos);

    // when
    sortForDisplay(actual);

    // then
    expect(actual).toHaveLength(givenDtos.length);
    expect(actual[0]).toEqual(givenDtos[1]);
    expect(actual[1]).toEqual(givenDtos[0]);
    expect(actual[2]).toEqual(givenDtos[2]);
  });

  it('Sort on date time when ids are non-numeric', async () => {
    // given
    const givenDtos: TaskDto[] = [
      { id: '2-x', title: 'Test task latest', description: null, due: '2025-03-01T10:00:00.000Z', status: 'Initial' },
      { id: '1', title: 'Test task middle', description: '', due: '2025-02-01T10:00:00.000Z', status: 'Initial' },
      { id: '3 4', title: 'Test task earliest', description: null, due: '2025-02-01T09:00:00.000Z', status: 'Deleted' },
    ];
    const actual: TaskDto[] = structuredClone(givenDtos);

    // when
    sortForDisplay(actual);

    // then
    expect(actual).toHaveLength(givenDtos.length);
    expect(actual[0]).toEqual(givenDtos[2]);
    expect(actual[1]).toEqual(givenDtos[1]);
    expect(actual[2]).toEqual(givenDtos[0]);
  });

  test.each([
    ['2025-01-01T10:00:00+01:00', '2025-01-01T09:00:00.000Z'],
    ['2025-01-01T10:00:00Z', '2025-01-01T10:00:00.000Z'],
    ['2025-01-01T10:00:00-02:00', '2025-01-01T12:00:00.000Z'],
    ['2025-01-01T10:00:00.000Z', '2025-01-01T10:00:00.000Z'],
    ['2025-01-01T10:00', '2025-01-01T10:00:00.000Z'],
  ])('normalises due "%s" to ISO "%s"', (inputDue, expectedIso) => {
    // given
    const actual: TaskDto[] = [{ id: '1', title: 'Test', description: '', due: inputDue, status: 'Initial' }];

    // when
    sortForDisplay(actual);

    // then
    expect(actual[0].due).toBe(expectedIso);
  });

  test('leaves due undefined when missing', () => {
    // given
    const actual: TaskDto[] = [{ id: '1', title: 'Test task 1', description: '', status: 'Initial' }];

    // when
    sortForDisplay(actual);

    // then
    expect(actual[0].due).toBeUndefined();
  });

  test('undefined due dates sort last when sorting by due', () => {
    // given
    const actual: TaskDto[] = [
      { id: 'abc', title: 'Test task 1', description: '', due: undefined },
      { id: '2', title: 'Test task 2', description: '', due: '2025-04-09T12:00:00.000Z' },
      { id: '3', title: 'Test task 3', description: '', due: undefined },
      { id: '4', title: 'Test task 4', description: '', due: '2025-04-09T11:00:00Z' },
    ];

    // when
    sortForDisplay(actual);

    // then
    expect(actual.map(t => t.due)).toEqual([
      '2025-04-09T11:00:00.000Z',
      '2025-04-09T12:00:00.000Z',
      undefined,
      undefined,
    ]);
  });

  test('mixed valid and invalid due values: invalid become undefined and sort last', () => {
    // given
    const actual: TaskDto[] = [
      { id: 'abc', title: '', description: '', due: 'not-a-date' },
      { id: '2', title: '', description: '', due: '2025-04-09T12:00:00Z' },
    ];

    // when
    sortForDisplay(actual);

    // then
    expect(actual[0].due).toBe('2025-04-09T12:00:00.000Z');
    expect(actual[1].due).toBeUndefined();
  });

  test('sorting by due is stable when due values are equal', () => {
    // given
    const actual: TaskDto[] = [
      { id: 'x2', title: '', description: '', due: '2025-04-09T12:00:00Z' },
      { id: 'x1', title: '', description: '', due: '2025-04-09T12:00:00Z' },
      { id: 'x3', title: '', description: '', due: '2025-04-09T12:00:00Z' },
    ];

    // when
    sortForDisplay(actual);

    // then
    expect(actual.map(t => t.id)).toEqual(['x2', 'x1', 'x3']);
  });
});
