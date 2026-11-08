import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { Trans } from 'react-i18next';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from '../../routes/hooks/useRouter';
import { useSearchParams } from '../../routes/hooks/useSearchParams';
import { useBoolean } from 'minimal-shared/hooks';
import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { Iconify } from '../../components/iconify';

import { FormHead } from './components/FormHead';
import { GoogleRegisterDialog } from './components/GoogleRegisterDialog';
import { useTranslate } from '../../locales';
import { createLoginSchema } from './schema/login';
import { createRecoverySchema } from './schema/login';
import { paths } from '../../routes/paths';
import { getApiErrorMessage } from '../../api/axios';
import {
  login,
  findUsername,
  findPassword,
  appLoginCheck,
  appRegister,
} from '../../api/services/userService';
import { getStoredUserJson, setTokens } from '../../auth/token';
import { resolvePostLoginPath } from '../../utils/profile';
import { useAuthContext } from '../../auth/hooks';
import { CONFIG } from '../../globalConfig';
import { signInWithGoogle } from '../../auth/googleAuth';
import { isFirebaseConfigured } from '../../lib/firebase';

// ----------------------------------------------------------------------

function getSafeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return CONFIG.auth.redirectPath || paths.main.home;
  }
  return value;
}

async function completeAppLogin(result, checkUserSession, router, returnTo, successMessage) {
  if (!result?.accessToken) {
    throw new Error('Missing access token');
  }

  setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  await checkUserSession({ strict: true });
  enqueueSnackbar(successMessage, { variant: 'success' });

  let sessionUser = null;
  try {
    sessionUser = JSON.parse(getStoredUserJson() || 'null');
  } catch {
    sessionUser = null;
  }
  router.replace(resolvePostLoginPath(sessionUser, returnTo));
}

export function LoginView() {
  const { t } = useTranslate('auth');

  const c = useCallback((key) => t(`condition.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);
  const l = useCallback((key) => t(`label.${key}`), [t]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const showPassword = useBoolean();
  const showGoogleLogin = isFirebaseConfigured();

  const [recoveryMode, setRecoveryMode] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRegister, setGoogleRegister] = useState({
    open: false,
    idToken: '',
    email: '',
    displayName: '',
  });
  const [registeringGoogle, setRegisteringGoogle] = useState(false);

  const LoginSchema = useMemo(() => createLoginSchema(c), [c]);
  const RecoverySchema = useMemo(() => createRecoverySchema(c), [c]);

  const methods = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { checkUserSession } = useAuthContext();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const tokens = await login(data.username, data.password);

      if (!tokens?.accessToken) {
        throw new Error(m('loginFail'));
      }

      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      await checkUserSession({ strict: true });

      enqueueSnackbar(m('loginSuccess'), { variant: 'success' });

      let sessionUser = null;
      try {
        sessionUser = JSON.parse(getStoredUserJson() || 'null');
      } catch {
        // ignore
      }
      router.replace(resolvePostLoginPath(sessionUser, returnTo));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('loginFail')), { variant: 'error' });
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { idToken, profile } = await signInWithGoogle();
      const result = await appLoginCheck(idToken);

      if (result?.status === 'LOGIN_SUCCESS') {
        await completeAppLogin(result, checkUserSession, router, returnTo, m('loginSuccess'));
        return;
      }

      if (result?.status === 'NEED_REGISTER') {
        const socialProfile = result.profile ?? profile;
        setGoogleRegister({
          open: true,
          idToken,
          email: socialProfile?.email ?? profile.email ?? '',
          displayName: socialProfile?.displayName ?? profile.displayName ?? '',
        });
        return;
      }

      throw new Error(m('googleLoginFail'));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('googleLoginFail')), { variant: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = async ({ username, displayName, password, cfPassword, phone }) => {
    try {
      setRegisteringGoogle(true);
      const normalizedDisplayName = displayName?.trim() || undefined;
      const result = await appRegister(googleRegister.idToken, {
        username,
        displayName: normalizedDisplayName,
        phone: phone || undefined,
        password,
        cfPassword,
      });
      setGoogleRegister({ open: false, idToken: '', email: '', displayName: '' });
      await completeAppLogin(result, checkUserSession, router, returnTo, m('googleRegisterSuccess'));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('googleRegisterFail')), { variant: 'error' });
    } finally {
      setRegisteringGoogle(false);
    }
  };

  const recoveryMethods = useForm({
    resolver: zodResolver(RecoverySchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit: handleRecoverySubmit,
    reset: resetRecovery,
    formState: { isSubmitting: isRecoverySubmitting },
  } = recoveryMethods;

  const onRecoverySubmit = handleRecoverySubmit(async ({ email }) => {
    if (!recoveryMode) return;

    try {
      if (recoveryMode === 'username') {
        await findUsername(email);
        enqueueSnackbar(m('findUsernameSent'), { variant: 'success' });
      } else {
        await findPassword(email);
        enqueueSnackbar(m('findPasswordSent'), { variant: 'success' });
      }
      resetRecovery({ email: '' });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('requestFail')), { variant: 'error' });
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 1.25, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="username" label={l('username')} />

      <Typography variant="caption" sx={{ alignSelf: 'flex-end' }}>
        <Link
          sx={{ cursor: 'pointer' }}
          onClick={() => setRecoveryMode('username')}
        >
          {m('forgotUsername')}
        </Link>
      </Typography>

      <Field.Text
        name="password"
        label={l('password')}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle}>
                  <Iconify
                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Typography variant="caption" sx={{ alignSelf: 'flex-end' }}>
        <Link
          sx={{ cursor: 'pointer' }}
          onClick={() => setRecoveryMode('password')}
        >
          {m('forgotPassword')}
        </Link>
      </Typography>

      <Button
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting || googleLoading}
        sx={{ mt: 1 }}
      >
        {isSubmitting ? l('loggingIn') : l('login')}
      </Button>

      {showGoogleLogin && (
        <>
          <Divider sx={{ my: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {l('orContinueWith')}
            </Typography>
          </Divider>

          <Button
            fullWidth
            size="large"
            variant="outlined"
            color="inherit"
            disabled={isSubmitting || googleLoading}
            onClick={handleGoogleLogin}
            startIcon={<Iconify icon="logos:google-icon" width={22} />}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' },
            }}
          >
            {googleLoading ? l('googleSigningIn') : l('googleLogin')}
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<img src="/assets/icons/auth/login.svg" alt="Login" height={50} />}
        title={l('loginTitle')}
      />

      <Box
        sx={{
          mb: 3,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'primary.lighter',
          color: 'primary.dark',
        }}
      >
        <Iconify icon="solar:danger-triangle-bold" />

        <Typography variant="body2">
          <Trans i18nKey="auth:message.loginAlert" components={{ b: <b /> }} />
        </Typography>
      </Box>

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Divider sx={{ my: 3 }} />

      {recoveryMode && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {recoveryMode === 'username' ? l('recoverUsernameTitle') : l('recoverPasswordTitle')}
          </Typography>

          <Form methods={recoveryMethods} onSubmit={onRecoverySubmit}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Field.Text
                name="email"
                label={l('email')}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={isRecoverySubmitting}
                sx={{ whiteSpace: 'nowrap', mt: '4px' }}
              >
                {isRecoverySubmitting ? l('sending') : l('send')}
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              <Link
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  setRecoveryMode(null);
                  resetRecovery({ email: '' });
                }}
              >
                {l('cancel')}
              </Link>
            </Typography>
          </Form>
        </Box>
      )}

      <Typography variant="body2" align="center">
        {m('donotHaveAccount')}{' '}
        <Link
          sx={{ cursor: 'pointer', color: 'primary.dark' }}
          onClick={() => router.push(paths.auth.signUp)}
        >
          {l('signUpTitle')}
        </Link>
      </Typography>

      <GoogleRegisterDialog
        open={googleRegister.open}
        email={googleRegister.email}
        displayName={googleRegister.displayName}
        onClose={() => setGoogleRegister({ open: false, idToken: '', email: '', displayName: '' })}
        onSubmit={handleGoogleRegister}
        submitting={registeringGoogle}
      />
    </>
  );
}

export default LoginView;
