import {
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import type { ThemePreference } from '@manja/core';

export interface ManjaThemeConfig {
  /** Preference used when nothing is persisted. Defaults to `'system'`. */
  defaultPreference?: ThemePreference;
  /** Storage key, or `null` to disable persistence. */
  storageKey?: string | null;
}

export const MANJA_THEME_CONFIG = new InjectionToken<ManjaThemeConfig>(
  'MANJA_THEME_CONFIG',
);

/**
 * Configures Manja theming for the application.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideManjaTheme({ defaultPreference: 'system' })],
 * });
 * ```
 *
 * `ManjaThemeService` is `providedIn: 'root'` and works without this — call it
 * only when you need to change the defaults.
 */
export function provideManjaTheme(config: ManjaThemeConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: MANJA_THEME_CONFIG, useValue: config }]);
}
