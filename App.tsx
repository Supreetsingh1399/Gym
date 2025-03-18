import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { User } from "firebase/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DebugApp from "./debug";

// Screen imports
import ForgotPass from "Gym_App/Screens/Login/ForgotPass";
import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
import TrainerHome from "Gym_App/Screens/TrainerDashboard/TrainerHome";
import TabNavigator from "Gym_App/TabNavigator/user_tab-navigator";
import GymRegistrationWizard from "Gym_App/Screens/Register/GymRegistrationWizard";
import Registered_Gyms from "Gym_App/Screens/UserDashboard/User_home_touchables/Registered_gyms";
import HandleLogin from "./Gym_App/Screens/Login/LoginScreen";

// Hooks
import useAuth from "Gym_App/Backend/hooks/Auth";
import { FireBase_Auth } from "Gym_App/Backend/firebase";

// Define the stack navigator param list
type RootStackParamList = {
  LoginScreen: undefined;
  User_SignUp: undefined;
  Trainer_SignUp: undefined;
  Forgot_Password: undefined;
  UserTabs: undefined;
  RGN_Gyms: undefined;
  TrainerHome: undefined;
  Gym_rgn: undefined;
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
          <Stack.Screen 
            name="Trainer_SignUp" 
            component={TR_SignUp}
            options={{ title: "Create Trainer Account" }}
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
  const { user, loading, error } = useAuth();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log("[App] Auth State:", { 
      loading, 
      error: error ? error.toString() : null,
      userExists: !!user,
      firebaseInitialized: !!FireBase_Auth,
      retryCount
    });
  }, [loading, error, user, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#0091EA" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
          <Text style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            Firebase Status: {FireBase_Auth ? "Initialized" : "Not Initialized"}
          </Text>
          {retryCount > 0 && (
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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StackNavigator user={user} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
