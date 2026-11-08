import { Navigate } from 'react-router-dom';

import { useAuthContext } from '../hooks';
import { paths } from '../../routes/paths';
import { usePathname } from '../../routes/hooks/usePathname';
import { SplashScreen } from '../../components/loadingScreen/SplashScreen';

// ----------------------------------------------------------------------

export function AuthGuard({ children }) {
  const pathname = usePathname();
  const { authenticated, loading } = useAuthContext();

  if (loading) {
    return <SplashScreen />;
  }

  if (!authenticated) {
    const queryString = new URLSearchParams({
      returnTo: pathname || paths.main.home,
    }).toString();

    return <Navigate to={`${paths.auth.login}?${queryString}`} replace />;
  }

  return <>{children}</>;
}
