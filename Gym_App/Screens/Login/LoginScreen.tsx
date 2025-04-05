import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { app, isFirebaseReady } from "../../Backend/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenProps } from "../../types/navigation";

// Import correct ToastManager
import ToastManager from "../UserDashboard/components/ToastManager";

// Import utilities
import { isFirebaseError, getAuthErrorMessage } from "../../utils/errorHandling";

/**
 * Login screen component for user authentication
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
  const [error, setError] = useState<string | null>(null);
  
  // Get auth directly - no helper needed
  const FireBase_Auth = getAuth(app);
  
  // Toast instance
  const toast = ToastManager;

  // Track component mount state
  const isMounted = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Simple Firebase Auth availability check
  useEffect(() => {
    // One-time check for Firebase Auth availability
    const services = isFirebaseReady();
    setAuthAvailable(services.auth);
    
    if (services.auth) {
      console.log("Firebase Auth is available in LoginScreen");
    } else {
      console.log("Firebase Auth not available in LoginScreen");
      // Single retry if not available
      setTimeout(() => {
        if (isMounted.current) {
          const retryServices = isFirebaseReady();
          setAuthAvailable(retryServices.auth);
          console.log("Auth retry result:", retryServices.auth);
        }
      }, 1000);
    }
  }, []);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (): void => setShowPassword(!showPassword);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form inputs
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
    // Prevent multiple submissions
    if (loading || authInProgress) return;
    
    // Validate the form
    if (!validateForm()) return;
    
    // Check if Auth is available
    if (!authAvailable || !FireBase_Auth) {
      if (toast && typeof toast.error === 'function') {
        toast.error("Authentication service is not available");
      } else {
        console.error("Authentication service is not available");
        alert("Authentication service is not available");
      }
      return;
    }
    
    try {
      setLoading(true);
      setAuthInProgress(true);
      
      const userCredential = await signInWithEmailAndPassword(
        FireBase_Auth,
        email,
        password
      );
      
      console.log("Sign in successful");
      
      if (toast && typeof toast.success === 'function') {
        toast.success("Login successful!");
      } else {
        alert("Login successful!");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      
      const errorMessage = isFirebaseError(error) 
        ? getAuthErrorMessage(error) 
        : "An unexpected error occurred";
        
      if (toast && typeof toast.error === 'function') {
        toast.error(errorMessage);
      } else {
        alert(`Login error: ${errorMessage}`);
      }
      
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setAuthInProgress(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
            Login to Your Account
          </Text>
          
          {/* Error message if auth is not available */}
          {!authAvailable && (
            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#ffeeee', borderRadius: 5 }}>
              <Text style={{ color: 'red' }}>
                Authentication service is initializing. Please wait or try again.
              </Text>
            </View>
          )}
          
          {/* Email Input */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ marginBottom: 5 }}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: emailError ? 'red' : '#ddd',
                padding: 12,
                borderRadius: 8
              }}
            />
            {emailError ? <Text style={{ color: 'red', marginTop: 5 }}>{emailError}</Text> : null}
          </View>
          
          {/* Password Input */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ marginBottom: 5 }}>Password</Text>
            <View style={{ 
              flexDirection: 'row', 
              borderWidth: 1, 
              borderColor: passwordError ? 'red' : '#ddd',
              borderRadius: 8,
              alignItems: 'center' 
            }}>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ flex: 1, padding: 12 }}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={{ padding: 12 }}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={{ color: 'red', marginTop: 5 }}>{passwordError}</Text> : null}
          </View>
          
          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading || authInProgress || !authAvailable}
            style={{
              backgroundColor: loading || authInProgress || !authAvailable ? '#a0cef5' : '#3498db',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Log In
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Register Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#3498db', fontWeight: 'bold' }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HandleLogin;