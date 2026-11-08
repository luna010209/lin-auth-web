import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { fDate, fDateTime, formatPatterns } from '../../utils/formatTime';
import { omitBlockedDomProps, splitTextFieldProps } from './sanitizeFieldProps';

// ----------------------------------------------------------------------

export function RHFDatePicker({ name, slotProps, sx, ...other }) {
  const { control } = useFormContext();
  const pickerSafe = omitBlockedDomProps(other);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { textFieldProps, sx: textFieldSx, slotProps: textFieldSlotProps } = splitTextFieldProps({
          sx,
          fullWidth: true,
          error: !!error,
          helperText: error?.message ?? slotProps?.textField?.helperText,
          ...slotProps?.textField,
        });

        return (
          <DatePicker
            {...pickerSafe}
            name={field.name}
            onBlur={field.onBlur}
            inputRef={field.ref}
            value={dayjs(field.value)}
            onChange={(newValue) => field.onChange(fDate(newValue, 'YYYY-MM-DD'))}
            format={formatPatterns.split.date}
            slotProps={{
              ...slotProps,
              textField: {
                ...textFieldProps,
                sx: textFieldSx,
                slotProps: textFieldSlotProps,
              },
            }}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFMobileDateTimePicker({ name, slotProps, sx, ...other }) {
  const { control } = useFormContext();
  const pickerSafe = omitBlockedDomProps(other);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { textFieldProps, sx: textFieldSx, slotProps: textFieldSlotProps } = splitTextFieldProps({
          sx,
          fullWidth: true,
          error: !!error,
          helperText: error?.message ?? slotProps?.textField?.helperText,
          ...slotProps?.textField,
        });

        return (
          <MobileDateTimePicker
            {...pickerSafe}
            name={field.name}
            onBlur={field.onBlur}
            inputRef={field.ref}
            value={dayjs(field.value)}
            onChange={(newValue) => field.onChange(fDateTime(newValue))}
            format={formatPatterns.split.dateTime}
            slotProps={{
              ...slotProps,
              textField: {
                ...textFieldProps,
                sx: textFieldSx,
                slotProps: textFieldSlotProps,
              },
            }}
          />
        );
      }}
    />
  );
}
