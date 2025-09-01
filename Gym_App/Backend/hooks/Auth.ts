import { User, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { FireBase_Auth, isUsingMockImplementation } from "../firebase";

/**
 * Custom hook for Firebase authentication state management
 * Handles cases when Firebase Auth is not available
 * @returns {Object} Authentication state with user and loading status
 */
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted
  const isMounted = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
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
      
      // Check if we're using mock implementations
      if (isUsingMockImplementation()) {
        console.log("[Auth Hook] Using mock Firebase implementation");
        if (isMounted.current) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      console.log("[Auth Hook] Setting up auth subscription");
      
      try {
        // Wrap in try-catch since onAuthStateChanged might fail
        // if Firebase Auth isn't properly initialized
        const unsub = onAuthStateChanged(
          FireBase_Auth,
          // Success callback
          (currentUser) => {
            if (!isMounted.current) return;
            
            console.log("[Auth Hook] Auth state changed:", currentUser ? "User logged in" : "No user");
            setUser(currentUser);
            setLoading(false);
          },
          // Error callback - note that we handle errors in the try/catch instead
          // as onAuthStateChanged only takes 2 parameters
        );
        
        // Store the unsubscribe function
        unsubscribeRef.current = unsub;
      } catch (authError) {
        console.error("[Auth Hook] Error in auth state listener:", authError);
        if (isMounted.current) {
          setError(authError instanceof Error ? authError.message : "Authentication error occurred");
          setLoading(false);
        }
      }
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted.current && loading) {
          console.log("[Auth Hook] Auth check timeout reached");
          setLoading(false);
          setError("Authentication check timed out");
        }
      }, 5000);
      
    } catch (setupError) {
      console.error("[Auth Hook] Auth setup error:", setupError);
      if (isMounted.current) {
        setError(setupError instanceof Error ? setupError.message : "Failed to establish authentication connection");
        setLoading(false);
      }
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {
          console.error("[Auth Hook] Error during cleanup:", e);
        }
      }
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