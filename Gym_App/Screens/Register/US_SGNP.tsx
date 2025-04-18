import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { app, isFirebaseReady } from "../../Backend/firebase";
//@ts-ignore
import { ScreenProps } from "../../types/navigation";
import { FitnessSplineModel } from "../components/FitnessSplineModel";
import axios from "axios";

// Import utilities
import {
  isFirebaseError,
  getAuthErrorMessage,
} from "../../utils/errorHandling";

// Import ToastManager
import ToastManager from "../components/ToastManager";

const { width, height } = Dimensions.get("window");

// Update with your actual MongoDB API URL
const API_URL = process.env.API_URL || "https://your-api-url.com";

// User interface
interface UserData {
  name: string;
  email: string;
  phoneNumber: string;
  fitnessGoal: string;
  gender: string;
  // dateOfBirth: string;
  weight: string;
  height: string;
  age: string;
}

const US_SignUp = ({
  navigation,
}: ScreenProps<"UserRegister">): JSX.Element => {
  // Form state
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phoneNumber: "",
    fitnessGoal: "General Fitness",
    gender: "",
    // dateOfBirth: "",
    weight: "",
    height: "",
    age: "",
  });

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Current step
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [servicesReady, setServicesReady] = useState(false);
     // Add these helper functions and state variables to your component

  // Animation values using Reanimated 2
  const fadeAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);


  // Firebase refs
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Toast instance
  const toast = ToastManager;

  // Component mounted ref
  const isMounted = useRef(true);

  // Check if Firebase services are available
  useEffect(() => {
    const checkServices = () => {
      const services = isFirebaseReady();
      if (services.auth && services.db) {
        // console.log("Firebase services are available in SignUp");
        setServicesReady(true);
      } else {
        console.log("Firebase services not fully available in SignUp");
        // Retry if not ready
        setTimeout(checkServices, 1000);
      }
    };

    // Check immediately and then every second
    checkServices();
    const interval = setInterval(checkServices, 1000);

    return () => {
      clearInterval(interval);
      isMounted.current = false;
    };
  }, []);

  // Handle step transition animations
  useEffect(() => {
    fadeAnim.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });

    // Schedule the slide animation after fade out
    setTimeout(() => {
      slideAnim.value = -20;

      // Schedule fade in and slide in after a small delay
      setTimeout(() => {
        fadeAnim.value = withTiming(1, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        });
        slideAnim.value = withTiming(0, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
      }, 50);
    }, 200);
  }, [currentStep]);

  


  // Create animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  // Handle user input change
  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData({
      ...userData,
      [field]: value,
    });

    // Clear error for this field if exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate personal info
      if (!userData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!userData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        newErrors.email = "Invalid email format";
      }

      if (!userData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\d{10}$/.test(userData.phoneNumber.replace(/\D/g, ""))) {
        newErrors.phoneNumber = "Invalid phone number";
      }
    } else if (step === 2) {
      // Validate fitness info
      if (!userData.fitnessGoal) {
        newErrors.fitnessGoal = "Please select a fitness goal";
      }

      if (!userData.gender) {
        newErrors.gender = "Please select your gender";
      }

      if (!userData.age) {
        newErrors.age = "Age is required";
      } else if (isNaN(Number(userData.age)) || Number(userData.age) < 1 || Number(userData.age) > 120) {
        newErrors.age = "Please enter a valid age (1-120)";
      }

      if (!userData.weight) {
        newErrors.weight = "Weight is required";
      }

      if (!userData.height) {
        newErrors.height = "Height is required";
      }
    } else if (step === 3) {
      // Validate password
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.navigate("Login");
    }
  };

  // Handle registration with MongoDB integration
  const handleRegister = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (!servicesReady || !auth || !db) {
      Alert.alert(
        "Service Unavailable",
        "Firebase services are initializing. Please try again in a moment.",
      );
      return;
    }

    setLoading(true);

    try {
      console.log("Creating user account...");
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password,
      );

      const user = userCredential.user;
      console.log("User created successfully:", user.uid);

      // Send email verification
      await sendEmailVerification(user);
      console.log("Verification email sent");

      // Modify your userDataObj in the handleRegister function:
      const userDataObj = {
        name: userData.name,
        email: userData.email,
        // Add missing required field
        age: parseInt(userData.age) || 18, 
        // Convert to number for MongoDB validation
        weight: userData.weight ? `${userData.weight}kg` : null,
        // Add proper format
        height: userData.height + "cm",
        // Remove non-digit characters if any
        phone: userData.phoneNumber.replace(/\D/g, ''),
        fitnessGoal: userData.fitnessGoal,
        gender: userData.gender,
        type: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: "user",
        uid: user.uid,
      };
      // Store in Firestore
      console.log("Saving user data to Firestore...");
      await setDoc(doc(db, "users", user.uid), userDataObj);
      console.log("User data saved to Firestore");

      // 1. Try to save to MongoDB via API endpoint
      let mongoDbSaved = false;
      // Modify your MongoDB API call:
      try {
        console.log("Sending user data to MongoDB API...");
        console.log("API endpoint:", `${API_URL}/Register/Users`); 
        const mongoResponse = await axios.post(
          `${API_URL}/Register/Users`,
          userDataObj,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
            timeout: 10000, // Add timeout to prevent hanging
          },
        );

        console.log("MongoDB Response full:", mongoResponse);
        console.log("MongoDB Response status:", mongoResponse.status);

        if (mongoResponse.status === 201 || mongoResponse.status === 200) {
          console.log("User data saved to MongoDB successfully");
          mongoDbSaved = true;
        }
      } catch (mongoError) {
        console.error(
          "MongoDB API error details:",
          (mongoError as any).response || mongoError,
        );
      }
      if (isMounted.current) {
        setLoading(false);
      }

      // Clear form after successful registration
      setUserData({
        name: "",
        email: "",
        phoneNumber: "",
        fitnessGoal: "General Fitness",
        gender: "",
        weight: "",
        height: "",
        age: "",
      });
      setPassword("");
      setConfirmPassword("");

      // Show success message
      //@ts-ignore
      if (toast && typeof toast.success === "function") {
        //@ts-ignore
        toast.success(
          "Account created! Please verify your email before logging in.",
        );
      } else {
        console.log(
          "Account created! Please verify your email before logging in.",
        );
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "UserTabs" }],
      });
    } catch (error: any) {
      console.error("Registration error:", error);

      if (isMounted.current) {
        setLoading(false);
      }

      // Show error message with proper handling
      let errorMessage = "Failed to create account. Please try again.";

      if (isFirebaseError(error)) {
        errorMessage = getAuthErrorMessage(error);
      }

      //@ts-ignore
      if (toast && typeof toast.error === "function") {
        //@ts-ignore
        toast.error(errorMessage);
      } else {
        Alert.alert("Registration Failed", errorMessage);
      }
    }
  };
// Render form based on current step
const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          //@ts-ignore
          <Animated.View style={[styles.stepContainer, animatedContainerStyle]}>
            <Text style={styles.stepTitle}>Personal Information</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.name ? styles.inputError : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Enter your full name"
                  value={userData.name}
                  onChangeText={(value: string) =>
                    handleInputChange("name", value)
                  }
                  style={styles.textInput}
                />
              </View>
              {errors.name ? (
                <Text style={styles.errorMessage}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputError : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  value={userData.email}
                  onChangeText={(value: string) =>
                    handleInputChange("email", value)
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorMessage}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phoneNumber ? styles.inputError : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Enter your phone number"
                  value={userData.phoneNumber}
                  onChangeText={(value: string) =>
                    handleInputChange("phoneNumber", value)
                  }
                  keyboardType="phone-pad"
                  style={styles.textInput}
                />
              </View>
              {errors.phoneNumber ? (
                <Text style={styles.errorMessage}>{errors.phoneNumber}</Text>
              ) : null}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          //@ts-ignore
          <Animated.View style={[styles.stepContainer, animatedContainerStyle]}>
            <Text style={styles.stepTitle}>Fitness Profile</Text>

            {/* Fitness Goal Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Fitness Goal</Text>
              <View style={styles.selectionContainer}>
                {[
                  "Weight Loss",
                  "Muscle Building",
                  "Endurance",
                  "General Fitness",
                ].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.selectionOption,
                      userData.fitnessGoal === goal
                        ? styles.selectionActive
                        : null,
                    ]}
                    onPress={() => handleInputChange("fitnessGoal", goal)}
                  >
                    <Text
                      style={[
                        styles.selectionText,
                        userData.fitnessGoal === goal
                          ? styles.selectionTextActive
                          : null,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.fitnessGoal ? (
                <Text style={styles.errorMessage}>{errors.fitnessGoal}</Text>
              ) : null}
            </View>

            {/* Gender Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {["Male", "Female", "Other"].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      userData.gender === gender ? styles.genderActive : null,
                    ]}
                    onPress={() => handleInputChange("gender", gender)}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={
                          gender === "Male"
                            ? "male-outline"
                            : gender === "Female"
                              ? "female-outline"
                              : "person-outline"
                        }
                        size={22}
                        color={userData.gender === gender ? "#fff" : "#777"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.genderText,
                        userData.gender === gender
                          ? styles.genderTextActive
                          : null,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? (
                <Text style={styles.errorMessage}>{errors.gender}</Text>
              ) : null}
            </View>
  {/* Age Field */}
<View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Age</Text>
  <View style={[
    styles.inputWrapper,
    errors.age ? styles.inputError : null,
  ]}>
    <View style={styles.iconContainer}>
      <Ionicons name="calendar-outline" size={20} color="#777" />
    </View>
    <TextInput
      placeholder="Enter your age"
      value={userData.age}
      onChangeText={(value: string) => handleInputChange("age", value)}
      keyboardType="numeric"
      style={styles.textInput}
      maxLength={3}
    />
  </View>
  {errors.age ? (
    <Text style={styles.errorMessage}>{errors.age}</Text>
  ) : null}
</View>
            {/* Weight and Height */}
            <View style={styles.rowContainer}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.inputLabel}>Weight</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.weight ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="kg"
                    value={userData.weight}
                    onChangeText={(value: string) =>
                      handleInputChange("weight", value)
                    }
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                {errors.weight ? (
                  <Text style={styles.errorMessage}>{errors.weight}</Text>
                ) : null}
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Height</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.height ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="cm"
                    value={userData.height}
                    onChangeText={(value: string) =>
                      handleInputChange("height", value)
                    }
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                {errors.height ? (
                  <Text style={styles.errorMessage}>{errors.height}</Text>
                ) : null}
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          //@ts-ignore
          <Animated.View style={[styles.stepContainer, animatedContainerStyle]}>
            <Text style={styles.stepTitle}>Create Password</Text>
            <Text style={styles.stepDescription}>
              Choose a secure password that you'll remember. We recommend using
              a combination of letters, numbers, and special characters.
            </Text>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputError : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Create password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.iconContainer}
                >
                  <View>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#777"
                    />
                  </View>
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorMessage}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#777" />
                </View>
                <TextInput
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorMessage}>
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

            {/* Password strength indicator */}
            <View style={styles.passwordStrengthContainer}>
              <Text style={styles.passwordStrengthLabel}>
                Password strength:
              </Text>
              <View style={styles.passwordStrengthBar}>
                <View
                  style={[
                    styles.passwordStrengthFill,
                    {
                      width: `${password.length < 4 ? 25 : password.length < 6 ? 50 : password.length < 10 ? 75 : 100}%`,
                      backgroundColor:
                        password.length < 4
                          ? "#ff4d4d"
                          : password.length < 6
                            ? "#ffbb33"
                            : password.length < 10
                              ? "#44cc44"
                              : "#00aaff",
                    },
                  ]}
                />
              </View>
              <Text style={styles.passwordStrengthText}>
                {password.length < 4
                  ? "Weak"
                  : password.length < 6
                    ? "Fair"
                    : password.length < 10
                      ? "Good"
                      : "Strong"}
              </Text>
            </View>

            {/* Email verification notice */}
            <View style={styles.verificationNote}>
              <View style={styles.noteIconContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#3498db"
                />
              </View>
              <Text style={styles.noteText}>
                A verification email will be sent to your email address. Please
                verify your email to complete the registration process.
              </Text>
            </View>

            {/* Terms and conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // Progress bar
  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index < currentStep
                ? styles.progressComplete
                : styles.progressIncomplete,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    //@ts-ignore
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header with 3D model - Improved design */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>

          <View style={styles.splineContainer}>
            <View style={styles.splineOverlay} />
            <FitnessSplineModel
              style={styles.splineModel}
              scene="https://prod.spline.design/6PYRwV3Z3hgda9Kl/scene.splinecode"
            />
          </View>
        </View>

        {/* Progress bar */}
        {renderProgressBar()}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <View style={styles.navigationButtons}>
            {currentStep < totalSteps ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <View>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  loading || !servicesReady ? styles.buttonDisabled : null,
                ]}
                onPress={handleRegister}
                disabled={loading || !servicesReady}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : !servicesReady ? (
                  <Text style={styles.registerButtonText}>INITIALIZING...</Text>
                ) : (
                  <Text style={styles.registerButtonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Login link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  splineContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#1a2a3a", // Darker background
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  splineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(52, 152, 219, 0.2)", // Blue tint overlay
    zIndex: 1,
  },
  splineModel: {
    width: "120%",
    height: "120%",
    opacity: 0.85, // Slightly transparent
  },
  progressContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressComplete: {
    backgroundColor: "#3498db",
  },
  progressIncomplete: {
    backgroundColor: "#ddd",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#ff4d4d",
    backgroundColor: "#fff8f8",
  },
  iconContainer: {
    padding: 12,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  errorMessage: {
    color: "#ff4d4d",
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
  },
  selectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  selectionOption: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectionActive: {
    backgroundColor: "#e1f0ff",
    borderColor: "#3498db",
  },
  selectionText: {
    color: "#555",
  },
  selectionTextActive: {
    color: "#3498db",
    fontWeight: "600",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  genderActive: {
    backgroundColor: "#3498db",
    borderColor: "#2980b9",
  },
  genderText: {
    color: "#555",
    marginLeft: 4,
  },
  genderTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: "100%",
  },
  passwordStrengthText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  verificationNote: {
    flexDirection: "row",
    backgroundColor: "#e1f0ff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  noteIconContainer: {
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: "#3498db",
    fontWeight: "600",
  },
  navigationButtons: {
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  registerButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  loginLinkText: {
    color: "#666",
  },
  loginLink: {
    color: "#3498db",
    fontWeight: "600",
  },
});

export default US_SignUp;
