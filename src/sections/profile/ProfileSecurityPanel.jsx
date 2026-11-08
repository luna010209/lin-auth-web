import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { useBoolean } from 'minimal-shared/hooks';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';

import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { Iconify } from '../../components/iconify';
import { getApiErrorMessage } from '../../api/axios';
import { changePassword } from '../../api/services/userService';
import { useTranslate } from '../../locales';
import { createPasswordSchema } from '../auth/schema/signUp';

// ----------------------------------------------------------------------

export function ProfileSecurityPanel() {
  const { t: tAuth } = useTranslate('auth');
  const c = useCallback((key) => tAuth(`condition.${key}`), [tAuth]);
  const l = useCallback((key) => tAuth(`label.${key}`), [tAuth]);
  const m = useCallback((key) => tAuth(`message.${key}`), [tAuth]);

  const schema = useMemo(() => createPasswordSchema(c), [c]);
  const showPassword = useBoolean();
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      password: '',
      cfPassword: '',
    },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      setLoading(true);
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
        cfPassword: data.cfPassword,
      });
      enqueueSnackbar(m('changePasswordSuccess'), { variant: 'success' });
      methods.reset();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('changePasswordFail')), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  });

  const eyeAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={showPassword.onToggle} edge="end">
        <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Card sx={{ p: { xs: 2.5, md: 3 }, maxWidth: 480 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Field.Text
            name="currentPassword"
            label={l('currentPassword')}
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{ input: { endAdornment: eyeAdornment } }}
          />
          <Field.Text
            name="password"
            label={l('newPassword')}
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{ input: { endAdornment: eyeAdornment } }}
          />
          <Field.Text
            name="cfPassword"
            label={l('confirmNewPassword')}
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{ input: { endAdornment: eyeAdornment } }}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? l('saving') : l('changePassword')}
          </Button>
        </Stack>
      </Form>
    </Card>
  );
}
