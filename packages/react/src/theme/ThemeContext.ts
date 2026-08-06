import type { ColorScheme, ThemePreference } from '@manja/core';
import { createContext } from 'react';

export interface ThemeContextValue {
  /** The stored choice, including `'system'`. */
  preference: ThemePreference;
  /** The theme actually in effect. Never `'system'`. */
  resolved: ColorScheme;
  setPreference: (preference: ThemePreference) => void;
  /** Flips between light and dark, resolving `'system'` first. */
  toggle: () => void;
}

/**
 * `null` means "no provider above me", which `useTheme` turns into a loud
 * error rather than silently rendering an unthemed tree.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
