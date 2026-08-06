import { defineConfig } from 'vitest/config';

export default defineConfig({
  // JSX is configured via tsconfig ("jsx": "react-jsx"); Vite 8's oxc
  // transform picks it up from there.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
  },
});
