import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { CONFIG } from '../../globalConfig';
import { useAuthContext } from '../../auth/hooks';
import { paths } from '../../routes/paths';
import { RouterLink } from '../../routes/components/RouterLink';

// ----------------------------------------------------------------------

export default function Home() {
  const { user } = useAuthContext();

  return (
    <>
      <PageDocumentTitle title="Home" />
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
        <Stack spacing={2}>
          <Typography variant="h4">{CONFIG.appName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Start with persona management, then add detail editing, products, and feed.
          </Typography>
          <Button component={RouterLink} href={paths.persona.manage} variant="contained">
            Manage personas
          </Button>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Signed in as
            </Typography>
            <Typography variant="h6">{user?.displayName || user?.username || '—'}</Typography>
            {user?.email ? (
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            ) : null}
          </Card>
        </Stack>
      </Box>
    </>
  );
}
