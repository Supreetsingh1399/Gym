import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPass from "Gym_App/Screens/Login/ForgotPass";
import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
import TrainerHome from "Gym_App/Screens/TrainerDashboard/TrainerHome";
import TabNavigator from "Gym_App/TabNavigator/user_tab-navigator";
import GymRegistrationWizard from "Gym_App/Screens/Register/GymRegistrationWizard";
import Registered_Gyms from "Gym_App/Screens/UserDashboard/User_home_touchables/Registered_gyms";
import useAuth from "Gym_App/Backend/hooks/Auth";
import { ActivityIndicator, View } from "react-native";
import { User } from "firebase/auth";
import HandleLogin from "./Gym_App/Screens/Login/LoginScreen";
// import LoginScreen from "./Gym_App/Screens/Login/LoginScreen";
const Stack = createNativeStackNavigator();

interface StackNavigatorProps {
  user: User | null;
}
const StackNavigator = ({ user }: { user: any }) => {
  return (
    <Stack.Navigator initialRouteName={user ? "UserTabs" : "LoginScreen"}>
      {!user ? (
        // Auth screens
        <Stack.Group>
          <Stack.Screen name="LoginScreen" component={HandleLogin} />
          <Stack.Screen name="User_SignUp" component={US_SignUp} />
          <Stack.Screen name="Trainer_SignUp" component={TR_SignUp} />
          <Stack.Screen name="Forgot_Password" component={ForgotPass} />
        </Stack.Group>
      ) : (
        // Protected screens
        <Stack.Group>
          <Stack.Screen
            name="UserTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="RGN_Gyms" component={Registered_Gyms} />
          <Stack.Screen name="TrainerHome" component={TrainerHome} />
          <Stack.Screen name="Gym_rgn" component={GymRegistrationWizard} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  const { user, loading } = useAuth();
  // console.log("User state in App:", user);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <StackNavigator user={user} />
    </NavigationContainer>
  );
};

export default App;
