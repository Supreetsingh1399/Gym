import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import handleLogin from "./Gym_App/Screens/Login/Homescreen";
import ForgotPass from "Gym_App/Screens/Login/ForgotPass";
import TR_SignUp from "Gym_App/Screens/Register/TR_SGnp";
import US_SignUp from "Gym_App/Screens/Register/US_SGNP";
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={handleLogin} />
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
