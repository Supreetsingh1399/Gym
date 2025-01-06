import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./Gym_App/Screens/Register/Login/Homescreen";
import ForgotPass from "Gym_App/Screens/Register/Login/ForgotPass";
import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Trainer_SignUp" component={TR_SignUp} />
      <Stack.Screen name="User_SignUp" component={US_SignUp} />
      <Stack.Screen name="Forgot_Password" component={ForgotPass} />
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
