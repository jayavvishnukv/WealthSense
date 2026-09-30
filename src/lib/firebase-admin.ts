import { cert, getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.VITE_FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/^"|"$/g, '')
  .trim();

const missingVariables = [
  !projectId && 'VITE_FIREBASE_PROJECT_ID',
  !clientEmail && 'FIREBASE_CLIENT_EMAIL',
  !privateKey && 'FIREBASE_PRIVATE_KEY',
].filter((variable): variable is string => Boolean(variable));

if (missingVariables.length > 0) {
  throw new Error(
    `Firebase Admin is not configured. Missing environment variable(s): ${missingVariables.join(', ')}. ` +
    'Set VITE_FIREBASE_PROJECT_ID to the web client project ID and provide the matching Firebase service account email and private key.'
  );
}

if (!privateKey!.includes('BEGIN PRIVATE KEY')) {
  throw new Error('FIREBASE_PRIVATE_KEY is missing or malformed');
}

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey: privateKey!.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

export const adminAuth = getAuth(app);
