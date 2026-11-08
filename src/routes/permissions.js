import { matchPath, redirect } from "react-router-dom";
import { getAccessToken } from "../auth/token";
import {
  getUserInfo,
  getUserRole,
  isAdmin,
  refreshSessionUser,
} from "../utils/auth";
import { paths } from "./paths";
import { normalizeRoles, roleAtLeast } from "../layouts/config/roleConfig";

// ------------------------------------
// Access rules
// ------------------------------------
export const ACCESS = {
  PUBLIC: { type: "PUBLIC" },
  AUTH: { type: "AUTH" },
  ADMIN: { type: "ADMIN" },
  MIN_ROLE: (role) => ({ type: "MIN_ROLE", role }),
};

// ------------------------------------
// Route permissions
// ------------------------------------
export const ROUTE_PERMISSIONS = [
  { path: paths.main.home, access: ACCESS.AUTH },
  { path: paths.profile.root, access: ACCESS.AUTH },
  { path: paths.persona.manage, access: ACCESS.AUTH },
  { path: paths.admin.dashboard, access: ACCESS.ADMIN },
];

// ------------------------------------
// Internal helpers
// ------------------------------------
function findRouteRule(pathname) {
  return ROUTE_PERMISSIONS.find((r) => {
    if (!r?.path || typeof r.path !== "string") return false;

    try {
      return matchPath({ path: r.path, end: true }, pathname);
    } catch {
      return false;
    }
  });
}

async function ensureAdminAccess() {
  if (isAdmin()) return true;
  if (!getAccessToken()) return false;

  try {
    const user = await refreshSessionUser();
    return isAdmin(user?.roles);
  } catch {
    return false;
  }
}

export function checkRoutePermission(pathname, userRoles = []) {
  const rule = findRouteRule(pathname);
  if (!rule) return false;

  const access = rule.access;

  if (access.type === "PUBLIC") return true;

  const hasRawRoles = Array.isArray(userRoles) ? userRoles.length > 0 : !!userRoles;
  if (access.type === "AUTH") {
    return hasRawRoles;
  }

  if (access.type === "MIN_ROLE") {
    const roles = normalizeRoles(userRoles);
    return roleAtLeast(roles, access.role);
  }

  if (access.type === "ADMIN") {
    return isAdmin();
  }

  return false;
}

// ------------------------------------
// Loader
// ------------------------------------
export function createPermissionLoader() {
  return async ({ request }) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const rule = findRouteRule(pathname);
    if (!rule) throw redirect(paths.notAllowed);

    const { access } = rule;

    if (access.type === "PUBLIC") return null;

    const userInfo = getUserInfo();
    const rawRoles = getUserRole() || [];
    const userRoles = normalizeRoles(rawRoles);

    if (!userInfo) throw redirect(paths.auth.login);

    if (access.type === "AUTH") return null;

    if (access.type === "MIN_ROLE") {
      const ok = roleAtLeast(userRoles, access.role);
      if (!ok) throw redirect(paths.notAllowed);
      return null;
    }

    if (access.type === "ADMIN") {
      const ok = await ensureAdminAccess();
      if (!ok) throw redirect(paths.notAllowed);
      return null;
    }

    throw redirect(paths.notAllowed);
  };
}

// ------------------------------------
// Nav filter
// ------------------------------------
export function filterNavItemsByRole(navItems, rawUserRoles = [], options = {}) {
  const isLoggedIn =
    options.isAuthenticated ??
    (Array.isArray(rawUserRoles) ? rawUserRoles.length > 0 : !!rawUserRoles);
  const roles = normalizeRoles(rawUserRoles);

  const can = (path) => {
    const rule = findRouteRule(path);
    if (!rule) return false;

    const { access } = rule;
    if (access.type === "PUBLIC") return true;
    if (access.type === "AUTH") return isLoggedIn;
    if (access.type === "MIN_ROLE") return roleAtLeast(roles, access.role);
    if (access.type === "ADMIN") return isAdmin();
    return false;
  };

  return navItems
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (!item.children?.length) {
            return can(item.path) ? item : null;
          }

          const children = item.children.filter((child) => can(child.path));
          if (!children.length && !can(item.path)) return null;

          return {
            ...item,
            children,
          };
        })
        .filter(Boolean),
    }))
    .filter((section) => section.items.length > 0);
}
