import { m } from 'framer-motion';
import { merge } from 'es-toolkit';
import { useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import { IconButton, iconButtonClasses, useTheme } from '@mui/material';

import { allLangs } from '../locales/allLangs';
import { LanguagePopover } from './components/language/LanguagePopover';
import { HeaderSection, layoutClasses, LayoutSection, MainSection } from './core';
import { SettingsButton } from './components/SettingsButton';
import { useSettingsContext } from '../components/settings';
import { MenuButton } from './components/MenuButton';
import { dashboardLayoutVars, dashboardNavColorVars } from './navbar/cssVars';
import { filterNavItemsByRole } from '../routes/permissions';
import { getUserRole } from '../utils/auth';
import { navData as mainNavData } from './navbar/NavConfigMain';
import { NavMobile } from './navbar/NavMobile';
import { NavVertical } from './navbar/NavVertical';
import { NavHorizontal } from './navbar/NavHorizontal';
import { useRouter } from '../routes/hooks/useRouter';
import { paths } from '../routes/paths';
import { transitionTap, varHover, varTap } from '../components/animate/variants';
import { PageHeaderProvider, PageHeaderSlot } from './page';

// ----------------------------------------------------------------------

const MotionIconButton = m.create(IconButton);

// ----------------------------------------------------------------------

export function NoAuthPublicLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const settings = useSettingsContext();
  const theme = useTheme();
  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const navDataRaw = slotProps?.nav?.data ?? mainNavData;
  const navData = useMemo(
    () => filterNavItemsByRole(navDataRaw, getUserRole()),
    [navDataRaw]
  );
  const route = useRouter();

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
      bottomArea: isNavHorizontal ? (
        <NavHorizontal data={navData} layoutQuery={layoutQuery} cssVars={navVars.section} />
      ) : null,
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

          <MotionIconButton
            whileTap={varTap(0.96)}
            whileHover={varHover(1.08)}
            transition={transitionTap()}
            onClick={() => route.push(paths.auth.login)}
            sx={{ width: 40, height: 40, color: 'primary.dark' }}
          >
            <LoginIcon />
          </MotionIconButton>

          <MotionIconButton
            whileTap={varTap(0.96)}
            whileHover={varHover(1.08)}
            transition={transitionTap()}
            onClick={() => route.push(paths.auth.signUp)}
            sx={{ width: 40, height: 40, color: 'primary.dark' }}
          >
            <PersonAddIcon />
          </MotionIconButton>

          <SettingsButton />
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
