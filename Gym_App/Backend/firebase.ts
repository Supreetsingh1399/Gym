// firebase.js
import { initializeApp } from "firebase/app";
import { 
  getReactNativePersistence, 
  initializeAuth 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc",
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.firebasestorage.app",
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a",
  measurementId: "G-KFQJTRFPKD",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Explicitly initialize Auth with AsyncStorage persistence
export const FireBase_Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
export const FireBase_DB = getFirestore(app);
export const FireBase_Storage = getStorage(app);

// Auth state subscription helper
export const subscribeToAuthChanges = (callback: any) => {
  const { onAuthStateChanged } = require('firebase/auth');
  return onAuthStateChanged(FireBase_Auth, callback);
};

export default app;