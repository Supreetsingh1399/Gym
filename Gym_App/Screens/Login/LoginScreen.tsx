import React, { useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";

// Define navigation types
type RootStackParamList = {
  LoginScreen: undefined;
  Forgot_Password: undefined;
  User_SignUp: undefined;
  Gym_rgn: undefined;  // Updated to match App.tsx navigation structure
  TrainerHome: undefined;
  UserTabs: undefined;
  GymHome: undefined;
  // TR_SGnp: undefined;  // Removed trainer registration route
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

/**
 * Login screen component for user authentication
 * @param {LoginScreenProps} props - Component props including navigation
 * @returns {JSX.Element} Login screen UI
 */
const HandleLogin = ({ navigation }: LoginScreenProps): JSX.Element => {
  // State management
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (): void => setShowPassword(!showPassword);

  /**
   * Validate email format
   * @param {string} email - User email to validate
   * @returns {boolean} Whether email is valid
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form inputs
   * @returns {boolean} Whether form is valid
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  /**
   * Navigate to appropriate screen based on user type
   * Uses reset to avoid navigation stack issues
   */
  const navigateToUserScreen = (destination: "UserTabs" | "TrainerHome" | "GymHome"): void => {
    // Reset navigation to prevent going back to login after authentication
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: destination }],
      })
    );
  };

  /**
   * Handle user sign in process
   */
  const handleSignIn = async (): Promise<void> => {
    if (loading || authInProgress) return; // Prevent multiple login attempts

    // Validate form before submission
    if (!validateForm()) return;

    try {
      setLoading(true);
      setAuthInProgress(true);

      const userCredential = await signInWithEmailAndPassword(
        FireBase_Auth,
        email,
        password,
      );
      const userId = userCredential.user.uid;
      console.log("Auth successful, UID:", userId);

      const db = getFirestore();
      // Check user, trainer, and gym collections
      const [userDoc, trainerDoc, gymDoc] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDoc(doc(db, "Trainers", userId)),
        getDoc(doc(db, "gyms", userId)),
      ]);

      // Navigate to appropriate screen based on user type
      if (gymDoc.exists() && gymDoc.data()?.type === "gym") {
        navigateToUserScreen("GymHome");
      } else if (trainerDoc.exists() && trainerDoc.data()?.type === "trainer") {
        navigateToUserScreen("TrainerHome");
      } else if (userDoc.exists() && userDoc.data()?.type === "user") {
        navigateToUserScreen("UserTabs");
      } else {
        Alert.alert("Error", "Account type not found. Please register first.");
        setAuthInProgress(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific authentication errors with user-friendly messages
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error && error.code) {
        const errorCode = error.code;
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (errorCode === 'auth/too-many-requests') {
          errorMessage = "Too many failed login attempts. Please try again later.";
        } else if (errorCode === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your internet connection.";
        }
      }
      
      Alert.alert("Login Failed", errorMessage);
      setAuthInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 justify-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="items-center mb-10">
          <Image 
            source={require('../../../assets/icon.png')} 
            className="w-16 h-16"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-blue-600 mt-2">GymBuddy</Text>
        </View>

        <View className="px-8">
          <Text className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</Text>
          <Text className="text-base text-gray-500 mb-6">Sign in to continue</Text>

          {/* Email Input */}
          <View className="flex-row items-center mb-1 border border-gray-300 rounded-lg bg-gray-50 px-2">
            <View className="px-2 py-3">
              <Ionicons name="mail-outline" size={22} color="#0091EA" />
            </View>
            <TextInput
              className={`flex-1 py-3 px-2 text-base text-gray-700 ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>
          {emailError ? (
            <Text className="text-red-500 text-xs mb-2 ml-1">{emailError}</Text>
          ) : (
            <View className="h-5" />
          )}

          {/* Password Input */}
          <View className="flex-row items-center mb-1 border border-gray-300 rounded-lg bg-gray-50 px-2">
            <View className="px-2 py-3">
              <Ionicons name="lock-closed-outline" size={22} color="#0091EA" />
            </View>
            <TextInput
              className={`flex-1 py-3 px-2 text-base text-gray-700 ${
                passwordError ? "border-red-500" : ""
              }`}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="px-2"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#0091EA"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text className="text-red-500 text-xs mb-2 ml-1">{passwordError}</Text>
          ) : (
            <View className="h-5" />
          )}

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Forgot_Password")}
            className="self-end mb-5"
          >
            <Text className="text-blue-500 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className={`py-3 px-6 rounded-lg items-center justify-center ${
              loading ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Section */}
          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("User_SignUp")}>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Alternative Sign Up Options */}
          <View className="mt-6">
            <Text className="text-gray-500 text-center mb-4">Or register as</Text>
            
            <View className="flex-row justify-center">
              {/* Gym Owner Registration */}
              <TouchableOpacity 
                className="flex-row items-center bg-blue-50 py-3 px-6 rounded-lg border border-blue-200"
                onPress={() => navigation.navigate("Gym_rgn")}
              >
                <Ionicons name="fitness-outline" size={20} color="#0091EA" />
                <Text className="ml-2 text-blue-700 font-medium">Gym Owner</Text>
              </TouchableOpacity>
              
              {/* Removed trainer registration option */}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HandleLogin;
