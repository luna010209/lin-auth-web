import axios from 'axios';
import i18next from 'i18next';

import { CONFIG } from '../globalConfig';
import { clearTokens, getAccessToken } from '../auth/token';

// ----------------------------------------------------------------------

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/sign-up',
  '/auth/app',
  '/auth/app/register',
  '/auth/find-username',
  '/auth/find-password',
  '/auth/email-verification/send-mail',
  '/auth/email-verification/verify',
];

const AUTH_GUEST_PATHS = ['/login', '/sign-up'];

let unauthorizedNavigate = null;

/** Register SPA navigation for session expiry (avoids full page reload). */
export const setUnauthorizedNavigate = (navigate) => {
  unauthorizedNavigate = navigate;
};

const parseErrorMessage = (error) => {
  const errorData = (error.response && error.response.data) || 'Something went wrong!';

  if (typeof errorData === 'object' && errorData !== null && errorData.message) {
    return {
      ...errorData,
      message: String(errorData.message).replace('Server Error: ', ''),
    };
  }

  if (typeof errorData === 'string') {
    return errorData.replace('Server Error: ', '');
  }

  return errorData;
};

const isPublicAuthRequest = (config) => {
  const url = config?.url || '';
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

const isAuthGuestPage = () => AUTH_GUEST_PATHS.includes(window.location.pathname);

/** Extract a user-facing message from axios or interceptor rejections */
export const getApiErrorMessage = (error, fallback = 'Something went wrong!') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error.message) return String(error.message);
  if (error.response?.data?.message) return String(error.response.data.message);
  if (typeof error.response?.data === 'string') return error.response.data;
  return fallback;
};

/** Unwrap ApiResponse envelope from lin-auth / lin-langa APIs */
export const unwrapApiData = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'success')) {
    return body.data ?? null;
  }
  return body ?? null;
};

const unwrapSuccessResponse = (response) => {
  response.data = unwrapApiData(response);
  return response;
};

const handleAuthError = (error) => {
  const status = error.response?.status;

  if (status === 401) {
    const parsed = parseErrorMessage(error);
    const skipSessionRedirect = isPublicAuthRequest(error.config) || isAuthGuestPage();

    if (!skipSessionRedirect) {
      clearTokens();
      if (unauthorizedNavigate) {
        unauthorizedNavigate('/login', { replace: true });
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(parsed);
  }

  if (status === 403) {
    return Promise.reject(error);
  }

  return Promise.reject(parseErrorMessage(error));
};

// ----------------------------------------------------------------------

const publicApi = axios.create({
  baseURL: CONFIG.serverUrl,
});

publicApi.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = i18next.language || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

publicApi.interceptors.response.use(unwrapSuccessResponse, (error) => handleAuthError(error));

// ----------------------------------------------------------------------

const privateApi = axios.create({
  baseURL: CONFIG.serverUrl,
});

privateApi.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers['Accept-Language'] = i18next.language || 'en';

    return config;
  },
  (error) => Promise.reject(error)
);

privateApi.interceptors.response.use(unwrapSuccessResponse, (error) => handleAuthError(error));

const authPublicApi = axios.create({
  baseURL: CONFIG.authServerUrl,
});

authPublicApi.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = i18next.language || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

authPublicApi.interceptors.response.use(unwrapSuccessResponse, (error) => handleAuthError(error));

const authPrivateApi = axios.create({
  baseURL: CONFIG.authServerUrl,
});

authPrivateApi.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers['Accept-Language'] = i18next.language || 'en';

    return config;
  },
  (error) => Promise.reject(error)
);

authPrivateApi.interceptors.response.use(unwrapSuccessResponse, (error) => handleAuthError(error));

export { publicApi, privateApi, authPublicApi, authPrivateApi };


