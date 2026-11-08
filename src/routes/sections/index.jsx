import { lazy } from 'react';
import { noAuthRoutes } from './SignUpLogin';
import { publicRoutes } from './Public';
import { privateRoutes } from './Private';
import { paths } from '../paths';

// ----------------------------------------------------------------------

const NotFoundPage = lazy(() => import('src/pages/error/NotFound'));
const NotAllowedPage = lazy(() => import('src/pages/error/NotAllowed'));

export const routesSection = [
  ...privateRoutes,
  ...publicRoutes,
  ...noAuthRoutes,

  { path: paths.notAllowed, element: <NotAllowedPage /> },
  { path: paths.notFound, element: <NotFoundPage /> },
  { path: '*', element: <NotFoundPage /> },
];
