export interface ColorPalette {
  primary: string;
  primaryHover: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  white: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    700: string;
    800: string;
    900: string;
  };
  red: {
    50: string;
    100: string;
    200: string;
    500: string;
    800: string;
  };
  green: {
    50: string;
    100: string;
    200: string;
    500: string;
    800: string;
  };
  yellow: {
    50: string;
    100: string;
    200: string;
    500: string;
    800: string;
  };
  blue: {
    50: string;
    100: string;
    200: string;
    500: string;
    800: string;
  };
  blackAlpha: {
    100: string;
    500: string;
  };
}

export interface ThemeColorScheme {
  background: string;
  text: string;
  textLight: string;
  border: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeColors extends ColorPalette {
  background: string;
  text: string;
  textLight: string;
  border: string;
  icon: string;
  button: {
    primary: {
      background: string;
      text: string;
      hover: string;
      focus: string;
      disabled: string;
      disabledText: string;
    };
    secondary: {
      background: string;
      text: string;
      hover: string;
      focus: string;
      disabled: string;
      disabledText: string;
    };
    outline: {
      background: string;
      text: string;
      hover: string;
      focus: string;
      disabled: string;
      disabledText: string;
    };
  };
  input: {
    background: string;
    text: string;
    border: string;
    focus: string;
    placeholder: string;
    error: string;
    disabled: string;
    disabledText: string;
  };
  select: {
    background: string;
    text: string;
    border: string;
    focus: string;
    placeholder: string;
    error: string;
    disabled: string;
    disabledText: string;
    option: {
      background: string;
      text: string;
      hover: string;
      selected: string;
      selectedText: string;
    };
  };
  checkbox: {
    background: string;
    border: string;
    checked: string;
    focus: string;
    disabled: string;
    label: string;
  };
  radio: {
    background: string;
    border: string;
    checked: string;
    focus: string;
    disabled: string;
    label: string;
  };
  switch: {
    background: string;
    checked: string;
    focus: string;
    disabled: string;
    handle: string;
  };
  modal: {
    background: string;
    overlay: string;
    border: string;
    shadow: string;
  };
  tooltip: {
    background: string;
    text: string;
    border: string;
    shadow: string;
  };
  popover: {
    background: string;
    text: string;
    border: string;
    shadow: string;
  };
  dropdown: {
    background: string;
    text: string;
    border: string;
    shadow: string;
    item: {
      background: string;
      text: string;
      hover: string;
      selected: string;
      selectedText: string;
      disabled: string;
      disabledText: string;
    };
  };
  table: {
    background: string;
    text: string;
    border: string;
    header: {
      background: string;
      text: string;
      border: string;
    };
    row: {
      background: string;
      text: string;
      hover: string;
      selected: string;
      selectedText: string;
      border: string;
    };
    cell: {
      background: string;
      text: string;
      border: string;
    };
  };
  pagination: {
    background: string;
    text: string;
    border: string;
    active: {
      background: string;
      text: string;
      border: string;
    };
    hover: {
      background: string;
      text: string;
      border: string;
    };
    disabled: {
      background: string;
      text: string;
      border: string;
    };
  };
  tabs: {
    background: string;
    text: string;
    border: string;
    active: {
      background: string;
      text: string;
      border: string;
    };
    hover: {
      background: string;
      text: string;
      border: string;
    };
    disabled: {
      background: string;
      text: string;
      border: string;
    };
  };
  accordion: {
    background: string;
    text: string;
    border: string;
    header: {
      background: string;
      text: string;
      hover: string;
      active: string;
      activeText: string;
      border: string;
    };
    content: {
      background: string;
      text: string;
      border: string;
    };
  };
  card: {
    background: string;
    text: string;
    border: string;
    shadow: string;
    header: {
      background: string;
      text: string;
      border: string;
    };
    footer: {
      background: string;
      text: string;
      border: string;
    };
  };
  alert: {
    success: {
      background: string;
      text: string;
      border: string;
      icon: string;
    };
    error: {
      background: string;
      text: string;
      border: string;
      icon: string;
    };
    warning: {
      background: string;
      text: string;
      border: string;
      icon: string;
    };
    info: {
      background: string;
      text: string;
      border: string;
      icon: string;
    };
  };
  badge: {
    success: {
      background: string;
      text: string;
    };
    error: {
      background: string;
      text: string;
    };
    warning: {
      background: string;
      text: string;
    };
    info: {
      background: string;
      text: string;
    };
  };
  progress: {
    background: string;
    fill: string;
    text: string;
  };
  skeleton: {
    background: string;
    animation: string;
  };
  avatar: {
    background: string;
    text: string;
    border: string;
    placeholder: string;
  };
  divider: {
    background: string;
    text: string;
  };
} 