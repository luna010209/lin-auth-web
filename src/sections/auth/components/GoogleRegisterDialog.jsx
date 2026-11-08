import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from 'react-i18next';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'minimal-shared/hooks';

import { Form } from '../../../components/hookForm/FormProvider';
import { Field } from '../../../components/hookForm/Fields';
import { Iconify } from '../../../components/iconify';
import { useTranslate } from '../../../locales';
import { createGoogleRegisterSchema } from '../schema/googleRegister';

function defaultUsernameFromEmail(email) {
  if (!email) return '';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  return atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
}

export function GoogleRegisterDialog({
  open,
  email,
  displayName,
  onClose,
  onSubmit,
  submitting,
}) {
  const { t } = useTranslate('auth');
  const c = useCallback((key) => t(`condition.${key}`), [t]);
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const showPassword = useBoolean();
  const [selectedCountry, setSelectedCountry] = useState(() => t('country'));

  const schema = useMemo(() => createGoogleRegisterSchema(c), [c]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      displayName: '',
      password: '',
      cfPassword: '',
      phone: '',
    },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (!open) return;

    setSelectedCountry(t('country'));
    reset({
      username: defaultUsernameFromEmail(email),
      displayName: displayName ?? '',
      password: '',
      cfPassword: '',
      phone: '',
    });
  }, [open, email, displayName, reset, t]);

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{l('googleRegisterTitle')}</DialogTitle>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              <Trans
                i18nKey="auth:message.googleRegisterDescription"
                values={{ email }}
                components={{ strong: <strong /> }}
              />
            </Typography>

            <Field.Text name="username" label={l('username')} />

            <Field.Text name="displayName" label={l('nickname')} />

            <Field.Text
              name="password"
              label={l('password')}
              type={showPassword.value ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPassword.onToggle} edge="end">
                        <Iconify
                          icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
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
                      <IconButton onClick={showPassword.onToggle} edge="end">
                        <Iconify
                          icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Field.Phone
              name="phone"
              label={l('phone')}
              country={selectedCountry}
              onCountryChange={setSelectedCountry}
              placeholder={l('phone')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={submitting}>{l('cancel')}</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? l('googleRegistering') : l('googleRegisterSubmit')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
