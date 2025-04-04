import React, { JSX, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { User } from "firebase/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import Firebase first to ensure initialization
import * as Firebase from "Gym_App/Backend/firebase";

// Screen imports
import ForgotPass from "Gym_App/Screens/Login/ForgotPass";
// import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
import TrainerHome from "Gym_App/Screens/TrainerDashboard/TrainerHome";
import TabNavigator from "Gym_App/TabNavigator/user_tab-navigator";
import GymRegistrationWizard from "Gym_App/Screens/Register/GymRegistrationWizard";
import Registered_Gyms from "Gym_App/Screens/UserDashboard/User_home_touchables/Registered_gyms";
import HandleLogin from "./Gym_App/Screens/Login/LoginScreen";
import SearchResults from "Gym_App/Screens/UserDashboard/SearchResults";
import ExternalGymDetails from "Gym_App/Screens/UserDashboard/ExternalGymDetails";

// Hooks
import useAuth from "Gym_App/Backend/hooks/Auth";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import ErrorBoundary from "./ErrorBoundary";

// Define the stack navigator param list
export type RootStackParamList = {
  LoginScreen: undefined;
  User_SignUp: undefined;
  Trainer_SignUp: undefined;
  Forgot_Password: undefined;
  UserTabs: undefined;
  RGN_Gyms: undefined;
  TrainerHome: undefined;
  Gym_rgn: undefined;
  SearchResults: {
    query?: string;
    filters?: any; // Replace with your actual filter type
  };
  ExternalGymDetails: {
    placeId: string;
    gymId?: string;
  };
  GymDetails: {
    gymId: string;
  };
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack Navigator component that handles navigation based on authentication state
 * @param {Object} props - Component props
 * @param {User | null} props.user - Current authenticated user
 * @returns {JSX.Element} Stack navigator component
 */
const StackNavigator = ({ user }: { user: User | null }): JSX.Element => {
  console.log("[Navigation] Rendering StackNavigator with user:", user ? "Logged in" : "Not logged in");
  
  return (
    <Stack.Navigator
      initialRouteName={user ? "UserTabs" : "LoginScreen"}
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: '#0091EA',
      }}
    >
      {!user ? (
        // Authentication screens
        <Stack.Group>
          <Stack.Screen 
            name="LoginScreen" 
            component={HandleLogin}
            options={{ title: "Log In" }}
          />
          <Stack.Screen 
            name="User_SignUp" 
            component={US_SignUp}
            options={{ title: "Create User Account" }}
          />
          {/* <Stack.Screen 
            name="Trainer_SignUp" 
            component={TR_SignUp}
            options={{ title: "Create Trainer Account" }}
          /> */}
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
        </Stack.Group>
      ) : (
        // Protected screens - only accessible when authenticated
        <Stack.Group>
          <Stack.Screen
            name="UserTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
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
            component={SearchResults}
            options={{ title: "Search Results" }}
          />
          <Stack.Screen 
            name="ExternalGymDetails" 
            component={ExternalGymDetails}
            options={{ title: "Gym Details" }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

/**
 * Main App component
 * Manages authentication state and renders appropriate screens
 * @returns {JSX.Element} App component
 */
const App = (): JSX.Element => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { user, loading, error } = useAuth();
  const [retryCount, setRetryCount] = useState(0);

  // Check if Firebase is initialized correctly
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        console.log("[App] Checking Firebase initialization...");
        if (Firebase.FireBase_Auth) {
          console.log("[App] Firebase Auth is available");
          setFirebaseReady(true);
        } else {
          console.error("[App] Firebase Auth is not available");
          setInitError("Firebase authentication not initialized properly");
        }
      } catch (err) {
        console.error("[App] Firebase check error:", err);
        setInitError(err instanceof Error ? err.message : "Unknown initialization error");
      }
    };
    
    checkFirebase();
  }, [retryCount]);
   
  useEffect(() => {
    console.log("[App] Auth State:", { 
      loading, 
      error: error ? error.toString() : null,
      userExists: !!user,
      firebaseInitialized: !!FireBase_Auth && firebaseReady,
      retryCount
    });
  }, [loading, error, user, retryCount, firebaseReady]);

  const handleRetry = () => {
    console.log("[App] Retrying connection...");
    setRetryCount(prev => prev + 1);
    setInitError(null);
    setFirebaseReady(false);
    // Don't use window.location.reload() in React Native
    // Instead, reset the states and retry initialization
  };

  // Show initialization error
  if (initError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 16 }}>
          <Text style={{ color: '#e53935', fontSize: 18, marginBottom: 8 }}>Initialization Error</Text>
          <Text style={{ color: '#666', marginBottom: 16, textAlign: 'center' }}>{initError}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#0091EA', padding: 12, borderRadius: 8 }}
            onPress={handleRetry}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry Initialization</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show loading state
  if (loading || !firebaseReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#0091EA" />
          <Text style={{ marginTop: 16, color: '#666' }}>
            {!firebaseReady ? "Initializing Firebase..." : "Loading user data..."}
          </Text>
          <Text style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            Firebase Status: {FireBase_Auth ? "Initialized" : "Not Initialized"}
          </Text>
          {(retryCount > 0 || !firebaseReady) && (
            <TouchableOpacity 
              style={{ marginTop: 16, backgroundColor: '#0091EA', padding: 12, borderRadius: 8 }}
              onPress={handleRetry}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Retry Connection</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  // Show authentication error
  if (error) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 16 }}>
          <Text style={{ color: '#e53935', fontSize: 18, marginBottom: 8 }}>Authentication Error</Text>
          <Text style={{ color: '#666', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#0091EA', padding: 12, borderRadius: 8 }}
            onPress={handleRetry}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Render the app when everything is ready
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer
          onStateChange={(state) => {
            console.log("[Navigation] Navigation state changed");
          }}
        >
          <StackNavigator user={user} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;