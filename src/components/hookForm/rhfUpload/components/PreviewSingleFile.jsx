import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { uploadClasses } from '../classes';
import { Iconify } from '../../../iconify';

// ----------------------------------------------------------------------

// export function SingleFilePreview({ file, sx, className, ...other }) {
//   const fileName = typeof file === 'string' ? file : file.name;

//   const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

//   return (
//     <PreviewRoot
//       className={mergeClasses([uploadClasses.uploadSinglePreview, className])}
//       sx={sx}
//       {...other}
//     >
//       <img alt={fileName} src={previewUrl} />
//     </PreviewRoot>
//   );
// }

export function SingleFilePreview({ file, sx, className, ...other }) {
  const fileName = typeof file === 'string' ? file : file?.name || '';
  const fileType = typeof file === 'string' ? '' : file?.type || '';
  const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  console.log("IS PDF", isPdf);

  return (
    <PreviewRoot
      className={mergeClasses([uploadClasses.uploadSinglePreview, className])}
      sx={sx}
      {...other}
    >
      {isImage ? (
        <img alt={fileName} src={previewUrl} />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: 'background.neutral',
            px: 2,
            textAlign: 'center',
          }}
        >
          <Iconify
            icon={isPdf ? 'vscode-icons:file-type-pdf2' : 'eva:file-fill'}
            width={48}
          />
          <Typography variant="body2" sx={{ mt: 1 }} noWrap>
            {fileName}
          </Typography>
        </Box>
      )}
    </PreviewRoot>
  );
}

// ----------------------------------------------------------------------

const PreviewRoot = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  padding: theme.spacing(1),
  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
}));

// ----------------------------------------------------------------------

export function DeleteButton({ sx, ...other }) {
  return (
    <IconButton
      size="small"
      sx={[
        (theme) => ({
          top: 16,
          right: 16,
          zIndex: 9,
          position: 'absolute',
          color: varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
          bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
          '&:hover': { bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}
