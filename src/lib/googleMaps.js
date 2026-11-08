/** @typedef {{ lat: number, lng: number }} MapLatLng */
/** @typedef {{ center: MapLatLng, language: string, region: string, regionCodes: string[] }} MapLocaleConfig */

const MAP_LOCALE_BY_LANG = {
  vi: {
    center: { lat: 21.0285, lng: 105.8542 },
    language: 'vi',
    region: 'VN',
    regionCodes: ['vn'],
  },
  ko: {
    center: { lat: 37.5665, lng: 126.978 },
    language: 'ko',
    region: 'KR',
    regionCodes: ['kr'],
  },
  ja: {
    center: { lat: 35.6762, lng: 139.6503 },
    language: 'ja',
    region: 'JP',
    regionCodes: ['jp'],
  },
  zh: {
    center: { lat: 39.9042, lng: 116.4074 },
    language: 'zh-CN',
    region: 'CN',
    regionCodes: ['cn'],
  },
  fr: {
    center: { lat: 48.8566, lng: 2.3522 },
    language: 'fr',
    region: 'FR',
    regionCodes: ['fr'],
  },
  ar: {
    center: { lat: 24.7136, lng: 46.6753 },
    language: 'ar',
    region: 'SA',
    regionCodes: ['sa'],
  },
  en: {
    center: { lat: 40.7128, lng: -74.006 },
    language: 'en',
    region: 'US',
    regionCodes: [],
  },
};

let mapsLoadPromise = null;

export function getGoogleMapsApiKey() {
  return String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
}

export function isGoogleMapsConfigured() {
  return getGoogleMapsApiKey().length > 0;
}

/** @param {string} [lang] */
export function getMapLocaleConfig(lang) {
  const key = String(lang || 'en').split('-')[0].toLowerCase();
  return MAP_LOCALE_BY_LANG[key] ?? MAP_LOCALE_BY_LANG.en;
}

/** @param {string} [lang] */
export function getDefaultMapCenter(lang) {
  return { ...getMapLocaleConfig(lang).center };
}

/** Import libraries required by profile location (Map, Geocoder, Places). */
async function importGoogleMapsLibraries() {
  if (!window.google?.maps?.importLibrary) {
    throw new Error('Google Maps failed to initialize');
  }

  await window.google.maps.importLibrary('maps');
  await window.google.maps.importLibrary('geocoding');
  await window.google.maps.importLibrary('places');

  return window.google.maps;
}

function injectMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-lin-google-maps]');
    if (existing) {
      if (window.google?.maps?.importLibrary) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.dataset.linGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly&loading=async`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

/** Load Maps JavaScript API (+ Places, Geocoding) once per tab. */
export function loadGoogleMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser'));
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
  }

  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  mapsLoadPromise = injectMapsScript(apiKey)
    .then(() => importGoogleMapsLibraries())
    .catch((error) => {
      mapsLoadPromise = null;
      throw error;
    });

  return mapsLoadPromise;
}

/** After the map container is laid out, fix grey/offset tiles. */
export function recenterMap(map, center) {
  if (!map || !center) return;
  const maps = window.google?.maps;
  if (!maps) return;

  requestAnimationFrame(() => {
    maps.event.trigger(map, 'resize');
    map.setCenter(center);
  });
}
