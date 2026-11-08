import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { Box, Button } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';

import { uploadClasses } from './classes';
import { UploadPlaceholder } from './components/Placeholder';
import { RejectionFiles } from './components/RejectionFiles';
import { MultiFilePreview } from './components/PreviewMultiFile';
import { DeleteButton, SingleFilePreview } from './components/PreviewSingleFile';
import { Iconify } from '../../iconify';
import { useTranslate } from '../../../locales';
import { useCallback } from 'react';

// ----------------------------------------------------------------------

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  thumbnail,
  helperText,
  onRemoveAll,
  className,
  multiple = false,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    ...other,
  });

  const { t } = useTranslate('others');
  const uploadTran = useCallback((key) => t(`field.upload.${key}`), [t]);

  const isArray = Array.isArray(value) && multiple;

  const hasFile = !isArray && !!value;
  const hasFiles = isArray && !!value.length;

  const hasError = isDragReject || !!error;

  const renderMultiPreview = () =>
    hasFiles && (
      <>
        <MultiFilePreview files={value} thumbnail={thumbnail} onRemove={onRemove} sx={{ my: 3 }} />

        {(onRemoveAll || onUpload) && (
          <Box sx={{ gap: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            {onRemoveAll && (
              <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
                {uploadTran('removeAll')}
              </Button>
            )}

            {onUpload && (
              <Button
                size="small"
                variant="contained"
                onClick={onUpload}
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              >
                {uploadTran('upload')}
              </Button>
            )}
          </Box>
        )}
      </>
    );

  return (
    <Box
      className={mergeClasses([uploadClasses.upload, className])}
      sx={[{ width: 1, position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        {...getRootProps()}
        sx={[
          (theme) => ({
            p: 5,
            outline: 'none',
            borderRadius: 1,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            border: `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
            transition: theme.transitions.create(['opacity', 'padding']),
            '&:hover': { opacity: 0.72 },
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
            ...(hasError && {
              color: 'error.main',
              borderColor: 'error.main',
              bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
            }),
            ...(hasFile && { padding: '28% 0' }),
          }),
        ]}
      >
        <input {...getInputProps()} />

        {/* Single file */}
        {hasFile ? <SingleFilePreview file={value} /> : <UploadPlaceholder />}
      </Box>

      {/* Single file */}
      {hasFile && <DeleteButton onClick={onDelete} />}

      {helperText && (
        <FormHelperText error={!!error} sx={{ mx: 1.75 }}>
          {helperText}
        </FormHelperText>
      )}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}

      {/* Multi files */}
      {renderMultiPreview()}
    </Box>
  );
}
