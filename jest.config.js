// jest.config.js - Jest configuration for Club Sphear tests

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],

  // Map @/ to src/
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Start server before tests, stop it after
  globalSetup: "./tests/setup.js",
  globalTeardown: "./tests/teardown.js",

  // 60s per test (API calls can be slow)
  testTimeout: 60000,

  verbose: true,
  clearMocks: true,
  resetMocks: true,
  transform: {},
  transformIgnorePatterns: ["/node_modules/"],
  resetModules: true,
};

module.exports = config;
