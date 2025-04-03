import type { ColorPalette, ThemeColorScheme, ThemeColors as ThemeColorsType } from '../types/theme';

export type ThemeKey = 'paint' | 'service' | 'plant' | 'reminder';

interface ThemeColors {
  background: string;
  backgroundHover: string;
  text: string;
  textLight: string;
  icon: string;
  border: string;
}

export const themes: Record<ThemeKey, ThemeColors> = {
  paint: {
    background: 'bg-violet-50',
    backgroundHover: 'hover:bg-violet-100',
    text: 'text-violet-900',
    textLight: 'text-violet-600',
    icon: 'text-violet-600',
    border: 'border-violet-200'
  },
  service: {
    background: 'bg-amber-50',
    backgroundHover: 'hover:bg-amber-100',
    text: 'text-amber-900',
    textLight: 'text-amber-600',
    icon: 'text-amber-700',
    border: 'border-amber-200'
  },
  plant: {
    background: 'bg-green-50',
    backgroundHover: 'hover:bg-green-100',
    text: 'text-green-900',
    textLight: 'text-green-600',
    icon: 'text-green-700',
    border: 'border-green-200'
  },
  reminder: {
    background: 'bg-blue-50',
    backgroundHover: 'hover:bg-blue-100',
    text: 'text-blue-900',
    textLight: 'text-blue-600',
    icon: 'text-blue-600',
    border: 'border-blue-200'
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

const colors = {
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#A5B4FC',
  secondary: '#8B5CF6',
  secondaryDark: '#7C3AED',
  secondaryLight: '#C4B5FD',
  white: '#FFFFFF',
  gray: {
    100: '#F3F4F6',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',
    800: '#B91C1C'
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    800: '#15803D'
  },
  yellow: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    800: '#A16207'
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    800: '#1E40AF'
  },
  blackAlpha: {
    500: 'rgba(0, 0, 0, 0.5)'
  }
};

const baseColors: ColorPalette = {
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  secondary: '#6B7280',
  secondaryDark: '#4B5563',
  secondaryLight: '#9CA3AF',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',
    800: '#991B1B',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    500: '#22C55E',
    800: '#166534',
  },
  yellow: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    500: '#F59E0B',
    800: '#92400E',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    800: '#1E40AF',
  },
  blackAlpha: {
    100: 'rgba(0, 0, 0, 0.1)',
    500: 'rgba(0, 0, 0, 0.5)',
  },
};

const themeColors: ThemeColorsType = {
  ...baseColors,
  background: baseColors.white,
  text: baseColors.gray[900],
  textLight: baseColors.gray[500],
  border: baseColors.gray[200],
  icon: baseColors.gray[500],
  button: {
    primary: {
      background: baseColors.primary,
      text: baseColors.white,
      hover: baseColors.primaryHover,
      focus: baseColors.primaryDark,
      disabled: baseColors.gray[200],
      disabledText: baseColors.gray[400],
    },
    secondary: {
      background: baseColors.secondary,
      text: baseColors.white,
      hover: baseColors.secondaryDark,
      focus: baseColors.secondaryDark,
      disabled: baseColors.gray[200],
      disabledText: baseColors.gray[400],
    },
    outline: {
      background: 'transparent',
      text: baseColors.primary,
      hover: baseColors.primaryLight,
      focus: baseColors.primary,
      disabled: baseColors.gray[200],
      disabledText: baseColors.gray[400],
    },
  },
  input: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[300],
    focus: baseColors.primary,
    placeholder: baseColors.gray[400],
    error: baseColors.red[500],
    disabled: baseColors.gray[100],
    disabledText: baseColors.gray[400],
  },
  select: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[300],
    focus: baseColors.primary,
    placeholder: baseColors.gray[400],
    error: baseColors.red[500],
    disabled: baseColors.gray[100],
    disabledText: baseColors.gray[400],
    option: {
      background: baseColors.white,
      text: baseColors.gray[900],
      hover: baseColors.gray[100],
      selected: baseColors.primary,
      selectedText: baseColors.white,
    },
  },
  checkbox: {
    background: baseColors.white,
    border: baseColors.gray[300],
    checked: baseColors.primary,
    focus: baseColors.primary,
    disabled: baseColors.gray[200],
    label: baseColors.gray[900],
  },
  radio: {
    background: baseColors.white,
    border: baseColors.gray[300],
    checked: baseColors.primary,
    focus: baseColors.primary,
    disabled: baseColors.gray[200],
    label: baseColors.gray[900],
  },
  switch: {
    background: baseColors.gray[200],
    checked: baseColors.primary,
    focus: baseColors.primary,
    disabled: baseColors.gray[200],
    handle: baseColors.white,
  },
  modal: {
    background: baseColors.white,
    overlay: baseColors.blackAlpha[500],
    border: baseColors.gray[200],
    shadow: baseColors.blackAlpha[100],
  },
  tooltip: {
    background: baseColors.gray[800],
    text: baseColors.white,
    border: baseColors.gray[700],
    shadow: baseColors.blackAlpha[100],
  },
  popover: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    shadow: baseColors.blackAlpha[100],
  },
  dropdown: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    shadow: baseColors.blackAlpha[100],
    item: {
      background: baseColors.white,
      text: baseColors.gray[900],
      hover: baseColors.gray[100],
      selected: baseColors.primary,
      selectedText: baseColors.white,
      disabled: baseColors.gray[100],
      disabledText: baseColors.gray[400],
    },
  },
  table: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    header: {
      background: baseColors.gray[50],
      text: baseColors.gray[700],
      border: baseColors.gray[200],
    },
    row: {
      background: baseColors.white,
      text: baseColors.gray[900],
      hover: baseColors.gray[50],
      selected: baseColors.primary,
      selectedText: baseColors.white,
      border: baseColors.gray[200],
    },
    cell: {
      background: baseColors.white,
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
  },
  pagination: {
    background: baseColors.white,
    text: baseColors.gray[700],
    border: baseColors.gray[200],
    active: {
      background: baseColors.primary,
      text: baseColors.white,
      border: baseColors.primary,
    },
    hover: {
      background: baseColors.gray[100],
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
    disabled: {
      background: baseColors.gray[100],
      text: baseColors.gray[400],
      border: baseColors.gray[200],
    },
  },
  tabs: {
    background: baseColors.white,
    text: baseColors.gray[700],
    border: baseColors.gray[200],
    active: {
      background: baseColors.primary,
      text: baseColors.white,
      border: baseColors.primary,
    },
    hover: {
      background: baseColors.gray[100],
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
    disabled: {
      background: baseColors.gray[100],
      text: baseColors.gray[400],
      border: baseColors.gray[200],
    },
  },
  accordion: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    header: {
      background: baseColors.white,
      text: baseColors.gray[900],
      hover: baseColors.gray[50],
      active: baseColors.primary,
      activeText: baseColors.white,
      border: baseColors.gray[200],
    },
    content: {
      background: baseColors.white,
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
  },
  card: {
    background: baseColors.white,
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    shadow: baseColors.blackAlpha[100],
    header: {
      background: baseColors.gray[50],
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
    footer: {
      background: baseColors.gray[50],
      text: baseColors.gray[900],
      border: baseColors.gray[200],
    },
  },
  alert: {
    success: {
      background: baseColors.green[50],
      text: baseColors.green[800],
      border: baseColors.green[200],
      icon: baseColors.green[500],
    },
    error: {
      background: baseColors.red[50],
      text: baseColors.red[800],
      border: baseColors.red[200],
      icon: baseColors.red[500],
    },
    warning: {
      background: baseColors.yellow[50],
      text: baseColors.yellow[800],
      border: baseColors.yellow[200],
      icon: baseColors.yellow[500],
    },
    info: {
      background: baseColors.blue[50],
      text: baseColors.blue[800],
      border: baseColors.blue[200],
      icon: baseColors.blue[500],
    },
  },
  badge: {
    success: {
      background: baseColors.green[100],
      text: baseColors.green[800],
    },
    error: {
      background: baseColors.red[100],
      text: baseColors.red[800],
    },
    warning: {
      background: baseColors.yellow[100],
      text: baseColors.yellow[800],
    },
    info: {
      background: baseColors.blue[100],
      text: baseColors.blue[800],
    },
  },
  progress: {
    background: baseColors.gray[200],
    fill: baseColors.primary,
    text: baseColors.gray[900],
  },
  skeleton: {
    background: baseColors.gray[200],
    animation: baseColors.gray[100],
  },
  avatar: {
    background: baseColors.gray[100],
    text: baseColors.gray[900],
    border: baseColors.gray[200],
    placeholder: baseColors.gray[400],
  },
  divider: {
    background: baseColors.gray[200],
    text: baseColors.gray[500],
  },
};

const themeSchemes: Record<'light' | 'dark', ThemeColorScheme> = {
  light: {
    background: baseColors.white,
    text: baseColors.gray[900],
    textLight: baseColors.gray[500],
    border: baseColors.gray[200],
    primary: baseColors.primary,
    primaryHover: baseColors.primaryHover,
    secondary: baseColors.secondary,
    secondaryHover: baseColors.secondaryDark,
    error: baseColors.red[500],
    success: baseColors.green[500],
    warning: baseColors.yellow[500],
    info: baseColors.blue[500],
  },
  dark: {
    background: baseColors.gray[900],
    text: baseColors.white,
    textLight: baseColors.gray[400],
    border: baseColors.gray[800],
    primary: baseColors.primaryLight,
    primaryHover: baseColors.primary,
    secondary: baseColors.secondaryLight,
    secondaryHover: baseColors.secondary,
    error: baseColors.red[500],
    success: baseColors.green[500],
    warning: baseColors.yellow[500],
    info: baseColors.blue[500],
  },
};

export const getThemeColors = (theme: 'light' | 'dark'): ThemeColorsType => {
  const scheme = themeSchemes[theme];
  return {
    ...themeColors,
    ...scheme,
  };
}; 