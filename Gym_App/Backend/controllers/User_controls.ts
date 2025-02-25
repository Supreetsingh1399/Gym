import axios from "axios";
import { FireBase_Auth } from "../firebase";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const registerUser = async (userData: any) => {
  try {
    // Firebase Authentication
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
      createdAt: new Date().toISOString(),
    };

    const db = getFirestore();

    // Save to Firestore and MongoDB in parallel
    await Promise.all([
      setDoc(doc(db, "users", userCredential.user.uid), userObject),
      axios
        .post(
          "https://gym-dhlm.onrender.com/Register/Users",
          { ...userObject, tableName: "Users", databaseName: "Register" },
          { headers: { "Content-Type": "application/json" } }
        )
        .catch((err) =>
          console.error("MongoDB Error:", err.response?.data || err)
        ),
    ]);

    return userObject;
  } catch (error: any) {
    console.error("Registration failed:", error);
    throw new Error(error.message || "User registration failed");
  }
};
