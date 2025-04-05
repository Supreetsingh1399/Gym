import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc", // Replace with real values
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.firebasestorage.app",
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a"
};

// Initialize Firebase only if it hasn't been initialized yet
let firebaseApp;
let FireBase_Auth: Auth;
let FirebaseDB: Firestore;

try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    console.log("Initializing new Firebase app");
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.log("Firebase app already initialized, getting existing app");
    firebaseApp = getApp();
  }
  
  // Initialize auth and firestore
  FireBase_Auth = getAuth(firebaseApp);
  FirebaseDB = getFirestore(firebaseApp);
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}
export { FireBase_Auth, FirebaseDB, firebaseApp };
export const isFirebaseReady = () => {
  return {
    auth: !!FireBase_Auth,
    firestore: !!FirebaseDB,
  };
}