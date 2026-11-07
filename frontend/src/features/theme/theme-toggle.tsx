'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const next = preference === 'system' ? 'dark' : preference === 'dark' ? 'light' : 'system';
  const label = preference === 'system' ? 'System' : preference === 'dark' ? 'Dark' : 'Light';
  return (
    <button
      aria-label={`Theme: ${label}. Switch to ${next} theme`}
      className="min-h-10 rounded-control border border-border px-3 text-sm font-medium text-primary transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      onClick={() => setPreference(next)}
      type="button"
    >
      {label} theme
    </button>
  );
}
