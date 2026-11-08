import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { getApiErrorMessage } from '../../api/axios';
import { updateBasicProfile } from '../../api/services/userService';
import { useAuthContext } from '../../auth/hooks';
import { useTranslate } from '../../locales';
import { parseBirthdayForForm } from '../../utils/profile';
import { createProfileAboutSchema } from './schema';
import { ProfileLocationField } from './ProfileLocationField';

// ----------------------------------------------------------------------

const GENDERS = ['', 'MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const MARITAL = ['', 'SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'PARTNERED'];

/** Fixed visibility column so public/private label length does not resize inputs (md+). */
const VISIBILITY_COLUMN_WIDTH = 228;

function ProfileVisibilitySwitch({ switchName, labelPublic, labelPrivate }) {
  const { control } = useFormContext();
  const isPublic = useWatch({ control, name: switchName });
  const switchLabel = isPublic ? labelPublic : labelPrivate;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 1,
        minHeight: { xs: 40, md: 56 },
        pl: { xs: 0.5, md: 0 },
      }}
    >
      <Field.Switch
        name={switchName}
        label={switchLabel}
        labelPlacement="start"
        sx={{
          m: 0,
          width: 1,
          mx: 0,
          justifyContent: 'space-between',
          gap: 0.5,
          '& .MuiFormControlLabel-label': {
            flex: 1,
            minWidth: 0,
            typography: 'body2',
            lineHeight: 1.35,
            whiteSpace: 'normal',
          },
        }}
        slotProps={{
          wrapper: { sx: { width: 1 } },
        }}
      />
    </Box>
  );
}

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

export function ProfileAboutPanel({ embedded = false, onSaved }) {
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

  const labelPublic = l('visibilityPublic');
  const labelPrivate = l('visibilityPrivate');

  const formBody = (
      <Form methods={methods} onSubmit={onSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: `minmax(0, 1fr) ${VISIBILITY_COLUMN_WIDTH}px`,
            },
            columnGap: { xs: 0, md: 2 },
            rowGap: 2.5,
            alignItems: 'start',
          }}
        >
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, minWidth: 0 }}>
            <Field.Text name="displayName" label={l('displayName')} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Field.DatePicker name="birthday" label={l('birthday')} />
          </Box>
          <ProfileVisibilitySwitch
            switchName="showBirthday"
            labelPublic={labelPublic}
            labelPrivate={labelPrivate}
          />

          <Box sx={{ minWidth: 0 }}>
            <Field.Select name="gender" label={l('gender')}>
              {GENDERS.map((value) => (
                <MenuItem key={value || 'unset'} value={value}>
                  {genderLabel(value)}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
          <ProfileVisibilitySwitch
            switchName="showGender"
            labelPublic={labelPublic}
            labelPrivate={labelPrivate}
          />

          <Box sx={{ minWidth: 0 }}>
            <Field.Select name="maritalStatus" label={l('maritalStatus')}>
              {MARITAL.map((value) => (
                <MenuItem key={value || 'unset'} value={value}>
                  {maritalLabel(value)}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
          <ProfileVisibilitySwitch
            switchName="showMaritalStatus"
            labelPublic={labelPublic}
            labelPrivate={labelPrivate}
          />

          <Box sx={{ minWidth: 0 }}>
            <Field.Text name="hometown" label={l('hometown')} />
          </Box>
          <ProfileVisibilitySwitch
            switchName="showHometown"
            labelPublic={labelPublic}
            labelPrivate={labelPrivate}
          />

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, minWidth: 0 }}>
            <ProfileLocationField name="currentLocation" />
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Button type="submit" variant="contained" size="large" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
              {saving ? tAuth('label.saving') : l('saveAbout')}
            </Button>
          </Box>
        </Box>
      </Form>
  );

  if (embedded) {
    return formBody;
  }

  return <Card sx={{ p: { xs: 2.5, md: 3 } }}>{formBody}</Card>;
}
