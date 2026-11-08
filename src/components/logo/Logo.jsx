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
    <img alt="Single logo" src="/logo/linlanga.png" width="100%" height="100%" />
  );

  const fullLogo = <img alt="Full logo" src="/logo/linlanga_full.png" width="100%" height="100%" />;

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
          // width: 40,
          height: 40,
          ...(!isSingle && { height: 40 }),
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
