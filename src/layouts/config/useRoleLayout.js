import { useMemo } from 'react';

import { useAuthContext } from 'src/auth/context';

import { getPrimaryRole, getNavConfigByRole } from './roleConfig';

/**
 * Custom hook to get layout configuration based on user role
 */
export function useRoleLayout() {
  const { user } = useAuthContext();

  const userRole = useMemo(() => getPrimaryRole(user?.authorities), [user?.authorities]);

  const navConfig = useMemo(() => getNavConfigByRole(userRole), [userRole]);

  return {
    userRole,
    navConfig,
    user,
  };
}

/**
 * Layout Provider Component
 */
export function RoleLayoutProvider({ children }) {
  useAuthContext();
  return children;
}
