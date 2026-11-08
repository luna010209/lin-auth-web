import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

export function FormHead({ sx, icon, title, description, ...other }) {
  const settings = useSettingsContext();

  const isDarkMode = settings.state.colorScheme === 'dark';

  return (
    <Box
      sx={[{
        mb: 5,
        textAlign: 'center',
        color: isDarkMode ? 'primary.lighter' : 'primary.main',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Row: icon + title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        {icon && <Box component="span">{icon}</Box>}
        {title && <Typography variant="h4" sx={{ color: 'primary' }}>{title}</Typography>}
      </Box>

      {/* Description */}
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

