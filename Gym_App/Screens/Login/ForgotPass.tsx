import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
  Platform,//@ts-ignore
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FireBase_Auth } from "../../Backend/firebase";
import { sendPasswordResetEmail } from "@firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../components/ToastManager";//@ts-ignore
import { ScreenProps } from "../../types/navigation";

//@ts-ignore
const ForgotPass = ({ navigation }: ScreenProps<"Forgot_Password">) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Animation value for error message
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  // Shake animation for error
  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  // Function to handle the reset password
  const handleResetPassword = async (): Promise<void> => {
    if (!email) {
      setError("Please enter your email address");
      startShakeAnimation();
      return;
    }

    // Validate email format
    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      startShakeAnimation();
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      // Just directly send the password reset email
      // Firebase will handle showing success even if email doesn't exist (for security)
      await sendPasswordResetEmail(FireBase_Auth, email.trim());
      
      // Success message
      showToast.success("Success", "If this email exists in our system, a password reset link will be sent.");
      
      // Navigate back to login screen after short delay
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1500);
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to reset password. Please try again.";
      
      // Handle specific Firebase errors
      // Only respond to "definitely wrong" scenarios, not "might not exist" scenarios
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please check and try again.";
        startShakeAnimation();
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // For user-not-found and other errors, give a generic message
        // to avoid email enumeration attacks
        errorMessage = "We were unable to process your request. Please check your email and try again.";
      }
      
      // Set the error message to display in UI
      setError(errorMessage);
      
      // Show toast error
      showToast.error("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (//@ts-ignore
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={60} color="#0091EA" />
        </View>
        
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>
        
        <View style={[styles.inputContainer, error ? styles.inputError : null]}>
          <Ionicons name="mail-outline" size={22} color={error ? "#e53935" : "#0091EA"} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text:string) => {
              setEmail(text);
              if (error) setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {error ? (
          <Animated.View 
            style={{ 
              transform: [{ translateX: shakeAnimation }] 
            }}
          >
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#e53935" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Animated.View>
        ) : null}
        
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#0091EA" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            For security reasons, we'll send a reset link only if the email is registered.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>RESET PASSWORD</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#e1f5fe',
    padding: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#e53935',
    backgroundColor: '#ffebee',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#e53935',
    flex: 1,
    fontSize: 13,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    padding: 8,
  },
  infoIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  infoText: {
    color: '#0277bd',
    flex: 1,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#0091EA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#64b5f6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#0091EA',
    fontSize: 14,
  },
});

export default ForgotPass;