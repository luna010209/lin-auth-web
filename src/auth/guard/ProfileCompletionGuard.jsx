import { Navigate } from 'react-router-dom';

import { useAuthContext } from '../hooks';
import { usePathname } from '../../routes/hooks/usePathname';
import { paths } from '../../routes/paths';
import { isProfileIncomplete } from '../../utils/profile';

// ----------------------------------------------------------------------

/** Redirect incomplete profiles to `/profile` (except when already there). */
export function ProfileCompletionGuard({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  if (loading || !user) {
    return children;
  }

  const onProfile = pathname === paths.profile.root || pathname.startsWith(`${paths.profile.root}/`);

  if (isProfileIncomplete(user) && !onProfile) {
    return (
      <Navigate
        to={`${paths.profile.root}?onboarding=1`}
        replace
        state={{ from: pathname }}
      />
    );
  }

  return children;
}
