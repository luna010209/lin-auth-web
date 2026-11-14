import { lazy } from 'react';
import { AuthGuard } from '../../auth/guard';
import { PersonaOnboardingGuard } from '../../auth/guard/PersonaOnboardingGuard';
import { ProfileCompletionGuard } from '../../auth/guard/ProfileCompletionGuard';
import { createPermissionLoader } from '../permissions';
import PrivateLayout from './layout/PrivateLayout';
import { paths } from '../paths';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/home/Home'));
const PersonaManagePage = lazy(() => import('src/pages/persona/Manage'));
const ProfilePage = lazy(() => import('src/pages/profile/Profile'));

/** Private paths: auth required */
export const privateRoutes = [
  {
    element: (
      <AuthGuard>
        <ProfileCompletionGuard>
          <PersonaOnboardingGuard>
            <PrivateLayout />
          </PersonaOnboardingGuard>
        </ProfileCompletionGuard>
      </AuthGuard>
    ),
    loader: createPermissionLoader,
    children: [
      { path: paths.main.home, element: <HomePage /> },
      { path: paths.profile.root, element: <ProfilePage /> },
      { path: paths.persona.manage, element: <PersonaManagePage /> },
    ],
  },
];
