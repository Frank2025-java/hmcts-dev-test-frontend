let testSubjectGet: Function;
let testSubjectPost: Function;

const expectedGetPage = 'task/create.njk';
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
import testSubject from '../../../src/main/routes/task/create';

describe('task/create route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<any>>, []>;
  let spyResponse: { redirect: jest.Mock; render: jest.Mock };

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

    spyResponse = { redirect: jest.fn(), render: jest.fn() };
  });

  it('Render Page on Get', async () => {
    // given
    const givenReq = { body: {} };

    // when
    await testSubjectGet(givenReq, spyResponse);

    // then
    expect(spyResponse.render).toHaveBeenCalledWith(expectedGetPage);
  });

  it('Redirect on Post to List when successful Create', async () => {
    // given
    const givenReq = { body: {} };
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
    expect(spyResponse.redirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyResponse.render).not.toHaveBeenCalled();
  });

  it('Stay on page when fail on Create', async () => {
    // given
    const givenReq = { body: {} };
    const expectedReqDto = testDto;
    toDtoMock.mockReturnValue(expectedReqDto);

    const givenResponseFailMsg = 'test errror message';
    const givenResponseFail: TaskRestApiResponse<String> = {
      data: givenResponseFailMsg,
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenReq, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(expectedReqDto);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, givenResponseFailMsg);
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenReq = { body: {} };
    toDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // then Create was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, 'DTO failure');
  });
});
