import packageJson from '../package.json';
import { paths } from './routes/paths';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'Lin Universe',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080',
  authServerUrl: import.meta.env.VITE_AUTH_API_URL ?? import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  s3Url: import.meta.env.VITE_S3_URL ?? '',
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.persona.manage,
  },
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  },
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  },
};
