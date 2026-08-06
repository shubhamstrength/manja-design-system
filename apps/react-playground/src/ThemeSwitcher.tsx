import { useTheme, type ThemePreference } from '@manja/react';

const OPTIONS: ThemePreference[] = ['light', 'system', 'dark'];

export function ThemeSwitcher() {
  const { preference, resolved, setPreference } = useTheme();

  return (
    <div className="pg-controls">
      <div className="pg-controls" role="group" aria-label="Colour theme">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className="pg-button"
            aria-pressed={preference === option}
            onClick={() => setPreference(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <span className="pg-badge">resolved: {resolved}</span>
    </div>
  );
}
