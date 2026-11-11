/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4000,
  },
  optimizeDeps: {
    // Recharts is only imported by the lazily loaded /admin page, so Vite's
    // startup scan misses it and re-optimizes mid-session ("504 Outdated
    // Optimize Dep"). Pre-bundling it at startup avoids that.
    include: ['recharts'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
