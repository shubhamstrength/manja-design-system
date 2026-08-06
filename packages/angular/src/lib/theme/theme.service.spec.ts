import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_ATTRIBUTE } from '@manja/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideManjaTheme } from './theme.config';
import { ManjaThemeService } from './theme.service';

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
  };
}

describe('ManjaThemeService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function configure(...providers: unknown[]) {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...(providers as never[])],
    });
    return TestBed.inject(ManjaThemeService);
  }

  it('resolves from the OS preference by default', () => {
    stubMatchMedia(true);
    const service = configure(provideManjaTheme({ storageKey: null }));

    expect(service.preference()).toBe('system');
    expect(service.resolved()).toBe('dark');
    expect(service.isDark()).toBe(true);
    // 'system' must not write the attribute, or the CSS media query is bypassed.
    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('writes the theme attribute for an explicit preference', () => {
    stubMatchMedia(false);
    const service = configure(provideManjaTheme({ storageKey: null }));

    service.setPreference('dark');

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(service.resolved()).toBe('dark');
  });

  it('updates its signals when the OS preference flips', () => {
    const media = stubMatchMedia(false);
    const service = configure(provideManjaTheme({ storageKey: null }));

    expect(service.resolved()).toBe('light');
    media.setDark(true);
    expect(service.resolved()).toBe('dark');
  });

  it('toggles between light and dark', () => {
    stubMatchMedia(false);
    const service = configure(provideManjaTheme({ storageKey: null }));

    service.toggle();
    expect(service.resolved()).toBe('dark');

    service.toggle();
    expect(service.resolved()).toBe('light');
  });

  it('honours defaultPreference from provideManjaTheme', () => {
    stubMatchMedia(false);
    const service = configure(
      provideManjaTheme({ defaultPreference: 'dark', storageKey: null }),
    );

    expect(service.preference()).toBe('dark');
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('persists and restores the preference', () => {
    stubMatchMedia(false);
    configure().setPreference('dark');

    TestBed.resetTestingModule();
    const restored = configure();

    expect(restored.preference()).toBe('dark');
  });

  it('works without provideManjaTheme', () => {
    stubMatchMedia(false);
    const service = configure();

    expect(service.preference()).toBe('system');
    expect(service.resolved()).toBe('light');
  });
});
