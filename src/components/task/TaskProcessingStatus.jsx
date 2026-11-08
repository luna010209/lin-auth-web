import { Alert, Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function TaskProcessingStatus({
  title,
  statusLabel,
  status = 'PROCESSING',
  checking = false,
  message,
  sx,
}) {
  if (!checking && status !== 'PROCESSING') {
    return null;
  }

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Chip
          size="small"
          color={checking ? 'default' : 'primary'}
          label={checking ? '...' : statusLabel || status}
        />
      </Stack>

      {(checking || status === 'PROCESSING') && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress />
        </Box>
      )}

      {!!message && (
        <Alert severity="info" sx={{ mt: 1 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
}
