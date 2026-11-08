import Popover from '@mui/material/Popover';
import { listClasses } from '@mui/material/List';
import { menuItemClasses } from '@mui/material/MenuItem';

import { Arrow } from './Styles';
import { calculateAnchorOrigin } from './utils';

// ----------------------------------------------------------------------

export function CustomPopover({
  open,
  onClose,
  children,
  anchorEl,
  slotProps,
  ...other
}) {
  const { arrow: arrowProps, paper: paperProps, ...otherSlotProps } = slotProps ?? {};

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

  const arrowSize = arrowProps?.size ?? 14;
  const arrowOffset = arrowProps?.offset ?? 17;
  const arrowPlacement = arrowProps?.placement ?? 'top-right';

  const { paperStyles, anchorOrigin, transformOrigin } =
    calculateAnchorOrigin(arrowPlacement);

  return (
    <Popover
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        ...otherSlotProps,
        paper: {
          ...paperProps,
          sx: [
            paperStyles,
            {
              overflow: 'inherit',
              [`& .${listClasses.root}`]: { minWidth: 140 },
              [`& .${menuItemClasses.root}`]: { gap: 2 },
            },
            ...(Array.isArray(paperProps?.sx)
              ? paperProps?.sx ?? []
              : [paperProps?.sx]),
          ],
        },
      }}
      {...safeOther}   // ✅ FIX
    >
      {!arrowProps?.hide && (
        <Arrow
          size={arrowSize}
          offset={arrowOffset}
          placement={arrowPlacement}
          sx={arrowProps?.sx}
        />
      )}

      {children}
    </Popover>
  );
}