import React, { createContext, useContext } from 'react';

const colors = {
  paper:      '#f1e6cb',
  paper2:     '#e9dcb9',
  card:       '#f8efd5',
  card2:      '#fbf5e2',
  ink:        '#2a2218',
  ink2:       '#5a4d3d',
  muted:      '#8e7e68',
  muted2:     '#b2a48a',
  rule:       '#d6c6a3',
  ruleSoft:   '#e2d6b6',
  accent:     '#8b3a2e',
  accentSoft: 'rgba(139,58,46,0.10)',
  ok:         '#4a6b3a',
} as const;

const fonts = {
  reading: "'Newsreader', 'Lora', Georgia, serif",
  ui:      "'DM Sans', system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, monospace",
} as const;

export type Colors = typeof colors;
export type Fonts  = typeof fonts;
export type Theme  = { colors: Colors; fonts: Fonts };

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors, fonts }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
