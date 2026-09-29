import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type AuthError,
  type User
} from 'firebase/auth';

const requiredFirebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingFirebaseEnv = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value?.trim())
  .map(([key]) => key);

if (missingFirebaseEnv.length > 0) {
  throw new Error(
    `Firebase is not configured. Add these Vite variables to the root .env file: ${missingFirebaseEnv.join(', ')}. ` +
    'Restart the Vite development server after changing .env.'
  );
}

const firebaseConfig = {
  apiKey: requiredFirebaseEnv.apiKey,
  authDomain: requiredFirebaseEnv.authDomain,
  projectId: requiredFirebaseEnv.projectId,
  appId: requiredFirebaseEnv.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code = (error as Partial<AuthError>)?.code;

  switch (code) {
    case 'auth/invalid-api-key':
      return 'Firebase configuration is invalid. Check that the API key belongs to the new Firebase project.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase Authentication. Add it under Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before sign-in completed.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Allow popups for this site and try again.';
    case 'auth/network-request-failed':
      return 'A network error interrupted sign-in. Check your connection and try again.';
    default:
      return 'Google sign-in could not be completed. Please try again.';
  }
}

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
};

export type { User };