import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthLayout } from '../../../layouts/AuthLayout';
import { LoadingScreen } from '../../../components/loadingScreen/LoadingScreen';

// ----------------------------------------------------------------------

/** Private shell: auth-required pages only */
export default function PrivateLayout() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </AuthLayout>
  );
}
