import { useAuthContext } from '../hooks';
import { useSearchParams } from '../../routes/hooks/useSearchParams';
import { SplashScreen } from '../../components/loadingScreen/SplashScreen';
import { Navigate } from 'react-router-dom';
import { CONFIG } from '../../globalConfig';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const searchParams = useSearchParams();
  const { loading, authenticated } = useAuthContext();

  const returnTo =
    searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  if (loading) {
    return <SplashScreen />;
  }

  if (authenticated) {
    return <Navigate to={returnTo} replace />;
  }

  return <>{children}</>;
}
