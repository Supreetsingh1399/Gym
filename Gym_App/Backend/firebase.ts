import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu6N6VDckGCrS_VfR0b3e2c8mi5uZSzhc",
  authDomain: "gymbuddy-7db1e.firebaseapp.com",
  projectId: "gymbuddy-7db1e",
  storageBucket: "gymbuddy-7db1e.firebasestorage.app",
  messagingSenderId: "585102985855",
  appId: "1:585102985855:web:8b13b4e3b6e95bd1ba4d4a",
  measurementId: "G-KFQJTRFPKD"
};

const app = initializeApp(firebaseConfig);
export const FireBase_Auth = getAuth(app);