import { lazy } from 'react';
import { AuthGuard } from '../../auth/guard';
import { createPermissionLoader } from '../permissions';
import PrivateLayout from './layout/PrivateLayout';
import { paths } from '../paths';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/home/Home'));
const PersonaManagePage = lazy(() => import('src/pages/persona/Manage'));

/** Private paths: auth required */
export const privateRoutes = [
  {
    element: (
      <AuthGuard>
        <PrivateLayout />
      </AuthGuard>
    ),
    loader: createPermissionLoader,
    children: [
      { path: paths.main.home, element: <HomePage /> },
      { path: paths.persona.manage, element: <PersonaManagePage /> },
    ],
  },
];
