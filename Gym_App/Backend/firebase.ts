import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc",
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.appspot.com",
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a",
  measurementId: "G-KFQJTRFPKD",
};

// Create mock implementations for Firebase services
const createMockAuth = (): Auth => {
  // Create a minimal mock that implements the Auth interface
  return {
    app: {} as FirebaseApp,
    name: 'mock-auth',
    currentUser: null,
    languageCode: null,
    tenantId: null,
    settings: {},
    config: {},
    // Add mock implementations of required methods
    signOut: () => Promise.resolve(),
    // Add other methods as needed to prevent crashes
    onAuthStateChanged: () => () => {},
  } as Auth;
};

const createMockFirestore = (): Firestore => {
  // Create a minimal mock that implements the Firestore interface
  return {
    app: {} as FirebaseApp,
    name: 'mock-firestore',
    type: 'firestore'
    // Add other properties as needed
  } as Firestore;
};

const createMockStorage = (): FirebaseStorage => {
  // Create a minimal mock that implements the FirebaseStorage interface
  return {
    app: {} as FirebaseApp,
    name: 'mock-storage',
    // Add other properties as needed
  } as FirebaseStorage;
};

// Define variables with proper types
let app: FirebaseApp;
let FireBase_Auth: Auth;
let FireBase_DB: Firestore;
let FireBase_Storage: FirebaseStorage;
let usingMocks = false;

/**
 * Initialize Firebase and its services
 * This is called automatically when this file is imported
 */
function initializeFirebase() {
  try {
    console.log("[Firebase] Initializing Firebase services");
    
    // Try to get existing app or create new one
    try {
      app = getApp();
      console.log("[Firebase] Using existing Firebase app instance");
    } catch (e) {
      try {
        console.log("[Firebase] Creating new Firebase app instance");
        app = initializeApp(firebaseConfig);
      } catch (err) {
        console.error("[Firebase] Failed to initialize Firebase app:", err);
        throw err;
      }
    }

    // Initialize services with explicit error handling for each
    try {
      FireBase_Auth = getAuth(app);
      console.log("[Firebase] Auth service initialized");
    } catch (authError) {
      console.error("[Firebase] Failed to initialize Auth:", authError);
      console.log("[Firebase] Using mock Auth implementation");
      FireBase_Auth = createMockAuth();
      usingMocks = true;
    }

    try {
      FireBase_DB = getFirestore(app);
      console.log("[Firebase] Firestore service initialized");
    } catch (dbError) {
      console.error("[Firebase] Failed to initialize Firestore:", dbError);
      console.log("[Firebase] Using mock Firestore implementation");
      FireBase_DB = createMockFirestore();
      usingMocks = true;
    }

    try {
      FireBase_Storage = getStorage(app);
      console.log("[Firebase] Storage service initialized");
    } catch (storageError) {
      console.error("[Firebase] Failed to initialize Storage:", storageError);
      console.log("[Firebase] Using mock Storage implementation");
      FireBase_Storage = createMockStorage();
      usingMocks = true;
    }
    
    console.log("[Firebase] Services initialization completed");
  } catch (error) {
    console.error("[Firebase] Critical error during initialization:", error);
    console.log("[Firebase] Falling back to mock implementations");
    
    // If we can't initialize Firebase at all, use mock implementations for everything
    FireBase_Auth = createMockAuth();
    FireBase_DB = createMockFirestore();
    FireBase_Storage = createMockStorage();
    usingMocks = true;
  }
}

// Run initialization once
try {
  console.log("[Firebase] Attempting initialization...");
  initializeFirebase();
} catch (e) {
  console.error("[Firebase] Initialization failed completely:", e);
}

/**
 * Helper function to check if Firebase services are ready
 * @returns Object containing the readiness state of each Firebase service
 */
export const isFirebaseReady = () => {
  return {
    auth: !!FireBase_Auth,
    firestore: !!FireBase_DB,
    storage: !!FireBase_Storage,
    app: !!app,
    usingMocks
  };
};

/**
 * Checks if we're using mock implementations instead of real Firebase
 */
export const isUsingMockImplementation = () => usingMocks;

// Export Firebase services
export { FireBase_Auth, FireBase_DB, FireBase_Storage, app };