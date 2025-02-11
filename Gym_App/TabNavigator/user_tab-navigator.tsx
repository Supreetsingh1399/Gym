import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserHome from "Gym_App/Screens/UserDashboard/UserHome";
import Trainer_Available from "Gym_App/Screens/UserDashboard/Trainers";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#0091EA",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="UserHome"
        component={UserHome}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trainers"
        component={Trainer_Available}
        options={{
          tabBarLabel: "Trainers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
export default TabNavigator;
