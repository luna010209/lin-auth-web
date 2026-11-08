import { Controller, useFormContext } from 'react-hook-form';
import { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HelperText } from './HelpText';

// ----------------------------------------------------------------------

export function RHFCode({
  name,
  slotProps,
  helperText,
  maxSize = 56,
  length = 6
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const [values, setValues] = useState(Array(length).fill(''));

        const handleChange = (index, value) => {
          const newValues = [...values];
          newValues[index] = value.slice(-1);
          setValues(newValues);

          field.onChange(newValues.join(''));
        };

        return (
          <Box
            {...slotProps?.wrapper}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              [`& .${inputBaseClasses.input}`]: {
                textAlign: 'center',
                p: 0,
                height: 'auto',
                aspectRatio: '1/1',
                maxWidth: maxSize,
              },
            }}
          >
            {values.map((val, index) => (
              <TextField
                key={index}
                value={val}
                onChange={(e) => handleChange(index, e.target.value)}
                error={!!error}
                inputProps={{ maxLength: 1 }}
                {...slotProps?.textfield}
              />
            ))}

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