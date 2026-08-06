import { themeInitScript } from '@manja/core';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Injects the anti-flash theme script into <head> straight from `@manja/core`,
 * so the playground can never drift from the snippet the design system ships.
 */
function manjaThemeInit(): Plugin {
  return {
    name: 'manja-theme-init',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          children: themeInitScript(),
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), manjaThemeInit()],
  server: {
    port: 4200,
    open: false,
  },
  optimizeDeps: {
    // These are workspace packages we rebuild constantly. Pre-bundling them
    // would serve a stale copy after every `nx build`.
    exclude: ['@manja/core', '@manja/react', '@manja/tokens', '@manja/styles'],
  },
});
