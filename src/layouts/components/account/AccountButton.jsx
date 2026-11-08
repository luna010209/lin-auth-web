import { m } from 'framer-motion';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

import { transitionTap, varHover, varTap } from '../../../components/animate/variants';
import { AnimateBorder } from '../../../components/animate/AnimateBorder';

// ----------------------------------------------------------------------

const MotionIconButton = m.create(IconButton);

export function AccountButton({ photoURL, displayName, sx, ...other }) {
  return (
    <MotionIconButton
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Account Avatar"
      sx={[{ p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <AnimateBorder
        sx={{ p: '3px', borderRadius: '50%', width: 40, height: 40 }}
        slotProps={{
          primaryBorder: { size: 60, width: '1px', sx: { color: 'primary.main' } },
          secondaryBorder: { sx: { color: 'warning.main' } },
        }}
      >
        <Avatar src={photoURL} alt={displayName} sx={{ width: 1, height: 1 }}>
          {displayName?.charAt(0).toUpperCase()}
        </Avatar>
      </AnimateBorder>
    </MotionIconButton>
  );
}
