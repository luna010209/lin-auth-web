/**
 * Theme-integrated Role Styling utilities
 * Provides styled components and utilities that work with your theme
 */

import { getRoleColor } from './roleConfig';

/**
 * Custom hook to get styled role colors based on theme mode
 */
export function useRoleColorStyles(role) {
  const roleColor = getRoleColor(role);

  // Return colors that adapt to light/dark mode
  return {
    color: roleColor.main || '#00B8D9',
    backgroundColor: roleColor.background || 'rgba(0, 184, 217, 0.08)',
    borderColor: roleColor.light || '#0097A7',
    textColor: roleColor.text || '#FFFFFF',
    lightColor: roleColor.lighter || '#CAFDF5',
  };
}

/**
 * Get styled props for role Badge/Chip
 */
export function getRoleChipProps(role) {
  const roleColor = getRoleColor(role);

  return {
    label: getRoleLabel(role),
    sx: {
      backgroundColor: roleColor.background,
      color: roleColor.text,
      borderColor: roleColor.main,
      border: `1px solid ${roleColor.light}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  };
}

/**
 * Get styled props for role Badge (with background color)
 */
export function getRoleBadgeProps(role) {
  const roleColor = getRoleColor(role);

  return {
    label: getRoleLabel(role),
    sx: {
      backgroundColor: roleColor.main,
      color: roleColor.text,
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      padding: '4px 8px',
      borderRadius: '6px',
    },
  };
}

/**
 * Get role label
 */
function getRoleLabel(role) {
  const labels = {
    ADMIN: 'Admin',
    PREMIUM: 'Premium',
    BASIC: 'Basic',
  };
  return labels[role] || role;
}

/**
 * Create gradient background for role cards
 */
export function getRoleGradientBackground(role) {
  const roleColor = getRoleColor(role);

  return {
    background: `linear-gradient(135deg, ${roleColor.lighter} 0%, ${roleColor.light}25 100%)`,
    backdropFilter: 'blur(8px)',
  };
}

/**
 * Create card styling for each role
 */
export function getRoleCardStyling(role) {
  const roleColor = getRoleColor(role);

  return {
    background: roleColor.background,
    border: `2px solid ${roleColor.light}`,
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: roleColor.main,
      boxShadow: `0 8px 24px ${roleColor.background}`,
    },
  };
}

/**
 * Get text color that works on role background
 */
export function getRoleTextColor(role, variant = 'primary') {
  const roleColor = getRoleColor(role);

  const variants = {
    primary: roleColor.text,
    secondary: roleColor.main,
    light: roleColor.lighter,
  };

  return variants[variant] || roleColor.text;
}

/**
 * Create a role indicator component styling
 */
export function getRoleIndicatorStyling(role) {
  const roleColor = getRoleColor(role);

  return {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: roleColor.main,
    display: 'inline-block',
    marginRight: '8px',
    boxShadow: `0 0 8px ${roleColor.background}`,
  };
}
