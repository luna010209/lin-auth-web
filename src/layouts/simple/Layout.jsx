import { merge } from 'es-toolkit';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';

import { SimpleCompactContent } from './Contents';
import { HeaderSection, LayoutSection, MainSection } from '../core';
import { SettingsButton } from '../components/SettingsButton';
import { Logo } from '../../components/logo';
import { RouterLink } from '../../routes/components/RouterLink';
import { paths } from '../../routes/paths';
import { allLangs } from '../../locales';
import { useSettingsContext } from '../../components/settings';
import { LanguagePopover } from '../components/language/LanguagePopover';

// ----------------------------------------------------------------------

export function SimpleLayout({ sx, cssVars, children, slotProps, layoutQuery = 'md', t }) {
  const settings = useSettingsContext();
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
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: <Logo isSingle={false}/>,
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/** @slot Help link */}
          <Link
            href={paths.faqs}
            component={RouterLink}
            color="inherit"
            sx={{ typography: 'subtitle2' }}
          >
            {t('needHelp')}
          </Link>

          <LanguagePopover data={allLangs} />

          {/** @slot Settings button */}
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

  const renderFooter = () => null;

  const renderMain = () => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <SimpleCompactContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </SimpleCompactContent>
        ) : (
          children
        )}
      </MainSection>
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
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ '--layout-simple-content-compact-width': '448px', ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
