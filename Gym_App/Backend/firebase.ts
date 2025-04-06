import { initializeAuth, getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, FirebaseApp } from "@firebase/app";
import { Auth, getAuth } from "@firebase/auth";
import { Firestore, getFirestore } from "@firebase/firestore";
import { FirebaseStorage, getStorage } from "@firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc",
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a",
  measurementId: "G-KFQJTRFPKD",
};

let app: FirebaseApp | FirebaseApp | undefined;
let FireBase_Auth: Auth;
let FireBase_DB: Firestore | Firestore;
let FireBase_Storage: FirebaseStorage;

try {
  console.log("Initializing Firebase services");

  // Check if Firebase app already exists
  if (getApps().length === 0) {
    console.log("Creating new Firebase app instance");
    app = initializeApp(firebaseConfig);
  } else {
    console.log("Using existing Firebase app instance");
    app = getApps()[0];
  }

  // Initialize Firebase Auth with persistence
  FireBase_Auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  // Initialize other Firebase services
  FireBase_DB = getFirestore(app);
  FireBase_Storage = getStorage(app);

  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase services:", error);
}

// Helper function to check if Firebase services are ready
export const isFirebaseReady = () => {
  return {
    auth: !!FireBase_Auth,
    db: !!FireBase_DB,
    storage: !!FireBase_Storage,
    app: !!app,
  };
};

export { FireBase_Auth, FireBase_DB, FireBase_Storage, app };
