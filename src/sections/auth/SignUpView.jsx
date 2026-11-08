import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { enqueueSnackbar } from 'notistack';
import { useRouter } from '../../routes/hooks/useRouter';
import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { sendVerificationCode, signUp, verifyEmailCode } from '../../api/services/userService';
import { Iconify } from '../../components/iconify';
import { FormHead } from './components/FormHead';
import { useTranslate } from '../../locales';
import { createSignUpSchema } from './schema/signUp';
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

export function SignUpView() {
  const { t } = useTranslate('auth');
  const c = useCallback(
    (key) => t(`condition.${key}`), [t]
  );
  const m = useCallback(
    (key) => t(`message.${key}`), [t]
  );
  const l = useCallback(
    (key) => t(`label.${key}`), [t]
  );

  const SignUpSchema = useMemo(() => createSignUpSchema(c), [c]);

  const router = useRouter();

  const showPassword = useBoolean();

  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(t('country'));

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: '',
      email: '',
      verifyCode: '',
      nickname: '',
      phone: '',
      password: '',
      cfPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleSendVerifyCode = async () => {
    const isValid = await methods.trigger('email');
    if (!isValid) return;

    const email = methods.getValues('email');

    try {
      setLoading(true);
      await sendVerificationCode(email);
      setEmailSent(true);
      enqueueSnackbar(m('sendSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error.message || m('sendFail'),
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const isValid = await methods.trigger(['email', 'verifyCode']);
    if (!isValid) return;

    const { email, verifyCode } = methods.getValues();

    try {
      setLoading(true);
      await verifyEmailCode(email, verifyCode);
      setEmailVerified(true);
      enqueueSnackbar(m('verifySuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error.message || m('verifyFail'),
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!emailVerified) {
      enqueueSnackbar(m('emailAlert'), {
        variant: 'warning',
      });
      return;
    }

    try {
      setLoading(true);

      await signUp({
        username: data.username,
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        password: data.password,
        cfPassword: data.cfPassword,
      });

      enqueueSnackbar(m('signUpSuccess'), {
        variant: 'success',
      });

      router.push('/login');
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message ||
        error.message ||
        m('signUpFail'),
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="username" label={l('username')} />

      <Field.Text name="nickname" label={l('nickname')} />

      <Field.Phone
        name="phone"
        label={l('phone')}
        country={selectedCountry}
        onCountryChange={setSelectedCountry}
        placeholder={l('phone')}
      />

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
                    icon={showPassword.value
                      ? 'solar:eye-bold'
                      : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text
        name="cfPassword"
        label={l('cfPassword')}
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle}>
                  <Iconify
                    icon={showPassword.value
                      ? 'solar:eye-bold'
                      : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Field.Text
        name="email"
        label={l('email')}
        disabled={emailVerified}
      />

      {!emailSent && (
        <Button
          variant="outlined"
          onClick={handleSendVerifyCode}
          disabled={loading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading ? l('sending') : l('sendVerificationCode')}
        </Button>
      )}

      {emailSent && !emailVerified && (
        <Alert severity="info">
          {m('sendAlert')}
        </Alert>
      )}

      {emailSent && !emailVerified && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Field.Text
            name="verifyCode"
            label={l('verifyCode')}
            sx={{ flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={handleVerifyCode}
            disabled={loading}
          >
            {loading ? l('verifying') : l('verify')}
          </Button>
        </Box>
      )}

      {emailVerified && (
        <Alert severity="success">
          {m('verifySuccess')}
        </Alert>
      )}

      <Button
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? l('signingUp') : l('signUp')}
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={
          <img
            src="/assets/icons/auth/signUp.svg"
            alt="Sign Up"
            height={50}
          />
        }
        title={l('signUpTitle')}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" align="center">
        {m('alreadyHaveAccount')}{' '}
        <Link
          sx={{ cursor: 'pointer', color: 'primary.dark' }}
          onClick={() => router.push(paths.auth.login)}
        >
          {l('login')}
        </Link>
      </Typography>
    </>
  );
}

export default SignUpView;
