import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";

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
    } else if (userData.password.length < 6) {
      setError("Error, Password must be at least 6 characters.");
      return;
    } else if (userData.password !== confirmPassword) {
      setError("Error, Passwords do not match.");
      return;
    }

    // Clear any previous errors
    setError("");
    setLoading(true);

    try {
      // Create user account with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        FireBase_Auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Save user profile in Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        type: "user", // Specify this is a user account
        createdAt: new Date().toISOString(),
      });

      // Sign up success
      Alert.alert(
        "Success",
        "Account created! Please verify your email before logging in.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("LoginScreen"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1 p-6 justify-center">
        <View>
          <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </Text>

          {/* Error message display */}
          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="person-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your name"
                value={userData.name}
                onChangeText={(text) =>
                  setUserData({ ...userData, name: text })
                }
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="mail-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={userData.email}
                onChangeText={(text) =>
                  setUserData({ ...userData, email: text })
                }
              />
            </View>
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="call-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={userData.phone}
                onChangeText={(text) =>
                  setUserData({ ...userData, phone: text })
                }
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={userData.password}
                onChangeText={(text) =>
                  setUserData({ ...userData, password: text })
                }
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Confirm Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Confirm password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`bg-blue-600 py-3 rounded-lg items-center justify-center mb-4 ${
              loading ? "opacity-70" : ""
            }`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">SIGN UP</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text className="text-blue-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default US_SignUp;
