import axios from 'axios';
import { FireBase_Auth } from '../firebase';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const registerUser = async (userData: any) => {
  try {
    // Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      FireBase_Auth,
      userData.email,
      userData.password
    );

    // Create user data object
    const userObject = {
      uid: userCredential.user.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      type: "user",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Store in Firestore
    const db = getFirestore();
    await setDoc(doc(db, "users", userCredential.user.uid), userObject);

    // Store in MongoDB with proper headers and data structure
    try {
      const response = await axios.post(
        "https://gym-dhlm.onrender.com/Register/Users",
        {
          ...userObject,
          tableName: "Users",
          databaseName: "Register"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("MongoDB response:", response.data);
    } catch (mongoError) {
      console.error("MongoDB error:", (mongoError as any).response?.data || mongoError);
      // Continue even if MongoDB fails - user is still created in Firebase
    }

    return userCredential.user;

  } catch (error: any) {
    console.error("Registration failed:", error);
    throw new Error(error.message || "User registration failed");
  }
};