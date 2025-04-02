export type ColorTheme = {
  primary: string;
  primaryHover: string;
  background: string;
  backgroundHover: string;
  text: string;
  textLight: string;
  icon: string;
};

export type ThemeKey = 'paint' | 'service' | 'plant' | 'reminder';

interface ThemeColors {
  background: string;
  text: string;
  textLight: string;
  icon: string;
}

export const themes: Record<ThemeKey, ThemeColors> = {
  paint: {
    background: 'bg-violet-50',
    text: 'text-violet-900',
    textLight: 'text-violet-600',
    icon: 'text-violet-600'
  },
  service: {
    background: 'bg-amber-50',
    text: 'text-amber-900',
    textLight: 'text-amber-600',
    icon: 'text-amber-700'
  },
  plant: {
    background: 'bg-green-50',
    text: 'text-green-900',
    textLight: 'text-green-600',
    icon: 'text-green-700'
  },
  reminder: {
    background: 'bg-blue-50',
    text: 'text-blue-900',
    textLight: 'text-blue-600',
    icon: 'text-blue-600'
  }
};

export const getThemeClass = (theme: ThemeKey, type: keyof ThemeColors): string => {
  return themes[theme][type];
};

export const getBackgroundClasses = (theme: ThemeKey): string => {
  return `bg-${themes[theme].background} hover:bg-${themes[theme].backgroundHover}`;
};

export const getTextClasses = (theme: ThemeKey, isLight: boolean = false): string => {
  return `text-${themes[theme][isLight ? 'textLight' : 'text']}`;
}; 