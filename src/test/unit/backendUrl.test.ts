import { getBackend, setBackend } from '../../main/modules/task/backendUrl';

// silence dotenv config during testing
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// mock the actual config variables
jest.mock('../../main/modules/variables', () => ({
  config: {
    backendUrl: 'http://local/',
    backendAwsUrl: 'http://aws/',
    basepath: 'x',
  },
}));

describe('backendUrl', () => {
  test('setBackend() accepts a valid backend URL', () => {
    // given
    const givenValid = 'http://local/x';
    // when
    setBackend(givenValid);
    // then
    expect(getBackend()).toBe(givenValid);
  });

  test('setBackend() rejects an invalid backend URL', () => {
    // given
    const givenInvalid = 'http://malicious/x';
    // when + then
    expect(() => setBackend(givenInvalid)).toThrow('Not recognized backend URL');
  });

  test('getBackend()  throws if no backend has been set', () => {
    // given - clear module cache
    jest.resetModules(); // clears module cache
    const backendUrl = require('../../main/modules/task/backendUrl');
    const freshGetBackend = backendUrl.getBackend as jest.MockedFunction<() => string>;

    // when + then
    expect(() => freshGetBackend()).toThrow('Not recognized backend URL');
  });

  test('getBackend() returns the last set backend', () => {
    // given
    const validBackends = ['http://local/x', 'http://aws/x'];

    // when
    setBackend(validBackends[1]);
    setBackend(validBackends[0]);

    // then
    expect(getBackend()).toBe(validBackends[0]);
  });
});
