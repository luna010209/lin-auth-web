import { m } from 'framer-motion';
import { Button } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

import { RouterLink } from '../../routes/components/RouterLink';
import { varBounce } from '../animate/variants';
import { MotionContainer } from '../animate/MotionContainer';
import PageNotFoundIllustration from '../../assets/illustrations/PageNotFoundIllustration';

// ----------------------------------------------------------------------

export function ErrorComponent({
  title, description, buttonText, href, n, illustration, onAction,
}) {

  const Illustration = illustration || PageNotFoundIllustration;
  return (
    <Container
      component={MotionContainer}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        component={m.div}
        variants={varBounce('in')}
        variant="h3"
        sx={{
          mb: 2,
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          wordBreak: 'keep-all',
        }}
      >
        {title ?? n('title')}
      </Typography>

      <Typography
        component={m.div}
        variants={varBounce('in')}
        sx={{
          color: 'text.secondary',
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          wordBreak: 'keep-all',
          maxWidth: 400,
        }}
      >
        {description ?? n('description')}
      </Typography>

      <Box
        component={m.div}
        variants={varBounce('in')}
      >
        <Illustration sx={{ my: { xs: 5, sm: 10 } }} />
      </Box>

      <Button
        component={onAction ? 'button' : RouterLink}
        href={onAction ? undefined : href || '/'}
        onClick={onAction}
        size="large"
        variant="contained"
      >
        {buttonText ?? n('home')}
      </Button>
    </Container>
  );
}
