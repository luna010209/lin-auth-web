import { Chip } from "@mui/material";
import { getRoleColor, getPrimaryRole, normalizeRole, ROLE_LABELS, ROLES } from "../../config/roleConfig";

// ----------------------------------------------------------------------
// UI component (optional)
// ----------------------------------------------------------------------

/**
 * Role badge for UI
 * Usage: <RoleBadge role="ROLE_ADMIN" />
 */
export function RoleBadge({ role, size = 'small', sx }) {
  const normalized = Array.isArray(role)
    ? getPrimaryRole(role)
    : (normalizeRole(role) || ROLES.FREE);
  const colors = getRoleColor(normalized);

  return (
    <Chip
      size={size}
      label={ROLE_LABELS[normalized] || normalized}
      sx={{
        height: 24,
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 999,
        bgcolor: colors.main,
        color: colors.text,
        '& .MuiChip-label': { px: 1.25 },
        '&:hover': { bgcolor: colors.light },
        ...sx,
      }}
    />
  );
}