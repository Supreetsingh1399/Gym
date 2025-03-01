import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import handleLogin from "./Gym_App/Screens/Login/Homescreen";
import ForgotPass from "Gym_App/Screens/Login/ForgotPass";
import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
import TrainerHome from "Gym_App/Screens/TrainerDashboard/TrainerHome";
import TabNavigator from "Gym_App/TabNavigator/user_tab-navigator";
import GymRegistrationWizard from "Gym_App/Screens/Register/GymRegistrationWizard";
import Registered_Gyms from "Gym_App/Screens/UserDashboard/User_home_touchables/Registered_gyms";
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen name="HomeScreen" component={handleLogin} />
      <Stack.Screen name="Trainer_SignUp" component={TR_SignUp} />
      <Stack.Screen name="Gym_rgn" component={GymRegistrationWizard} />
      <Stack.Screen name="User_SignUp" component={US_SignUp} />
      <Stack.Screen name="Forgot_Password" component={ForgotPass} />
      <Stack.Screen
        name="UserTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="RGN_Gyms" component={Registered_Gyms} />
      <Stack.Screen name="TrainerHome" component={TrainerHome} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;
