import { useState, useEffect, useRef } from "react";
import { MongoAuth, User } from "../mongodb";

/**
 * Custom hook for MongoDB authentication state management
 * This replaces the previous Firebase Auth hook
 * @returns {Object} Authentication state with user and loading status
 */
const useMongoAuth = () => {
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
      console.log("[MongoDB Auth Hook] Setting up auth subscription");
      
      // Subscribe to auth state changes
      unsubscribeRef.current = MongoAuth.onAuthStateChanged((currentUser) => {
        if (!isMounted.current) return;
        
        console.log("[MongoDB Auth Hook] Auth state changed:", currentUser ? "User logged in" : "No user");
        setUser(currentUser);
        setLoading(false);
      });
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted.current && loading) {
          console.log("[MongoDB Auth Hook] Auth check timeout reached");
          setLoading(false);
        }
      }, 2000);
      
    } catch (setupError) {
      console.error("[MongoDB Auth Hook] Auth setup error:", setupError);
      if (isMounted.current) {
        setError(setupError instanceof Error ? setupError.message : "Failed to establish authentication connection");
        setLoading(false);
      }
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Convenience methods for components
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const user = await MongoAuth.signIn(email, password);
      return user;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Sign in failed";
      setError(errorMessage);
      throw e;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const user = await MongoAuth.signUp(email, password, userData);
      return user;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Sign up failed";
      setError(errorMessage);
      throw e;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await MongoAuth.signOut();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Sign out failed";
      setError(errorMessage);
      throw e;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await MongoAuth.resetPassword(email);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Password reset failed";
      setError(errorMessage);
      throw e;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  return { 
    user, 
    loading,
    error,
    isAuthenticated: !!user,
    // Add convenience methods
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};

export default useMongoAuth; 