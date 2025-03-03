import { onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";
import { FireBase_Auth } from "../firebase";
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireBase_Auth, (Currentuser) => {
      // console.log("Auth state changed. Current user:", Currentuser);
      setUser(Currentuser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
export default useAuth;
