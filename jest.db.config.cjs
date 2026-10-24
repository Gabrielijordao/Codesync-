module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/db/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/helpers/setup-env.js'],
  testTimeout: 20000,
  clearMocks: true
};
