//@ts-nocheck
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";

// Import your custom animated icon
import AnimatedTabIcon from "../Screens/components/AnimatedTabIcon";

// Screens
import UserHome from "../Screens/UserDashboard/UserHome";
import UserProfile from "../Screens/UserDashboard/US_profile";
import UserChats from "../Screens/UserDashboard/US_chats";
import NewsScreen from "../Screens/UserDashboard/Gym_related_news";
import { TabBarIconProps } from "../types/navigation";

// Navigation types
import { UserTabParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<UserTabParamList>();

// Track focus states for all tabs
const UserTabNavigator = {
  previousFocusStates: {
    home: false,
    chats: false,
    news: false,
    profile: false
  },
  
  updateFocusState(tabName: string, isFocused: boolean) {
    this.previousFocusStates[tabName] = isFocused;
  }
};

// Create wrapper components for tab icons to properly use hooks
const HomeTabIcon = ({ color, size, focused }: TabBarIconProps) => {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      UserTabNavigator.updateFocusState('home', true);
    } else {
      UserTabNavigator.updateFocusState('home', false);
    }
  }, [isFocused]);
  
  return (
    <AnimatedTabIcon 
    key={`home-${Date.now()}`}
      name="home" 
      size={size}
      color={color}
      focused={focused} 
      previouslyFocused={UserTabNavigator.previousFocusStates.home} 
    />
  );
};

const ChatsTabIcon = ({ color, size, focused }: TabBarIconProps) => {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      UserTabNavigator.updateFocusState('chats', true);
    } else {
      UserTabNavigator.updateFocusState('chats', false);
    }
  }, [isFocused]);
  
  return (
    <AnimatedTabIcon 
    key={`home-${Date.now()}`}
      name="chatbubbles" 
      size={size} 
      color={color} 
      focused={focused}
      previouslyFocused={UserTabNavigator.previousFocusStates.chats}
    />
  );
};

const NewsTabIcon = ({ color, size, focused }: TabBarIconProps) => {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      UserTabNavigator.updateFocusState('news', true);
    } else {
      UserTabNavigator.updateFocusState('news', false);
    }
  }, [isFocused]);
  
  return (
    <AnimatedTabIcon 
    key={`home-${Date.now()}`}
      name="newspaper" 
      size={size} 
      color={color} 
      focused={focused}
      previouslyFocused={UserTabNavigator.previousFocusStates.news}
    />
  );
};

const ProfileTabIcon = ({ color, size, focused }: TabBarIconProps) => {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      UserTabNavigator.updateFocusState('profile', true);
    } else {
      UserTabNavigator.updateFocusState('profile', false);
    }
  }, [isFocused]);
  
  return (
    <AnimatedTabIcon 
    key={`home-${Date.now()}`}
      name="person" 
      size={size} 
      color={color} 
      focused={focused}
      previouslyFocused={UserTabNavigator.previousFocusStates.profile}
    />
  );
};

// Main Tab Navigator component
const MainTabNavigator = (): JSX.Element => {
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
        headerTintColor: "#143549",
      }}
    >
      <Tab.Screen
        name="UserHome"
        component={UserHome}
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: (props: TabBarIconProps) => <HomeTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <Tab.Screen
        name="UserChats"
        component={UserChats}
        options={{
          title: "Messages",
          tabBarLabel: "Chats",
          tabBarIcon: (props: TabBarIconProps) => <ChatsTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <Tab.Screen
        name="UserNews"
        component={NewsScreen}
        options={{
          title: "Fitness News",
          tabBarLabel: "News",
          tabBarIcon: (props: TabBarIconProps) => <NewsTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <Tab.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          title: "My Profile",
          tabBarLabel: "Profile",
          tabBarIcon: (props: TabBarIconProps) => <ProfileTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />
    </Tab.Navigator>
  );
};

export { UserTabNavigator };
export default MainTabNavigator;