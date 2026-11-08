import { useCallback, useState } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { LogOutButton } from '../../layouts/components/account/LogOutButton';
import { RoleBadge } from '../../layouts/components/account/RoleBadge';
import { useAuthContext } from '../../auth/hooks';
import { useTranslate } from '../../locales';
import { useRouter } from '../../routes/hooks/useRouter';
import { useSearchParams } from '../../routes/hooks/useSearchParams';
import { paths } from '../../routes/paths';
import { getStoredUserJson } from '../../auth/token';
import { isProfileIncomplete } from '../../utils/profile';
import { formatDate } from '../../utils/formatTime';
import { getPrimaryRole } from '../../layouts/config/roleConfig';
import { ProfileAboutPanel } from './ProfileAboutPanel';
import { ProfileAccountPanel } from './ProfileAccountPanel';
import { ProfileSecurityPanel } from './ProfileSecurityPanel';

// ----------------------------------------------------------------------

export function ProfileView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const { t } = useTranslate('profile');
  const { t: tAuth } = useTranslate('auth');
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const onboarding = searchParams?.get('onboarding') === '1';
  const [tab, setTab] = useState(0);

  const displayName = user?.displayName || user?.username || '—';
  const initial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();

  const handleAboutSaved = () => {
    if (!onboarding) return;
    try {
      const sessionUser = JSON.parse(getStoredUserJson() || 'null');
      if (!isProfileIncomplete(sessionUser)) {
        router.push(paths.persona.manage);
      }
    } catch {
      // ignore
    }
  };

  const clearOnboarding = () => {
    if (onboarding) {
      router.replace(paths.profile.root);
    }
  };

  return (
    <>
      <PageDocumentTitle title={l('title')} />

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
        {onboarding && (
          <Alert severity="info" sx={{ mb: 2 }} onClose={clearOnboarding}>
            {m('onboardingBanner')}
          </Alert>
        )}

        <Card
          sx={{
            mb: 3,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            spacing={2}
            sx={{ p: { xs: 3, md: 4 } }}
          >
            <Avatar
              sx={{
                width: 88,
                height: 88,
                fontSize: 32,
                fontWeight: 700,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: theme.customShadows?.z8,
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                @{user?.username}
                {user?.email ? ` · ${user.email}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {l('heroSubtitle')}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <RoleBadge role={getPrimaryRole(user?.roles)} />
                {user?.createdAt ? (
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    {tAuth('label.joined')}: {formatDate(user.createdAt)}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
            {!isProfileIncomplete(user) && onboarding ? (
              <Button
                variant="contained"
                color="inherit"
                onClick={() => router.push(paths.persona.manage)}
                sx={{ bgcolor: 'background.paper' }}
              >
                {l('continueToPersonas')}
              </Button>
            ) : null}
          </Stack>
        </Card>

        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label={l('tabAbout')} />
          <Tab label={l('tabAccount')} />
          <Tab label={l('tabSecurity')} />
        </Tabs>

        {tab === 0 && <ProfileAboutPanel onSaved={handleAboutSaved} />}
        {tab === 1 && <ProfileAccountPanel />}
        {tab === 2 && <ProfileSecurityPanel />}

        <Box sx={{ mt: 4, maxWidth: 360 }}>
          <LogOutButton />
        </Box>
      </Box>
    </>
  );
}
