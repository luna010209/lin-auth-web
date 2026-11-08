import 'src/index.css';

import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedNavigate } from './api/axios';
import { MotionLazy } from './components/animate/MotionLazy';
import { Snackbar } from './components/snackbar/Snackbar';
import { ProgressBar } from './components/progressBar/ProgressBar';
import { themeConfig } from './theme/themeConfig';
import { usePathname } from './routes/hooks/usePathname';
import { ThemeProvider } from './theme/ThemeProvider';
import { defaultSettings } from './components/settings/settingsConfig';
import { SettingsProvider } from './components/settings';
import { AuthProvider } from './auth/context/jwt/AuthProvider';
import { I18nProvider, LocalizationProvider } from './locales';
import { LanguageProvider } from './locales/langs/LanguageProvider';
import { SettingsDrawer } from './components/settings/drawer/SettingsDrawer';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


// ----------------------------------------------------------------------

export default function App({ children }) {
  return (
    <AppContent>{children}</AppContent>
  );
}

function AppContent({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedNavigate((path, options) => navigate(path, options));
    return () => setUnauthorizedNavigate(null);
  }, [navigate]);

  useHandlePreloadError();
  useScrollToTop();

  return (
    <I18nProvider>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider defaultSettings={defaultSettings}>
            <ThemeProvider
              noSsr
              defaultMode={themeConfig.defaultMode}
              modeStorageKey={themeConfig.modeStorageKey}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MotionLazy>
                  <Snackbar />
                  <ProgressBar />
                  <SettingsDrawer defaultSettings={defaultSettings} />
                  {children}
                </MotionLazy>
              </LocalizationProvider>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </I18nProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function useHandlePreloadError() {
  const handlePreloadError = useCallback((event) => {
    event.preventDefault();
    window.location.reload();
  }, []);

  useEffect(() => {
    window.addEventListener('vite:preloadError', handlePreloadError);

    return () => {
      window.removeEventListener('vite:preloadError', handlePreloadError);
    };
  }, [handlePreloadError]);
}
