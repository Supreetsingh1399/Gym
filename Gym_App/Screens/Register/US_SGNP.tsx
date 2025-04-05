import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";
import { FireBase_Auth, FirebaseDB, isFirebaseReady } from "../../Backend/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import axios from "axios";
import { setDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { isFirebaseError, getAuthErrorMessage } from "../../utils/errorHandling";

const API_URL = process.env.API_URL || "https://your-api-url.com"; // Update with your actual API URL

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type UserSignUpProps = {
  navigation: NavigationProp<RootStackParamList>;
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
  const [servicesReady, setServicesReady] = useState(false);

  // Check if Firebase services are available
  useEffect(() => {
    const checkServices = () => {
      const services = isFirebaseReady();
      if (services.auth && services.firestore) {
        console.log("Firebase services are available in SignUp");
        setServicesReady(true);
      } else {
        console.log("Firebase services not fully available in SignUp");
      }
    };

    // Check immediately and then every second
    checkServices();
    const interval = setInterval(checkServices, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (!servicesReady || !FireBase_Auth || !FirebaseDB) {
      Alert.alert(
        "Service Unavailable", 
        "Firebase services are initializing. Please try again in a moment."
      );
      return;
    }
    
    if (
      !userData.email ||
      !userData.password ||
      !userData.name ||
      !userData.phone
    ) {
      setError("Please fill in all required fields.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Please enter a valid email.");
      return;
    } else if (userData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    } else if (userData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Clear any previous errors
    setError("");
    setLoading(true);

    try {
      console.log("Creating user account...");
      // Create user account with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        FireBase_Auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;
      console.log("User created successfully:", user.uid);

      // Send email verification
      await sendEmailVerification(user);
      console.log("Verification email sent");

      // Save user profile in Firestore
      console.log("Saving user data to Firestore...");
      await setDoc(doc(FirebaseDB, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        type: "user", // Specify this is a user account
        createdAt: new Date().toISOString(),
      });
      console.log("User data saved to Firestore");
      
      // Optionally, save user data to your backend
      try {
        console.log("Sending user data to API...");
        await axios.post(`${API_URL}/Register/Users`, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          uid: user.uid,
        });
        console.log("User data sent to API successfully");
      } catch (apiError) {
        console.error("API error during user registration:", apiError);
        // Continue with the flow even if API call fails
      }

      // Sign up success
      Alert.alert(
        "Success",
        "Account created! Please verify your email before logging in.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (err) {
      console.error("Signup error:", err);
      
      if (isFirebaseError(err)) {
        setError(getAuthErrorMessage(err));
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1 p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="person-add" size={32} color="#0091EA" />
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </Text>

          {/* Error message display */}
          {error ? (
            <View className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
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
                onChangeText={(text:string) =>
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
                onChangeText={(text:string) =>
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
                onChangeText={(text:string) =>
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
                placeholder="Enter password (min 6 characters)"
                secureTextEntry={!showPassword}
                value={userData.password}
                onChangeText={(text:string) =>
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
              loading || !servicesReady ? "opacity-70" : ""
            }`}
            onPress={handleSubmit}
            disabled={loading || !servicesReady}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : !servicesReady ? (
              <Text className="text-white font-bold text-lg">INITIALIZING...</Text>
            ) : (
              <Text className="text-white font-bold text-lg">SIGN UP</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
            >
              <Text className="text-blue-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default US_SignUp;