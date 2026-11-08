import { forwardRef } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { logoClasses } from './classes';
import { RouterLink } from '../../routes/components/RouterLink';

// ----------------------------------------------------------------------

export const Logo = forwardRef((props, ref) => {
  const { className, href = '/', isSingle = true, disabled, sx, ...other } = props;
  const singleLogo = (
    <img
      alt="Lin Universe"
      src="/logo/linuniverse.png"
      width="100%"
      height="100%"
      style={{ display: 'block', objectFit: 'cover' }}
    />
  );

  const fullLogo = (
    <img
      alt="Lin Universe"
      src="/logo/linuniverse_full.png"
      height="100%"
      style={{ display: 'block', width: 'auto', objectFit: 'contain' }}
    />
  );

  return (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        () => ({
          // Match the previous full wordmark's visual width at its natural aspect ratio.
          width: isSingle ? 40 : 'auto',
          height: isSingle ? 40 : 44,
          ...(disabled && { pointerEvents: 'none' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
});

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
