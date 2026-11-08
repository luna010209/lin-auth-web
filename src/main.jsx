import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react'; // Add this
import createCache from '@emotion/cache';
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.jsx';
import './index.css';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { routesSection } from './routes/sections/index.jsx';
import { initI18n } from './locales/localesConfig.js';

const cache = createCache({
  key: 'mui',
  prepend: true,
});

// 2. Enable compatibility mode to silence the :first-child warning
cache.compat = true;

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    children: routesSection,
  },
]);

async function bootstrap() {
  await initI18n();

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <CacheProvider value={cache}>

        <HelmetProvider>
          <SnackbarProvider
            maxSnack={5}
            autoHideDuration={3500}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .SnackbarItem-contentRoot': {
                maxWidth: 400,
                borderRadius: 10,
              },
            }}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </HelmetProvider>
      </CacheProvider>
    </StrictMode>
  );
}

bootstrap();
