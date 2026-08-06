import {
  createThemeController,
  cx,
  DEFAULT_STORAGE_KEY,
  type ThemeController,
  type ThemePreference,
  type ThemeState,
} from '@manja/core';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext.js';

export interface ThemeProviderProps {
  children: ReactNode;
  /** Preference used when nothing is persisted. Defaults to `'system'`. */
  defaultPreference?: ThemePreference;
  /** Storage key, or `null` to disable persistence. */
  storageKey?: string | null;
  /**
   * Theme a subtree instead of the whole document. Renders a wrapper element
   * that carries the theme attribute — useful for side-by-side previews and
   * for embedding Manja inside a host app you do not control.
   */
  scoped?: boolean;
  /** Class applied to the wrapper. Only meaningful with `scoped`. */
  className?: string;
}

/**
 * Installs a Manja theme.
 *
 * The theme is applied by an effect, so the server-rendered markup carries no
 * theme attribute. That is deliberate — it keeps hydration consistent. To avoid
 * a light-mode flash for dark-theme users, inline `themeInitScript()` from
 * `@manja/core` in your document head.
 */
export function ThemeProvider({
  children,
  defaultPreference = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
  scoped = false,
  className,
}: ThemeProviderProps) {
  // Callback ref via state: the controller can only be built once the wrapper
  // element exists, and this re-runs the effect when it does.
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [controller, setController] = useState<ThemeController | null>(null);
  const [state, setState] = useState<ThemeState>({
    preference: defaultPreference,
    resolved: defaultPreference === 'dark' ? 'dark' : 'light',
  });

  useEffect(() => {
    // A scoped provider has nothing to attach to until the wrapper mounts.
    if (scoped && !host) return;

    const next = createThemeController({
      element: scoped ? host : undefined,
      defaultPreference,
      storageKey,
    });

    setController(next);
    setState(next.getState());
    const unsubscribe = next.subscribe(setState);

    return () => {
      unsubscribe();
      next.destroy();
    };
  }, [scoped, host, defaultPreference, storageKey]);

  const setPreference = useCallback(
    (preference: ThemePreference) => controller?.setPreference(preference),
    [controller],
  );

  const toggle = useCallback(
    () => controller?.setPreference(state.resolved === 'dark' ? 'light' : 'dark'),
    [controller, state.resolved],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference: state.preference,
      resolved: state.resolved,
      setPreference,
      toggle,
    }),
    [state.preference, state.resolved, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      {scoped ? (
        <div ref={setHost} className={cx('mj-theme', className)}>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}
