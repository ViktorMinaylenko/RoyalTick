import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Додаємо цей коментар зверху, щоб TypeScript знав про типи Vitest
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Ця секція тепер буде працювати коректно
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: mode === "development",
  },
  base: "./",
}));