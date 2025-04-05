import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { FireBase_Auth, isFirebaseReady } from "../../Backend/firebase";
import { Ionicons } from "@expo/vector-icons";
import { ScreenProps } from "../../types/navigation";

// Import custom hooks and utilities
import useToastNotification from "../../hooks/useToastNotification";
import { isFirebaseError, getAuthErrorMessage } from "../../utils/errorHandling";

/**
 * Login screen component for user authentication
 * @returns {JSX.Element} Login screen UI
 */
const HandleLogin = ({ navigation }: ScreenProps<"LoginScreen">): JSX.Element => {
  // State management
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);
  const [authAvailable, setAuthAvailable] = useState<boolean>(false);
  
  // Custom hooks
  const toast = useToastNotification();

  // Check if Firebase Auth is available
  useEffect(() => {
    const checkAuth = () => {
      const services = isFirebaseReady();
      if (services.auth) {
        console.log("Firebase Auth is available in LoginScreen");
        setAuthAvailable(true);
      } else {
        console.log("Firebase Auth not available in LoginScreen");
      }
    };

    // Check immediately and then every second
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
   * Handle user sign in process
   */
  const handleSignIn = async (): Promise<void> => {
    if (loading || authInProgress) {
      console.log("Sign in blocked - already in progress");
      return;
    }
    
    if (!authAvailable || !FireBase_Auth) {
      const errorMsg = "Authentication service is initializing. Please try again in a moment.";
      toast.warning(errorMsg, "Service Unavailable");
      return;
    }

    // Validate form before submission
    if (!validateForm()) return;

    try {
      setLoading(true);
      setAuthInProgress(true);
      console.log("Attempting to sign in with:", email);

      const userCredential = await signInWithEmailAndPassword(
        FireBase_Auth,
        email,
        password
      );
      
      console.log("Sign in successful");
      toast.auth("Login successful!", true);
      // Navigation will be handled by the auth state change listener in App.js
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Use our error handling utility for consistent messages
      const errorMessage = getAuthErrorMessage(err);
      toast.error(errorMessage, "Login Failed");
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
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="fitness" size={32} color="#0091EA" />
          </View>
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
              loading || !authAvailable ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleSignIn}
            disabled={loading || !authAvailable}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : !authAvailable ? (
              <Text className="text-white font-bold text-lg">INITIALIZING...</Text>
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
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HandleLogin;