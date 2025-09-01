import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';

// Import navigation types
import { RootStackParamList } from "./Gym_App/types/navigation";

// Import Firebase for authentication
import { FireBase_Auth, isFirebaseReady } from "./Gym_App/Backend/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Import toast manager for notifications
import ToastManager from "./Gym_App/Screens/UserDashboard/components/ToastManager";
import { showToast } from "./Gym_App/Screens/UserDashboard/components/ToastManager";

// Import NetworkManager
import NetworkManager from "./Gym_App/Screens/UserDashboard/components/NetworkManager";

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

// Hooks
import useAuth from "./Gym_App/Backend/hooks/Auth";

// Import toast configuration
import toastConfig from './src/components/ToastConfig';

// Define interface for ErrorBoundary props and state
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
    showToast?.error("App Error", error.message || "An unexpected error occurred");
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.toString() || "An unknown error occurred"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.resetError}>
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

// App State Interface
interface AppState {
  networkAvailable: boolean;
  isFirebaseReady: boolean;
}

/**
 * Main App component
 * Manages authentication state and renders appropriate screens
 */
const App = (): JSX.Element => {
  // Define all state variables first to maintain consistent hook order
  const [appState, setAppState] = useState<AppState>({
    networkAvailable: true,
    isFirebaseReady: false
  });
  
  // Use Firebase auth hook
  const { user, loading, error, isAuthenticated } = useAuth();
  
  // Check if Firebase Auth is initialized
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FireBase_Auth, () => {
      // If we reach here, Firebase Auth is initialized
      setAppState(prevState => ({ 
        ...prevState, 
        isFirebaseReady: true 
      }));
      console.log("[App] Firebase Auth is ready");
    });

    return () => unsubscribe();
  }, []);
  
  // Handle network status changes from NetworkManager
  const handleNetworkStatusChange = (isAvailable: boolean) => {
    console.log(`[App] Network status change: ${isAvailable ? 'Available' : 'Unavailable'}`);
    setAppState(prevState => ({ 
      ...prevState, 
      networkAvailable: isAvailable 
    }));

    if (!isAvailable) {
      showToast.warning(
        "Network Unavailable",
        "Some features may be limited without network connectivity"
      );
    }
  };

  // Handle force offline mode
  const handleForceOfflineMode = () => {
    console.log("[App] User selected to continue in offline mode");
    // This is now just a stub since we don't need to do anything special
  };

  // Log important state changes
  useEffect(() => {
    console.log("[App] Status:", { 
      loading, 
      error: error ? "Error present" : "No error",
      userExists: !!user,
      networkAvailable: appState.networkAvailable,
      isFirebaseReady: appState.isFirebaseReady
    });
  }, [loading, error, user, appState]);

  // Show toast notifications for auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        showToast.success("Authentication", "Successfully logged in");
      }
  
      if (error) {
        showToast.error("Authentication Error", error);
      }
    }
  }, [user, loading, error]);

  // Show loading state if auth is still loading or Firebase is not ready
  if (loading || !appState.isFirebaseReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0091EA" />
          <Text style={styles.loadingText}>
            {!appState.isFirebaseReady 
              ? "Initializing Firebase..." 
              : "Loading user data..."}
          </Text>
        </View>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    );
  }

  // Authentication error 
  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    );
  }

  // Render the app when everything is ready
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <NetworkManager 
            onNetworkStatusChange={handleNetworkStatusChange}
            onForceOfflineMode={handleForceOfflineMode}
          />
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "UserTabs" : "LoginScreen"}
            screenOptions={{
              headerStyle: {
                backgroundColor: '#0091EA',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            {/* Authentication screens */}
            <Stack.Screen 
              name="LoginScreen" 
              component={HandleLogin} 
              options={{ title: "Login" }} 
            />
            <Stack.Screen 
              name="User_SignUp" 
              component={US_SignUp}
              options={{ title: "Create User Account" }}
            />
            <Stack.Screen 
              name="Forgot_Password" 
              component={ForgotPass}
              options={{ title: "Reset Password" }}
            />
            <Stack.Screen 
              name="Gym_rgn" 
              component={GymRegistrationWizard}
              options={{ title: "Register Gym" }}
            />

            {/* Main navigation */}
            <Stack.Screen 
              name="UserTabs" 
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="TrainerHome" 
              component={TrainerHome}
              options={{ title: "Trainer Dashboard" }}
            />
            <Stack.Screen 
              name="RGN_Gyms" 
              component={Registered_Gyms}
              options={{ title: "My Gyms" }}
            />
            <Stack.Screen 
              name="SearchResults" 
              component={SearchResults}
              options={{ title: "Search Results" }}
            />
            <Stack.Screen 
              name="ExternalGymDetails" 
              component={ExternalGymDetails}
              options={{ title: "Gym Details" }}
            />
          </Stack.Navigator>
          <Toast config={toastConfig} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0091EA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default App;