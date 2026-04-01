module.exports = {
  roots: ['<rootDir>/src/test/routes'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.console.js'],
  moduleNameMapper: {
    '^glob$': '<rootDir>/node_modules/glob/dist/commonjs/index.js',

    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^types/(.*)$': '<rootDir>/src/main/types/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^router/(.*)$': '<rootDir>/src/main/router/$1',
  },
};
