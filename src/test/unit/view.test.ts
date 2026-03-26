let testSubjectGet: Function;
let testSubjectPost: Function;

const expectedGetPageSucces = 'task/view.njk';
const expectedGetPageWarn = 'task/view.njk';

import {
  createMockApp,
  createMockApi,
  toDto,
  TaskDto,
  TaskRestApiResponse,
  expectRenderWithWarning,
} from './routes.test.base';

// tesSubject with toDto mocked
import testSubject from '../../../src/main/routes/task/view';

describe('task/update route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<any>>, []>;
  let spyResponse: { redirect: jest.Mock; render: jest.Mock };

  const toDtoMock = toDto as jest.Mock;

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.View.call as jest.Mock;

    spyResponse = { redirect: jest.fn(), render: jest.fn() };
  });

  it('Display task on Get', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } };

    const givenResponseDto: TaskDto = {
      id: '1234',
      title: 'test title from form',
      description: '',
      due: '2026-12-31T23:59:59Z',
      status: 'Deleted',
    };
    toDtoMock.mockReturnValue(givenResponseDto);

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
    expect(spyResponse.render).toHaveBeenCalledWith(expectedGetPageSucces, expectedRenderData);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
  });

  it('Stay on page when fail on backend', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } };
    const givenResponseFail: TaskRestApiResponse<String> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectGet(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedGetPageWarn, 'test errror message');
  });

  it('Stay on page on parsing error', async () => {
    // given
    const givenId = '1234';
    const givenRequest = { body: {}, params: { id: givenId } };

    const givenResponseOk: TaskRestApiResponse<any> = {
      data: {},
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    toDtoMock.mockImplementation(() => {
      throw new Error('DTO failure');
    });

    // when, then propagate error
    await testSubjectGet(givenRequest, spyResponse);

    // Ensure Create.call was never invoked
    expect(mockBackendCall).toHaveBeenCalledWith(givenId);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedGetPageWarn, 'DTO failure');
  });

  it('No render on Post', async () => {
    expect(testSubjectPost).toBeUndefined();
  });
});
