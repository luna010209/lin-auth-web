import { parsePhoneNumber } from 'react-phone-number-input';
import PhoneNumberInput from 'react-phone-number-input/input';
import { useState, forwardRef, useCallback, startTransition } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';


import { countries } from '../../../assets/data/countries';
import { CountryListPopover } from './ListPopover';
import { Iconify } from '../../iconify';
import { omitBlockedDomProps, splitTextFieldProps } from '../sanitizeFieldProps';

// ----------------------------------------------------------------------

export const PhoneInput = forwardRef((props, ref) => {
  const {
    sx,
    size,
    value,
    label,
    onChange,
    placeholder,
    disableSelect,
    disabled,
    variant = 'outlined',
    country: inputCountryCode,
    international: _international,
    withCountryCallingCode: _withCountryCallingCode,
    onCountryChange,
    ...rest
  } = props;

  const safeRest = omitBlockedDomProps(rest);

  const [searchCountry, setSearchCountry] = useState('');
  const selectedCountry = inputCountryCode || 'KR';

  const handleClickCountry = (inputValue) => {
    onChange('');
    startTransition(() => {
      onCountryChange?.(inputValue);
    });
  };

  const hasLabel = !!label;

  const cleanValue = (value || '').replace(/^\+\d+\s*/, '');
  const e164Value = value ? value.replace(/\s+/g, '') : undefined;

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleSearchCountry = (inputValue) => {
    setSearchCountry(inputValue);
  };

  const handleChange = (val) => {
    if (!val) {
      onChange('');
      return;
    }

    const phone = parsePhoneNumber(val);

    if (!phone) {
      onChange(val);
      return;
    }

    // ✅ THIS IS YOUR REQUIRED FORMAT
    const formatted = `+${phone.countryCallingCode} ${phone.nationalNumber}`;

    onChange(formatted);
  };

  return (
    <Box
      sx={[
        () => ({
          '--popover-button-mr': '12px',
          '--popover-button-height': '22px',
          '--popover-button-width': variant === 'standard' ? '80px' : '120px',
          position: 'relative',
          ...(!disableSelect && {
            [`& .${inputBaseClasses.input}`]: {
              pl: 'calc(var(--popover-button-width) + var(--popover-button-mr))',
            },
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!disableSelect && (
        <CountryListPopover
          countries={countries}
          searchCountry={searchCountry}
          countryCode={selectedCountry}
          onClickCountry={disabled ? undefined : handleClickCountry}
          onSearchCountry={handleSearchCountry}
          sx={{
            pl: variant === 'standard' ? 0 : 1.5,
            ...(variant === 'standard' && hasLabel && { mt: size === 'small' ? '16px' : '20px' }),
            ...((variant === 'filled' || variant === 'outlined') && {
              mt: size === 'small' ? '8px' : '16px',
            }),
            ...(variant === 'filled' && hasLabel && { mt: size === 'small' ? '21px' : '25px' }),
            ...(disabled && {
              pointerEvents: 'none',
              opacity: 0.5,
            }),
          }}
        />
      )}

      <PhoneNumberInput
        ref={ref}
        size={size}
        label={label}
        value={e164Value}
        variant={variant}
        onChange={handleChange}
        hiddenLabel={!label}
        country={selectedCountry}
        inputComponent={CustomInput}
        placeholder={placeholder ?? 'Enter phone number'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: cleanValue && (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={handleClear}>
                  <Iconify width={16} icon="mingcute:close-line" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...safeRest}
      />
    </Box>
  );
});

// ----------------------------------------------------------------------
const CustomInput = forwardRef((props, ref) => {
  const { onChange, ...rest } = props;

  const handleChange = (e) => {
    const value = e.target.value;

    const digitsOnly = value.replace(/[^0-9]/g, '');

    onChange({
      ...e,
      target: {
        ...e.target,
        value: digitsOnly,
      },
    });
  };

  const { textFieldProps, sx, slotProps } = splitTextFieldProps(rest);

  return (
    <TextField
      {...textFieldProps}
      inputRef={ref}
      sx={sx}
      slotProps={slotProps}
      onChange={handleChange}
    />
  );
});
