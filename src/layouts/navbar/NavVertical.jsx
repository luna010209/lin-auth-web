import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { layoutClasses } from '../core/classes';
import { NavToggleButton } from '../components/NavToggleButton';
import { NavSectionMini, NavSectionVertical } from '../../components/navSection';
import { Logo } from '../../components/logo';
import { Scrollbar } from '../../components/scrollbar';
import { useSettingsContext } from '../../components/settings';

// ----------------------------------------------------------------------

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  layoutQuery = 'md',
  ...other
}) {
  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 3}}>
          <Logo isSingle={false}/>
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical data={data} cssVars={cssVars} sx={{ px: 2, flex: '1 1 auto' }} />
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
          <Logo />
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        sx={[
          (theme) => ({
            ...theme.mixins.hideScrollY,
            pb: 2,
            px: 0.5,
            flex: '1 1 auto',
            overflowY: 'auto',
          }),
        ]}
      />

      {slots?.bottomArea}
    </>
  );

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      {...other}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        sx={[
          (theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
  shouldForwardProp: (prop) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})(({ isNavMini, layoutQuery = 'md', theme }) => {
  const settings = useSettingsContext();
  const isDarkMode = settings.state.colorScheme === 'dark';

  return {
    top: 0,
    left: 0,
    height: '100%',
    display: 'none',
    position: 'fixed',
    flexDirection: 'column',
    zIndex: 'var(--layout-nav-zIndex)',
    backgroundColor: 'var(--layout-nav-bg)',
    width: isNavMini
      ? 'var(--layout-nav-mini-width)'
      : 'var(--layout-nav-vertical-width)',

    // ✅ Right-side shadow with dark mode support
    boxShadow: isDarkMode
      ? '4px 0 12px rgba(225, 225, 225, 0.2)'
      : '4px 0 12px rgba(0, 0, 0, 0.1)',

    transition: theme.transitions.create(['width'], {
      easing: 'var(--layout-transition-easing)',
      duration: 'var(--layout-transition-duration)',
    }),

    [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
  };
});
