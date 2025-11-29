import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

interface Theme {
  mode: ThemeMode;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  border: string;
  cardBg: string;
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const themes: Record<ThemeMode, Theme> = {
  light: {
    mode: 'light',
    background: '#f9f6f0', // warm yellowish white
    backgroundSecondary: '#f5f3f0',
    text: '#2a2a2a',
    textSecondary: '#6b7280',
    primary: '#8b7355', // warm brown/taupe
    primaryHover: '#6d5a43',
    border: '#e5d5c0',
    cardBg: '#ffffff',
  },
  dark: {
    mode: 'dark',
    background: '#1a1a1a',
    backgroundSecondary: '#2d2d2d',
    text: '#f5f5f5',
    textSecondary: '#a3a3a3',
    primary: '#d4a574', // warm accent
    primaryHover: '#c49563',
    border: '#404040',
    cardBg: '#262626',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode;
    return saved && themes[saved] ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    const theme = themes[mode];

    // Update CSS variables
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-hover', theme.primaryHover);

    // Update body background and dark class
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;

    if (mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme: themes[mode],
    mode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
