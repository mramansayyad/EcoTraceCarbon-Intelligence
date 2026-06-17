import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key-local-development',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'virtual-promptwars-492614.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'virtual-promptwars-492614',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'virtual-promptwars-492614.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '29956574188',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:29956574188:web:mockapp123'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if running locally
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    const disableEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'false';
    if (!disableEmulators) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8090);
      console.log('Firebase Client connected to local emulators successfully (Auth: 9099, Firestore: 8090).');
    }
  } catch (err) {
    console.warn('Firebase Emulator connection warning:', err);
  }
}

export { app, auth, db };
