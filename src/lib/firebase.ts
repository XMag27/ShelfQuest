import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'shelfquestxmag.firebaseapp.com',
  projectId: 'shelfquestxmag',
  storageBucket: 'shelfquestxmag.firebasestorage.app',
  messagingSenderId: '643970748929',
  appId: '1:643970748929:web:6a0f4f5f1e0c5b7f7e8a6d',
};

// Initialize Firebase (prevent re-initialization in dev hot reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;