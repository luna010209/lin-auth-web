import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import GlobalStyles from '@mui/material/GlobalStyles';
import TextField from '@mui/material/TextField';

import { splitTextFieldProps } from '../../components/hookForm/sanitizeFieldProps';

import { Iconify } from '../../components/iconify';
import { getDefaultMapCenter, isGoogleMapsConfigured, loadGoogleMaps } from '../../lib/googleMaps';
import { useTranslate } from '../../locales';

// ----------------------------------------------------------------------

const MAP_HEIGHT = 280;

export function ProfileLocationField({ name = 'currentLocation' }) {
  const { control, setValue } = useFormContext();
  const { t } = useTranslate('profile');
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const inputElRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [locating, setLocating] = useState(false);
  const locationValue = useWatch({ control, name });
  const syncedAddressRef = useRef('');

  const setMarkerPosition = useCallback((maps, position) => {
    if (!mapRef.current || !position) return;

    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        map: mapRef.current,
        position,
        draggable: true,
      });

      markerRef.current.addListener('dragend', () => {
        const latLng = markerRef.current.getPosition();
        if (!latLng || !geocoderRef.current) return;
        geocoderRef.current.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const addr = results[0].formatted_address;
            syncedAddressRef.current = addr;
            setValue(name, addr, { shouldDirty: true });
          }
        });
      });
    } else {
      markerRef.current.setPosition(position);
    }

    mapRef.current.panTo(position);
    if (mapRef.current.getZoom() < 14) {
      mapRef.current.setZoom(14);
    }
  }, [name, setValue]);

  const applyAddress = useCallback(
    (maps, address) => {
      if (!address?.trim() || !geocoderRef.current) return;
      geocoderRef.current.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          setMarkerPosition(maps, results[0].geometry.location);
        }
      });
    },
    [setMarkerPosition]
  );

  useEffect(() => {
    if (!isGoogleMapsConfigured() || !mapContainerRef.current) {
      return undefined;
    }

    let cancelled = false;
    let placeListener = null;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;

        geocoderRef.current = new maps.Geocoder();

        mapRef.current = new maps.Map(mapContainerRef.current, {
          center: getDefaultMapCenter(),
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        if (inputElRef.current && maps.places) {
          autocompleteRef.current = new maps.places.Autocomplete(inputElRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['geocode'],
          });

          placeListener = autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            const label = place.formatted_address || place.name || '';
            if (label) {
              setValue(name, label, { shouldDirty: true });
            }
            if (place.geometry?.location) {
              syncedAddressRef.current = label;
              setMarkerPosition(maps, place.geometry.location);
            }
          });
        }

        setMapsReady(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setMapsError(error?.message || m('mapLoadFail'));
        }
      });

    return () => {
      cancelled = true;
      if (placeListener) {
        placeListener.remove();
      }
      markerRef.current = null;
      mapRef.current = null;
      autocompleteRef.current = null;
    };
  }, [m, name, setMarkerPosition, setValue]);

  useEffect(() => {
    if (!mapsReady || !locationValue?.trim()) return;
    if (syncedAddressRef.current === locationValue) return;
    syncedAddressRef.current = locationValue;

    loadGoogleMaps()
      .then((maps) => applyAddress(maps, locationValue))
      .catch(() => {});
  }, [mapsReady, locationValue, applyAddress]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar(m('locationUnsupported'), { variant: 'warning' });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const maps = await loadGoogleMaps();
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setMarkerPosition(maps, latLng);

          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: latLng }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                const addr = results[0].formatted_address;
                syncedAddressRef.current = addr;
                setValue(name, addr, { shouldDirty: true });
              }
            });
          }
        } catch (error) {
          enqueueSnackbar(error?.message || m('mapLoadFail'), { variant: 'error' });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        enqueueSnackbar(m('locationDenied'), { variant: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  };

  if (!isGoogleMapsConfigured()) {
    return (
      <Alert severity="warning" sx={{ mt: 0.5 }}>
        {m('mapKeyMissing')}
      </Alert>
    );
  }

  return (
    <Box>
      <GlobalStyles styles={{ '.pac-container': { zIndex: 1600 } }} />
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { textFieldProps, sx, slotProps } = splitTextFieldProps({
            fullWidth: true,
            label: l('currentLocation'),
            placeholder: l('locationSearchPlaceholder'),
            error: !!error,
            helperText: error?.message ?? l('locationSearchHelper'),
          });

          return (
            <TextField
              {...textFieldProps}
              name={field.name}
              value={field.value ?? ''}
              onChange={field.onChange}
              sx={sx}
              inputRef={(node) => {
                field.ref(node);
                inputElRef.current = node;
              }}
              onBlur={(event) => {
                field.onBlur();
                if (mapsReady && event.target.value) {
                  loadGoogleMaps().then((maps) => applyAddress(maps, event.target.value));
                }
              }}
              slotProps={{
                ...slotProps,
                input: {
                  ...slotProps?.input,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:map-point-bold" width={22} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          );
        }}
      />

      <StackRow sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          disabled={!mapsReady || locating}
          onClick={handleUseMyLocation}
          startIcon={
            locating ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="solar:gps-bold" width={18} />
            )
          }
        >
          {l('useMyLocation')}
        </Button>
      </StackRow>

      {mapsError ? (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {mapsError}
        </Alert>
      ) : (
        <Box
          sx={{
            mt: 1.5,
            position: 'relative',
            height: MAP_HEIGHT,
            borderRadius: 1.5,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Box ref={mapContainerRef} sx={{ width: 1, height: 1 }} />
          {!mapsReady && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function StackRow({ children, sx }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ...sx }}>{children}</Box>
  );
}
