import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

import { CONFIG } from '../globalConfig';

function getFirebaseConfig() {
  const { apiKey, authDomain, projectId } = CONFIG.firebase;

  if (!apiKey || !authDomain || !projectId) {
    return null;
  }

  return CONFIG.firebase;
}

export function isFirebaseConfigured() {
  return getFirebaseConfig() !== null;
}

export function getFirebaseAuth() {
  const config = getFirebaseConfig();

  if (!config) {
    throw new Error('Firebase is not configured');
  }

  if (!getApps().length) {
    initializeApp(config);
  }

  return getAuth();
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}
