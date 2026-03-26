import axios from 'axios';

// silence dotenv config during testing
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
import { config } from '../../main/modules/variables';

import { TaskRestApi } from '../../main/modules/task/backend';
import { Status } from '../../main/types/status';
import { taskDto } from '../../main/types/task.dto';

// Suppress console during tests to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// mock the actual backend rest api calls
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockGet = mockAxios.get as jest.Mock;
const mockPost = mockAxios.post as jest.Mock;
const mockPut = mockAxios.put as jest.Mock;
const mockDelete = mockAxios.delete as jest.Mock;

const testSubject = TaskRestApi({ http: mockAxios as any });

describe('TaskRestApi backend client', () => {
  const expectedTaskBaseUri = `${config.backendUrl}${config.basepath}`;

  const testDue = '2026-02-29T10:00:00Z';
  const testDtoIn = taskDto(undefined, 'Test', null, testDue, Status.Init);
  const testDtoOut = taskDto('123', 'Test', '', testDue, Status.Init);

  const mockErrorStatus = 400;
  const mockErrorMsg = { error: 'backend return message' };
  const mockError = {
    response: {
      status: mockErrorStatus,
      statusText: 'Bad Request',
      data: mockErrorMsg,
      headers: {},
      config: {},
    },
  };
  const expectedErrorResponse = { data: mockErrorMsg, status: mockErrorStatus };

  // axios does not come back with a response on cors erros, network errors, or a timeout
  const mockNoResponseErrorMessage = 'CORS error';
  const mockNoResponseError = {
    message: mockNoResponseErrorMessage,
    response: undefined,
  };
  const expectedNoResponseErrorResponse = { data: mockNoResponseErrorMessage, status: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
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
    const expectedResponse = { data: testDtoOut, status: 201 };

    // when
    const actual = await testSubject.Create.call(testDtoIn);

    // then
    expect(mockAxios.post).toHaveBeenCalledWith(`${expectedTaskBaseUri}/create`, testDtoIn);
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
    const expectedResponse = { data: mockData, status: 200 };

    // when
    const actual = await testSubject.List.call();

    // then
    expect(mockGet).toHaveBeenCalledWith(`${expectedTaskBaseUri}/get-all-tasks`);
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
    const expectedResponse = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.View.call(givenId);

    // then
    expect(mockGet).toHaveBeenCalledWith(`${expectedTaskBaseUri}/get/123`);
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
    const expectedResponse = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.Update.call(given);

    // then
    expect(mockPost).toHaveBeenCalledWith(`${expectedTaskBaseUri}/update`, given);
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
    const expectedResponse = { data: testDtoOut, status: 200 };

    // when
    const actual = await testSubject.UpdateStatus.call(givenId, givenStatus);

    // then
    expect(mockAxios.put).toHaveBeenCalledWith(`${expectedTaskBaseUri}/update/123/status/Deleted`);
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
    const expectedResponse = { data: undefined, status: 204 };

    // when
    const actual = await testSubject.Delete.call(givenId);

    // then
    expect(mockAxios.delete).toHaveBeenCalledWith(`${expectedTaskBaseUri}/delete/123`);
    expect(actual).toEqual(expectedResponse);
  });

  it('should wrap server side error on create', async () => {
    // given
    mockPost.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.Create.call(testDtoIn);

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap server side error on get-all-tasks', async () => {
    // given
    mockGet.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.List.call();

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap server side error on get', async () => {
    // given
    const givenId = '123';
    mockGet.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.View.call(givenId);

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap server side error on update', async () => {
    // given
    const given = testDtoIn;
    mockPost.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.Update.call(given);

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap server side error on update status', async () => {
    // given
    const givenId = '123';
    const givenStatus = Status.Deleted;
    mockPut.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.UpdateStatus.call(givenId, givenStatus);

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap server side error on delete', async () => {
    // given
    const givenId = '123';
    mockDelete.mockRejectedValue(mockError);

    // when
    const actual = await testSubject.Delete.call(givenId);

    // then
    expect(actual).toEqual(expectedErrorResponse);
  });

  it('should wrap no response error like cors, on create', async () => {
    // given
    mockPost.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.Create.call(testDtoIn);

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });

  it('should wrap no response error like cors, on get-all-tasks', async () => {
    // given
    mockGet.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.List.call();

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });

  it('should wrap no response error like cors, on get', async () => {
    // given
    const givenId = '123';
    mockGet.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.View.call(givenId);

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });

  it('should wrap no response error like cors, on update', async () => {
    // given
    const given = testDtoIn;
    mockPost.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.Update.call(given);

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });

  it('should wrap no response error like cors, on update status', async () => {
    // given
    const givenId = '123';
    const givenStatus = Status.Deleted;
    mockPut.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.UpdateStatus.call(givenId, givenStatus);

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });

  it('should wrap no response error like cors, on delete', async () => {
    // given
    const givenId = '123';
    mockDelete.mockRejectedValue(mockNoResponseError);

    // when
    const actual = await testSubject.Delete.call(givenId);

    // then
    expect(actual).toEqual(expectedNoResponseErrorResponse);
  });
});
