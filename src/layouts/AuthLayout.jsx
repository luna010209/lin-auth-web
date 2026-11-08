import { merge } from 'es-toolkit';
import { useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { NavMobile } from './navbar/NavMobile';
import { NavVertical } from './navbar/NavVertical';
import { navData as dashboardNavData } from './navbar/NavConfigMain';
import { layoutClasses, HeaderSection, LayoutSection, MainSection } from './core';
import { dashboardLayoutVars, dashboardNavColorVars } from './navbar/cssVars';
import { getUserRole } from '../utils/auth';
import { useAuthContext } from '../auth/hooks';
import { LanguagePopover } from './components/language/LanguagePopover';
import { filterNavItemsByRole } from '../routes/permissions';
import { MenuButton } from './components/MenuButton';
import { AccountDrawer } from './components/account/AccountDrawer';
import { account } from './navbar/NavConfigAccount';
import { SettingsButton } from './components/SettingsButton';
import { useSettingsContext } from '../components/settings';
import { PageHeaderProvider, PageHeaderSlot } from './page';

import { allLangs } from '../locales';

// ----------------------------------------------------------------------

export function AuthLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const theme = useTheme();
  const settings = useSettingsContext();
  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const navDataRaw = slotProps?.nav?.data ?? dashboardNavData;
  const { user, authenticated } = useAuthContext();
  const navRoles = user?.roles?.length ? user.roles : getUserRole();
  const navData = useMemo(
    () => filterNavItemsByRole(navDataRaw, navRoles, { isAuthenticated: authenticated }),
    [navDataRaw, navRoles, authenticated]
  );

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            backgroundColor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const isDarkMode = settings.state.colorScheme === 'dark';
    const headerSx = {
      boxShadow: isDarkMode
        ? '0px 4px 6px rgba(225, 225, 225, 0.2)'
        : '0px 4px 6px rgba(0, 0, 0, 0.1)',
      ...slotProps?.header?.sx,
    };

    const headerSlots = {
      leftArea: (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 0.5, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile data={navData} open={open} onClose={onClose} cssVars={navVars.section} />
          <PageHeaderSlot layoutQuery={layoutQuery} />
        </Box>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
          <LanguagePopover data={allLangs} />
          <SettingsButton />
          {authenticated ? <AccountDrawer data={account} /> : null}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx ?? headerSx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        {
          flex: '1 1 auto',
          bgcolor: 'background.neutral',
        },
        ...(Array.isArray(slotProps?.main?.sx)
          ? slotProps.main.sx
          : slotProps?.main?.sx
            ? [slotProps.main.sx]
            : []),
      ]}
    >
      {children}
    </MainSection>
  );

  return (
    <PageHeaderProvider>
      <LayoutSection
        headerSection={renderHeader()}
        sidebarSection={isNavHorizontal ? null : renderSidebar()}
        footerSection={renderFooter()}
        cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
        sx={[
          {
            [`& .${layoutClasses.sidebarContainer}`]: {
              [theme.breakpoints.up(layoutQuery)]: {
                pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
                transition: theme.transitions.create(['padding-left'], {
                  easing: 'var(--layout-transition-easing)',
                  duration: 'var(--layout-transition-duration)',
                }),
              },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {renderMain()}
      </LayoutSection>
    </PageHeaderProvider>
  );
}
