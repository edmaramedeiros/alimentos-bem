import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

/**
 * Paleta oficial da marca Edmara Medeiros (alimentos do bem).
 * Fonte: manual de marca da Agência Transcender (2024).
 */
export const brand = {
  oliveDark: '#70754D',
  oliveLight: '#C6C664',
  cream: '#F4EFEB',
  tan: '#ECCFB1',
  terracotta: '#DC9251',
  orange: '#FE9150',
  brickRed: '#A74C39',
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.oliveDark,
    onPrimary: brand.cream,
    primaryContainer: brand.oliveLight,
    onPrimaryContainer: brand.oliveDark,
    secondary: brand.terracotta,
    onSecondary: brand.cream,
    secondaryContainer: brand.tan,
    onSecondaryContainer: brand.brickRed,
    error: brand.brickRed,
    background: brand.cream,
    onBackground: brand.oliveDark,
    surface: brand.cream,
    onSurface: brand.oliveDark,
    surfaceVariant: brand.tan,
    onSurfaceVariant: brand.oliveDark,
    outline: brand.oliveLight,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.oliveLight,
    onPrimary: brand.oliveDark,
    primaryContainer: brand.oliveDark,
    onPrimaryContainer: brand.oliveLight,
    secondary: brand.orange,
    onSecondary: brand.brickRed,
    secondaryContainer: brand.brickRed,
    onSecondaryContainer: brand.tan,
    error: brand.orange,
    background: '#2A2C1F',
    onBackground: brand.cream,
    surface: '#2A2C1F',
    onSurface: brand.cream,
  },
};
