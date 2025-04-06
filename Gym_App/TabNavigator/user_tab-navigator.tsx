import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

// Import navigation types
import { UserTabParamList } from "../types/navigation";

// Screen imports
import UserHome from "../Screens/UserDashboard/UserHome";
import UserProfile from "../Screens/UserDashboard/US_profile";
import UserChats from "../Screens/UserDashboard/US_chats";
import NewsScreen from "../Screens/UserDashboard/Gym_related_news";

// Create the navigator with type
const Tab = createBottomTabNavigator<UserTabParamList>();

/**
 * Tab Navigator component for the user dashboard
 * Provides bottom tab navigation between main app screens
 * @returns {JSX.Element} Tab Navigator component
 */
const TabNavigator = (): JSX.Element => {
  return (
    <Tab.Navigator
      initialRouteName="UserHome"
      screenOptions={{
        tabBarActiveTintColor: "#0091EA",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: Platform.OS === "ios" ? 5 : 8,
          height: Platform.OS === "ios" ? 60 : 65,
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarItemStyle: {
          padding: 5,
        },
        headerStyle: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 5,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTintColor: "#0091EA",
      }}
    >
      <Tab.Screen
        name="UserHome"
        component={UserHome}
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        //@ts-ignore
        name="UserChats"
        component={UserChats}
        options={{
          title: "Messages",
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        //@ts-ignore
        name="UserNews"
        component={NewsScreen}
        options={{
          title: "Fitness News",
          tabBarLabel: "News",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        //@ts-ignore
        name="UserProfile"
        //@ts-ignore
        component={UserProfile}
        options={{
          title: "My Profile",
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
