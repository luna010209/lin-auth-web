import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Trans } from 'react-i18next';

import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { getApiErrorMessage } from '../../api/axios';
import {
  getCurrentUser,
  sendVerificationCode,
  updateAccountInfo,
  updateUserInfo,
  verifyEmailCode,
} from '../../api/services/userService';
import { useAuthContext } from '../../auth/hooks';
import { useTranslate } from '../../locales';
import { countries } from '../../assets/data/countries';
import { createEmailSchema } from '../auth/schema/signUp';
import { createProfileAccountSchema } from './schema';

// ----------------------------------------------------------------------

function splitPhone(phone) {
  if (!phone || !phone.startsWith('+')) {
    return { local: phone || '', dialCode: undefined };
  }
  const match = phone.match(/^\+(\d+)\s*(.*)$/);
  if (!match) return { local: phone, dialCode: undefined };
  return { local: match[2] || '', dialCode: match[1] };
}

export function ProfileAccountPanel({ embedded = false }) {
  const { user, checkUserSession } = useAuthContext();
  const { t } = useTranslate('profile');
  const { t: tAuth } = useTranslate('auth');

  const cProfile = useCallback((key) => t(`condition.${key}`), [t]);
  const cAuth = useCallback((key) => tAuth(`condition.${key}`), [tAuth]);
  const lAuth = useCallback((key) => tAuth(`label.${key}`), [tAuth]);
  const mAuth = useCallback((key) => tAuth(`message.${key}`), [tAuth]);
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const accountSchema = useMemo(() => createProfileAccountSchema(cProfile), [cProfile]);
  const emailSchema = useMemo(() => createEmailSchema(cAuth), [cAuth]);

  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [saving, setSaving] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  const accountForm = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { username: '', phone: '' },
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', verifyCode: '' },
  });

  const resetAccountForm = useCallback(() => {
    const { local, dialCode } = splitPhone(user?.phone);
    const fullPhone = dialCode ? `+${dialCode} ${local}` : user?.phone || '';

    accountForm.reset({
      username: user?.username || '',
      phone: fullPhone,
    });

    if (dialCode) {
      const matched = countries.find((country) => country.phone === dialCode);
      if (matched) setSelectedCountry(matched.code);
    }
  }, [user?.username, user?.phone, accountForm]);

  useEffect(() => {
    resetAccountForm();
    emailForm.reset({ email: user?.email || '', verifyCode: '' });
  }, [user, resetAccountForm, emailForm]);

  const resolveStoredEmail = useCallback(async () => {
    if (user?.email != null && String(user.email) !== '') {
      return String(user.email);
    }
    const profile = await getCurrentUser();
    return profile?.email == null ? '' : String(profile.email);
  }, [user?.email]);

  const onAccountSubmit = accountForm.handleSubmit(async (data) => {
    try {
      setSaving(true);
      const storedEmail = await resolveStoredEmail();
      if (!storedEmail) {
        enqueueSnackbar(m('accountFail'), { variant: 'error' });
        return;
      }
      await updateAccountInfo({
        username: data.username,
        phone: data.phone,
        email: storedEmail,
      });
      await checkUserSession?.();
      enqueueSnackbar(m('accountSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('accountFail')), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  });

  const handleSendVerifyCode = async () => {
    const isValid = await emailForm.trigger('email');
    if (!isValid) return;

    const email = emailForm.getValues('email');
    if (
      user?.email &&
      String(email).trim().toLowerCase() === String(user.email).trim().toLowerCase()
    ) {
      enqueueSnackbar(mAuth('emailUnchanged'), { variant: 'info' });
      return;
    }

    try {
      setEmailLoading(true);
      await sendVerificationCode(email);
      setEmailSent(true);
      enqueueSnackbar(mAuth('sendSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, mAuth('sendFail')), { variant: 'error' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const isValid = await emailForm.trigger(['email', 'verifyCode']);
    if (!isValid) return;

    const email = emailForm.getValues('email');
    const verifyCode = emailForm.getValues('verifyCode');

    try {
      setEmailLoading(true);
      await verifyEmailCode(email, verifyCode);

      await updateUserInfo({
        username: user?.username,
        phone: user?.phone,
        email: String(email).trim(),
      });

      await checkUserSession?.();
      enqueueSnackbar(mAuth('changeEmailSuccess'), { variant: 'success' });
      setEmailMode(false);
      setEmailSent(false);
      setEmailVerified(false);
      emailForm.reset({ email: email, verifyCode: '' });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, mAuth('changeEmailFail')), { variant: 'error' });
    } finally {
      setEmailLoading(false);
    }
  };

  const openEmailChange = () => {
    if (user?.uid) {
      setEmailConfirmOpen(true);
      return;
    }
    setEmailMode(true);
  };

  const accountCardSx = embedded ? undefined : { p: { xs: 2.5, md: 3 } };
  const AccountWrap = embedded ? Box : Card;

  return (
    <Stack spacing={2}>
      <AccountWrap sx={accountCardSx}>
        <Form methods={accountForm} onSubmit={onAccountSubmit}>
          <Stack spacing={2}>
            <Field.Text name="username" label={lAuth('username')} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                {l('accountReadOnlyEmail')}
              </Typography>
              <Typography variant="body1">{user?.email || '—'}</Typography>
            </Box>
            <Field.Phone
              name="phone"
              label={lAuth('phone')}
              country={selectedCountry}
              onCountryChange={setSelectedCountry}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? lAuth('saving') : l('saveAccount')}
              </Button>
              <Button variant="outlined" onClick={openEmailChange}>
                {l('changeEmail')}
              </Button>
            </Stack>
          </Stack>
        </Form>
      </AccountWrap>

      {emailMode && (
        <AccountWrap sx={embedded ? { pt: 2, borderTop: 1, borderColor: 'divider' } : { p: { xs: 2.5, md: 3 } }}>
          <Form methods={emailForm}>
            <Stack spacing={2}>
              <Field.Text name="email" label={lAuth('email')} disabled={emailVerified} />
              {!emailSent && (
                <Button variant="outlined" onClick={handleSendVerifyCode} disabled={emailLoading}>
                  {emailLoading ? lAuth('sending') : lAuth('sendVerificationCode')}
                </Button>
              )}
              {emailSent && (
                <>
                  <Alert severity="info">{mAuth('sendAlert')}</Alert>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center' }}>
                    <Field.Text name="verifyCode" label={lAuth('verifyCode')} sx={{ flex: 1 }} />
                    <Button variant="contained" onClick={handleVerifyCode} disabled={emailLoading}>
                      {emailLoading ? lAuth('verifying') : lAuth('verify')}
                    </Button>
                  </Stack>
                </>
              )}
              <Button
                variant="text"
                onClick={() => {
                  setEmailMode(false);
                  setEmailSent(false);
                  emailForm.reset({ email: user?.email || '', verifyCode: '' });
                }}
              >
                {lAuth('cancel')}
              </Button>
            </Stack>
          </Form>
        </AccountWrap>
      )}

      <Dialog open={emailConfirmOpen} onClose={() => setEmailConfirmOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {mAuth('changeEmailConfirmTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            <Trans
              ns="auth"
              i18nKey="message.changeEmailConfirm"
              components={{ b: <Box component="span" sx={{ fontWeight: 700 }} /> }}
            />
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="text" onClick={() => setEmailConfirmOpen(false)}>
              {lAuth('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setEmailConfirmOpen(false);
                setEmailMode(true);
              }}
            >
              {lAuth('change')}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Stack>
  );
}
