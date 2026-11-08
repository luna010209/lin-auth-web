import { signInWithPopup } from 'firebase/auth';

import { getFirebaseAuth, getGoogleProvider } from '../lib/firebase';

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return {
    idToken,
    profile: {
      uid: result.user.uid,
      email: result.user.email ?? '',
      displayName: result.user.displayName ?? '',
      picture: result.user.photoURL ?? '',
    },
  };
}
