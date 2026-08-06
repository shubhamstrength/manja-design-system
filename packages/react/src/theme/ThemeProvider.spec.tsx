import { THEME_ATTRIBUTE } from '@manja/core';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider.js';
import { useTheme } from './useTheme.js';

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

function ThemeProbe() {
  const { preference, resolved, setPreference, toggle } = useTheme();
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setPreference('dark')}>go dark</button>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves from the OS preference by default', () => {
    stubMatchMedia(true);

    render(
      <ThemeProvider storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('preference')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('writes the theme attribute onto documentElement', async () => {
    stubMatchMedia(false);

    render(
      <ThemeProvider storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await act(async () => {
      screen.getByText('go dark').click();
    });

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('re-renders when the OS preference flips', async () => {
    const media = stubMatchMedia(false);

    render(
      <ThemeProvider storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    await act(async () => {
      media.setDark(true);
    });

    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('toggles between light and dark', async () => {
    stubMatchMedia(false);

    render(
      <ThemeProvider storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');

    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('persists the preference across remounts', async () => {
    stubMatchMedia(false);

    const first = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    await act(async () => {
      screen.getByText('go dark').click();
    });
    first.unmount();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('preference')).toHaveTextContent('dark');
  });

  it('scopes the theme to a wrapper instead of the document', async () => {
    stubMatchMedia(false);

    render(
      <ThemeProvider scoped storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await act(async () => {
      screen.getByText('go dark').click();
    });

    // The document must stay untouched so a host app keeps its own theme.
    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
    const wrapper = document.querySelector('.mj-theme');
    expect(wrapper?.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('releases the document attribute on unmount', async () => {
    stubMatchMedia(false);

    const view = render(
      <ThemeProvider storageKey={null}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    await act(async () => {
      screen.getByText('go dark').click();
    });

    view.unmount();
    // The controller is destroyed; nothing should throw and no listener leaks.
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });
});

describe('useTheme', () => {
  it('throws a useful error outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<ThemeProbe />)).toThrow(/requires a <ThemeProvider>/);
    } finally {
      spy.mockRestore();
    }
  });
});
