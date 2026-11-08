import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { enqueueSnackbar } from 'notistack';

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
import { useTranslate } from '../../locales';
import { formatDateTime } from '../../utils/formatTime';

// ----------------------------------------------------------------------

const createSchema = zod.object({
  displayName: zod.string().max(150).optional(),
  headline: zod.string().max(255).optional(),
  bio: zod.string().max(5000).optional(),
  location: zod.string().max(150).optional(),
});

export function PersonaManageView() {
  const { t } = useTranslate('persona');
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

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
    },
  });

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
    const body = {
      displayName: data.displayName?.trim() || null,
      headline: data.headline?.trim() || null,
      bio: data.bio?.trim() || null,
      location: data.location?.trim() || null,
    };

    try {
      setSaving(true);
      await createPersona(body);
      enqueueSnackbar(m('createSuccess'), { variant: 'success' });
      setCreateOpen(false);
      methods.reset();
      await loadPersonas();
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
              onClick={() => setCreateOpen(true)}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {l('create')}
            </Button>
          </Stack>
        </Stack>

        <Card sx={{ height: 480 }}>
          {!loading && rows.length === 0 ? (
            <EmptyContent filled title={l('emptyTitle')} description={l('emptyDescription')} sx={{ py: 10 }} />
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

      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{l('create')}</DialogTitle>
        <Form methods={methods} onSubmit={onCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Field.Text name="displayName" label={l('displayName')} />
            <Field.Text name="headline" label={l('headline')} />
            <Field.Text name="location" label={l('location')} />
            <Field.Text name="bio" label={l('bio')} multiline rows={4} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>
              {t('others:cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {l('create')}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
