import { User, onAuthStateChanged } from "@firebase/auth";
import { useState, useEffect, useRef } from "react";
import { FireBase_Auth } from "../firebase";

/**
 * Custom hook for Firebase authentication state management
 * Improved version with better timeout handling
 * @returns {Object} Authentication state with user and loading status
 */
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted
  const isMounted = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const authInitializedRef = useRef<boolean>(false);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Set up auth listener
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Check if Firebase Auth is available
      if (!FireBase_Auth) {
        console.error("[Auth Hook] Firebase Auth is not initialized");
        if (isMounted.current) {
          setError("Firebase Auth not initialized");
          setLoading(false);
        }
        return;
      }
      
      console.log("[Auth Hook] Setting up auth subscription");
      
      try {
        // Set up the auth state listener
        unsubscribeRef.current = onAuthStateChanged(
          FireBase_Auth,
          (currentUser) => {
            if (!isMounted.current) return;
            
            console.log("[Auth Hook] Auth state changed:", currentUser ? "User logged in" : "No user");
            authInitializedRef.current = true; // Mark auth as initialized
            setUser(currentUser);
            setLoading(false);
            setError(null); // Clear any previous errors
          },
          (authError) => {
            // Error handler for onAuthStateChanged
            console.error("[Auth Hook] Auth state error:", authError);
            if (isMounted.current) {
              setError(authError.message || "Authentication error occurred");
              setLoading(false);
            }
          }
        );
      } catch (authError) {
        console.error("[Auth Hook] Error in auth state listener:", authError);
        if (isMounted.current) {
          setError(authError instanceof Error ? authError.message : "Authentication error occurred");
          setLoading(false);
        }
      }
      
      // Set a timeout to prevent infinite loading
      // This will only fire if onAuthStateChanged doesn't complete in time
      timeoutId = setTimeout(() => {
        if (isMounted.current && loading && !authInitializedRef.current) {
          console.log("[Auth Hook] Auth check timeout reached");
          setLoading(false);
          
          // Only set error if auth hasn't been initialized yet
          if (!authInitializedRef.current) {
            setError("Authentication check timed out - please check your network connection");
          }
        }
      }, 7000); // Increased timeout to give more time for initialization
      
    } catch (setupError) {
      console.error("[Auth Hook] Auth setup error:", setupError);
      if (isMounted.current) {
        setError(setupError instanceof Error ? setupError.message : "Failed to establish authentication connection");
        setLoading(false);
      }
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  return { 
    user, 
    loading,
    error,
    isAuthenticated: !!user
  };
};

export default useAuth;