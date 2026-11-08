import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Button, Dialog } from '@mui/material';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from '../../../components/iconify';
import { Scrollbar } from '../../../components/scrollbar';
import { useTranslate } from '../../../locales';
import { AccountButton } from './AccountButton';
import { LogOutButton } from './LogOutButton';
import { useAuthContext } from '../../../auth/hooks';
import { formatDate, formatDateTime } from '../../../utils/formatTime';
import { RoleBadge } from './RoleBadge';
import { updateUserInfo, updateUserBasicInfo, changePassword, changeAvatar, sendVerificationCode, verifyEmailCode, getCurrentUser } from '../../../api/services/userService';
import { Field } from '../../../components/hookForm/Fields';
import { Form } from '../../../components/hookForm/FormProvider';
import { createEmailSchema, createInfoSchema, createPasswordSchema } from '../../../sections/auth/schema/signUp';
import { Trans } from 'react-i18next';
import { countries } from '../../../assets/data/countries';
import { getPrimaryRole } from '../../config/roleConfig';

export function AccountDrawer({ sx, ...other }) {
  const { user, checkUserSession } = useAuthContext();

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

  const PasswordSchema = useMemo(() => createPasswordSchema(c), [c]);
  const EmailSchema = useMemo(() => createEmailSchema(c), [c]);
  const InfoSchema = useMemo(() => createInfoSchema(c), [c]);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const showPassword = useBoolean();

  // modes: view | basic | email | password
  const [mode, setMode] = useState('view');

  // avatar mini-flow states
  const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const fileRef = useRef(null);

  const resetAvatarPanel = () => {
    setAvatarPanelOpen(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarSaving(false);
    // reset file input so selecting same file again triggers onChange
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrawerClose = () => {
    setMode('view');
    resetAvatarPanel();
    onClose();
  };

  const openFilePicker = () => fileRef.current?.click();

  const onPickAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    try {
      setAvatarSaving(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await changeAvatar(formData);
      enqueueSnackbar(m('changeAvatarSuccess'), { variant: 'success' });
      resetAvatarPanel();
    } catch (error) {
      enqueueSnackbar(error.message || m('changeAvatarFail'), { variant: 'error' });
    } finally {
      setAvatarSaving(false);
    }
  };

  // Edit form states
  const editForm = useForm({
    resolver: zodResolver(InfoSchema),
    defaultValues: {
      username: user?.username || '',
      displayName: user?.displayName || '',
      phone: user?.phone || '',
    },
  });
  const emailForm = useForm({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: user?.email || '',
      verifyCode: '',
    }
  });

  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KR');

  // Password form states
  const passwordForm = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      cfPassword: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  const splitPhone = (phone) => {
    if (!phone || !phone.startsWith('+')) {
      return {
        local: phone || '',
        country: undefined,
      };
    }

    const match = phone.match(/^\+(\d+)\s*(.*)$/);

    if (!match) {
      return {
        local: phone,
        country: undefined,
      };
    }

    const dialCode = match[1];
    const local = match[2] || '';

    return {
      local,
      dialCode,
    };
  };

  const resolveStoredAccountEmail = useCallback(async () => {
    if (user?.email != null && String(user.email) !== '') {
      return String(user.email);
    }

    const profile = await getCurrentUser();
    return profile?.email == null ? '' : String(profile.email);
  }, [user?.email]);

  const resetBasicInfoForm = useCallback(() => {
    const { local, dialCode } = splitPhone(user?.phone);
    const fullPhone = dialCode ? `+${dialCode} ${local}` : (user?.phone || '');

    editForm.reset({
      username: user?.username || '',
      displayName: user?.displayName || '',
      phone: fullPhone,
    });

    if (dialCode) {
      const matched = countries.find((c) => c.phone === dialCode);
      if (matched) {
        setSelectedCountry(matched.code);
      }
    }
  }, [user?.username, user?.displayName, user?.phone, editForm]);

  const handleOpenChangeBasicInfo = () => {
    resetAvatarPanel();
    resetBasicInfoForm();
    setMode('basic');
  };

  const handleCancelChangeBasicInfo = () => {
    resetBasicInfoForm();
    setMode('view');
  };

  useEffect(() => {
    setProfile({
      username: user?.username || '',
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      email: user?.email || '',
    });

    const { local, dialCode } = splitPhone(user?.phone);

    const fullPhone = dialCode ? `+${dialCode} ${local}` : (user?.phone || '');

    editForm.reset({
      username: user?.username || '',
      displayName: user?.displayName || '',
      phone: fullPhone,
    });

    // ✅ set initial country
    if (dialCode) {
      const matched = countries.find((c) => c.phone === dialCode);
      if (matched) {
        setSelectedCountry(matched.code);
      }
    }

    emailForm.reset({
      email: user?.email || '',
      verifyCode: '',
    });
  }, [user, editForm, emailForm]);

  // Email verification handlers
  const handleSendVerifyCode = async () => {
    const isValid = await emailForm.trigger('email'); // ✅ validate only email

    if (!isValid) return;
    
    const email = emailForm.getValues('email');
    if (
      user?.email &&
      String(email).trim().toLowerCase() === String(user.email).trim().toLowerCase()
    ) {
      enqueueSnackbar(m('emailUnchanged'), { variant: 'info' });
      return;
    }
    try {
      setEditLoading(true);
      await sendVerificationCode(email);
      setEmailSent(true);
      enqueueSnackbar(m('sendSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || m('sendFail'), { variant: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const isValid = await emailForm.trigger('email'); // ✅ validate only email

    if (!isValid) return;

    const email = emailForm.getValues('email');
    const verifyCode = emailForm.getValues('verifyCode');

    try {
      setEditLoading(true);
      await verifyEmailCode(email, verifyCode);

      await updateUserInfo({
        username: profile.username || user?.username,
        displayName: profile.displayName,
        phone: profile.phone,
        email: String(email).trim(),
      });

      await checkUserSession?.();

      setProfile((prev) => ({
        ...prev,
        email,
      }));

      setEmailVerified(true);
      enqueueSnackbar(m('changeEmailSuccess'), { variant: 'success' });
      setMode('view');
      setEmailSent(false);
      setEmailVerified(false);
      emailForm.reset({ email: email, verifyCode: '' });
    } catch (error) {
      enqueueSnackbar(error.message || m('changeEmailFail'), { variant: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenChangeEmail = () => {
    resetAvatarPanel();

    if (user?.uid) {
      setEmailConfirmOpen(true);
      return;
    }

    setMode((prev) => (prev === 'email' ? 'view' : 'email'));
  };

  const handleConfirmChangeEmail = () => {
    setEmailConfirmOpen(false);
    setMode((prev) => (prev === 'email' ? 'view' : 'email'));
  };

  // Edit form submit
  const handleEditSubmit = async (data) => {
    try {
      setEditLoading(true);

      const storedEmail = await resolveStoredAccountEmail();

      if (!storedEmail) {
        enqueueSnackbar(m('updateInfoFail'), { variant: 'error' });
        return;
      }

      await updateUserBasicInfo({
        username: data.username,
        displayName: data.displayName,
        phone: data.phone,
        email: storedEmail,
      });

      await checkUserSession?.();

      setProfile((prev) => ({
        ...prev,
        username: data.username,
        displayName: data.displayName || '',
        phone: data.phone || '',
        email: storedEmail,
      }));

      enqueueSnackbar(m('updateInfoSuccess'), { variant: 'success' });
      setMode('view');
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        m('updateInfoFail');
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  // Password form submit
  const handlePasswordSubmit = passwordForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
        cfPassword: data.cfPassword
      });
      enqueueSnackbar(m('changePasswordSuccess'), { variant: 'success' });
      setMode('view');
    } catch (error) {
      enqueueSnackbar(error.message || m('changePasswordFail'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  });

  const renderBasicInfoForm = () => (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2.5 }}>
        <Form methods={editForm} onSubmit={editForm.handleSubmit(handleEditSubmit)}>
          <Stack spacing={2}>
            <Field.Text name="username" label={l('username')} />
            <Field.Text name="displayName" label={l('nickname')} />
            <Field.Phone
              name="phone"
              label={l('phone')}
              country={selectedCountry}
              onCountryChange={setSelectedCountry}
              placeholder={l('phone')}
            />
          </Stack>
          <Button sx={{ width: '100%', mt: 2 }} variant="contained" type="submit" disabled={editLoading}>
            {editLoading ? l('saving') : l('save')}
          </Button>
          <Button
            sx={{ width: '100%', mt: 1 }}
            variant="outlined"
            onClick={handleCancelChangeBasicInfo}
          >
            {l('cancel')}
          </Button>
        </Form>
      </Box>
    </>
  );

  // Edit mode UI
  const renderEmailForm = () => (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2.5 }}>
        <Form methods={emailForm}>
          <Box sx={{ mb: 2 }}>
            <Field.Text name="email" label={l('email')} disabled={emailVerified} />
          </Box>
          {!emailSent && (
            <Button
              sx={{ width: '100%' }}
              variant="outlined"
              onClick={handleSendVerifyCode}
              disabled={editLoading || emailSent}
            >
              {editLoading ? l('sending') : l('sendVerificationCode')}
            </Button>
          )}
          {emailSent && !emailVerified && (
            <>
              <Alert severity="info">{m('sendAlert')}</Alert>
              <Box sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                <Field.Text
                  name="verifyCode"
                  label={l('verifyCode')}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyCode}
                  disabled={editLoading}
                >
                  {editLoading ? l('verifying') : l('verify')}
                </Button>
              </Box>
            </>
          )}
          <Button sx={{ width: '100%', mt: 1 }} variant="outlined" onClick={() => { setMode('view'); setEmailSent(false); setEmailVerified(false); emailForm.reset({ email: user?.email || '', verifyCode: '' }); }}>
            {l('cancel')}
          </Button>
        </Form>
      </Box>
    </>
  );

  // Password mode UI
  const renderPasswordForm = () => (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2.5 }}>
        <Form methods={passwordForm} onSubmit={handlePasswordSubmit}>
          <Stack spacing={2}>
            {/*Current Password */}
            <Field.Text
              name="currentPassword"
              label={l('currentPassword')}
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

            {/* New Password */}
            <Field.Text
              name="password"
              label={l('newPassword')}
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

            {/* Confirm Password */}
            <Field.Text
              name="cfPassword"
              label={l('confirmNewPassword')}
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
          </Stack>
          <Button sx={{ width: '100%', mt: 2 }} variant="contained" type="submit" disabled={loading}>
            {loading ? l('saving') : l('changePassword')}
          </Button>
          <Button sx={{ width: '100%', mt: 1 }} variant="outlined" onClick={() => setMode('view')}>
            {l('cancel')}
          </Button>
        </Form>
      </Box>
    </>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={user?.avatar || '/static/default-avatar.png'}
        displayName={profile?.displayName || '-'}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleDrawerClose}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        // Target the paper class directly inside sx
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Close button only (no header) */}
        <IconButton
          onClick={handleDrawerClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: 'absolute',
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <Box
            sx={{
              pt: 8,
              px: 2.5,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            {/* Avatar (click to open mini panel only in view mode) */}
            <Avatar
              src={avatarPreview || user?.avatar || '/static/default-avatar.png'}
              alt={profile?.displayName || l('profile')}
              sx={{ width: 80, height: 80, mb: 1.5, cursor: mode === 'view' ? 'pointer' : 'default' }}
              onClick={() => {
                if (mode !== 'view') return;
                setAvatarPanelOpen(true);
              }}
            />

            {/* Avatar mini controls (ONLY when avatarPanelOpen) */}
            {mode === 'view' && avatarPanelOpen && (
              <Box sx={{ width: 1, textAlign: 'center', mb: 1.5 }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onPickAvatarFile}
                />

                {/* link-style action */}
                <Link
                  component="button"
                  type="button"
                  onClick={openFilePicker}
                  sx={{
                    typography: 'body2',
                    textDecoration: 'underline',
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    p: 0,
                  }}
                >
                  {l('changeAvatar')}
                </Link>

                {/* Save/Cancel in same row */}
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!avatarFile || avatarSaving}
                    onClick={saveAvatar}
                  >
                    {avatarSaving ? l('saving') : l('save')}
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      resetAvatarPanel();
                    }}
                  >
                    {l('cancel')}
                  </Button>
                </Box>
              </Box>
            )}

            <Typography variant="subtitle1" noWrap sx={{ mt: 1, textAlign: 'center' }}>
              {profile?.displayName || '-'}
            </Typography>

            {mode === 'view' && (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }} noWrap>
                  {l('username')}: {profile?.username || '-'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }} noWrap>
                  {profile?.phone || '-'}
                </Typography>

                {profile?.email && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
                    {profile?.email}
                  </Typography>
                )}

                {user?.lastLogin && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
                    {l('lastLogin')}: {formatDateTime(user.lastLogin)}
                  </Typography>
                )}

                {user?.createdAt && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
                    {l('joined')}: {formatDate(user.createdAt)}
                  </Typography>
                )}

                <RoleBadge role={getPrimaryRole(user?.roles)} sx={{ mt: 1 }} />
              </>
            )}

          </Box>

          {mode === 'view' && (
            <>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={handleOpenChangeBasicInfo}
                  >
                    {l('changeBasicInfo')}
                  </Button>

                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={handleOpenChangeEmail}
                  >
                    {l('changeEmail')}
                  </Button>

                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={() => {
                      resetAvatarPanel();
                      setMode((prev) => (prev === 'password' ? 'view' : 'password'));
                    }}
                  >
                    {l('changePassword')}
                  </Button>
                </Stack>
              </Box>
            </>
          )}

          {mode === 'basic' && renderBasicInfoForm()}

          {mode === 'password' && renderPasswordForm()}

          {mode === 'email' && renderEmailForm()}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2.5 }}>
            <LogOutButton onClose={handleDrawerClose} />
          </Box>
        </Scrollbar>

        {/* Email change Confirm */}
        <Dialog
          open={emailConfirmOpen}
          onClose={() => setEmailConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {m('changeEmailConfirmTitle')}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              <Trans
                ns="auth"
                i18nKey="message.changeEmailConfirm"
                components={{
                  b: <Box component="span" sx={{ fontWeight: 700 }} />,
                }}
              />
            </Typography>

            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                onClick={() => setEmailConfirmOpen(false)}
              >
                {l('cancel')}
              </Button>

              <Button
                variant="contained"
                onClick={handleConfirmChangeEmail}
              >
                {l('change')}
              </Button>
            </Stack>
          </Box>
        </Dialog>
      </Drawer>
    </>
  );
}
