/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.test.ts"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.ts"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};