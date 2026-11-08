import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { getApiErrorMessage } from '../../api/axios';
import { updateBasicProfile } from '../../api/services/userService';
import { useAuthContext } from '../../auth/hooks';
import { useTranslate } from '../../locales';
import { parseBirthdayForForm } from '../../utils/profile';
import { createProfileAboutSchema } from './schema';

// ----------------------------------------------------------------------

const GENDERS = ['', 'MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const MARITAL = ['', 'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PARTNERED'];

function userToAboutDefaults(user) {
  return {
    displayName: user?.displayName || '',
    birthday: parseBirthdayForForm(user?.birthday),
    gender: user?.gender || '',
    hometown: user?.hometown || '',
    maritalStatus: user?.maritalStatus || '',
    currentLocation: user?.currentLocation || '',
    showBirthday: user?.showBirthday !== false,
    showGender: user?.showGender !== false,
    showMaritalStatus: user?.showMaritalStatus !== false,
    showHometown: user?.showHometown !== false,
  };
}

export function ProfileAboutPanel({ onSaved }) {
  const { user, checkUserSession } = useAuthContext();
  const { t } = useTranslate('profile');
  const { t: tAuth } = useTranslate('auth');
  const c = useCallback((key) => t(`condition.${key}`), [t]);
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const schema = useMemo(() => createProfileAboutSchema(c), [c]);
  const [saving, setSaving] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: userToAboutDefaults(user),
  });

  useEffect(() => {
    methods.reset(userToAboutDefaults(user));
  }, [user, methods]);

  const genderLabel = useCallback(
    (value) => {
      if (!value) return l('genderUnset');
      return l(`gender${value}`);
    },
    [l]
  );

  const maritalLabel = useCallback(
    (value) => {
      if (!value) return l('maritalUnset');
      return l(`marital${value}`);
    },
    [l]
  );

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      setSaving(true);
      await updateBasicProfile(data);
      await checkUserSession?.();
      enqueueSnackbar(m('aboutSuccess'), { variant: 'success' });
      onSaved?.();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('aboutFail')), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  });

  return (
    <Card sx={{ p: { xs: 2.5, md: 3 } }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          <Field.Text name="displayName" label={l('displayName')} />
          <Field.DatePicker name="birthday" label={l('birthday')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Field.Select name="gender" label={l('gender')}>
              {GENDERS.map((value) => (
                <MenuItem key={value || 'unset'} value={value}>
                  {genderLabel(value)}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Select name="maritalStatus" label={l('maritalStatus')}>
              {MARITAL.map((value) => (
                <MenuItem key={value || 'unset'} value={value}>
                  {maritalLabel(value)}
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
          <Field.Text name="hometown" label={l('hometown')} />
          <Field.Text name="currentLocation" label={l('currentLocation')} />

          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            {l('visibility')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}
          >
            <Field.Switch name="showBirthday" label={l('showBirthday')} />
            <Field.Switch name="showGender" label={l('showGender')} />
            <Field.Switch name="showMaritalStatus" label={l('showMaritalStatus')} />
            <Field.Switch name="showHometown" label={l('showHometown')} />
          </Box>

          <Button type="submit" variant="contained" size="large" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
            {saving ? tAuth('label.saving') : l('saveAbout')}
          </Button>
        </Stack>
      </Form>
    </Card>
  );
}
