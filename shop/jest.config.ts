import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/__tests__/**/*.test.tsx",
    "**/__tests__/**/*.test.js"
  ],
  
  transformIgnorePatterns: ["/node_modules/(?!(mongodb|bson)/)"],
};

export default createJestConfig(config);