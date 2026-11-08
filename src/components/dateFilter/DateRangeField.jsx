import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Paper,
  Stack,
  Button,
  Popover,
  TextField,
  IconButton,
  InputAdornment,
  FormHelperText,
} from '@mui/material';

import { formatDate } from '../../utils/formatTime';
import { useTranslate } from '../../locales';
import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function DateRangeField({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  PaperProps,
  title,
  size,
  ...other
}) {
  const { t } = useTranslate('navbar');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const {
    inputProps,
    InputProps,
    alignItems,
    justifyContent,
    flexWrap,
    ...rest
  } = other;

  // temp state for Apply/Cancel
  const [tmpStart, setTmpStart] = useState(startDate);
  const [tmpEnd, setTmpEnd] = useState(endDate);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setTmpStart(startDate || null);
        setTmpEnd(endDate || null);
      }, 0);

      return () => clearTimeout(id);
    }
  }, [open, startDate, endDate]);

  const formatDateRange = useCallback(() => {
    if (!startDate && !endDate) return '';
    const start = startDate ? formatDate(startDate) : '';
    const end = endDate ? formatDate(endDate) : '';
    return `${start} - ${end}`;
  }, [startDate, endDate]);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleClear = useCallback(() => {
    onChangeStartDate(null);
    onChangeEndDate(null);
  }, [onChangeStartDate, onChangeEndDate]);

  const isError = tmpStart && tmpEnd && dayjs(tmpStart).isAfter(dayjs(tmpEnd));
  const hasValue = startDate || endDate;

  const handleApply = useCallback(() => {
    if (isError) return;
    onChangeStartDate(tmpStart || null);
    onChangeEndDate(tmpEnd || null);
    handleClose();
  }, [isError, tmpStart, tmpEnd, onChangeStartDate, onChangeEndDate, handleClose]);

  const handleCancel = useCallback(() => {
    // just close; temp state resets next open via useEffect
    handleClose();
  }, [handleClose]);

  return (
    <>
      <TextField
        size={size}
        value={formatDateRange()}
        onClick={handleClick}
        error={!!(startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate)))}
        placeholder={title || t('dateRange')}
        inputprops={{
          readOnly: true,
          sx: { cursor: 'pointer' },
          endAdornment: (
            <InputAdornment position="end">
              {hasValue && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  sx={{ mr: 0.5 }}
                >
                  <Iconify icon="eva:close-fill" width={16} />
                </IconButton>
              )}
              <Iconify icon="eva:calendar-fill" width={20} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        {...rest}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCancel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            ...PaperProps,
            sx: {
              p: 1,
              minWidth: 400,
              maxWidth: 500,
              overflow: 'visible',
              ...(PaperProps?.sx || {}),
            },
          },
        }}
      >
        <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <DatePicker
              label={t('startDate')}
              value={tmpStart}
              maxDate={tmpEnd || undefined}
              onChange={setTmpStart}
            />
            <DatePicker
              label={t('endDate')}
              value={tmpEnd}
              minDate={tmpStart || undefined}
              onChange={setTmpEnd}
            />
          </Stack>

          {isError && (
            <FormHelperText error sx={{ mb: 2 }}>
              {t('endDateMustBeLater')}
            </FormHelperText>
          )}

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button disabled={isError} variant="contained" onClick={handleApply}>
              {t('apply')}
            </Button>
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}