import axios from "axios";
import { FireBase_Auth } from "../firebase";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const registerUser = async (userData: any) => {
    try {
      // Check if email exists first
      const emailCheck = await axios.get(`https://gym-dhlm.onrender.com/api/users/check-email/${userData.email}`);
      if (emailCheck.data.exists) {
        throw new Error('Email already exists');
      }
  
      const userCredential = await createUserWithEmailAndPassword(
        FireBase_Auth,
        userData.email,
        userData.password
      );
  
      const userObject = {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        type: "user",
        status: "active",
        createdAt: new Date().toISOString()
      };
  
      // Save to Firestore and MongoDB in parallel
      await Promise.all([
        setDoc(doc(getFirestore(), "users", userCredential.user.uid), userObject),
        axios.post(
          "https://gym-dhlm.onrender.com/api/users/register",
          userObject,
          {
            headers: { 
              'Content-Type': 'application/json'
            }
          }
        )
      ]);
  
      return userCredential.user;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };