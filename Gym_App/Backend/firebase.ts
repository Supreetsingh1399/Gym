import { initializeApp } from "firebase/app";
import { 
  getReactNativePersistence, 
  initializeAuth, 
  getAuth,
  onAuthStateChanged,
  connectAuthEmulator
} from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { 
  getStorage, 
  connectStorageEmulator 
} from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Firebase configuration object
 * Contains API keys and project settings for Firebase services
 */
const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc",
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.firebasestorage.app",
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a",
  measurementId: "G-KFQJTRFPKD",
};

/**
 * Initialize Firebase app instance
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase authentication with AsyncStorage persistence
 */
export const FireBase_Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/**
 * Initialize Firestore database
 */
export const FireBase_DB = getFirestore(app);

/**
 * Initialize Firebase storage
 */
export const FireBase_Storage = getStorage(app);

/**
 * Enable offline persistence for Firestore on web platform
 * This allows the app to work offline and sync when back online
 */
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(FireBase_DB)
    .catch((error) => {
      console.error("Error enabling offline persistence:", error);
      if (error.code === 'failed-precondition') {
        console.warn(
          "Multiple tabs open, persistence can only be enabled in one tab at a time."
        );
      } else if (error.code === 'unimplemented') {
        console.warn(
          "The current browser doesn't support all of the features required to enable persistence."
        );
      }
    });
}

/**
 * Connect to emulators for local development if in development environment
 * This is disabled by default in production
 */
if (__DEV__) {
  // Uncomment these lines to connect to local emulators
  // const host = '127.0.0.1';
  // connectAuthEmulator(FireBase_Auth, `http://${host}:9099`);
  // connectFirestoreEmulator(FireBase_DB, host, 8080);
  // connectStorageEmulator(FireBase_Storage, host, 9199);
  
  console.log("Firebase initialized in development mode");
} else {
  console.log("Firebase initialized in production mode");
}

/**
 * Gracefully handle authentication state changes
 * @param {Function} callback - Function to handle user state
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  return onAuthStateChanged(FireBase_Auth, (user) => {
    callback(user);
  });
};

export default app;
