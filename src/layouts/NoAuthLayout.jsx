import { m } from 'framer-motion';
import { merge } from 'es-toolkit';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { allLangs } from '../locales/allLangs';
import { LanguagePopover } from './components/language/LanguagePopover';
import { Logo } from '../components/logo';
import { HeaderSection, LayoutSection } from './core';
import { SettingsButton } from './components/SettingsButton';
import { useSettingsContext } from '../components/settings';
import { transitionTap, varHover, varTap } from '../components/animate/variants';
import { useRouter } from '../routes/hooks/useRouter';
import { paths } from '../routes/paths';

// ----------------------------------------------------------------------

const MotionIconButton = m.create(IconButton);

// ----------------------------------------------------------------------

export function NoAuthLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
  contentMaxWidth = 'sm',
  contentAlign = 'center',
}) {

  const settings = useSettingsContext();
  const route = useRouter();

  const renderHeader = () => {
    const headerSlotProps = {
      container: { maxWidth: false }
    };

    const isDarkMode = settings.state.colorScheme === 'dark';
    const headerSx = {
      boxShadow: isDarkMode
        ? '0px 4px 6px rgba(225, 225, 225, 0.2)' // Dark theme shadow
        : '0px 4px 6px rgba(0, 0, 0, 0.1)', // Light theme shadow
      ...slotProps?.header?.sx,
    };

    const headerSlots = {
      leftArea: <Logo isSingle={false} />,
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>

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
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={headerSx}
      />
    );
  };

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      // footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-simple-content-compact-width': '448px', ...cssVars }}
      sx={sx}
    >
      {/* Main Content */}
      <Container
        maxWidth={contentMaxWidth}
        sx={{ flex: 1, display: 'flex', alignItems: contentAlign, py: { xs: 3, md: 4 } }}
      >
        {children}
      </Container>
    </LayoutSection>
  );
}
