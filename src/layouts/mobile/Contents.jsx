import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export function MobileContent({ sx, children, className, layoutQuery = 'md', ...other }) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          width: '100%',
          height: '100%',
          mx: 'auto',
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          p: theme.spacing(3, 2, 14, 2),
          maxWidth: 'var(--layout-simple-content-compact-width)',
          [theme.breakpoints.up(layoutQuery)]: {
            p: theme.spacing(10, 0, 10, 0),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}
