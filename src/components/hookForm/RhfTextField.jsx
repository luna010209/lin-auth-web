import { Controller, useFormContext } from 'react-hook-form';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';

import TextField from '@mui/material/TextField';

import { splitTextFieldProps } from './sanitizeFieldProps';

// ----------------------------------------------------------------------

export function RHFTextField({ name, helperText, slotProps, type = 'text', sx, ...other }) {
  const { control } = useFormContext();

  const isNumberType = type === 'number';
  const { textFieldProps, sx: sanitizedSx, slotProps: mergedSlotProps } = splitTextFieldProps({
    sx,
    slotProps,
    ...other,
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...textFieldProps}
          {...field}
          fullWidth
          sx={sanitizedSx}
          value={isNumberType ? transformValue(field.value) : field.value}
          onChange={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnChange(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
          }}
          onBlur={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnBlur(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
          }}
          type={isNumberType ? 'text' : type}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...mergedSlotProps,
            htmlInput: {
              autoComplete: 'off',
              ...mergedSlotProps?.htmlInput,
              ...(isNumberType && { inputMode: 'decimal', pattern: '[0-9]*\\.?[0-9]*' }),
            },
          }}
        />
      )}
    />
  );
}
