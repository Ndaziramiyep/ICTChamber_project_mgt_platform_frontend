/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/test/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/shared/config/env$": "<rootDir>/test/mocks/env.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(svg|png|jpg|jpeg|gif|webp)$": "<rootDir>/test/mocks/file-mock.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
    "^.+\\.m?jsx?$": "babel-jest",
  },
  // MSW's dependency tree ships several ESM-only packages; rather than enumerate every one,
  // let babel-jest transform all of node_modules instead of the default node_modules exclusion.
  transformIgnorePatterns: [],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    // Wraps import.meta.env (Vite-only syntax) — swapped out via moduleNameMapper in every
    // test, so it is never exercised under Jest by design. See test/mocks/env.ts.
    "!src/shared/config/env.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 85,
      lines: 90,
    },
  },
  clearMocks: true,
};
