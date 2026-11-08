import { useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from '../../../components/iconify';
import { useRouter } from '../../../routes/hooks/useRouter';
import { useAuthContext } from '../../../auth/hooks';
import { useTranslate } from '../../../locales';
import { paths } from '../../../routes/paths';

// ----------------------------------------------------------------------

export function LogOutIconButton({ sx }) {
  const router = useRouter();
  const { logout } = useAuthContext();
  const { t } = useTranslate('auth');

  const handleLogout = useCallback(() => {
    try {
      logout();
      router.push(paths.auth.login);
    } catch (error) {
      console.error(error);
    }
  }, [logout, router]);

  return (
    <Tooltip title={t('label.logout')}>
      <IconButton color="error" onClick={handleLogout} aria-label={t('label.logout')} sx={sx}>
        <Iconify icon="solar:logout-2-bold" width={22} />
      </IconButton>
    </Tooltip>
  );
}
