import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';

import { HelperText } from './HelpText';
import { UploadAvatar } from './rhfUpload/UploadAvatar';
import { UploadBox } from './rhfUpload/UploadBox';
import { Upload } from './rhfUpload/Uploads';

// ----------------------------------------------------------------------

export function RHFUploadAvatar({ name, slotProps, ...other }) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles) => {
          const value = acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <Box {...slotProps?.wrapper}>
            <UploadAvatar value={field.value} error={!!error} onDrop={onDrop} {...other} />

            <HelperText errorMessage={error?.message} sx={{ textAlign: 'center' }} />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox value={field.value} error={!!error} {...other} />
      )}
    />
  );
}

// ----------------------------------------------------------------------


export function RHFUpload({ name, multiple, helperText, ...other }) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: other.accept || { 'image/*': [] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = (acceptedFiles) => {
          const currentValue = multiple ? (field.value || []) : [];
          const value = multiple
            ? [...currentValue, ...acceptedFiles]
            : acceptedFiles[0];

          setValue(name, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        };

        const onDelete = !multiple
          ? () => {
            setValue(name, null, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }
          : undefined;

        const onRemove = multiple
          ? (inputFile) => {
            const filtered = (field.value || []).filter((file) => file !== inputFile);
            setValue(name, filtered, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }
          : undefined;

        const onRemoveAll = multiple
          ? () => {
            setValue(name, [], {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }
          : undefined;

        return (
          <Upload
            {...uploadProps}
            value={field.value}
            onDrop={onDrop}
            onDelete={onDelete}
            onRemove={onRemove}
            onRemoveAll={onRemoveAll}
            {...other}
          />
        );
      }}
    />
  );
}


// export function RHFUpload({ name, multiple, helperText, ...other }) {
//   const { control, setValue } = useFormContext();

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState: { error } }) => {
//         const uploadProps = {
//           multiple,
//           accept: other.accept || { 'image/*': [] },
//           error: !!error,
//           helperText: error?.message ?? helperText,
//         };

//         const onDrop = (acceptedFiles) => {
//           const currentValue = multiple ? (field.value || []) : null;
//           const value = multiple
//             ? [...currentValue, ...acceptedFiles]
//             : acceptedFiles[0];

//           setValue(name, value, { shouldValidate: true });
//         };

//         return <Upload {...uploadProps} value={field.value} onDrop={onDrop} {...other} />;
//       }}
//     />
//   );
// }
