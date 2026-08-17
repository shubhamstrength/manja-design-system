export { Button } from './button/Button.js';
export type { ButtonProps } from './button/Button.js';

export { ThemeProvider } from './theme/ThemeProvider.js';
export type { ThemeProviderProps } from './theme/ThemeProvider.js';

export { useTheme } from './theme/useTheme.js';
export { ThemeContext } from './theme/ThemeContext.js';
export type { ThemeContextValue } from './theme/ThemeContext.js';

/**
 * Re-exported so an app only needs `@manja/react` on its import list. The
 * shared vocabulary lives in `@manja/core` because Angular uses it too.
 */
export { cx, themeInitScript, DEFAULT_STORAGE_KEY, THEME_ATTRIBUTE } from '@manja/core';
export type {
  ClassValue,
  ColorScheme,
  Intent,
  Orientation,
  Size,
  ThemePreference,
  ValidationState,
  Variant,
} from '@manja/core';
