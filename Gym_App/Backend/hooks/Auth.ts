import { User, onAuthStateChanged } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useState, useEffect, useRef } from "react";
import { FireBase_Auth, isFirebaseReady } from "../firebase";

/**
 * Custom hook for Firebase authentication state management
 * @returns {Object} Authentication state with user and loading status
 */
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  
  // Ref to track previous user and prevent unnecessary re-renders
  const prevUserRef = useRef<User | null>(null);
  const authCheckAttempted = useRef<boolean>(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  // First effect - check if Firebase Auth is initialized
  useEffect(() => {

     // Check if Firebase Auth is available
     if (!FireBase_Auth) {
      console.error("[Auth Hook] Firebase Auth is not initialized");
      setError("Firebase Auth not initialized");
      setLoading(false);
      return;
    }
    console.log("[Auth Hook] Setting up auth subscription");
    let checkAuthTimer: NodeJS.Timeout | undefined;
    
    const checkAuth = () => {
      const services = isFirebaseReady();
      console.log("[Auth Hook] Auth ready status:", services.auth);
      
      if (services.auth) {
        setAuthReady(true);
        if (checkAuthTimer) {
          clearInterval(checkAuthTimer); // Stop checking once auth is ready
        }
      }
    };
    
    // Check immediately
    checkAuth();
    
    // Then check every 500ms until auth is ready
    checkAuthTimer = setInterval(checkAuth, 500);
    
    // Cleanup interval
    return () => {
      if (checkAuthTimer) {
        clearInterval(checkAuthTimer);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);
  // Second effect - set up auth listener once auth is ready
  useEffect(() => {
    if (!authReady) return;
    
    let authTimeoutId: NodeJS.Timeout | undefined;
    
    try {
      authCheckAttempted.current = true;
      console.log("[Auth Hook] Setting up auth state listener");
      
      // Set up the auth state listener
      unsubscribeRef.current = onAuthStateChanged(
        FireBase_Auth,
        (currentUser: User | null) => {
          console.log("[Auth Hook] Auth state changed:", currentUser ? "User logged in" : "No user");
          
          // Update previous user ref
          prevUserRef.current = currentUser;
          
          // Update state
          setUser(currentUser);
          setLoading(false);
        }
        // Error handling is not supported as a third argument in onAuthStateChanged
      );
      
      // Set a timeout to prevent infinite loading
      authTimeoutId = setTimeout(() => {
        if (loading) {
          console.log("[Auth Hook] Auth check timeout reached");
          setLoading(false);
          setError("Authentication check timed out");
        }
      }, 5000);
      
    } catch (setupError) {
      console.error("[Auth Hook] Auth setup error:", setupError);
      setError(setupError instanceof Error ? setupError.message : "Failed to establish authentication connection");
      setLoading(false);
    }
    
    return () => {
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
      }
    };
  }, [authReady, loading]);
  
  return { 
    user, 
    loading,
    error,
    isAuthenticated: !!user,
    authReady
  };
};

export default useAuth;