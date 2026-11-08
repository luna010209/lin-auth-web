import { countries } from "../assets/data/countries";
import { getCurrentUser } from "../api/services/userService";
import { getAccessToken, getStoredUserJson, jwtDecode, setStoredUser } from "../auth/token";

export const getUserInfo = () => {
  try {
    const storedData = getStoredUserJson();
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData);

    // Zustand-style persist: { state: { user } }
    if (parsedData?.state?.user) {
      return parsedData.state.user;
    }

    // AuthProvider / login: user object stored directly
    if (parsedData?.id != null || parsedData?.username != null) {
      return parsedData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing user data from session storage: ', error);
    return null;
  }
};

export const getUserRole = () => {
  try {
    const userInfo = getUserInfo();
    return userInfo?.roles || [];
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return [];
  }
};

export const getUserTimeZone = () => {
  try {
    const userInfo = getUserInfo();
    return userInfo?.timezone || 'UTC';
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return 'UTC';
  }
};

export const getUserCurrencyCode = () => {
  try {
    const userInfo = getUserInfo();
    return userInfo?.currency || '';
  } catch (error) {
    console.error('Error getting user currency code:', error);
    return '';
  }
};

export const getUserCountryCode = () => {
  try {
    const currency = getUserCurrencyCode();
    if (!currency) return '';

    const country = countries.find((c) => c.currency?.code === currency);
    return country?.code || '';
  } catch (error) {
    console.error('Error getting user country code:', error);
    return '';
  }
};

export const hasAdminRole = (roles = []) => {
  const list = Array.isArray(roles) ? roles : [];
  return list.some(
    (role) => String(role).toUpperCase() === 'ROLE_ADMIN' || String(role).toUpperCase() === 'ADMIN'
  );
};

export const isAdmin = (roles) => hasAdminRole(roles ?? getUserRole());

/** Whether the current access token includes ROLE_ADMIN (used by API authorization). */
export const jwtHasAdminRole = () => {
  const claims = jwtDecode(getAccessToken());
  if (!claims?.auth) return false;

  return String(claims.auth)
    .split(',')
    .some((role) => {
      const normalized = String(role).trim().toUpperCase();
      return normalized === 'ROLE_ADMIN' || normalized === 'ADMIN';
    });
};

/** Profile says admin but JWT was issued before the role was granted. */
export const isStaleAdminSession = () => isAdmin() && !jwtHasAdminRole();

export const saveUserToStorage = (user) => {
  setStoredUser(user);
};

/** Refresh profile from GET /me and persist to session storage (for route guards). */
export const refreshSessionUser = async () => {
  const user = await getCurrentUser();
  saveUserToStorage(user);
  return user;
};
