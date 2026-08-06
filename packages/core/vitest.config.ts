import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The theme controller reads documentElement and matchMedia.
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    restoreMocks: true,
  },
});
