import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const defaultAdminEmails = ['cherryliao43@gmail.com', 'sela21depot@gmail.com'];

export const adminEmails = [
  import.meta.env.VITE_ADMIN_EMAILS,
  import.meta.env.VITE_ADMIN_EMAIL,
  defaultAdminEmails.join(','),
]
  .filter(Boolean)
  .join(',')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const adminEmail = adminEmails[0] || defaultAdminEmails[0];

export function isAdminEmail(email) {
  return Boolean(email && adminEmails.includes(email.trim().toLowerCase()));
}

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
