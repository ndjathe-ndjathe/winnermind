import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDrEpJBakK2aqmi3FCr8VoXstdb8p9WpzU",
  authDomain: "winnermind-3f3cc.firebaseapp.com",
  projectId: "winnermind-3f3cc",
  storageBucket: "winnermind-3f3cc.firebasestorage.app",
  messagingSenderId: "614286316967",
  appId: "1:614286316967:web:057d881c9ff87a3d1b5282",
  measurementId: "G-QFPWTRDRQ9"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { db, auth, storage, analytics };