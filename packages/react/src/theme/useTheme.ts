import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext.js';

/**
 * Reads the current theme and the controls to change it.
 *
 * Throws when there is no `<ThemeProvider>` above — a missing provider means
 * tokens are unthemed, which is far easier to diagnose as an error here than as
 * a subtly wrong colour three screens away.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme() requires a <ThemeProvider>. Wrap your app root in one, or ' +
        'use a scoped <ThemeProvider scoped> around this subtree.',
    );
  }

  return context;
}
