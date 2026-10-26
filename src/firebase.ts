import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// mutlular-haber Firebase projesi (Mutlular-Haber-2 ile aynı proje)
const firebaseConfig = {
  apiKey: 'AIzaSyAkEPGBWken51nJGcS9-_ZS1QU10J8DCm8',
  authDomain: 'mutlular-haber.firebaseapp.com',
  projectId: 'mutlular-haber',
  storageBucket: 'mutlular-haber.firebasestorage.app',
  messagingSenderId: '407814803681',
  appId: '1:407814803681:web:c41807849172dd22bbe7a0',
  measurementId: 'G-ZH17J0CMLG',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
