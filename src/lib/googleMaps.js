const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

let mapsLoadPromise = null;

export function getGoogleMapsApiKey() {
  return String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
}

export function isGoogleMapsConfigured() {
  return getGoogleMapsApiKey().length > 0;
}

export function getDefaultMapCenter() {
  return { ...DEFAULT_CENTER };
}

/** Load Maps JavaScript API (+ Places) once per tab. */
export function loadGoogleMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser'));
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-lin-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.linGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly&loading=async`;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}
