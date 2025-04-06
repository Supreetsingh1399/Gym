// We don't need to export navigation types here now that they are in a .ts file

// Extend Firebase types
import "./firebase";

// Extend React Native types
import "./react-native";

// Extend React Native Maps types
import "./react-native-maps";

// Extend React Native Toast Message types
import "./react-native-toast-message";

// Export environment variable types
declare module "@env" {
  export const API_URL: string;
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
  export const GOOGLE_MAPS_API_KEY: string;
}

// Extend module declarations
declare global {
  namespace ReactNavigation {
    // Import directly from the ts file
    interface RootParamList extends import("./navigation").RootStackParamList {}
  }
}
