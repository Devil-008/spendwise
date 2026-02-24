import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import Colors, { ThemeColors } from '@/constants/colors';
import { loadSettings, saveSettings } from '@/lib/storage';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  fontSize: number;
  toggleTheme: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetSettings: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setIsDark(s.darkMode);
      setFontSize(s.fontSize);
      setLoaded(true);
    });
  }, []);

  const persistSettings = useCallback((dark: boolean, size: number) => {
    saveSettings({ darkMode: dark, fontSize: size });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      persistSettings(next, fontSize);
      return next;
    });
  }, [fontSize, persistSettings]);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = Math.min(prev + 2, 24);
      persistSettings(isDark, next);
      return next;
    });
  }, [isDark, persistSettings]);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = Math.max(prev - 2, 12);
      persistSettings(isDark, next);
      return next;
    });
  }, [isDark, persistSettings]);

  const resetSettings = useCallback(() => {
    setIsDark(false);
    setFontSize(16);
    persistSettings(false, 16);
  }, [persistSettings]);

  const colors = isDark ? Colors.dark : Colors.light;

  const value = useMemo(() => ({
    isDark,
    colors,
    fontSize,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    resetSettings,
  }), [isDark, colors, fontSize, toggleTheme, increaseFontSize, decreaseFontSize, resetSettings]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
