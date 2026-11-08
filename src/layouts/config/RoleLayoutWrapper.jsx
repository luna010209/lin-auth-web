/* eslint-disable react-refresh/only-export-components */
import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useAuthContext } from 'src/auth/context';
import { ForbiddenIllustration } from 'src/assets/illustrations';

import { hasPermission, getPrimaryRole } from './roleConfig';

/**
 * HOC to wrap layout components with role-based access control
 */
export function withRoleLayout(LayoutComponent, requiredFeature = null) {
  return function RoleLayoutWrapper(props) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const { user } = useAuthContext();

    const userRole = useMemo(() => getPrimaryRole(user?.authorities), [user?.authorities]);

    const hasAccess = !requiredFeature || hasPermission(userRole, requiredFeature);

    if (!hasAccess) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 2,
          }}
        >
          <ForbiddenIllustration sx={{ height: 260, mb: 2 }} />
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            You don't have permission to access this feature. Please contact your administrator.
          </Alert>
        </Box>
      );
    }

    return <LayoutComponent {...props} isDesktop={isDesktop} userRole={userRole} />;
  };
}

/**
 * Component to check feature access
 */
export function FeatureAccessGate({ feature, fallback, children }) {
  const { user } = useAuthContext();
  const userRole = useMemo(() => getPrimaryRole(user?.authorities), [user?.authorities]);

  const hasAccess = useMemo(() => hasPermission(userRole, feature), [userRole, feature]);

  if (!hasAccess) {
    return fallback || null;
  }

  return children;
}
