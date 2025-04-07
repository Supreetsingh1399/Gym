import React, { useEffect, useState } from "react"; //@ts-ignore
import { NavigationContainer } from "@react-navigation/native"; //@ts-ignore
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { User } from "firebase/auth";

// Import navigation types
import { RootStackParamList } from "./Gym_App/types/navigation";

// Import Firebase first to ensure initialization
import { FireBase_Auth, isFirebaseReady } from "./Gym_App/Backend/firebase";

// Import toast manager for notifications
import ToastManager from "./Gym_App/Screens/components/ToastManager";
import { showToast } from "./Gym_App/Screens/components/ToastManager";

// Screen imports
import ForgotPass from "./Gym_App/Screens/Login/ForgotPass";
import US_SignUp from "./Gym_App/Screens/Register/US_SGNP";
import TrainerHome from "./Gym_App/Screens/TrainerDashboard/TrainerHome";
import TabNavigator from "./Gym_App/TabNavigator/user_tab-navigator";
import GymRegistrationWizard from "./Gym_App/Screens/Register/GymRegistrationWizard";
import Registered_Gyms from "./Gym_App/Screens/UserDashboard/User_home_touchables/Registered_gyms";
import HandleLogin from "./Gym_App/Screens/Login/LoginScreen";
import SearchResults from "./Gym_App/Screens/UserDashboard/SearchResults";
import ExternalGymDetails from "./Gym_App/Screens/UserDashboard/ExternalGymDetails";
import WorkoutDetails from "./Gym_App/Screens/UserDashboard/WorkoutDetails";
import ExerciseDetail from "./Gym_App/Screens/UserDashboard/ExerciseDetail";
import ProfileUpdate from "Gym_App/Screens/UserDashboard/ProfileUpdate";

// Hooks
import useAuth from "./Gym_App/Backend/hooks/Auth";

// Define interface for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary component
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
    showToast?.error(
      "App Error",
      error.message || "An unexpected error occurred",
    );
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.toString() || "An unknown error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.resetError}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Define the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Stack Navigator props interface
interface StackNavigatorProps {
  user: User | null;
}

/**
 * Stack Navigator component that handles navigation based on authentication state
 */
const StackNavigator = ({ user }: StackNavigatorProps): JSX.Element => {
  console.log(
    "[Navigation] Rendering StackNavigator with user:",
    user ? "Logged in" : "Not logged in",
  );

  return (
    <Stack.Navigator
      initialRouteName={user ? "UserTabs" : "LoginScreen"}
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTintColor: "#0091EA",
      }}
    >
      {!user ? (
        // Authentication screens
        <>
          <Stack.Screen
            name="LoginScreen"
            component={HandleLogin}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            //@ts-ignore
            name="User_SignUp"
            component={US_SignUp}
            options={{ title: "Create User Account" }}
          />

          <Stack.Screen
            //@ts-ignore
            name="Forgot_Password"
            component={ForgotPass}
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            //@ts-ignore
            name="Gym_rgn"
            component={GymRegistrationWizard}
            options={{ title: "Register Gym" }}
          />
        </>
      ) : (
        // Protected screens - only accessible when authenticated
        <>
          <Stack.Screen
            //@ts-ignore
            name="UserTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            //@ts-ignore
            name="RGN_Gyms"
            component={Registered_Gyms}
            options={{ title: "Registered Gyms" }}
          />
          <Stack.Screen
            name="TrainerHome"
            component={TrainerHome}
            options={{ title: "Trainer Dashboard" }}
          />
          <Stack.Screen
            name="SearchResults"
            component={SearchResults as any}
            options={{ title: "Search Results" }}
          />
          <Stack.Screen
            name="ExternalGymDetails"
            component={ExternalGymDetails as any}
            options={{ title: "Gym Details" }}
          />
          <Stack.Screen name="WorkoutDetails" component={WorkoutDetails} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetail} />
          <Stack.Screen
            name="ProfileUpdate"
            component={ProfileUpdate}
            options={{ title: "Update Profile" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

/**
 * Main App component
 * Manages authentication state and renders appropriate screens
 */
const App = (): JSX.Element => {
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [initAttempts, setInitAttempts] = useState<number>(0);
  const { user, loading, error } = useAuth();

  // Max number of initialization attempts before showing retry button
  const MAX_INIT_ATTEMPTS = 10;

  // Check if Firebase services are ready
  useEffect(() => {
    // Skip if services are already marked as ready
    if (servicesReady) return;

    // Don't try more than MAX_INIT_ATTEMPTS times automatically
    if (initAttempts >= MAX_INIT_ATTEMPTS) return;

    console.log(
      `[App] Checking Firebase services, attempt ${initAttempts + 1}/${MAX_INIT_ATTEMPTS}`,
    );

    const services = isFirebaseReady();

    if (services.auth && services.db) {
      console.log("[App] Firebase services are ready");
      setServicesReady(true);
    } else {
      // Schedule next check
      const timer = setTimeout(() => {
        setInitAttempts((prev) => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [initAttempts, servicesReady]);

  // Log important state changes
  useEffect(() => {
    console.log("[App] Status:", {
      loading,
      error: error ? "Error present" : "No error",
      userExists: !!user,
      servicesReady,
      initAttempts,
    });
  }, [loading, error, user, servicesReady, initAttempts]);

  // Show toast notifications for auth state changes
  useEffect(() => {
    if (!loading && user) {
      showToast.success("Authentication", "Successfully logged in");
    }

    if (error) {
      showToast.error("Authentication Error", error);
    }
  }, [user, loading, error]);

  const handleRetry = (): void => {
    console.log("[App] Retrying Firebase initialization...");
    showToast.info("Connection", "Retrying connection to services...");
    setInitAttempts(0);
    setServicesReady(false);
  };

  // Show loading state if services aren't ready or auth is still loading
  if (!servicesReady || loading) {
    const showRetryButton = initAttempts >= MAX_INIT_ATTEMPTS || error;

    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0091EA" />
          <Text style={styles.loadingText}>
            {!servicesReady
              ? "Initializing services..."
              : "Loading user data..."}
          </Text>
          <Text style={styles.statusText}>
            Firebase Auth: {FireBase_Auth ? "Available" : "Initializing"}
          </Text>
          {initAttempts > 0 && (
            <Text style={styles.statusText}>
              Initialization attempts: {initAttempts}/{MAX_INIT_ATTEMPTS}
            </Text>
          )}

          {showRetryButton && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          )}
        </View>
        <ToastManager />
      </SafeAreaProvider>
    );
  }

  // Show authentication error
  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <ToastManager />
      </SafeAreaProvider>
    );
  }

  // Render the app when everything is ready
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StackNavigator
            //@ts-ignore
            user={user}
          />
        </NavigationContainer>
        <ToastManager />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0091EA",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default App;
