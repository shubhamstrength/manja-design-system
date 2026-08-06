import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  type Signal,
} from '@angular/core';
import {
  createThemeController,
  DEFAULT_STORAGE_KEY,
  type ColorScheme,
  type ThemePreference,
  type ThemeState,
} from '@manja/core';
import { MANJA_THEME_CONFIG } from './theme.config';

/**
 * Reads and controls the active theme.
 *
 * A thin signal-based wrapper over the shared controller in `@manja/core`, so
 * Angular and React resolve, persist and apply themes identically.
 */
@Injectable({ providedIn: 'root' })
export class ManjaThemeService {
  private readonly config = inject(MANJA_THEME_CONFIG, { optional: true }) ?? {};
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly state = signal<ThemeState>({
    preference: 'system',
    resolved: 'light',
  });

  /** The stored choice, including `'system'`. */
  readonly preference: Signal<ThemePreference> = computed(() => this.state().preference);

  /** The theme actually in effect. Never `'system'`. */
  readonly resolved: Signal<ColorScheme> = computed(() => this.state().resolved);

  readonly isDark: Signal<boolean> = computed(() => this.resolved() === 'dark');

  private readonly controller = createThemeController({
    // On the server there is a DOM (Angular SSR uses domino) but no way to know
    // the user's choice, so we deliberately leave the markup unthemed and let
    // the browser apply it. Inline `themeInitScript()` to avoid a flash.
    element: this.isBrowser ? this.document.documentElement : null,
    defaultPreference: this.config.defaultPreference ?? 'system',
    storageKey:
      this.config.storageKey === undefined ? DEFAULT_STORAGE_KEY : this.config.storageKey,
  });

  constructor() {
    this.state.set(this.controller.getState());

    const unsubscribe = this.controller.subscribe((next) => this.state.set(next));

    this.destroyRef.onDestroy(() => {
      unsubscribe();
      this.controller.destroy();
    });
  }

  setPreference(preference: ThemePreference): void {
    this.controller.setPreference(preference);
  }

  /** Flips between light and dark, resolving `'system'` first. */
  toggle(): void {
    this.setPreference(this.resolved() === 'dark' ? 'light' : 'dark');
  }
}
