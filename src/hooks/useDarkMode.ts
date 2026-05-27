'use client';
import { useState, useEffect } from 'react';

export type ThemeId =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'emerald'
  | 'synthwave'
  | 'retro'
  | 'halloween'
  | 'forest'
  | 'wireframe'
  | 'dracula'
  | 'coffee'
  | 'abyss'
  | 'sunset'
  | 'silk';

export function useDarkMode() {
  const [theme, setTheme] = useState<ThemeId>('light');

  useEffect(() => {
    // Check local storage or system preference on mount
    const stored = localStorage.getItem('txts_v2_theme') as ThemeId | null;
    if (stored) {
      setTheme(stored);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Update data-theme on HTML element
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('txts_v2_theme', theme);
    
    // Also toggle the 'dark' variant class on document.documentElement for legacy Tailwind/CSS classes
    const isDarkTheme = ['dark', 'synthwave', 'halloween', 'forest', 'dracula', 'coffee', 'abyss', 'sunset'].includes(theme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const selectTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
  };

  const isDark = ['dark', 'synthwave', 'halloween', 'forest', 'dracula', 'coffee', 'abyss', 'sunset'].includes(theme);

  return { isDark, theme, toggleDarkMode, selectTheme };
}
