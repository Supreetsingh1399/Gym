// Create a file called env.d.ts in your project root
declare module "@env" {
  export const GOOGLE_PLACES_API_KEY: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const API_URL: string;
}
