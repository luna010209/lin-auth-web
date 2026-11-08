import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from '../../routes/components/RouterLink';

// ----------------------------------------------------------------------

export function PageHeading({
  title,
  subtitle,
  breadcrumb = [],
  titleVariant = 'h6',
  compact = false,
  showBreadcrumb = true,
  showTitle = true,
}) {
  const hasBreadcrumb = showBreadcrumb && breadcrumb.length > 0;

  return (
    <Stack spacing={compact ? 0.25 : 0.5} sx={{ minWidth: 0 }}>
      {hasBreadcrumb && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-li': { maxWidth: compact ? 140 : 200 },
            '& .MuiBreadcrumbs-li p, & .MuiBreadcrumbs-li a': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            },
          }}
        >
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;

            if (!isLast && item.href) {
              return (
                <Link
                  key={`${item.label}-${index}`}
                  component={RouterLink}
                  href={item.href}
                  underline="hover"
                  color="inherit"
                  variant="body2"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Typography key={`${item.label}-${index}`} variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      {showTitle && title && (
        <Typography variant={titleVariant} noWrap sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      )}

      {showTitle && subtitle && (
        <Typography variant={compact ? 'caption' : 'body2'} color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
