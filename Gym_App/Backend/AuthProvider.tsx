import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FireBase_Auth } from "../Backend/firebase"; // Ensure correct import

//Define authentication context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

//Create AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

//Define props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();

  // Load stored user from AsyncStorage when the app starts
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Restore user if found
      }
    };

    loadUser();

    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      } else {
        await AsyncStorage.removeItem("user");
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Logout function
  const logout = async () => {
    await signOut(auth);
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
