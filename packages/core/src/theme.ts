/**
 * Framework-agnostic theme controller.
 *
 * React's `ThemeProvider` and Angular's `ManjaThemeService` are both thin
 * wrappers over this, so theme behaviour — resolution, persistence, reacting to
 * the OS preference — is defined exactly once.
 */

/** Must match `themeAttribute` from `@manja/tokens`; asserted in theme.spec.ts. */
export const THEME_ATTRIBUTE = 'data-mj-theme';

export const DEFAULT_STORAGE_KEY = 'manja-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** A concrete theme that is actually painted. */
export type ColorScheme = 'light' | 'dark';

/** What the user asked for. `'system'` defers to the OS setting. */
export type ThemePreference = ColorScheme | 'system';

export interface ThemeState {
  /** The stored choice, including `'system'`. */
  readonly preference: ThemePreference;
  /** The theme currently in effect, never `'system'`. */
  readonly resolved: ColorScheme;
}

/** The slice of `Storage` we use, so callers can pass cookies or memory instead. */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ThemeControllerOptions {
  /** Element carrying the theme attribute. Defaults to `<html>`. */
  element?: HTMLElement | null;
  /** Preference used when nothing is stored. Defaults to `'system'`. */
  defaultPreference?: ThemePreference;
  /** Storage key, or `null` to disable persistence entirely. */
  storageKey?: string | null;
  /** Storage backend. Defaults to `localStorage` when available. */
  storage?: ThemeStorage | null;
}

export interface ThemeController {
  getState(): ThemeState;
  setPreference(preference: ThemePreference): void;
  /** Fires on preference changes *and* on OS changes while set to `'system'`. */
  subscribe(listener: (state: ThemeState) => void): () => void;
  /** Detaches the media-query listener. */
  destroy(): void;
}

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/** Safari in private mode throws on storage access rather than returning null. */
function safeGet(storage: ThemeStorage | null, key: string | null): string | null {
  if (!storage || !key) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: ThemeStorage | null, key: string | null, value: string): void {
  if (!storage || !key) return;
  try {
    storage.setItem(key, value);
  } catch {
    /* Quota exceeded or storage disabled — the theme still applies this session. */
  }
}

function defaultStorage(): ThemeStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function createThemeController(
  options: ThemeControllerOptions = {},
): ThemeController {
  const {
    defaultPreference = 'system',
    storageKey = DEFAULT_STORAGE_KEY,
    storage = defaultStorage(),
  } = options;

  const hasDom = typeof document !== 'undefined';
  const element = options.element ?? (hasDom ? document.documentElement : null);

  const media = typeof matchMedia === 'function' ? matchMedia(DARK_QUERY) : null;

  const stored = safeGet(storage, storageKey);
  let preference: ThemePreference = isPreference(stored) ? stored : defaultPreference;

  const listeners = new Set<(state: ThemeState) => void>();

  const resolve = (): ColorScheme =>
    preference === 'system' ? (media?.matches ? 'dark' : 'light') : preference;

  const state = (): ThemeState => ({ preference, resolved: resolve() });

  /**
   * `'system'` removes the attribute rather than writing the resolved value.
   * The stylesheet's `prefers-color-scheme` block then takes over, so the theme
   * keeps tracking the OS even if this controller is later torn down.
   */
  const apply = (): void => {
    if (!element) return;
    if (preference === 'system') {
      element.removeAttribute(THEME_ATTRIBUTE);
    } else {
      element.setAttribute(THEME_ATTRIBUTE, preference);
    }
  };

  const emit = (): void => {
    const next = state();
    for (const listener of listeners) listener(next);
  };

  const onMediaChange = (): void => {
    // Only a `'system'` preference is affected by the OS flipping.
    if (preference === 'system') emit();
  };

  media?.addEventListener('change', onMediaChange);
  apply();

  return {
    getState: state,

    setPreference(next: ThemePreference): void {
      if (!isPreference(next) || next === preference) return;
      preference = next;
      safeSet(storage, storageKey, next);
      apply();
      emit();
    },

    subscribe(listener: (state: ThemeState) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    destroy(): void {
      media?.removeEventListener('change', onMediaChange);
      listeners.clear();
    },
  };
}

/**
 * A tiny script to run before first paint, preventing the light-mode flash that
 * otherwise happens when a dark-theme user loads the page.
 *
 * Inline the result in `<head>`, ahead of any stylesheet:
 * `<script>{themeInitScript()}</script>`
 */
export function themeInitScript(storageKey: string = DEFAULT_STORAGE_KEY): string {
  const key = JSON.stringify(storageKey);
  return (
    `(function(){try{var p=localStorage.getItem(${key});` +
    `if(p==='light'||p==='dark')` +
    `document.documentElement.setAttribute('${THEME_ATTRIBUTE}',p)}catch(e){}})()`
  );
}
