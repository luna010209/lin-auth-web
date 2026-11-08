import { useMemo } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useRoleLayout } from '../config/useRoleLayout';

/**
 * Admin Layout
 * Full featured layout with all navigation items and features
 */
export function AdminLayout({ children, header, sidebar }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  useRoleLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        ...(isDesktop && {
          backgroundColor: theme.palette.background.default,
        }),
      }}
    >
      {isDesktop && sidebar && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {sidebar}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {header && <Box>{header}</Box>}

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Premium Layout
 * Limited features layout
 */
export function PremiumLayout({ children, header, sidebar }) {
  // theme not required in BasicLayout, keep for future styling if needed
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        ...(isDesktop && {
          backgroundColor: theme.palette.background.default,
        }),
      }}
    >
      {isDesktop && sidebar && (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {sidebar}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {header && <Box>{header}</Box>}

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Basic Layout
 * Minimal features layout
 */
export function BasicLayout({ children, header }) {
 
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
      }}
    >
      {header && <Box>{header}</Box>}

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          overflow: 'auto',
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/**
 * Auto-select layout based on user role
 */
export function RoleBasedLayout({ children, header, sidebar }) {
  const { userRole } = useRoleLayout();

  const LayoutComponent = useMemo(() => {
    switch (userRole) {
      case 'ADMIN':
        return AdminLayout;
      case 'PREMIUM':
        return PremiumLayout;
      case 'BASIC':
      default:
        return BasicLayout;
    }
  }, [userRole]);

  return (
    <LayoutComponent header={header} sidebar={sidebar}>
      {children}
    </LayoutComponent>
  );
}
