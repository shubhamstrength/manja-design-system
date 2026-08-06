export { MANJA_THEME_CONFIG, provideManjaTheme } from './lib/theme/theme.config';
export type { ManjaThemeConfig } from './lib/theme/theme.config';

export { ManjaThemeService } from './lib/theme/theme.service';
export { ManjaThemeDirective } from './lib/theme/theme.directive';

/**
 * Re-exported so an app only needs `@manja/angular` on its import list. The
 * shared vocabulary lives in `@manja/core` because React uses it too.
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
