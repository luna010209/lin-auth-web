import Container from '@mui/material/Container';
import { varBounce, MotionContainer } from 'src/components/animate';
import Typography from '@mui/material/Typography';

import { getUserRole } from '../../utils/auth';
import ForbiddenIllustration from '../../assets/illustrations/ForbiddenIllustration';
import { NavbarContent } from '../../layouts/navbar/Contents';
import { usePathname } from '../../routes/hooks/usePathname';
import { checkRoutePermission } from '../../routes/permissions';

// ----------------------------------------------------------------------

export function RoleGuard({ children, roles = [], path }) {
  const pathname = usePathname();
  const userRoles = getUserRole();
  const checkPath = path || pathname;

  if (roles && roles.length > 0) {
    if (userRoles.includes('ROLE_ADMIN') || roles.includes(userRoles?.[0])) {
      return <>{children}</>;
    }
  } else {
    if (checkRoutePermission(checkPath, userRoles)) {
      return <>{children}</>;
    }
  }

  return (
    <NavbarContent>
      <Container component={MotionContainer} sx={[{ textAlign: 'center' }]}>
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission denied
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    </NavbarContent>
  );
}
