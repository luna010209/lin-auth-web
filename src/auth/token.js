// Auth tokens and cached profile: sessionStorage (per browser tab; new tab must log in again).

import {
  AUTH_ACCESS_KEY,
  AUTH_REFRESH_KEY,
  AUTH_USER_KEY,
} from '../storage/keys';

export const ACCESS_KEY = AUTH_ACCESS_KEY;
export const REFRESH_KEY = AUTH_REFRESH_KEY;
export const USER_STORAGE_KEY = AUTH_USER_KEY;

const authStorage = () => sessionStorage;

/** Remove legacy auth keys from localStorage (pre-sessionStorage migration). */
export function clearLegacyAuthFromLocalStorage() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const getAccessToken = () => authStorage().getItem(ACCESS_KEY);
export const getRefreshToken = () => authStorage().getItem(REFRESH_KEY);

export const getStoredUserJson = () => authStorage().getItem(USER_STORAGE_KEY);

export const getValidAccessToken = () => {
  const token = getAccessToken();
  return isValidToken(token) ? token : null;
};

export const setTokens = ({ accessToken, refreshToken, user }) => {
  clearLegacyAuthFromLocalStorage();

  if (accessToken) authStorage().setItem(ACCESS_KEY, accessToken);
  if (refreshToken) authStorage().setItem(REFRESH_KEY, refreshToken);
  if (user) authStorage().setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const setStoredUser = (user) => {
  if (!user) return;
  authStorage().setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearTokens = () => {
  try {
    authStorage().removeItem(ACCESS_KEY);
    authStorage().removeItem(REFRESH_KEY);
    authStorage().removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
  clearLegacyAuthFromLocalStorage();
};

export const jwtDecode = (token) => {
  try {
    if (!token) return null;
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const isValidToken = (token) => {
  const decoded = jwtDecode(token);
  return !!decoded?.exp && decoded.exp > Date.now() / 1000;
};
