module.exports = {
  //testRegex: '(/src/test/unit/.*|\\.(test|spec))\\.(ts|js)$',
  testMatch: ['<rootDir>/src/test/unit/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest'] },
  moduleNameMapper: {
    '^glob$': '<rootDir>/node_modules/glob/dist/commonjs/index.js',

    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^types/(.*)$': '<rootDir>/src/main/types/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^router/(.*)$': '<rootDir>/src/main/router/$1',
  },
};
