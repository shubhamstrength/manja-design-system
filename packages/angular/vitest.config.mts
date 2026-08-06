import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  /**
   * Compiles the library with the real Angular compiler (AOT) rather than JIT.
   *
   * This is not optional: signal APIs like `input()` and `model()` are
   * discovered by static analysis, so under JIT a template binding silently
   * never reaches the directive and the component looks broken for reasons
   * that have nothing to do with the component.
   */
  plugins: [
    angular({
      // Must be a program that contains the specs and their inline test hosts,
      // otherwise the plugin skips them and their decorators go uncompiled.
      tsconfig: './tsconfig.spec.json',
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
  },
});
