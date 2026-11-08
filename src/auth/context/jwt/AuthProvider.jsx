// src/auth/context/jwt/AuthProvider.jsx
import { useMemo, useEffect, useCallback, useState } from 'react';

import { AuthContext } from '../AuthContext';
import { getCurrentUser } from '../../../api/services/userService';
import {
  clearLegacyAuthFromLocalStorage,
  clearTokens,
  getAccessToken,
  setStoredUser,
} from '../../../auth/token';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async (options = {}) => {
    const { strict = false } = options;

    try {
      const token = getAccessToken();

      if (!token) {
        clearTokens();
        setUser(null);
        setLoading(false);
        if (strict) {
          throw new Error('No access token found');
        }
        return false;
      }

      const sessionUser = await getCurrentUser();

      if (!sessionUser?.id && !sessionUser?.username) {
        throw new Error('Session profile is incomplete');
      }

      setUser(sessionUser);
      setStoredUser(sessionUser);
      setLoading(false);
      return true;
    } catch (e) {
      console.error('Error checking user session:', e);
      clearTokens();
      setUser(null);
      setLoading(false);
      if (strict) {
        throw e;
      }
      return false;
    }
  }, []);

  useEffect(() => {
    clearLegacyAuthFromLocalStorage();
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      checkUserSession,
      logout,
      loading,
      authenticated: !loading && !!user,
    }),
    [user, loading, checkUserSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}