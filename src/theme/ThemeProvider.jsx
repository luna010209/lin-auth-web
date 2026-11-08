import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { useSettingsContext } from '../components/settings/context/useSettingsContext';
import { Rtl } from './withSettings';
import { createTheme } from './createTheme';

// ----------------------------------------------------------------------

export function ThemeProvider({ themeOverrides, children, ...other }) {
  const settings = useSettingsContext();

  const theme = createTheme({
    settingsState: settings.state,
    themeOverrides,
  });

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      <Rtl direction={settings.state.direction}>{children}</Rtl>
    </ThemeVarsProvider>
  );
}
