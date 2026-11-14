import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { enqueueSnackbar } from 'notistack';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

import { PageDocumentTitle } from '../../components/documentTitle/PageDocumentTitle';
import { EmptyContent } from '../../components/emptyContent/EmptyContent';
import { Iconify } from '../../components/iconify';
import { Form } from '../../components/hookForm/FormProvider';
import { Field } from '../../components/hookForm/Fields';
import { getApiErrorMessage } from '../../api/axios';
import { createPersona, deletePersona, fetchPersonas } from '../../api/services/personaService';
import { useAuthContext } from '../../auth/hooks';
import { useRouter } from '../../routes/hooks/useRouter';
import { useSearchParams } from '../../routes/hooks/useSearchParams';
import { paths } from '../../routes/paths';
import { useTranslate } from '../../locales';
import { formatDateTime } from '../../utils/formatTime';
import { fileToApiByteArray } from '../../utils/fileBytes';

// ----------------------------------------------------------------------

const createSchema = zod.object({
  displayName: zod.string().max(150).optional(),
  headline: zod.string().max(255).optional(),
  bio: zod.string().max(5000).optional(),
  location: zod.string().max(150).optional(),
  avatar: zod
    .custom((value) => value == null || value instanceof File, {
      message: 'Invalid avatar file',
    })
    .optional()
    .nullable(),
});

export function PersonaManageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const { t } = useTranslate('persona');
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const onboarding = searchParams?.get('onboarding') === '1';
  const onboardingDialogShown = useRef(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const methods = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      displayName: '',
      headline: '',
      bio: '',
      location: '',
      avatar: null,
    },
  });

  const openCreateDialog = useCallback(() => {
    methods.reset({
      displayName: user?.displayName?.trim() || '',
      headline: '',
      bio: '',
      location: user?.currentLocation?.trim() || '',
      avatar: null,
    });
    setCreateOpen(true);
  }, [methods, user?.currentLocation, user?.displayName]);

  const loadPersonas = useCallback(async () => {
    try {
      setLoading(true);
      const list = (await fetchPersonas()) ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('loadFail')), { variant: 'error' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [m]);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  useEffect(() => {
    if (!onboarding || loading || onboardingDialogShown.current) {
      return;
    }
    if (rows.length === 0) {
      onboardingDialogShown.current = true;
      openCreateDialog();
    }
  }, [loading, onboarding, openCreateDialog, rows.length]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm(m('deleteConfirm'))) return;
      try {
        await deletePersona(id);
        enqueueSnackbar(m('deleteSuccess'), { variant: 'success' });
        await loadPersonas();
      } catch (error) {
        enqueueSnackbar(getApiErrorMessage(error, m('deleteFail')), { variant: 'error' });
      }
    },
    [loadPersonas, m]
  );

  const isLastPersona = rows.length === 1;

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'displayName', headerName: l('displayName'), flex: 1, minWidth: 140 },
      { field: 'headline', headerName: l('headline'), flex: 1, minWidth: 160 },
      { field: 'location', headerName: l('location'), flex: 1, minWidth: 120 },
      {
        field: 'createdAt',
        headerName: l('createdAt'),
        width: 180,
        valueFormatter: (value) => (value ? formatDateTime(value) : '—'),
      },
      {
        field: 'actions',
        headerName: l('actions'),
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <IconButton
            size="small"
            color="error"
            disabled={isLastPersona}
            onClick={() => handleDelete(params.row.id)}
            aria-label={l('delete')}
            title={isLastPersona ? m('deleteLastHint') : undefined}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        ),
      },
    ],
    [handleDelete, isLastPersona, l, m]
  );

  const onCreate = methods.handleSubmit(async (data) => {
    const avatarBytes =
      data.avatar instanceof File ? await fileToApiByteArray(data.avatar) : null;

    const body = {
      displayName: data.displayName?.trim() || null,
      headline: data.headline?.trim() || null,
      bio: data.bio?.trim() || null,
      location: data.location?.trim() || null,
      ...(avatarBytes ? { avatar: avatarBytes } : {}),
    };

    try {
      setSaving(true);
      await createPersona(body);
      enqueueSnackbar(m('createSuccess'), { variant: 'success' });
      setCreateOpen(false);
      methods.reset();
      await loadPersonas();
      if (onboarding) {
        router.replace(paths.persona.manage);
      }
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, m('createFail')), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  });

  return (
    <>
      <PageDocumentTitle title={l('title')} />

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {onboarding && rows.length === 0 && !loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {m('onboardingBanner')}
          </Alert>
        )}

        <Stack
          direction="row"
          spacing={0}
          sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="h4">{l('manage')}</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={loadPersonas} disabled={loading} startIcon={<Iconify icon="solar:refresh-bold" />}>
              {l('refresh')}
            </Button>
            <Button
              variant="contained"
              onClick={openCreateDialog}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {l('create')}
            </Button>
          </Stack>
        </Stack>

        <Card sx={{ height: 480 }}>
          {!loading && rows.length === 0 ? (
            <EmptyContent
              filled
              title={l('emptyTitle')}
              description={l('emptyDescription')}
              sx={{ py: 10 }}
              action={
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={openCreateDialog}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    {l('create')}
                  </Button>
                </Box>
              }
            />
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          )}
        </Card>
      </Box>

      <Dialog
        open={createOpen}
        onClose={() => {
          if (saving) return;
          if (onboarding && rows.length === 0) return;
          setCreateOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{onboarding && rows.length === 0 ? l('onboardingTitle') : l('create')}</DialogTitle>
        <Form methods={methods} onSubmit={onCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {onboarding && rows.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {m('onboardingHint')}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle2" sx={{ alignSelf: 'flex-start' }}>
                {l('avatar')}
              </Typography>
              <Field.UploadAvatar
                name="avatar"
                helperText={m('avatarHelper')}
                uploadCaption={l('avatarUpload')}
                updateCaption={l('avatarUpdate')}
                accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
              />
            </Box>

            <Field.Text name="displayName" label={l('displayName')} />
            <Field.Text name="headline" label={l('headline')} />
            <Field.Text name="location" label={l('location')} />
            <Field.Text name="bio" label={l('bio')} multiline rows={4} />
          </DialogContent>
          <DialogActions>
            {!(onboarding && rows.length === 0) && (
              <Button onClick={() => setCreateOpen(false)} disabled={saving}>
                {l('cancel')}
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? l('creating') : l('create')}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
