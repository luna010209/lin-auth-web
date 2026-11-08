import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { SplashScreen } from '../../components/loadingScreen/SplashScreen';
import { AuthSplitLayout } from '../../layouts/authSplit/Layouts';
import { GuestGuard } from '../../auth/guard';
import { LoadingScreen } from '../../components/loadingScreen/LoadingScreen';
import { NoAuthLayout } from '../../layouts/NoAuthLayout';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const SignUpPage = lazy(() => import('src/pages/auth/SignUp'));
const LoginPage = lazy(() => import('src/pages/auth/Login'));

const singUpLogin = () => (
  <NoAuthLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </NoAuthLayout>
);

const authJwt = {
  element: singUpLogin(),
  children: [

    // 📝 Sign Up
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },

    // 🔐 Log In
    {
      path: 'login',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <LoginPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const noAuthRoutes = [
  {
    path: '',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt],
  },
];
