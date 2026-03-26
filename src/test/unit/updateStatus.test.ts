let testSubjectGet: Function;
let testSubjectPost: Function;

//onst expectedGetPage = undefined;
const expectedNextPageWarn = 'task/list.njk';
const expectedNextPageSuccess = '/task/list';

import { createMockApp, createMockApi, TaskRestApiResponse, expectRenderWithWarning } from './routes.test.base';

// tesSubject with toDto mocked
import testSubject from '../../../src/main/routes/task/updateStatus';

describe('task/create route', () => {
  let mockBackendCall: jest.Mock<Promise<TaskRestApiResponse<any>>, []>;
  let spyResponse: { redirect: jest.Mock; render: jest.Mock };

  beforeEach(() => {
    const mockApi = createMockApi();

    // initialise testSubjectGet and  testSubjectPost
    const mockApp = createMockApp({
      getHandler: fn => (testSubjectGet = fn),
      postHandler: fn => (testSubjectPost = fn),
    });

    testSubject(mockApp, mockApi);

    mockBackendCall = mockApi.UpdateStatus.call as jest.Mock;

    spyResponse = { redirect: jest.fn(), render: jest.fn() };
  });

  it('No render on Get', async () => {
    expect(testSubjectGet).toBeUndefined();
  });

  it('Stay on List when successful updateStatus', async () => {
    // given
    const givenId = '1234';
    const givenStatus = 'Deleted';
    const givenRequest = { body: { status: givenStatus }, params: { id: givenId } };

    const givenResponseOk: TaskRestApiResponse<any> = {
      data: '',
      status: 200,
    };
    mockBackendCall.mockResolvedValue(givenResponseOk);

    // when
    await testSubjectPost(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, givenStatus);
    expect(spyResponse.redirect).toHaveBeenCalledWith(expectedNextPageSuccess);
    expect(spyResponse.render).not.toHaveBeenCalled();
  });

  it('Stay on List when fail on updateStatus', async () => {
    // given
    const givenId = '1234';
    const givenStatus = 'Deleted';
    const givenRequest = { body: { status: givenStatus }, params: { id: givenId } };

    const givenResponseFail: TaskRestApiResponse<String> = {
      data: 'test errror message',
      status: 500,
    };
    mockBackendCall.mockResolvedValue(givenResponseFail);

    // when
    await testSubjectPost(givenRequest, spyResponse);

    // then
    expect(mockBackendCall).toHaveBeenCalledWith(givenId, givenStatus);
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, 'test errror message');
  });

  it('Stay on List on error when id undefined', async () => {
    // given -- expected "Cannot destructure property 'id' of 'req.params' as it is undefined."
    const givenReq = { body: {} };

    // when, then propagate error
    await testSubjectPost(givenReq, spyResponse);

    // Ensure call was never invoked
    expect(mockBackendCall).not.toHaveBeenCalled();
    expect(spyResponse.redirect).not.toHaveBeenCalled();
    expectRenderWithWarning(spyResponse, expectedNextPageWarn, 'req.params');
  });
});
