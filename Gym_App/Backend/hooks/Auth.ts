import { User, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { FireBase_Auth } from "../firebase";

/**
 * Custom hook for Firebase authentication state management
 * @returns {Object} Authentication state with user and loading status
 */
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track previous user for comparison to prevent unnecessary re-renders
  const prevUserRef = useRef<User | null>(null);
  const authCheckAttempted = useRef<boolean>(false);
  
  useEffect(() => {
    console.log("[Auth Hook] Setting up auth subscription");
    
    // Check if Firebase Auth is initialized
    if (!FireBase_Auth) {
      console.error("[Auth Hook] Firebase Auth is not initialized");
      setError("Firebase authentication failed to initialize");
      setLoading(false);
      return;
    }
    
    let unsubscribe: () => void;
    let timeoutId: NodeJS.Timeout;
    
    try {
      authCheckAttempted.current = true;
      
      // Direct use of onAuthStateChanged for better error handling
      unsubscribe = onAuthStateChanged(
        FireBase_Auth,
        (currentUser) => {
          console.log("[Auth Hook] Auth state changed:", {
            previousUser: prevUserRef.current ? "Exists" : "None",
            currentUser: currentUser ? "Exists" : "None"
          });
          
          // Update the previous user reference
          prevUserRef.current = currentUser;
          
          // Update state
          setUser(currentUser);
          setLoading(false);
        },
        (authError) => {
          console.error("[Auth Hook] Auth state error:", authError);
          setError(authError.message || "Authentication error occurred");
          setLoading(false);
        }
      );
      
      console.log("[Auth Hook] Auth subscription setup complete");
      
      // Add a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (loading) {
          console.log("[Auth Hook] Loading timeout reached");
          setLoading(false);
          setError("Authentication check timed out");
        }
      }, 5000); // 5 second timeout
      
    } catch (setupError) {
      console.error("[Auth Hook] Setup error:", setupError);
      setError(setupError instanceof Error ? setupError.message : "Failed to establish authentication connection");
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      console.log("[Auth Hook] Cleaning up auth subscription");
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once
  
  // Derive authenticated state from user
  const isAuthenticated = !!user;
  
  return { 
    user, 
    loading,
    error,
    isAuthenticated
  };
};

export default useAuth;