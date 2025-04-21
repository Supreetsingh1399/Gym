import React, { createContext, ReactNode, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "@env";
import { FireBase_Auth } from "../../Backend/firebase";

// Define a better type for user data
interface UserData {
  id?: string;
  uid?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?: string;
  [key: string]: any; // Allow for additional properties
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<boolean>;
}

// Create the context with default values
export const UserContext = createContext<UserContextType>({
  userData: null,
  loading: false,
  error: null,
  loadUserProfile: async () => {},
  updateUserProfile: async () => false,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile data from your API
  const loadUserProfile = async (): Promise<void> => {
    const currentUser = FireBase_Auth?.currentUser;
    if (!currentUser) {
      setError("No authenticated user");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get Firebase token for authentication
      const token = await currentUser.getIdToken();
      
      // Fetch user data from MongoDB through your API
      const response = await axios.get(
        `${API_URL}/Register/Users/${currentUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      console.log("User profile loaded:", response.data);

      // Extract user data from response (handle different response formats)
      let profileData: UserData | null = null;
      
      if (response.data?.success && response.data?.user) {
        profileData = response.data.user;
      } else if (response.data?.data) {
        profileData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        profileData = response.data;
      }

      if (profileData) {
        setUserData(profileData);
      } else {
        setError("Could not extract user data from response");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile and then reload data
  const updateUserProfile = async (data: Partial<UserData>): Promise<boolean> => {
    const currentUser = FireBase_Auth?.currentUser;
    if (!currentUser) {
      setError("No authenticated user");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Get Firebase token for authentication
      const token = await currentUser.getIdToken();
      
      // Update user data through your API
      const response = await axios.put(
        `${API_URL}/Register/Users/${currentUser.uid}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 1000,
        }
      );

      console.log("Profile update response:", response.data);

      // Reload user profile to get updated data
      await loadUserProfile();
      return true;
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load profile data when the app starts
  useEffect(() => {
    if (FireBase_Auth?.currentUser) {
      loadUserProfile();
    }
  }, []);

  // Also reload when auth state changes
  useEffect(() => {
    const unsubscribe = FireBase_Auth?.onAuthStateChanged((user) => {
      if (user) {
        loadUserProfile();
      } else {
        setUserData(null);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        loading, 
        error, 
        loadUserProfile, 
        updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier usage
export const useUser = () => useContext(UserContext);