import { Controller, useFormContext } from 'react-hook-form';
import { PhoneInput } from './rhfPhoneInput/PhoneInput';
import { omitBlockedDomProps } from './sanitizeFieldProps';

// ----------------------------------------------------------------------

export function RHFPhoneInput({ name, helperText, ...other }) {
  const { control } = useFormContext();
  const safeOther = omitBlockedDomProps(other);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <PhoneInput
          {...field}
          fullWidth
          error={!!error}
          helperText={error?.message ?? helperText}
          {...safeOther}
        />
      )}
    />
  );
}
