import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FirebaseError } from "firebase/app";
import { FireBase_Auth, isFirebaseReady } from "../../Backend/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../UserDashboard/components/ToastManager";
import { ScreenProps } from "../../types/navigation";
//@ts-ignore
const ForgotPass = ({ navigation }: ScreenProps<"Forgot_Password">) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [authAvailable, setAuthAvailable] = useState<boolean>(false);

  // Check if Firebase Auth is available
  useEffect(() => {
    const checkAuth = () => {
      const services = isFirebaseReady();
      if (services.auth) {
        console.log("Firebase Auth is available in ForgotPass");
        setAuthAvailable(true);
      } else {
        console.log("Firebase Auth not available in ForgotPass");
      }
    };

    // Check immediately and then every second
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to handle the reset password
  const handleResetPassword = async (): Promise<void> => {
    if (!authAvailable || !FireBase_Auth) {
      const errorMsg = "Authentication service is initializing. Please try again in a moment.";
      setError(errorMsg);
      showToast.warning("Service Unavailable", errorMsg);
      return;
    }
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Validate email format
    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      // Send password reset email through Firebase Auth
      await sendPasswordResetEmail(FireBase_Auth, email);
      showToast.success("Success", "Password reset email sent! Please check your inbox.");
      navigation.navigate("Login");
    } catch (err) {
      console.error("Reset password error:", err);
      let errorMessage = "Failed to reset password. Please try again.";
      
      const error = err as FirebaseError;
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account exists with this email";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      setError(errorMessage);
      showToast.error("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    //@ts-ignore  
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={60} color="#0091EA" />
        </View>
        
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#0091EA" style={styles.inputIcon} />
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
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.button, (loading || !authAvailable) ? styles.buttonDisabled : null]}
          onPress={handleResetPassword}
          disabled={loading || !authAvailable}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : !authAvailable ? (
            <Text style={styles.buttonText}>INITIALIZING...</Text>
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
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  errorText: {
    color: '#e53935',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0091EA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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