import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Dimensions,//@ts-ignore
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword, getAuth, signOut, AuthError } from "@firebase/auth";
import { app, isFirebaseReady } from "../../Backend/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
//@ts-ignore
import { ScreenProps } from "../../types/navigation";
import { FitnessSplineModel } from "../components/FitnessSplineModel";

// Import correct ToastManager
import ToastManager from "../components/ToastManager";

// Import utilities
import { isFirebaseError, getAuthErrorMessage } from "../../utils/errorHandling";

const { width, height } = Dimensions.get('window');

/**
 * Enhanced Login screen component with 3D elements
 */
const Login = ({ navigation }: ScreenProps<"LoginScreen">): JSX.Element => {
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Get auth directly - no helper needed
  const FireBase_Auth = getAuth(app);
  
  // Toast instance
  const toast = ToastManager;

  // Track component mount state
  const isMounted = useRef(true);

  // Sign out any existing user when component mounts to prevent cached login issues
  useEffect(() => {
    const clearPreviousSession = async () => {
      try {
        if (FireBase_Auth && FireBase_Auth.currentUser) {
          console.log("Signing out previous user to prevent cached session");
          await signOut(FireBase_Auth);
        }
      } catch (error) {
        console.error("Error during sign out:", error);
      }
    };
    
    clearPreviousSession();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => {
      isMounted.current = false;
    };
  }, [fadeAnim, slideAnim]);

  // Simple Firebase Auth availability check
  useEffect(() => {
    // One-time check for Firebase Auth availability
    const services = isFirebaseReady();
    setAuthAvailable(services.auth);
    
    if (services.auth) {
      // console.log("Firebase Auth is available in LoginScreen");
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
    
    // Clear any previous errors
    setError(null);
    
    // Check if Auth is available
    if (!authAvailable || !FireBase_Auth){ //@ts-ignore
      if (toast && typeof toast.error === 'function') {
        //@ts-ignore
        toast.error("Authentication service is not available");
      } else {
        console.error("Authentication service is not available");
        Alert.alert("Error", "Authentication service is not available");
      }
      return;
    }
    
    try {
      setLoading(true);
      setAuthInProgress(true);
      
      // Sign out any existing user first to prevent cached login issues
      if (FireBase_Auth.currentUser) {
        await signOut(FireBase_Auth);
      }
      
      // Now attempt to sign in with the provided credentials
      const userCredential = await signInWithEmailAndPassword(
        FireBase_Auth,
        email.trim(),
        password
      );
      
      // Log successful authentication
      console.log("Sign in successful for:", userCredential.user.email);
      
      // Show success message
      //@ts-ignore
      if (toast && typeof toast.success === 'function') { //@ts-ignore
        toast.success("Login successful!");
      } else {
        Alert.alert("Success", "Login successful!");
      }
      
      // Clear form fields after successful login
      setEmail("");
      setPassword("");
      
    } catch (error) {
      console.error("Login error:", error);
      
      const errorMessage = isFirebaseError(error) 
        ? getAuthErrorMessage(error) 
        : "An unexpected error occurred";
      
      setError(errorMessage);
         
      //@ts-ignore
      if (toast && typeof toast.error === 'function') { //@ts-ignore
        toast.error(errorMessage);
      } else {
        Alert.alert("Login Failed", errorMessage);
      }
      
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setAuthInProgress(false);
      }
    }
  };

  return (//@ts-ignore
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* 3D Model Header - Smaller and with a different design */}
          <View style={styles.splineContainer}>
            <View style={styles.splineOverlay}>
              <Text style={styles.brandText}>FITNESS HUB</Text>
            </View>
            <FitnessSplineModel 
              style={styles.splineModel} 
              scene="https://prod.spline.design/example-fitness-scene" // Replace with your preferred scene
            />
          </View>
          
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.titleText}>
              Welcome Back
            </Text>
            <Text style={styles.subtitleText}>
              Login to continue your fitness journey
            </Text>
            
            {/* Error message if auth is not available */}
            {!authAvailable && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Authentication service is initializing. Please wait or try again.
                </Text>
              </View>
            )}
            
            {/* General error display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputWrapper,
                emailError ? styles.inputError : null
              ]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
              {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrapper,
                passwordError ? styles.inputError : null
              ]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                  <View>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#777" />
                  </View>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}
            </View>
            
            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('Forgot_Password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading || authInProgress || !authAvailable}
              style={[
                styles.loginButton,
                (loading || authInProgress || !authAvailable) ? styles.loginButtonDisabled : null
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Log In
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Or divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            {/* Register Links */}
            <View style={styles.registerOptions}>
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('User_SignUp')}
              >
                <View style={styles.registerButtonIcon}>
                  <Ionicons name="person-add-outline" size={18} color="#3498db" />
                </View>
                <Text style={styles.registerButtonText}>Sign Up as User</Text>
              </TouchableOpacity>
              
              <View style={styles.registerButtonSpacer} />
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('Gym_rgn')}
              >
                <View style={styles.registerButtonIcon}>
                  <Ionicons name="fitness-outline" size={18} color="#3498db" />
                </View>
                <Text style={styles.registerButtonText}>Register Your Gym</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
  splineContainer: {
    top: 0,
    height: height * 0.16, // Reduced height by ~30%
    width: '100%',
    backgroundColor: '#2c3e50', // Different background color
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 80,
    position: 'relative',
  },
  splineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly reduced opacity
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 24, // Smaller text
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  splineModel: {
    height: '110%', // Slightly reduced size
    width: '110%', 
    position: 'absolute',
    opacity: 0.85,
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  titleText: {
    fontSize: 26, // Slightly smaller
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 15, // Slightly smaller
    color: '#666',
    textAlign: 'center',
    marginBottom: 20, // Slightly reduced
  },
  errorContainer: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
  },
  errorText: {
    color: '#d63031',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 14, // Reduced
  },
  inputLabel: {
    marginBottom: 6, // Reduced
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff8f8',
  },
  iconContainer: {
    padding: 10, // Reduced
  },
  textInput: {
    flex: 1,
    padding: 10, // Reduced
    fontSize: 15, // Slightly smaller
    color: '#333',
  },
  errorMessage: {
    color: '#ff4d4d',
    marginTop: 3,
    fontSize: 12,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20, // Reduced
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 14, // Reduced
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20, // Reduced
  },
  loginButtonDisabled: {
    backgroundColor: '#a0cef5',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Reduced
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  registerOptions: {
    marginBottom: 20,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    backgroundColor: '#ebf5ff',
  },
  registerButtonSpacer: {
    height: 10,
  },
  registerButtonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Login;