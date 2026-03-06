// Suppress all console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  //  info: jest.fn(),
  //  warn: jest.fn(),
  //  error: jest.fn(),
};
