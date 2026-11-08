import { useEffect, useMemo } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { NavbarContent } from '../navbar/Contents';
import { usePageHeader } from './PageHeaderContext';

// ----------------------------------------------------------------------

export function PageLayout({
  title,
  subtitle,
  breadcrumb = [],
  maxWidth = 'lg',
  showPageTitle = true,
  heading,
  children,
  sx,
  ...other
}) {
  const { setPageHeader, clearPageHeader } = usePageHeader();

  const breadcrumbKey = useMemo(
    () => breadcrumb.map((item) => `${item.label}:${item.href ?? ''}`).join('|'),
    [breadcrumb]
  );

  useEffect(() => {
    setPageHeader({ title, subtitle, breadcrumb });
    return clearPageHeader;
  }, [title, subtitle, breadcrumbKey, setPageHeader, clearPageHeader]);

  const hasHeading = Boolean(title || subtitle);

  return (
    <NavbarContent
      maxWidth={maxWidth}
      sx={[{ }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...other}
    >
      {showPageTitle && hasHeading && (
        <Stack spacing={1} sx={{ mb: { xs: 3, md: 5 } }}>
          {heading ?? (
            <>
              {title && <Typography variant="h4">{title}</Typography>}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </Stack>
      )}

      {children}
    </NavbarContent>
  );
}

export function PageIntro({ children, sx }) {
  return (
    <Stack
      spacing={1}
      sx={[
        { mb: { xs: 3, md: 4 }, maxWidth: 720 },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Stack>
  );
}
