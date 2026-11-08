// src/auth/context/AuthContext.js
import { createContext } from 'react';

// ----------------------------------------------------------------------

export const AuthContext = createContext({
  user: null,
  loading: true,
  authenticated: false,
  checkUserSession: async () => {},
  setUser: () => {},
  logout: () => {},
});