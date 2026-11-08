import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';


import { uploadClasses } from '../classes';
import { fileData, FileThumbnail } from '../../fileThumbnail';
import { Iconify } from '../../../iconify';
import { fData } from '../../../../utils/formatNumber';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export function MultiFilePreview({
  sx,
  onRemove,
  lastNode,
  thumbnail,
  slotProps,
  firstNode,
  files = [],
  className,
  ...other
}) {
  return (
    <ListRoot
      thumbnail={thumbnail}
      className={mergeClasses([uploadClasses.uploadMultiPreview, className])}
      sx={sx}
      {...other}
    >
      {firstNode && <ItemNode thumbnail={thumbnail}>{firstNode}</ItemNode>}

      {files.map((file) => {
        const { name, size, type } = fileData(file);

        const isImage = type?.startsWith('image/');
        const isPdf =
          type === 'application/pdf' || String(name || '').toLowerCase().endsWith('.pdf');

        if (thumbnail) {
          return (
            <ItemThumbnail key={name}>
              {isImage ? (
                <FileThumbnail
                  tooltip
                  imageView
                  file={file}
                  onRemove={() => onRemove?.(file)}
                  sx={[
                    (theme) => ({
                      width: 80,
                      height: 80,
                      border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                    }),
                  ]}
                  slotProps={{ icon: { sx: { width: 36, height: 36 } } }}
                  {...slotProps?.thumbnail}
                />
              ) : (
                <Box
                  sx={(theme) => ({
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                    bgcolor: 'background.neutral',
                  })}
                >
                  <Iconify
                    icon={isPdf ? 'vscode-icons:file-type-pdf2' : 'eva:file-fill'}
                    width={36}
                  />

                  {onRemove && (
                    <IconButton
                      size="small"
                      onClick={() => onRemove(file)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Iconify width={14} icon="mingcute:close-line" />
                    </IconButton>
                  )}
                </Box>
              )}
            </ItemThumbnail>
          );
        }

        return (
          <ItemRow key={name}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: 'background.neutral',
                overflow: 'hidden',
              }}
            >
              {isImage ? (
                <FileThumbnail file={file} {...slotProps?.thumbnail} />
              ) : (
                <Iconify
                  icon={isPdf ? 'vscode-icons:file-type-pdf2' : 'eva:file-fill'}
                  width={24}
                />
              )}
            </Box>

            <ListItemText
              primary={name}
              secondary={fData(size)}
              primarytypographyprops={{
                noWrap: true,
              }}
              secondarytypographyprops={{
                component: 'span',
                typography: 'caption',
              }}
            />

            {onRemove && (
              <IconButton size="small" onClick={() => onRemove(file)}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            )}
          </ItemRow>
        );
      })}

      {lastNode && <ItemNode thumbnail={thumbnail}>{lastNode}</ItemNode>}
    </ListRoot>
  );
}

// ----------------------------------------------------------------------

const ListRoot = styled('ul', {
  shouldForwardProp: (prop) => !['thumbnail', 'sx'].includes(prop),
})(({ thumbnail, theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexDirection: 'column',
  ...(thumbnail && { flexWrap: 'wrap', flexDirection: 'row' }),
}));

const ItemThumbnail = styled('li')(() => ({ display: 'inline-flex' }));

const ItemRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1, 1, 1.5),
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
}));

const ItemNode = styled('li', {
  shouldForwardProp: (prop) => !['thumbnail', 'sx'].includes(prop),
})(({ thumbnail }) => ({
  ...(thumbnail && { width: 'auto', display: 'inline-flex' }),
}));
