import type { AxiosError } from 'axios';
import axios, { isAxiosError } from 'axios';

// silence dotenv config during testing
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('../../main/modules/task/backendUrl', () => ({
  getBackend: jest.fn() as jest.MockedFunction<() => string>,
  setBackend: jest.fn() as jest.MockedFunction<(url: string) => void>,
}));
// eslint-disable-next-line import/order
import { getBackend } from '../../main/modules/task/backendUrl';
const mockedGetBackend = getBackend as jest.MockedFunction<() => string>;

// eslint-disable-next-line import/order
import { TaskRestApi, TaskRestApiResponse, header } from '../../main/modules/task/backend';
import { Status } from '../../main/types/status';
import { TaskDto, taskDto } from '../../main/types/task.dto';

// Suppress console during tests to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// mock the actual backend rest api calls
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual, // keep all real named exports
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    default: {
      // mock only the default axios instance
      ...actual.default, // keep real properties like create(), defaults, interceptors
    },
  };
});
const mockGet = axios.get as jest.Mock;
const mockPost = axios.post as jest.Mock;
const mockPut = axios.put as jest.Mock;
const mockDelete = axios.delete as jest.Mock;

const testSubject = TaskRestApi({ http: axios });

describe('TaskRestApi backend client', () => {
  const givenTaskBaseUri = 'http://x/y';

  const testDue = '2026-02-29T10:00:00Z';
  const testDtoIn = taskDto(undefined, 'Test', null, testDue, Status.Init);
  const testDtoOut = taskDto('123', 'Test', '', testDue, Status.Init);
  const testIdempotencyKey = 'test-key-123';
  const expectedHeader = expectIdempotencyHeader(testIdempotencyKey);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetBackend.mockReturnValue(givenTaskBaseUri);
  });

  it('should call create', async () => {
    // given
    const mockOkResponse = {
      status: '201',
      statusText: 'Created',
      data: testDtoOut,
      headers: {},
      config: {},
    };
    mockPost.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<TaskDto> = { data: testDtoOut, status: 201 };

    // when
    const actual = await testSubject.Create.call(testDtoIn, testIdempotencyKey);

    // then
    expect(mockPost).toHaveBeenCalledWith(`${givenTaskBaseUri}/create`, testDtoIn, expectedHeader);
    expect(actual).toEqual(expectedResponse);
  });

  it('should call get-all-tasks', async () => {
    // given
    const mockData = [
      taskDto('2', 'task2', null, testDue, Status.Init),
      taskDto('1', 'task1', null, testDue, Status.Init),
    ];
    const mockOkResponse = {
      status: '200',
      statusText: 'Ok',
      data: mockData,
      headers: {},
      config: {},
    };
    mockGet.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<TaskDto[]> = { data: mockData, status: 200 };

    // when
    const actual = await testSubject.List.call();

    // then
    expect(mockGet).toHaveBeenCalledWith(`${givenTaskBaseUri}/get-all-tasks`);
    expect(actual).toEqual(expectedResponse);
  });

  it('should call get', async () => {
    // given
    const givenId = '123';
    const mockOkResponse = {
      status: '200',
      statusText: 'Ok',
      data: testDtoOut,
      headers: {},
      config: {},
    };
    mockGet.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<TaskDto> = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.View.call(givenId);

    // then
    expect(mockGet).toHaveBeenCalledWith(`${givenTaskBaseUri}/get/123`);
    expect(actual).toEqual(expectedResponse);
  });

  it('should call update', async () => {
    // given
    const given = testDtoIn;
    const mockOkResponse = {
      status: '200',
      statusText: 'Ok',
      data: testDtoOut,
      headers: {},
      config: {},
    };
    mockPost.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<TaskDto> = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.Update.call(given, testIdempotencyKey);

    // then
    expect(mockPost).toHaveBeenCalledWith(`${givenTaskBaseUri}/update`, given, expectedHeader);
    expect(actual).toEqual(expectedResponse);
  });

  it('should call update status', async () => {
    // given
    const givenId = '123';
    const givenStatus = Status.Deleted;
    const mockOkResponse = {
      status: '200',
      statusText: 'Ok',
      data: testDtoOut,
      headers: {},
      config: {},
    };
    mockPut.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<TaskDto> = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.UpdateStatus.call(givenId, givenStatus, testIdempotencyKey);

    // then
    expect(mockPut).toHaveBeenCalledWith(`${givenTaskBaseUri}/update/123/status/Deleted`, undefined, expectedHeader);
    expect(actual).toEqual(expectedResponse);
  });

  it('should call delete', async () => {
    // given
    const givenId = '123';
    const mockOkResponse = {
      status: '204',
      statusText: 'Deleted',
      headers: {},
      config: {},
    };
    mockDelete.mockResolvedValue(mockOkResponse);
    const expectedResponse: TaskRestApiResponse<void> = { data: undefined, status: 204 };

    // when
    const actual = await testSubject.Delete.call(givenId, testIdempotencyKey);

    // then
    expect(mockDelete).toHaveBeenCalledWith(`${givenTaskBaseUri}/delete/123`, expectedHeader);
    expect(actual).toEqual(expectedResponse);
  });
});

describe('Wrapping of errors', () => {
  const testId = '123';
  const testStatus = Status.Deleted;
  const testDtoIn = {} as TaskDto;
  const testIdempotencyKey = 'test-key-123';

  const mockBackendErrorStatus = 400;
  const mockBackendErrorMsg = 'backend return message';
  const mockBackendError = {
    response: {
      status: mockBackendErrorStatus,
      statusText: 'Bad Request',
      data: mockBackendErrorMsg,
      headers: {},
      config: {},
    },
    isAxiosError: true,
  } as unknown as AxiosError<string>;
  const expectedErrorResponse = { data: mockBackendErrorMsg, status: mockBackendErrorStatus };

  // axios does come back with a response on network errors or a timeout
  const mockAxiosErrorMessage = 'Axios error msg';
  const mockAxiosError = {
    message: mockAxiosErrorMessage,
    response: undefined,
    isAxiosError: true,
  } as unknown as AxiosError<string>;
  const expectedAxiosErrorResponse = { data: mockAxiosErrorMessage, status: 0 };

  // browser error, like Cors error is not an Axios error
  const mockBrowserError = {
    message: 'CORS error',
    response: undefined,
  };
  const expectedBrowserErrorResponse = { data: String(mockBrowserError), status: 0 };

  type ErrorCase = [_label: string, data: { given: unknown; expected: TaskRestApiResponse<string> }];
  const givenErrorExpectWrap: ErrorCase[] = [
    ['backend error', { given: mockBackendError, expected: expectedErrorResponse }],
    ['network error', { given: mockAxiosError, expected: expectedAxiosErrorResponse }],
    ['browser error', { given: mockBrowserError, expected: expectedBrowserErrorResponse }],
  ];

  test('Should use real isAxiosError implementation', () => {
    expect(isAxiosError(mockBackendError)).toBe(true);
    expect(isAxiosError(mockAxiosError)).toBe(true);
    expect(isAxiosError(mockBrowserError)).toBe(false);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on create', async (_label, { given, expected }) => {
    // given
    mockPost.mockRejectedValue(given);

    // when
    const actual = await testSubject.Create.call(testDtoIn, testIdempotencyKey);

    // then
    expect(actual).toEqual(expected);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on get-all-tasks', async (_label, { given, expected }) => {
    // given
    mockGet.mockRejectedValue(given);

    // when
    const actual = await testSubject.List.call();

    // then
    expect(actual).toEqual(expected);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on get', async (_label, { given, expected }) => {
    // given
    mockGet.mockRejectedValue(given);

    // when
    const actual = await testSubject.View.call(testId);

    // then
    expect(actual).toEqual(expected);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on update', async (_label, { given, expected }) => {
    // given
    mockPost.mockRejectedValue(given);

    // when
    const actual = await testSubject.Update.call(testDtoIn, testIdempotencyKey);

    // then
    expect(actual).toEqual(expected);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on update status', async (_label, { given, expected }) => {
    // given
    mockPut.mockRejectedValue(given);

    // when
    const actual = await testSubject.UpdateStatus.call(testId, testStatus, testIdempotencyKey);

    // then
    expect(actual).toEqual(expected);
  });

  it.each(givenErrorExpectWrap)('should wrap %s on delete', async (_label, { given, expected }) => {
    // given
    mockDelete.mockRejectedValue(given);

    // when
    const actual = await testSubject.Delete.call(testId, testIdempotencyKey);

    // then
    expect(actual).toEqual(expected);
  });
});

describe('header()', () => {
  it('returns the correct Axios header object when idempotencyKey is provided', () => {
    const key = 'test-key-123';

    const result = header(key);

    expect(result).toEqual({
      headers: {
        'Idempotency-Key': key,
      },
    });
  });

  it('throws an error when idempotencyKey is undefined', () => {
    expect(() => header(undefined)).toThrow('Idempotency key is missing');
  });

  it('throws an error when idempotencyKey is an empty string', () => {
    expect(() => header('')).toThrow('Idempotency key is missing');
  });
});

describe('Should fail without idempotency key', () => {
  const testDtoIn = taskDto(undefined, 'Test', null, '2026-02-29T10:00:00Z', Status.Init);

  const expectedReturnErrorResponse = { data: 'Error: Idempotency key is missing', status: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should fail on create without idempotency key', async () => {
    // given

    // when
    const actual = await testSubject.Create.call(testDtoIn);

    // then
    expect(actual).toEqual(expectedReturnErrorResponse);
  });

  it('Should fail on update without idempotency key', async () => {
    // given

    // when
    const actual = await testSubject.Update.call(testDtoIn);

    // then
    expect(actual).toEqual(expectedReturnErrorResponse);
  });

  it('Should fail on update status without idempotency key', async () => {
    // given

    // when
    const actual = await testSubject.UpdateStatus.call('123', Status.Deleted);

    // then
    expect(actual).toEqual(expectedReturnErrorResponse);
  });

  it('Should fail on delete without idempotency key', async () => {
    // given

    // when
    const actual = await testSubject.Delete.call('123');

    // then
    expect(actual).toEqual(expectedReturnErrorResponse);
  });
});

function expectIdempotencyHeader(key: string) {
  return expect.objectContaining({
    headers: expect.objectContaining({
      'Idempotency-Key': key,
    }),
  });
}
