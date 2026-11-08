import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { usePageHeader } from './PageHeaderContext';
import { PageHeading } from './PageHeading';

// ----------------------------------------------------------------------

export function PageHeaderSlot({ layoutQuery = 'lg' }) {
  const theme = useTheme();
  const { pageHeader } = usePageHeader();

  if (pageHeader.breadcrumb.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'none',
        minWidth: 0,
        flex: '1 1 auto',
        pr: 2,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'block',
        },
      }}
    >
      <PageHeading breadcrumb={pageHeader.breadcrumb} compact showTitle={false} />
    </Box>
  );
}
