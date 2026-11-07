'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ThemePreference = 'system' | 'light' | 'dark';
type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'salesmora-theme';

function applyTheme(preference: ThemePreference) {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const initial = saved === 'dark' || saved === 'light' ? saved : 'system';
    setPreferenceState(initial);
    applyTheme(initial);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystem = () => {
      if (initial === 'system') applyTheme('system');
    };
    media.addEventListener('change', updateSystem);
    return () => media.removeEventListener('change', updateSystem);
  }, []);
  const setPreference = useCallback((value: ThemePreference) => {
    localStorage.setItem(storageKey, value);
    setPreferenceState(value);
    applyTheme(value);
  }, []);
  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider.');
  return context;
}
