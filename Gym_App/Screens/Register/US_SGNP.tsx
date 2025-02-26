import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";
import { FireBase_Auth } from "../../Backend/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import axios from "axios";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { registerUser } from "../../Backend/controllers/User_controls";

type UserSignUpProps = {
  navigation: NavigationProp<any>;
};

const US_SignUp = ({ navigation }: UserSignUpProps) => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (
      !userData.email ||
      !userData.password ||
      !userData.name ||
      !userData.phone
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Error, Please enter a valid email.");
      return;
    } else if (userData.password !== confirmPassword) {
      setError("Error, Passwords do not match.");
      return;
    } else if (userData.password.length < 6) {
      setError("Error , Password must be at least 6 characters long.");
      return;
    } else if (userData.phone.length !== 10 || userData.phone[0] === "0") {
      setError("Error, Phone number must be 10 digits long.");
      return;
    } else {
      setError("ERROR");
    }

    // Reset error
    setError("");
    setLoading(true);

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        FireBase_Auth,
        userData.email,
        userData.password
      );
      await sendEmailVerification(userCredential.user);
      console.log("Firebase user created:", userCredential.user.uid);
      Alert.alert("Success", "Registration successful!");
      navigation.navigate("UserTabs");

      // Step 2: Save to Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        type: "user",
        status: "active",
        createdAt: new Date().toISOString(),
      });

      // Step 3: Save to MongoDB
      try {
        const mongoResponse = await axios.post(
          "https://gym-dhlm.onrender.com/Register/Users",
          {
            uid: userCredential.user.uid,
            ...userData,
            type: "user",
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            timeout: 5000,
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("MongoDB response:", mongoResponse.data);
      } catch (mongoError) {
        console.error("MongoDB error:", mongoError);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Email already registered"
          : error.response?.data?.message ||
            error.message ||
            "Registration failed";

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  //continue from sign up page

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <KeyboardAvoidingView className="w-full">
        <View className="flex-shrink-0 p-4 w-full relative">
          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Enter your Name"
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
          />
          <TextInput
            className="border-2 border-black p-2  mb-4 rounded"
            placeholder="Enter your Email"
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="relative flex-row items-center mb-4">
            <TextInput
              className="flex-1 border-2 border-black p-2 rounded pr-12"
              placeholder="Enter your Password"
              value={userData.password}
              onChangeText={(text) =>
                setUserData({ ...userData, password: text })
              }
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="absolute right-3"
            >
              <Text>{showPassword ? "Hide Password" : "Show Password"}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
          <TextInput
            className="border-2 border-black p-2  mb-4 rounded"
            placeholder="Enter your Phone"
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
            keyboardType="phone-pad"
          />
          <Button
            title={loading ? "Loading..." : "Sign Up"}
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default US_SignUp;
