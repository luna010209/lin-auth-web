import { m } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import i18next from 'i18next';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { useLanguages } from '../../../locales/langs/useLanguages';
import { transitionTap, varHover, varTap } from '../../../components/animate/variants';
import { CustomPopover } from '../../../components/customPopover/CustomPopover';
import { FlagIcon } from '../../../components/hookForm/flagIcon/FlagIcon';

// ----------------------------------------------------------------------

const MotionIconButton = m.create(IconButton);

export function LanguagePopover({ data = [], sx, ...other }) {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { language, updateLanguage } = useLanguages();
  const [locale, setLocale] = useState(data[0].value);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setLocale(lng);
    };

    i18next.on('languageChanged', handleLanguageChange);

    setLocale(i18next.language || 'en');

    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    setLocale(language);
  }, [language]);

  const currentLang = data.find((lang) => lang.value === locale);

  const handleChangeLang = useCallback(
    (newLang) => {
      setLocale(newLang);
      updateLanguage(newLang);

      onClose();
    },
    [updateLanguage, onClose]
  );

  const renderMenuList = () => (
    <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
      <MenuList sx={{ width: 160, minHeight: 72 }}>
        {data?.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang?.value}
            onClick={() => handleChangeLang(option.value)}
          >
            <FlagIcon code={option.countryCode} />
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <MotionIconButton
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Languages button"
        onClick={onOpen}
        sx={[
          (theme) => ({
            p: 0,
            width: 40,
            height: 40,
            ...(open && { backgroundColor: theme.vars.palette.action.selected }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <FlagIcon sx={ (theme) => ({ boxShadow: `0 4px 12px ${theme.vars.palette.primary.dark}` }) } code={currentLang?.countryCode} />
      </MotionIconButton>

      {renderMenuList()}
    </>
  );
}
