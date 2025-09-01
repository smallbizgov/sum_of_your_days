module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server/**/*.test.js', '**/server/**/*.spec.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/smoke-test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/server/test/setup.js'],
};