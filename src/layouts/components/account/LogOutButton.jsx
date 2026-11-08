import { useCallback } from 'react';
import { Button } from '@mui/material';

import { useRouter } from '../../../routes/hooks/useRouter';
import { useAuthContext } from '../../../auth/hooks';
import { useTranslate } from '../../../locales';
import { paths } from '../../../routes/paths';

export function LogOutButton({ onClose, sx, ...other }) {
  const router = useRouter();
  const { logout } = useAuthContext();
  const { t } = useTranslate('auth');

  const handleLogout = useCallback(() => {
    try {
      logout();          // ✅ clears tokens + user
      onClose?.();       // close drawer/popover if any

      router.push(paths.auth.login);
    } catch (error) {
      console.error(error);
    }
  }, [logout, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      {t('label.logout')}
    </Button>
  );
}