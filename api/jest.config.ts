/* eslint-disable */
export default {
  displayName: 'api',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api',
  moduleNameMapper: {
    '^@\\./api-interfaces(.*)$': '<rootDir>/../shared/api-interfaces/src$1',
    '^@\\./auth(.*)$': '<rootDir>/../shared/auth/src$1',
    '^@\\./shared(.*)$': '<rootDir>/../shared/src$1'
  }
};