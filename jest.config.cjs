module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js', '<rootDir>/tests/http/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/helpers/setup-env.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/utils/security.js', 'src/services/auth.service.js',
    'src/services/audit.service.js', 'src/middlewares/auth.js',
    'src/controllers/auth.controller.js', 'src/middlewares/validate.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: { global: { lines: 60, branches: 45, functions: 60, statements: 60 } }
};
