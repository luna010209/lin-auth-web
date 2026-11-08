import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import ForbiddenIllustration from '../../assets/illustrations/ForbiddenIllustration';
import { varBounce } from '../../components/animate/variants';
import { MotionContainer } from '../../components/animate/MotionContainer';

// ----------------------------------------------------------------------

export function RoleBasedGuard({ sx, children, hasContent, currentRole, acceptRoles }) {
  if (typeof acceptRoles !== 'undefined' && !acceptRoles.includes(currentRole)) {
    return hasContent ? (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
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
    ) : null;
  }

  return <> {children} </>;
}
