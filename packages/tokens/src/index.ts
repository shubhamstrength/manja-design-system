import type { themes } from './generated/tokens.js';

export {
  cssVars,
  darkTokens,
  themeAttribute,
  themes,
  tokenPrefix,
  tokens,
} from './generated/tokens.js';

/** `'light' | 'dark'` — the themes the token pipeline emits. */
export type Theme = (typeof themes)[number];
