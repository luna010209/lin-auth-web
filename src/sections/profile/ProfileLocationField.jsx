import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

import { splitTextFieldProps } from '../../components/hookForm/sanitizeFieldProps';

import { Iconify } from '../../components/iconify';
import {
  getDefaultMapCenter,
  getMapLocaleConfig,
  isGoogleMapsConfigured,
  loadGoogleMaps,
  recenterMap,
} from '../../lib/googleMaps';
import { useTranslate } from '../../locales';

// ----------------------------------------------------------------------

const MAP_HEIGHT = 400;
const MAP_DEFAULT_ZOOM = 15;
const MAP_FOCUS_ZOOM = 18;
const SEARCH_DEBOUNCE_MS = 400;
const MIN_SEARCH_CHARS = 2;

function toLatLngLiteral(latLng) {
  if (!latLng) return null;
  if (typeof latLng.lat === 'function') {
    return { lat: latLng.lat(), lng: latLng.lng() };
  }
  const lat = Number(latLng.lat);
  const lng = Number(latLng.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

function formatGeocodeAddress(result) {
  if (!result) return '';
  if (result.formatted_address) return result.formatted_address;
  if (result.formattedAddress) return result.formattedAddress;
  return '';
}

export function ProfileLocationField({ name = 'currentLocation' }) {
  const { control, setValue } = useFormContext();
  const { t, i18n } = useTranslate('profile');
  const mapLocale = getMapLocaleConfig(i18n.resolvedLanguage);
  const l = useCallback((key) => t(`label.${key}`), [t]);
  const m = useCallback((key) => t(`message.${key}`), [t]);

  const [mapContainer, setMapContainer] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteSessionTokenRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const initialGeocodeDoneRef = useRef(false);
  const syncedAddressRef = useRef('');
  const skipNextSearchRef = useRef(false);
  const mapsApiRef = useRef(null);
  const ignoreBlurGeocodeRef = useRef(false);
  const fieldOnChangeRef = useRef(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const locationValue = useWatch({ control, name });

  const geocodeRequestBase = useCallback(() => {
    const regionCode =
      mapLocale.regionCodes?.[0] || String(mapLocale.region || '').toLowerCase() || undefined;
    return {
      language: mapLocale.language,
      ...(regionCode ? { region: regionCode } : {}),
    };
  }, [mapLocale.language, mapLocale.region, mapLocale.regionCodes]);

  const commitLocationAddress = useCallback(
    (addr) => {
      const trimmed = addr?.trim();
      if (!trimmed) return;

      syncedAddressRef.current = trimmed;
      skipNextSearchRef.current = true;
      fieldOnChangeRef.current?.(trimmed);
      setValue(name, trimmed, { shouldDirty: true, shouldTouch: true });
      setSuggestionsOpen(false);
    },
    [name, setValue]
  );

  const reverseGeocodeAt = useCallback(
    async (latLng) => {
      const location = toLatLngLiteral(latLng);
      if (!location) return;

      try {
        await loadGoogleMaps();
        const { Geocoder } = await window.google.maps.importLibrary('geocoding');
        if (!geocoderRef.current) {
          geocoderRef.current = new Geocoder();
        }

        const request = { ...geocodeRequestBase(), location };

        let results;
        try {
          const response = await geocoderRef.current.geocode(request);
          results = response?.results;
        } catch {
          results = await new Promise((resolve, reject) => {
            geocoderRef.current.geocode(request, (legacyResults, status) => {
              if (status === 'OK' && legacyResults?.length) {
                resolve(legacyResults);
              } else {
                reject(new Error(status || 'GEOCODE_FAILED'));
              }
            });
          });
        }

        const addr = formatGeocodeAddress(results?.[0]);
        if (!addr) {
          enqueueSnackbar(m('locationGeocodeFail'), { variant: 'warning' });
          return;
        }

        commitLocationAddress(addr);
      } catch {
        enqueueSnackbar(m('locationGeocodeFail'), { variant: 'warning' });
      }
    },
    [commitLocationAddress, geocodeRequestBase, m]
  );

  const setMarkerPosition = useCallback(
    (maps, position) => {
      if (!mapRef.current || !position) return;

      if (!markerRef.current) {
        markerRef.current = new maps.Marker({
          map: mapRef.current,
          position,
          draggable: true,
        });

        markerRef.current.addListener('dragend', () => {
          const latLng = markerRef.current?.getPosition();
          if (!latLng) return;
          reverseGeocodeAt(latLng);
        });
      } else {
        markerRef.current.setMap(mapRef.current);
        markerRef.current.setPosition(position);
      }

      mapRef.current.panTo(position);
      if (mapRef.current.getZoom() < MAP_FOCUS_ZOOM) {
        mapRef.current.setZoom(MAP_FOCUS_ZOOM);
      }
    },
    [reverseGeocodeAt]
  );

  const applyAddress = useCallback(
    (maps, address) => {
      if (!address?.trim() || !geocoderRef.current) return;
      geocoderRef.current.geocode({ ...geocodeRequestBase(), address }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          setMarkerPosition(maps, results[0].geometry.location);
        }
      });
    },
    [geocodeRequestBase, setMarkerPosition]
  );

  const resetAutocompleteSession = useCallback(() => {
    autocompleteSessionTokenRef.current = null;
  }, []);

  const applySuggestion = useCallback(
    async (item) => {
      if (!item) return;

      setSuggestions([]);
      setSuggestionsOpen(false);

      try {
        const maps = await loadGoogleMaps();

        if (item.placePrediction?.toPlace) {
          const place = item.placePrediction.toPlace();
          await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });

          const label = place.formattedAddress || place.displayName || item.description || '';
          if (label) {
            syncedAddressRef.current = label;
            skipNextSearchRef.current = true;
            setValue(name, label, { shouldDirty: true });
          }
          if (place.location) {
            const loc = place.location;
            const position =
              typeof loc.lat === 'function'
                ? { lat: loc.lat(), lng: loc.lng() }
                : loc;
            setMarkerPosition(maps, position);
          }
          resetAutocompleteSession();
          return;
        }

        const placeId = item.place_id || item.id;
        const description = item.description || '';
        if (description) {
          syncedAddressRef.current = description;
          skipNextSearchRef.current = true;
          setValue(name, description, { shouldDirty: true });
        }

        if (!geocoderRef.current) {
          geocoderRef.current = new maps.Geocoder();
        }

        if (placeId) {
          geocoderRef.current.geocode({ ...geocodeRequestBase(), placeId }, (results, status) => {
            if (status === 'OK' && results?.[0]?.geometry?.location) {
              setMarkerPosition(maps, results[0].geometry.location);
            }
          });
        }
        resetAutocompleteSession();
      } catch {
        // ignore
      }
    },
    [geocodeRequestBase, name, resetAutocompleteSession, setMarkerPosition, setValue]
  );

  const fetchSuggestions = useCallback(
    async (input) => {
      const query = input?.trim() ?? '';

      if (query.length < MIN_SEARCH_CHARS) {
        setSuggestions([]);
        setSuggestionsOpen(false);
        setSearching(false);
        return;
      }

      setSearching(true);

      try {
        await loadGoogleMaps();
        const placesLib = await window.google.maps.importLibrary('places');
        const { AutocompleteSuggestion, AutocompleteSessionToken } = placesLib;

        if (!autocompleteSessionTokenRef.current) {
          autocompleteSessionTokenRef.current = new AutocompleteSessionToken();
        }

        const locale = getMapLocaleConfig(i18n.resolvedLanguage);
        const request = {
          input: query,
          sessionToken: autocompleteSessionTokenRef.current,
          language: locale.language,
          locationBias: { center: locale.center, radius: 120_000 },
          ...(locale.regionCodes.length ? { includedRegionCodes: locale.regionCodes } : {}),
        };

        const { suggestions: raw } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        const normalized = (raw ?? [])
          .map((entry) => {
            const prediction = entry.placePrediction;
            if (!prediction) return null;
            const description =
              typeof prediction.text === 'string'
                ? prediction.text
                : prediction.text?.text ?? prediction.description ?? '';
            const placeId = prediction.placeId ?? prediction.place_id;
            if (!description || !placeId) return null;
            return { id: placeId, place_id: placeId, description, placePrediction: prediction };
          })
          .filter(Boolean);

        setSuggestions(normalized);
        setSuggestionsOpen(normalized.length > 0);
      } catch {
        await new Promise((resolve) => {
          const maps = window.google?.maps;
          if (!maps?.places?.AutocompleteService) {
            setSuggestions([]);
            setSuggestionsOpen(false);
            resolve();
            return;
          }

          const legacy = new maps.places.AutocompleteService();
          legacy.getPlacePredictions(
            {
              input: query,
              language: mapLocale.language,
              types: ['geocode'],
              ...(mapLocale.regionCodes[0]
                ? { componentRestrictions: { country: mapLocale.regionCodes[0] } }
                : {}),
            },
            (predictions, status) => {
              const ok =
                status === maps.places.PlacesServiceStatus?.OK || status === 'OK';
              if (ok && predictions?.length) {
                setSuggestions(
                  predictions.map((p) => ({
                    id: p.place_id,
                    place_id: p.place_id,
                    description: p.description,
                  }))
                );
                setSuggestionsOpen(true);
              } else {
                setSuggestions([]);
                setSuggestionsOpen(false);
              }
              resolve();
            }
          );
        });
      } finally {
        setSearching(false);
      }
    },
    [i18n.resolvedLanguage, mapLocale.language, mapLocale.regionCodes]
  );

  const scheduleSuggestionSearch = useCallback(
    (input) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        fetchSuggestions(input);
      }, SEARCH_DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    if (!isGoogleMapsConfigured() || !mapContainer) {
      return undefined;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;

        geocoderRef.current = new maps.Geocoder();
        mapsApiRef.current = maps;

        const defaultCenter = getDefaultMapCenter(i18n.resolvedLanguage);

        mapRef.current = new maps.Map(mapContainer, {
          center: defaultCenter,
          zoom: MAP_DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        recenterMap(mapRef.current, defaultCenter);

        setMapsReady(true);
      })
      .catch((error) => {
        if (!cancelled) {
          setMapsError(error?.message || m('mapLoadFail'));
        }
      });

    return () => {
      cancelled = true;
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [i18n.resolvedLanguage, mapContainer, m]);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || markerRef.current) {
      return;
    }
    const center = getDefaultMapCenter(i18n.resolvedLanguage);
    mapRef.current.setCenter(center);
    recenterMap(mapRef.current, center);
  }, [i18n.resolvedLanguage, mapsReady]);

  useEffect(() => {
    if (!mapsReady || !locationValue?.trim() || initialGeocodeDoneRef.current) {
      return;
    }
    initialGeocodeDoneRef.current = true;
    syncedAddressRef.current = locationValue;

    loadGoogleMaps()
      .then((maps) => applyAddress(maps, locationValue))
      .catch(() => {});
  }, [mapsReady, locationValue, applyAddress]);

  useEffect(() => {
    if (!mapsReady || !mapRef.current) {
      return undefined;
    }

    const maps = mapsApiRef.current;
    if (!maps) {
      return undefined;
    }

    const listener = mapRef.current.addListener('click', (event) => {
      const latLng = event.latLng;
      if (!latLng) return;
      ignoreBlurGeocodeRef.current = true;
      setMarkerPosition(maps, latLng);
      reverseGeocodeAt(latLng);
    });

    return () => {
      listener.remove();
    };
  }, [mapsReady, reverseGeocodeAt, setMarkerPosition]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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
          await reverseGeocodeAt(latLng);
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
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          fieldOnChangeRef.current = field.onChange;

          const { textFieldProps, sx, slotProps } = splitTextFieldProps({
            fullWidth: true,
            label: l('currentLocation'),
            placeholder: l('locationSearchPlaceholder'),
            error: !!error,
            helperText: error?.message ?? l('locationSearchHelper'),
          });

          return (
            <Box sx={{ position: 'relative' }}>
              <TextField
                {...textFieldProps}
                name={field.name}
                value={field.value ?? ''}
                onChange={(event) => {
                  field.onChange(event);
                  const next = event.target.value;
                  syncedAddressRef.current = '';

                  if (skipNextSearchRef.current) {
                    skipNextSearchRef.current = false;
                    return;
                  }

                  if (mapsReady) {
                    scheduleSuggestionSearch(next);
                  }
                }}
                sx={sx}
                inputRef={field.ref}
                autoComplete="off"
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setSuggestionsOpen(true);
                  }
                }}
                onBlur={(event) => {
                  field.onBlur();
                  window.setTimeout(() => {
                    setSuggestionsOpen(false);
                  }, 180);

                  if (ignoreBlurGeocodeRef.current) {
                    ignoreBlurGeocodeRef.current = false;
                    return;
                  }

                  const next = event.target.value?.trim();
                  if (!mapsReady || !next || next === syncedAddressRef.current) {
                    return;
                  }

                  syncedAddressRef.current = next;
                  loadGoogleMaps().then((maps) => applyAddress(maps, next));
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
                    endAdornment: searching ? (
                      <InputAdornment position="end">
                        <CircularProgress size={18} />
                      </InputAdornment>
                    ) : (
                      slotProps?.input?.endAdornment
                    ),
                  },
                }}
              />

              {suggestionsOpen && suggestions.length > 0 && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1700,
                    mt: 0.5,
                    maxHeight: 280,
                    overflow: 'auto',
                  }}
                >
                  <List dense disablePadding>
                    {suggestions.map((item) => (
                      <ListItemButton
                        key={item.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applySuggestion(item)}
                      >
                        <ListItemText
                          primary={item.description}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
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
          <Box
            ref={setMapContainer}
            sx={{ width: 1, height: 1 }}
            onPointerDown={() => {
              ignoreBlurGeocodeRef.current = true;
            }}
          />
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
          {mapsReady && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                typography: 'caption',
                color: 'text.secondary',
                bgcolor: 'background.paper',
                boxShadow: 1,
                pointerEvents: 'none',
              }}
            >
              {l('locationMapHint')}
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
