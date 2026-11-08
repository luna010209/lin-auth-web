/**
 * Layout Configuration Exports
 * Central export point for all role-based layout utilities
 */

export * from './roleConfig';
export {
  useRoleColorStyles,
  getRoleChipProps,
  getRoleBadgeProps,
  getRoleGradientBackground,
  getRoleCardStyling,
  getRoleTextColor,
  getRoleIndicatorStyling,
} from './roleThemeStyles';
export { withRoleLayout, FeatureAccessGate } from './RoleLayoutWrapper';
export {
  getAdminNavConfig,
  getPremiumNavConfig,
  getBasicNavConfig,
  getNavConfigByRole,
} from './roleNavConfig';
export { useRoleLayout, RoleLayoutProvider } from './useRoleLayout';
