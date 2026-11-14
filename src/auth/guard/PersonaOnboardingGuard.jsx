import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { fetchPersonas } from '../../api/services/personaService';
import { useAuthContext } from '../hooks';
import { usePathname } from '../../routes/hooks/usePathname';
import { paths } from '../../routes/paths';
import { isProfileIncomplete } from '../../utils/profile';

// ----------------------------------------------------------------------

/** When profile is complete but the user has no personas, send them to persona onboarding. */
export function PersonaOnboardingGuard({ children }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthContext();
  const [check, setCheck] = useState({ ready: false, hasPersona: true });

  useEffect(() => {
    if (authLoading || !user || isProfileIncomplete(user)) {
      setCheck({ ready: true, hasPersona: true });
      return undefined;
    }

    let cancelled = false;

    fetchPersonas()
      .then((list) => {
        if (cancelled) return;
        const hasPersona = Array.isArray(list) && list.length > 0;
        setCheck({ ready: true, hasPersona });
      })
      .catch(() => {
        if (!cancelled) {
          setCheck({ ready: true, hasPersona: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading || !check.ready) {
    return children;
  }

  if (!user || isProfileIncomplete(user)) {
    return children;
  }

  const onProfile =
    pathname === paths.profile.root || pathname.startsWith(`${paths.profile.root}/`);
  const onPersona =
    pathname === paths.persona.manage || pathname.startsWith(`${paths.persona.manage}/`);

  if (!check.hasPersona && !onPersona && !onProfile) {
    return (
      <Navigate
        to={`${paths.persona.manage}?onboarding=1`}
        replace
        state={{ from: pathname }}
      />
    );
  }

  return children;
}