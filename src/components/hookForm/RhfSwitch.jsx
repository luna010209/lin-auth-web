import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { HelperText } from './HelpText';
import { omitBlockedDomProps, sanitizeFieldProps, spreadSanitizedRootProps } from './sanitizeFieldProps';

// ----------------------------------------------------------------------

export function RHFSwitch({ name, helperText, label, slotProps, sx, ...other }) {
  const { control } = useFormContext();

  const sanitized = sanitizeFieldProps({ sx, ...other });
  const layoutSx = sanitized.sx;
  const inputProps = sanitized.inputProps;
  const labelProps = spreadSanitizedRootProps(sanitized);
  const wrapperSanitized = sanitizeFieldProps(slotProps?.wrapper ?? {});
  const wrapperSx = wrapperSanitized.sx;
  const wrapperProps = spreadSanitizedRootProps(wrapperSanitized);
  const switchSlot = omitBlockedDomProps(slotProps?.switch ?? {});
  const switchInputProps = {
    ...inputProps,
    ...slotProps?.switch?.inputProps,
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { value, ...switchField } = field;

        return (
          <Box sx={wrapperSx} {...wrapperProps}>
            <FormControlLabel
              label={label}
              control={
                <Switch
                  {...switchField}
                  checked={!!value}
                  {...switchSlot}
                  slotProps={{
                    ...slotProps?.switch?.slotProps,
                    input: {
                      id: `${name}-switch`,
                      ...(!label && { 'aria-label': `${name} switch` }),
                      ...switchInputProps,
                      ...slotProps?.switch?.slotProps?.input,
                    },
                  }}
                />
              }
              sx={[{ mx: 0 }, ...(Array.isArray(layoutSx) ? layoutSx : layoutSx ? [layoutSx] : [])]}
              {...labelProps}
            />

            <HelperText
              {...slotProps?.helperText}
              errorMessage={error?.message}
              helperText={helperText}
            />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFMultiSwitch({ name, label, options, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  const groupSanitized = sanitizeFieldProps(other);
  const groupSx = groupSanitized.sx;
  const groupProps = spreadSanitizedRootProps(groupSanitized);

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

          <FormGroup sx={groupSx} {...groupProps}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Switch
                    checked={field.value.includes(option.value)}
                    onChange={() => field.onChange(getSelected(field.value, option.value))}
                    {...omitBlockedDomProps(slotProps?.switch)}
                    slotProps={{
                      input: {
                        id: `${option.label}-switch`,
                        ...(!option.label && { 'aria-label': `${option.label} switch` }),
                        ...slotProps?.switch?.inputProps,
                      },
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
