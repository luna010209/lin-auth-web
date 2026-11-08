// ----------------------------------------------------------------------
// Roles
// ----------------------------------------------------------------------

export const ROLES = {
  ADMIN: 'ADMIN',
  PREMIUM: 'PREMIUM',
  BASIC: 'BASIC',
  FREE: 'FREE',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.PREMIUM]: 2,
  [ROLES.BASIC]: 1,
  [ROLES.FREE]: 0,
};

// ----------------------------------------------------------------------
// UI colors
// ----------------------------------------------------------------------

export const ROLE_COLORS = {
  [ROLES.ADMIN]: {
    light: 'rgb(3, 135, 137)',
    lighter: 'rgb(6, 94, 73)',
    main: '#006C9C',
    text: '#FFFFFF',
    background: 'rgba(0, 108, 156, 0.08)',
  },
  [ROLES.PREMIUM]: {
    light: '#0097A7',
    lighter: '#00B8D9',
    main: '#00B8D9',
    text: '#FFFFFF',
    background: 'rgba(0, 184, 217, 0.08)',
  },
  [ROLES.BASIC]: {
    light: '#CAFDF5',
    lighter: '#E0F7FA',
    main: '#80DEEA',
    text: '#006C9C',
    background: 'rgba(0, 184, 217, 0.04)',
  },
  [ROLES.FREE]: {
    light: '#BDBDBD',
    lighter: '#E0E0E0',
    main: '#9E9E9E',
    text: '#FFFFFF',
    background: 'rgba(158, 158, 158, 0.08)',
  },
};

export const DEFAULT_ROLE_COLOR = {
  light: '#919EAB',
  lighter: '#DFE3E8',
  main: '#919EAB',
  text: '#FFFFFF',
  background: 'rgba(145, 158, 171, 0.08)',
};

// ----------------------------------------------------------------------
// Labels
// ----------------------------------------------------------------------

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.PREMIUM]: 'Premium User',
  [ROLES.BASIC]: 'Basic User',
  [ROLES.FREE]: 'Free User',
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

export function normalizeRole(input) {
  if (!input) return null;
  const cleaned = String(input).trim().toUpperCase().replace(/^ROLE_/, '');

  if (cleaned === ROLES.ADMIN) return ROLES.ADMIN;
  if (cleaned === ROLES.PREMIUM) return ROLES.PREMIUM;
  if (cleaned === ROLES.BASIC) return ROLES.BASIC;
  if (cleaned === ROLES.FREE) return ROLES.FREE;

  return null;
}

export function normalizeRoles(inputs = []) {
  if (!Array.isArray(inputs) || inputs.length === 0) return [ROLES.FREE];
  const normalized = inputs.map(normalizeRole).filter(Boolean);
  return normalized.length ? normalized : [ROLES.FREE];
}

export function getPrimaryRole(authoritiesOrRoles = []) {
  const roles = normalizeRoles(authoritiesOrRoles);

  return roles.reduce((best, current) => {
    const bestScore = ROLE_HIERARCHY[best] ?? 0;
    const currentScore = ROLE_HIERARCHY[current] ?? 0;
    return currentScore > bestScore ? current : best;
  }, roles[0]);
}

export function roleAtLeast(userRoles, minimumRole) {
  const primary = getPrimaryRole(userRoles);
  const userLevel = ROLE_HIERARCHY[primary] ?? 0;
  const needLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
  return userLevel >= needLevel;
}

// export function hasPermission(userRole, featureKey) {
//   const role = normalizeRole(userRole);
//   if (!role) return false;
//   return Boolean(ROLE_FEATURES[role]?.[featureKey]);
// }

export function hasAnyRole(userRoles, requiredRoles) {
  const u = normalizeRoles(userRoles);
  const r = normalizeRoles(requiredRoles);
  if (u.length === 0 || r.length === 0) return false;
  return u.some((role) => r.includes(role));
}

export function hasAllRoles(userRoles, requiredRoles) {
  const u = normalizeRoles(userRoles);
  const r = normalizeRoles(requiredRoles);
  if (u.length === 0 || r.length === 0) return false;
  return r.every((role) => u.includes(role));
}

export function getRoleDisplayLabel(role) {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] || 'Unknown Role';
}

export function getRoleColor(role) {
  const normalized = normalizeRole(role);
  return ROLE_COLORS[normalized] || DEFAULT_ROLE_COLOR;
}

// Nav sections visible per role
export const VISIBLE_MENU_ITEMS = {
  ADMIN: ['home'],
  PREMIUM: ['home'],
  BASIC: ['home'],
  FREE: ['home'],
};

