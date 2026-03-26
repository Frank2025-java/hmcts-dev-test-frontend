let testSubjectGet: Function;
let testSubjectPost: Function;

const expectedGetPage = 'task/view.njk';
const expectedNextPageWarn = expectedGetPage;
const expectedNextPageSuccess = '/task/list';

import {
  createMockApp,
  createMockApi,
  toDto,
  TaskDto,
  TaskRestApiResponse,
  expectRenderWithWarning,
} from './routes.test.base';

// tesSubject with toDto mocked
import testSubject from '../../../src/main/routes/task/update';

describe('task/update route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<any>>, []>;
  let spyResponse: { redirect: jest.Mock; render: jest.Mock };

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

    spyResponse = { redirect: jest.fn(), render: jest.fn() };
  });

  it('No render on Get', async () => {
    expect(testSubjectGet).toBeUndefined();
  });

  it('Redirect on Post to List when successful Create', async () => {
    // given
    const givenReq = {
      body: {
        id: '123',
        title: 'test title from form',
        description: '',
        due: '2026-12-31T23:59:59Z',
        status: 'Deleted',
      },
    };
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
    expect(mockBackendCall).toHaveBeenCalledWith(givenDto);
    expect(spyResponse.redirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyResponse.render).not.toHaveBeenCalled();
  });

  it('Stay on page when fail on backend', async () => {
    // given
    const givenReq = { body: {} };
    const givenDto = testDto;
    toDtoMock.mockReturnValue(givenDto);

    const givenResponseFail: TaskRestApiResponse<String> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenDto);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, 'test errror message');
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenReq = { body: {} };
    toDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // Ensure Create.call was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, 'DTO failure');
  });
});
