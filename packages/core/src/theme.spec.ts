import { themeAttribute } from '@manja/tokens';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createThemeController,
  DEFAULT_STORAGE_KEY,
  THEME_ATTRIBUTE,
  themeInitScript,
  type ThemeStorage,
} from './theme.js';

/** Controllable stand-in for `matchMedia`, so we can flip the OS preference. */
function stubMatchMedia(initialDark: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches: initialDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  );

  return {
    setDark(dark: boolean) {
      mql.matches = dark;
      for (const listener of listeners) listener();
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

function memoryStorage(seed: Record<string, string> = {}): ThemeStorage {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('createThemeController', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps THEME_ATTRIBUTE in sync with the generated tokens', () => {
    // A drift here means the CSS selectors and the JS would disagree, and the
    // theme would silently stop switching.
    expect(THEME_ATTRIBUTE).toBe(themeAttribute);
  });

  it('defaults to system and resolves from the OS preference', () => {
    stubMatchMedia(true);
    const controller = createThemeController({ element: root, storage: null });

    expect(controller.getState()).toEqual({ preference: 'system', resolved: 'dark' });
    // 'system' must not write the attribute, or the CSS media query is bypassed.
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('writes the attribute for an explicit preference', () => {
    stubMatchMedia(false);
    const controller = createThemeController({ element: root, storage: null });

    controller.setPreference('dark');

    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(controller.getState()).toEqual({ preference: 'dark', resolved: 'dark' });
  });

  it('removes the attribute when returning to system', () => {
    stubMatchMedia(false);
    const controller = createThemeController({ element: root, storage: null });

    controller.setPreference('dark');
    controller.setPreference('system');

    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    expect(controller.getState().resolved).toBe('light');
  });

  it('lets an explicit light preference override a dark OS setting', () => {
    stubMatchMedia(true);
    const controller = createThemeController({ element: root, storage: null });

    controller.setPreference('light');

    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('light');
    expect(controller.getState().resolved).toBe('light');
  });

  it('notifies subscribers when the OS flips while set to system', () => {
    const media = stubMatchMedia(false);
    const controller = createThemeController({ element: root, storage: null });
    const listener = vi.fn();
    controller.subscribe(listener);

    media.setDark(true);

    expect(listener).toHaveBeenCalledWith({ preference: 'system', resolved: 'dark' });
  });

  it('ignores OS changes once a preference is explicit', () => {
    const media = stubMatchMedia(false);
    const controller = createThemeController({ element: root, storage: null });
    controller.setPreference('light');

    const listener = vi.fn();
    controller.subscribe(listener);
    media.setDark(true);

    expect(listener).not.toHaveBeenCalled();
    expect(controller.getState().resolved).toBe('light');
  });

  it('restores a persisted preference', () => {
    stubMatchMedia(false);
    const storage = memoryStorage({ [DEFAULT_STORAGE_KEY]: 'dark' });

    const controller = createThemeController({ element: root, storage });

    expect(controller.getState().preference).toBe('dark');
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('persists preference changes', () => {
    stubMatchMedia(false);
    const storage = memoryStorage();
    const controller = createThemeController({ element: root, storage });

    controller.setPreference('dark');

    expect(storage.getItem(DEFAULT_STORAGE_KEY)).toBe('dark');
  });

  it('falls back to the default when stored data is garbage', () => {
    stubMatchMedia(false);
    const storage = memoryStorage({ [DEFAULT_STORAGE_KEY]: 'chartreuse' });

    const controller = createThemeController({
      element: root,
      storage,
      defaultPreference: 'light',
    });

    expect(controller.getState().preference).toBe('light');
  });

  it('survives storage that throws', () => {
    stubMatchMedia(false);
    const hostile: ThemeStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    const controller = createThemeController({ element: root, storage: hostile });
    expect(() => controller.setPreference('dark')).not.toThrow();
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('unsubscribes and tears down the media listener', () => {
    const media = stubMatchMedia(false);
    const controller = createThemeController({ element: root, storage: null });
    const listener = vi.fn();

    const unsubscribe = controller.subscribe(listener);
    unsubscribe();
    media.setDark(true);
    expect(listener).not.toHaveBeenCalled();

    controller.destroy();
    expect(media.listenerCount).toBe(0);
  });

  it('works without a DOM or matchMedia, for SSR', () => {
    vi.stubGlobal('matchMedia', undefined);

    const controller = createThemeController({ element: null, storage: null });

    expect(controller.getState()).toEqual({ preference: 'system', resolved: 'light' });
    expect(() => controller.setPreference('dark')).not.toThrow();
    expect(controller.getState().resolved).toBe('dark');
  });
});

describe('themeInitScript', () => {
  it('applies a stored theme to documentElement', () => {
    const script = themeInitScript();
    expect(script).toContain(THEME_ATTRIBUTE);
    expect(script).toContain(DEFAULT_STORAGE_KEY);
  });

  it('escapes a custom storage key', () => {
    expect(themeInitScript("it's-a-key")).toContain('"it\'s-a-key"');
  });

  it('actually sets the attribute when evaluated', () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, 'dark');
    try {
      // `new Function` runs the snippet in global scope, the way an inline
      // <script> in the document head would.
      new Function(themeInitScript())();
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    } finally {
      localStorage.removeItem(DEFAULT_STORAGE_KEY);
      document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    }
  });
});
