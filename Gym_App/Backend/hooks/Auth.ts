import { User } from "firebase/auth";
import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToAuthChanges } from "../firebase";

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
  
  // Memoized handler to avoid recreating function on every render
  const handleAuthChange = useCallback((currentUser: User | null) => {
    console.log("[Auth Hook] Auth state changed:", {
      previousUser: prevUserRef.current ? "Exists" : "None",
      currentUser: currentUser ? "Exists" : "None"
    });

    // Always update the user state and set loading to false
    prevUserRef.current = currentUser;
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("[Auth Hook] Setting up auth subscription");
    let unsubscribe: () => void;
    
    try {
      setLoading(true);
      unsubscribe = subscribeToAuthChanges(handleAuthChange);
      console.log("[Auth Hook] Auth subscription setup complete");

      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("[Auth Hook] Loading timeout reached");
        setLoading(false);
      }, 5000); // 5 second timeout

      return () => {
        clearTimeout(timeoutId);
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error("[Auth Hook] Subscription error:", error);
      setError("Failed to establish authentication connection");
      setLoading(false);
    }
  }, [handleAuthChange]);

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
