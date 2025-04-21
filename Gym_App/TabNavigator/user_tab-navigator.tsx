//@ts-nocheck
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";

// Import your custom animated icon
import AnimatedTabIcon from "../Screens/components/AnimatedTabIcon";
// Import ThemeContext
import { useTheme } from "../Screens/components/ThemeContext";

// User Screens
import UserHome from "../Screens/UserDashboard/UserHome";
import UserProfile from "../Screens/UserDashboard/US_profile";
import UserChats from "../Screens/UserDashboard/US_chats";
import NewsScreen from "../Screens/UserDashboard/Gym_related_news";

// Gym Screens
import GymHomeScreen from "../Screens/GymDashboard/GymHome";
import GymProfileScreen from "../Screens/GymDashboard/GymProfile";
import GymChatScreen from "../Screens/GymDashboard/GymChat";

// Navigation types
import { TabBarIconProps, UserTabParamList, GymTabParamList } from "../types/navigation";
import useAuth from "../Backend/hooks/Auth"; 

const UserTab = createBottomTabNavigator<UserTabParamList>();
const GymTab = createBottomTabNavigator<GymTabParamList>();

// Track focus states for all tabs
const UserTabNavigator = {
  previousFocusStates: {
    home: false,
    chats: false,
    news: false,
    profile: false,
    members: false
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
      key={`chats-${Date.now()}`}
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
      key={`news-${Date.now()}`}
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
      key={`profile-${Date.now()}`}
      name="person" 
      size={size} 
      color={color} 
      focused={focused}
      previouslyFocused={UserTabNavigator.previousFocusStates.profile}
    />
  );
};

const MembersTabIcon = ({ color, size, focused }: TabBarIconProps) => {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      UserTabNavigator.updateFocusState('members', true);
    } else {
      UserTabNavigator.updateFocusState('members', false);
    }
  }, [isFocused]);
  
  return (
    <AnimatedTabIcon 
      key={`members-${Date.now()}`}
      name="people" 
      size={size} 
      color={color} 
      focused={focused}
      previouslyFocused={UserTabNavigator.previousFocusStates.members}
    />
  );
};

// Tab navigator base config for both user and gym tabs
const getTabOptions = (darkMode) => ({
  tabBarActiveTintColor: darkMode ? "#60A5FA" : "#0091EA",
  tabBarInactiveTintColor: darkMode ? "#9CA3AF" : "gray",
  tabBarStyle: {
    paddingBottom: Platform.OS === "ios" ? 5 : 8,
    height: Platform.OS === "ios" ? 60 : 65,
    borderTopWidth: 1,
    borderTopColor: darkMode ? "#374151" : "#e0e0e0",
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
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
    backgroundColor: darkMode ? "#111827" : "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  headerTitleStyle: {
    fontWeight: "bold",
    fontSize: 18,
    color: darkMode ? "#F9FAFB" : "#143549",
  },
  headerTintColor: darkMode ? "#F9FAFB" : "#143549",
});

// User Tab Navigator component
const UserTabNavigatorComponent = (): JSX.Element => {
  const { darkMode } = useTheme();
  
  return (
    <UserTab.Navigator
      initialRouteName="UserHome"
      screenOptions={getTabOptions(darkMode)}
    >
      <UserTab.Screen
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

      <UserTab.Screen
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

      <UserTab.Screen
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

      <UserTab.Screen
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
    </UserTab.Navigator>
  );
};

// Gym Tab Navigator component
const GymTabNavigatorComponent = (): JSX.Element => {
  const { darkMode } = useTheme();
  
  return (
    <GymTab.Navigator
      initialRouteName="GymHome"
      screenOptions={getTabOptions(darkMode)}
    >
      <GymTab.Screen
        name="GymHome"
        component={GymHomeScreen}
        options={{
          title: "Dashboard",
          tabBarLabel: "Home",
          tabBarIcon: (props: TabBarIconProps) => <HomeTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <GymTab.Screen
        name="GymMembers"
        component={GymMembersScreen}
        options={{
          title: "Members",
          tabBarLabel: "Members",
          tabBarIcon: (props: TabBarIconProps) => <MembersTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <GymTab.Screen
        name="GymChat"
        component={GymChatScreen}
        options={{
          title: "Messages",
          tabBarLabel: "Chats",
          tabBarIcon: (props: TabBarIconProps) => <ChatsTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />

      <GymTab.Screen
        name="GymProfile"
        component={GymProfileScreen}
        options={{
          title: "Gym Profile",
          tabBarLabel: "Profile",
          tabBarIcon: (props: TabBarIconProps) => <ProfileTabIcon {...props} />
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />
    </GymTab.Navigator>
  );
};

// Main Tab Navigator component - decides which tab navigator to show based on user type
const MainTabNavigator = (): JSX.Element => {
  const { user } = useAuth();
  const isGym = user?.type === 'gym' || user?.role === 'gym';

  console.log('[TabNavigator] Rendering tabs for:', isGym ? 'Gym Owner' : 'Regular User');
  
  // Return appropriate tab navigator based on user type
  return isGym ? <GymTabNavigatorComponent /> : <UserTabNavigatorComponent />;
};

export { UserTabNavigator };
export default MainTabNavigator;