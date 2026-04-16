import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // ВИПРАВЛЕНО: шукаємо будь-які файли тестів
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts"
  ],
  transformIgnorePatterns: ["/node_modules/(?!(mongodb|bson)/)"],
};

export default createJestConfig(config);