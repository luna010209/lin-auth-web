import { Outlet } from 'react-router';
import { Suspense } from 'react';
import { useAuthContext } from '../../../auth/hooks';
import { SplashScreen } from '../../../components/loadingScreen/SplashScreen';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { NoAuthPublicLayout } from '../../../layouts/NoAuthPublicLayout';

// ----------------------------------------------------------------------

/** Public shell: list/detail pages (works for guests + logged-in users) */
export default function PublicLayout() {
  const { loading, authenticated } = useAuthContext();

  if (loading) return <SplashScreen />;

  return authenticated ? (
    <AuthLayout>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </AuthLayout>
  ) : (
    <NoAuthPublicLayout>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </NoAuthPublicLayout>
  );
}
