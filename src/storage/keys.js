/** Shared browser storage key names (localStorage vs sessionStorage documented per key). */

export const STORAGE_PREFIX = 'lin-auth';

// --- sessionStorage (auth: src/auth/token.js) ---
export const AUTH_ACCESS_KEY = 'token';
export const AUTH_REFRESH_KEY = 'refresh_token';
export const AUTH_USER_KEY = 'user';

// --- localStorage (app shell) ---
/** i18next language detector; keep literal `i18nextLng`. */
export const I18N_LANG_KEY = 'i18nextLng';
export const THEME_MODE_KEY = 'theme-mode';
export const APP_SETTINGS_KEY = 'app-settings';
