import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UserHome from "Gym_App/Screens/UserDashboard/UserHome";
// import Trainer_Available from "Gym_App/Screens/UserDashboard/Trainers";
import { Ionicons } from "@expo/vector-icons";
import UserProfile from "Gym_App/Screens/UserDashboard/US_profile";
import UserChats from "Gym_App/Screens/UserDashboard/US_chats";
import UserNews from "Gym_App/Screens/UserDashboard/Gym_related_news";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="UserHome"
      screenOptions={{
        tabBarActiveTintColor: "#0091EA",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        // headerShown: false,
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

      {/* <Tab.Screen
        name="Trainers"
        component={Trainer_Available}
        options={{
          tabBarLabel: "Trainers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="UserChats"
        component={UserChats}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserNews"
        component={UserNews}
        options={{
          tabBarLabel: "News",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
export default TabNavigator;
