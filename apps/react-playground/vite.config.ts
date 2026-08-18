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

/**
 * GitHub Pages serves a project site from `/<repo>/`, not from the domain root,
 * so every asset URL has to be prefixed or the page loads a blank shell.
 *
 * The deploy workflow passes the repository name in, which keeps this correct
 * in a fork or after a rename. The literal default is only a convenience for
 * building the production bundle by hand.
 */
const PAGES_BASE = process.env['MANJA_BASE_PATH'] ?? '/manja-design-system/';

export default defineConfig(({ command, isPreview }) => ({
  // The dev server stays at the root; the built site and `vite preview` use the
  // Pages prefix, so previewing locally exercises the real asset URLs.
  base: command === 'build' || isPreview ? PAGES_BASE : '/',
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
}));
