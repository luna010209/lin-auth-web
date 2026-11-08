import { useAuthContext } from '../../../auth/hooks';
import { RouterLink } from '../../../routes/components/RouterLink';
import { paths } from '../../../routes/paths';
import { AccountButton } from './AccountButton';

// ----------------------------------------------------------------------

export function ProfileNavButton({ sx }) {
  const { user } = useAuthContext();
  const displayName = user?.displayName || user?.username || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <AccountButton
      component={RouterLink}
      href={paths.profile.root}
      photoURL={null}
      displayName={initial}
      sx={sx}
    />
  );
}
