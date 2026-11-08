import { useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

import { layoutClasses } from '../core/classes';
import { usePathname } from '../../routes/hooks/usePathname';

import { Logo } from '../../components/logo';
import { Scrollbar } from '../../components/scrollbar';
import { NavSectionVertical } from '../../components/navSection';

// ----------------------------------------------------------------------

export function NavMobile({
  data,
  open,
  onClose,
  slots,
  sx,
  className,
  ...other
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  // ✅ filter unsafe props
  const {
    inputProps,
    InputProps,
    alignItems,
    justifyContent,
    flexWrap,
    PaperProps,
    ...safeOther
  } = other;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: mergeClasses([
            layoutClasses.nav.root,
            layoutClasses.nav.vertical,
            className,
          ]),
          sx: [
            () => ({
              overflow: 'unset',
              backgroundColor: 'var(--layout-nav-bg)',
              width: 'var(--layout-nav-mobile-width)',
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          sx={{ px: 2, flex: '1 1 auto' }}
          {...safeOther}   // ✅ FIX
        />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}