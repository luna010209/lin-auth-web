import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { HelperText } from './HelpText';

// ----------------------------------------------------------------------

export function RHFCheckbox({ sx, name, label, slotProps, helperText, ...other }) {
  const { control } = useFormContext();

  const {
    inputProps,
    alignItems,
    justifyContent,
    flexWrap,
    PaperProps,
    ...safeOther
  } = other;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <FormControlLabel
            label={label}
            control={
              <Checkbox
                {...field}
                checked={field.value}
                {...slotProps?.checkbox}
                slotProps={{
                  input: {
                    id: `${name}-checkbox`,
                    ...(!label && { 'aria-label': `${name} checkbox` }),
                    ...slotProps?.checkbox?.inputProps,
                  },
                }}
              />
            }
            sx={[{ mx: 0 }, ...(Array.isArray(sx) ? (sx ?? []) : [sx])]}
            {...safeOther}
          />

          <HelperText
            {...slotProps?.helperText}
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFMultiCheckbox({ name, label, options, slotProps, helperText, ...other }) {
  const { control } = useFormContext();

  const {
    inputProps,
    InputProps,
    alignItems,
    justifyContent,
    flexWrap,
    PaperProps,
    ...safeOther
  } = other;

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" {...slotProps?.wrapper}>
          {label && (
            <FormLabel
              component="legend"
              {...slotProps?.formLabel}
              sx={[
                { mb: 1, typography: 'body2' },
                ...(Array.isArray(slotProps?.formLabel?.sx)
                  ? (slotProps?.formLabel?.sx ?? [])
                  : [slotProps?.formLabel?.sx]),
              ]}
            >
              {label}
            </FormLabel>
          )}

          <FormGroup {...safeOther}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={field.value.includes(option.value)}
                    onChange={() => field.onChange(getSelected(field.value, option.value))}
                    {...slotProps?.checkbox}
                    inputProps={{
                      id: `${option.label}-checkbox`,
                      ...(!option.label && { 'aria-label': `${option.label} checkbox` }),
                      ...slotProps?.checkbox?.inputProps,
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>

          <HelperText
            {...slotProps?.helperText}
            disableGutters
            errorMessage={error?.message}
            helperText={helperText}
          />
        </FormControl>
      )}
    />
  );
}
