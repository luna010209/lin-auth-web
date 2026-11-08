import { useEffect, useCallback } from 'react';
import { hasKeys, varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { themeConfig } from '../../../theme/themeConfig';
import { useTranslate } from '../../../locales';

import { Iconify } from '../../iconify';
import { Scrollbar } from '../../scrollbar';
import { useSettingsContext } from '../context';

import { SmallBlock, LargeBlock } from './Styles';
import { FullScreenButton } from './options/FullscreenButton';
import { BaseOption } from './options/BaseOption';
import { FontFamilyOptions, FontSizeOptions } from './options/FontOptions';

// ----------------------------------------------------------------------

export function SettingsDrawer({ sx, defaultSettings }) {
  const settings = useSettingsContext();
  const { t } = useTranslate('navbar');

  const { mode, setMode, systemMode } = useColorScheme();

  useEffect(() => {
    if (mode === 'system' && systemMode) {
      settings.setState({ colorScheme: systemMode });
    }
  }, [mode, systemMode, settings]);

  // Visible options
  const isFontFamilyVisible = hasKeys(defaultSettings, ['fontFamily']);
  const isCompactLayoutVisible = hasKeys(defaultSettings, ['compactLayout']);
  const isDirectionVisible = hasKeys(defaultSettings, ['direction']);
  const isColorSchemeVisible = hasKeys(defaultSettings, ['colorScheme']);
  const isContrastVisible = hasKeys(defaultSettings, ['contrast']);
  // const isNavColorVisible = hasKeys(defaultSettings, ['navColor']);
  // const isNavLayoutVisible = hasKeys(defaultSettings, ['navLayout']);
  const isFontSizeVisible = hasKeys(defaultSettings, ['fontSize']);

  const handleReset = useCallback(() => {
    settings.onReset();
    setMode(defaultSettings.colorScheme);
  }, [defaultSettings.colorScheme, setMode, settings]);

  // ----------------------------------------------------------------------

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t('settings.title')}
      </Typography>

      <FullScreenButton />

      <Tooltip title={t('settings.resetAll')}>
        <IconButton onClick={handleReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title={t('close')}>
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label={t('settings.darkMode')}
      icon="moon"
      selected={settings.state.colorScheme === 'dark'}
      onChangeOption={() => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        settings.setState({ colorScheme: newMode });
      }}
    />
  );

  const renderContrast = () => (
    <BaseOption
      label={t('settings.contrast')}
      icon="contrast"
      selected={settings.state.contrast === 'high'}
      onChangeOption={() =>
        settings.setState({
          contrast: settings.state.contrast === 'default' ? 'high' : 'default',
        })
      }
    />
  );

  const renderRtl = () => (
    <BaseOption
      label={t('settings.rightToLeft')}
      icon="align-right"
      selected={settings.state.direction === 'rtl'}
      onChangeOption={() =>
        settings.setState({
          direction: settings.state.direction === 'ltr' ? 'rtl' : 'ltr',
        })
      }
    />
  );

  const renderCompact = () => (
    <BaseOption
      tooltip={t('settings.compactTooltip')}
      label={t('settings.compact')}
      icon="autofit-width"
      selected={!!settings.state.compactLayout}
      onChangeOption={() =>
        settings.setState({ compactLayout: !settings.state.compactLayout })
      }
    />
  );

  // const renderNav = () => (
  //   <LargeBlock title={t('settings.nav')} tooltip={t('settings.dashboardOnly')} sx={{ gap: 2.5 }}>
  //     {isNavLayoutVisible && (
  //       <SmallBlock
  //         label={t('settings.layout')}
  //         canReset={settings.state.navLayout !== defaultSettings.navLayout}
  //         onReset={() => settings.setState({ navLayout: defaultSettings.navLayout })}
  //       >
  //         <NavLayoutOptions
  //           options={['vertical', 'horizontal', 'mini']}
  //           value={settings.state.navLayout}
  //           onChangeOption={(newOption) =>
  //             settings.setState({ navLayout: newOption })
  //           }
  //         />
  //       </SmallBlock>
  //     )}

  //     {isNavColorVisible && (
  //       <SmallBlock
  //         label={t('settings.color')}
  //         canReset={settings.state.navColor !== defaultSettings.navColor}
  //         onReset={() => settings.setState({ navColor: defaultSettings.navColor })}
  //       >
  //         <NavColorOptions
  //           options={['integrate', 'apparent']}
  //           value={settings.state.navColor}
  //           onChangeOption={(newOption) =>
  //             settings.setState({ navColor: newOption })
  //           }
  //           t={t}
  //         />
  //       </SmallBlock>
  //     )}
  //   </LargeBlock>
  // );

  const renderFont = () => (
    <LargeBlock title={t('settings.font')} sx={{ gap: 2.5 }}>
      {isFontFamilyVisible && (
        <SmallBlock
          label={t('settings.family')}
          canReset={settings.state.fontFamily !== defaultSettings.fontFamily}
          onReset={() =>
            settings.setState({ fontFamily: defaultSettings.fontFamily })
          }
        >
          <FontFamilyOptions
            options={[
              themeConfig.fontFamily.primary,
              'Inter Variable',
              'DM Sans Variable',
              'Nunito Sans Variable',
            ]}
            value={settings.state.fontFamily}
            onChangeOption={(newOption) =>
              settings.setState({ fontFamily: newOption })
            }
          />
        </SmallBlock>
      )}

      {isFontSizeVisible && (
        <SmallBlock
          label={t('settings.size')}
          canReset={settings.state.fontSize !== defaultSettings.fontSize}
          onReset={() =>
            settings.setState({ fontSize: defaultSettings.fontSize })
          }
          sx={{ gap: 5 }}
        >
          <FontSizeOptions
            options={[12, 20]}
            value={settings.state.fontSize}
            onChangeOption={(newOption) =>
              settings.setState({ fontSize: newOption })
            }
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  // ----------------------------------------------------------------------

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{
        backdrop: { invisible: true },
        paper: {
          sx: [
            (theme) => ({
              width: 360,
              ...theme.mixins.paperStyles(theme, {
                color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
              }),
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
      disableRestoreFocus
    >
      {renderHead()}

      <Scrollbar>
        <Box
          sx={{
            pb: 5,
            gap: 6,
            px: 2.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
          >
            {isColorSchemeVisible && renderMode()}
            {isContrastVisible && renderContrast()}
            {isDirectionVisible && renderRtl()}
            {isCompactLayoutVisible && renderCompact()}
          </Box>

          {/* {(isNavColorVisible || isNavLayoutVisible) && renderNav()} */}
          {(isFontFamilyVisible || isFontSizeVisible) && renderFont()}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
