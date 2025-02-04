import Trainer_Available from "Gym_App/Screens/UserDashboard/Trainers";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserHome from "Gym_App/Screens/UserDashboard/UserHome";
import { NavigationContainer } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="UserHome" component={UserHome} />
      <Tab.Screen name="Trainers" component={Trainer_Available} />
    </Tab.Navigator>
  );
};
const Tab_app=()=>{
    return(
        <NavigationContainer>
            <TabNavigator/>
        </NavigationContainer>
    )
}
export default Tab_app;