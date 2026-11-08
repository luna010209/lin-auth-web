import { themeConfig } from "../../theme/themeConfig";
import { APP_SETTINGS_KEY } from '../../storage/keys';

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY = APP_SETTINGS_KEY;

// ----------------------------------------------------------------------

export const defaultSettings = {
  colorScheme: themeConfig.defaultMode,
  direction: themeConfig.direction,
  contrast: 'default',
  navLayout: 'vertical',
  primaryColor: 'default',
  navColor: 'integrate',
  compactLayout: true,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
};
