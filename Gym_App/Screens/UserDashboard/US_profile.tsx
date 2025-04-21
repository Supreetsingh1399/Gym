import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  SafeAreaView,
} from "react-native";
import { FireBase_Auth, isFirebaseReady } from "../../Backend/firebase";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@env"; //@ts-nocheck
import { NavigationProps } from "../../types/navigation";
import { handleLogout } from '../../Backend/hooks/Auth';
import { useUser } from '../components/UserContext';
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useTheme } from '../components/ThemeContext';


// Define interfaces for our data structure
interface UserMembership {
  gym: string;
  type: string;
  expiry: string;
  active: boolean;
}

interface UserTrainer {
  name: string;
  experience: string;
  imageUrl: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  profilePic: string | null;
  height: string;
  weight: string;
  fitnessGoal: string;
  membership: UserMembership;
  trainer: UserTrainer;
}

export default function UserProfile({
  navigation,
}: NavigationProps<"Profile">) {
  // Get user data from context
  const { userData: contextUserData, loading: contextLoading, loadUserProfile } = useUser();
  
  // State for settings
  const { darkMode, setDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authAvailable, setAuthAvailable] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const hasInitiallyLoaded = React.useRef(false);
  const isUpdatingRef = React.useRef(false);
  const refreshCount = useRef(0);
  const lastUpdateTime = useRef(0);

  // State for user data
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();

  useEffect(() => {
    if (route.params?.profileJustUpdated && !isUpdatingRef.current) {
      console.log("Profile was just updated, refreshing data ONCE");
      
      // Set the flag to prevent multiple refreshes
      isUpdatingRef.current = true;
      
      // Load the profile data
      loadUserProfile().then(() => {
        // Reset the flag after profile is loaded
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 500);
        
        // Clear the navigation param
        navigation.setParams({ profileJustUpdated: undefined });
      });
    }
  }, [route.params?.profileJustUpdated]);
  
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only refresh if:
      // 1. It's been at least 1 second since the last refresh (prevent rapid refreshes)
      // 2. We're not currently updating
      if (now - lastUpdateTime.current > 1000 && !isUpdatingRef.current) {
        console.log(`Focus refresh #${refreshCount.current + 1}`);
        refreshCount.current += 1;
        lastUpdateTime.current = now;
        loadUserProfile();
      } else {
        console.log("Skipping duplicate refresh");
      }
    }, [loadUserProfile])
  );

  // Check if Firebase Auth is available
  useEffect(() => {
    const checkAuth = () => {
      const services = isFirebaseReady();
      if (services.auth) {
        setAuthAvailable(true);
        // Update current user ID when available
        if (FireBase_Auth.currentUser?.uid) {
          setCurrentUserId(FireBase_Auth.currentUser.uid);
        }
      } else {
        console.log("Firebase Auth not available in UserProfile");
      }
    };

    // Check immediately and then every second
    checkAuth();
    const interval = setInterval(checkAuth, 1000);

    // Set up auth state change listener
    const unsubscribe = FireBase_Auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setCurrentUserId(user?.uid || null);
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Update local state when context data changes
  useEffect(() => {
    if (contextUserData) {
      setUser({
        profilePic: contextUserData.profilePic || null,
        name: contextUserData.name || "No Name",
        email: contextUserData.email || "No Email",
        phone: contextUserData.phone || "No Phone",
        height: contextUserData.height || "N/A",
        weight: contextUserData.weight || "N/A",
        fitnessGoal: contextUserData.fitnessGoal || "No goal set",
        membership: {
          gym: contextUserData.membership?.gym || "No gym",
          type: contextUserData.membership?.type || "Basic",
          expiry: contextUserData.membership?.expiry || "N/A",
          active: contextUserData.membership?.active || false,
        },
        trainer: {
          name: contextUserData.trainer?.name || "No trainer",
          experience: contextUserData.trainer?.experience || "N/A",
          imageUrl: contextUserData.trainer?.imageUrl || "https://randomuser.me/api/portraits/men/41.jpg",
        },
      });
      setLoading(false);
    }
  }, [contextUserData]);

  // Fetch user data from API - fallback if context doesn't work
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authAvailable || !FireBase_Auth || !FireBase_Auth.currentUser) {
        setLoading(false);
        return;
      }
      
      // If we already have context data, skip API call
      if (contextUserData) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the tracked user ID instead of directly accessing
        console.log("Fetching data for user ID:", currentUserId);
        
        // Get token for authentication with retry
        let token;
        try {
          token = await FireBase_Auth.currentUser?.getIdToken(true);  // Force refresh token
        } catch (tokenError) {
          console.error("Error getting auth token:", tokenError);
          throw new Error("Authentication error");
        }
        
        // Add retry logic for network issues
        let retries = 3;
        let response;
        
        while (retries > 0) {
          try {
            response = await axios.get(`${API_URL}/Register/Users/${currentUserId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 10000,
            });
            break; // Success, exit retry loop
          } catch (networkError) {
            retries--;
            if (retries === 0) throw networkError;
            console.log(`Network request failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }
        
        //@ts-ignore
        console.log("API Response received:", response.status);
        
        // Process response data
        //@ts-ignore
        const userData = response.data;
        
        if (!userData || typeof userData !== 'object') {
          throw new Error("Invalid user data format");
        }
        
        setUser({
          profilePic: userData.profilePic || null,
          name: userData.name || "No Name",
          email: userData.email || "No Email",
          phone: userData.phone || "No Phone",
          height: userData.height || "N/A",
          weight: userData.weight || "N/A",
          fitnessGoal: userData.fitnessGoal || "No goal set",
          membership: {
            gym: userData.membership?.gym || "No gym",
            type: userData.membership?.type || "Basic",
            expiry: userData.membership?.expiry || "N/A",
            active: userData.membership?.active || false,
          },
          trainer: {
            name: userData.trainer?.name || "No trainer",
            experience: userData.trainer?.experience || "N/A",
            imageUrl: userData.trainer?.imageUrl || "https://randomuser.me/api/portraits/men/41.jpg",
          },
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again.");
        
        // Set default user data for testing/fallback
        setUser({
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          name: "John Doe",
          email: FireBase_Auth.currentUser?.email || "user@example.com",
          phone: "(123) 456-7890",
          height: "5'10\"",
          weight: "175 lbs",
          fitnessGoal: "Build muscle and improve endurance",
          membership: {
            gym: "Fitness Plus",
            type: "Premium",
            expiry: "Dec 31, 2023",
            active: true,
          },
          trainer: {
            name: "Mike Johnson",
            experience: "5 years",
            imageUrl: "https://randomuser.me/api/portraits/men/41.jpg",
          },
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authAvailable, currentUserId, contextUserData]);
  
  // Handle logout
  const onLogoutPress = async () => {
    console.log("Logout requested");
    await handleLogout(); 
  };
  
  // Navigate to profile update screen with callback
  const navigateToProfileUpdate = () => {
    if (user) {
      navigation.navigate("ProfileUpdate", {
        userData: user,
        darkMode: darkMode,
        onProfileUpdate: () => {
          // This will be called after successful profile update
          console.log("Profile updated, refreshing data");
          loadUserProfile();
        }
      });
    } else {
      Alert.alert("Error", "User data is not available yet");
    }
  };

  // Calculate BMI based on height and weight
  const calculateBMI = (): string => {
    if (!user?.weight || !user?.height || 
        user.weight === "N/A" || user.height === "N/A") {
      return "N/A";
    }

    try {
      // Extract numeric values and handle different formats
      let weightValue: number;
      let heightValue: number;
      
      // Parse weight
      if (typeof user.weight === 'number') {
        weightValue = user.weight;
      } else {
        const weightMatch = user.weight.match(/(\d+\.?\d*)/);
        if (!weightMatch) return "N/A";
        weightValue = parseFloat(weightMatch[0]);
        
        // Convert to kg if in pounds
        if (user.weight.toLowerCase().includes('lb')) {
          weightValue = weightValue * 0.453592;
        }
      }
      
      // Parse height
      if (typeof user.height === 'number') {
        heightValue = user.height / 100; // Assume cm
      } else if (user.height.includes('cm')) {
        heightValue = parseFloat(user.height.replace('cm', '')) / 100;
      } else if (user.height.includes('m') && !user.height.includes('cm')) {
        heightValue = parseFloat(user.height.replace('m', ''));
      } else if (user.height.includes("'")) {
        // Handle feet and inches format (e.g., 5'10")
        const parts = user.height.split("'");
        const feet = parseInt(parts[0]);
        const inches = parts[1] ? parseFloat(parts[1]) : 0;
        const totalInches = feet * 12 + inches;
        heightValue = totalInches * 0.0254; // Convert inches to meters
      } else {
        // Default assume cm if just a number
        heightValue = parseFloat(user.height) / 100;
      }
      
      // Calculate BMI
      const bmi = weightValue / (heightValue * heightValue);
      return bmi.toFixed(1); // Round to 1 decimal place
    } catch (error) {
      console.error("Error calculating BMI:", error);
      return "N/A";
    }
  };

  // If no auth is available or user data is still loading, show a loading indicator
  if (!authAvailable || loading || contextLoading) {
    return (
      <SafeAreaView className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-white'} justify-center items-center`}>
        <ActivityIndicator size="large" color={darkMode ? "#4FC3F7" : "#0091EA"} />
        <Text className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {!authAvailable ? "Initializing services..." : "Loading profile..."}
        </Text>
      </SafeAreaView>
    );
  }

  // If there was an error and no user data, show error
  if (error && !user) {
    return (
      <SafeAreaView className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-white'} justify-center items-center`}>
        <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
        <Text className="mt-2 text-red-500 font-bold">Error</Text>
        <Text className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center px-6`}>{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          onPress={loadUserProfile}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Information */}
        <View className={`flex-row items-center px-5 py-5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
          {user?.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              className={`w-[60px] h-[60px] rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              onError={() =>
                console.log("Image failed to load:", user.profilePic)
              }
            />
          ) : (
            <View className={`w-[60px] h-[60px] rounded-full justify-center items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <Text className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-4">
            <Text className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.name || "User Name"}
            </Text>
            <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
              {user?.email || "user@example.com"}
            </Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="call-outline" size={16} color={darkMode ? "#aaa" : "#666"} />
              <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {user?.phone || "No phone"}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full justify-center items-center`} 
            onPress={navigateToProfileUpdate}
          >
            <Ionicons name="pencil" size={18} color={darkMode ? "#4FC3F7" : "#0091EA"} />
          </TouchableOpacity>
        </View>

        {/* Physical Stats */}
        <View className={`flex-row mx-5 my-2.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4 justify-between`}>
          <View className="flex-1 items-center">
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
              {user?.height}
            </Text>
            <Text className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Height</Text>
          </View>
          <View className={`h-[80%] w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <View className="flex-1 items-center">
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
              {user?.weight}
            </Text>
            <Text className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Weight</Text>
          </View>
          <View className={`h-[80%] w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <View className="flex-1 items-center">
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
              {calculateBMI()}
            </Text>
            <Text className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>BMI</Text>
          </View>
        </View>

        {/* Fitness Goal */}
        <View className={`mx-5 my-2.5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="flag" size={20} color={darkMode ? "#4FC3F7" : "#0091EA"} />
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>
              Fitness Goal
            </Text>
          </View>
          <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-7`}>
            {user?.fitnessGoal}
          </Text>
        </View>

        {/* Membership Details */}
        <View className={`mx-5 my-2.5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="card" size={20} color={darkMode ? "#4FC3F7" : "#0091EA"} />
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>
              Membership
            </Text>
          </View>
          <View className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mt-1 ml-7`}>
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {user?.membership.gym}
              </Text>
              <View
                className={`px-2 py-1 rounded-lg ${user?.membership.active ? 
                  (darkMode ? "bg-green-900" : "bg-green-100") : 
                  (darkMode ? "bg-red-900" : "bg-red-100")}`}
              >
                <Text
                  className={`text-xs font-medium ${user?.membership.active ? 
                    (darkMode ? "text-green-300" : "text-green-600") : 
                    (darkMode ? "text-red-300" : "text-red-600")}`}
                >
                  {user?.membership.active ? "Active" : "Expired"}
                </Text>
              </View>
            </View>
            <View className="mt-2.5">
              <View className="flex-row mb-1.5">
                <Text className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-[70px]`}>Type:</Text>
                <Text className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                  {user?.membership.type}
                </Text>
              </View>
              <View className="flex-row">
                <Text className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-[70px]`}>Expires:</Text>
                <Text className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                  {user?.membership.expiry}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trainer */}
        <View className={`mx-5 my-2.5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="fitness" size={20} color={darkMode ? "#4FC3F7" : "#0091EA"} />
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>
              Personal Trainer
            </Text>
          </View>
          <View className={`flex-row ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mt-1 ml-7`}>
            <Image
              source={{ uri: user?.trainer.imageUrl }}
              className="w-[60px] h-[60px] rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                {user?.trainer.name}
              </Text>
              <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                {user?.trainer.experience} experience
              </Text>
              <TouchableOpacity className="bg-blue-500 rounded py-1 px-2.5 self-start">
                <Text className="text-xs text-white font-medium">Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className={`mx-5 my-2.5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="settings-outline" size={20} color={darkMode ? "#4FC3F7" : "#0091EA"} />
            <Text className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>
              Settings
            </Text>
          </View>

          <View className={`flex-row items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={22} color={darkMode ? "#ccc" : "#555"} />
              <Text className={`text-base ${darkMode ? 'text-white' : 'text-gray-800'} ml-2.5`}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#d0d0d0", true: darkMode ? "#2c5282" : "#aed6f1" }}
              thumbColor={notifications ? "#0091EA" : "#f4f3f4"}
            />
          </View>

          <View className={`flex-row items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={22} color={darkMode ? "#ccc" : "#555"} />
              <Text className={`text-base ${darkMode ? 'text-white' : 'text-gray-800'} ml-2.5`}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#d0d0d0", true: darkMode ? "#2c5282" : "#aed6f1" }}
              thumbColor={darkMode ? "#0091EA" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            className={`flex-row items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          >
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={22} color={darkMode ? "#ccc" : "#555"} />
              <Text className={`text-base ${darkMode ? 'text-white' : 'text-gray-800'} ml-2.5`}>
                Privacy Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={darkMode ? "#777" : "#aaa"} />
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center justify-between py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={22} color={darkMode ? "#ccc" : "#555"} />
              <Text className={`text-base ${darkMode ? 'text-white' : 'text-gray-800'} ml-2.5`}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={darkMode ? "#777" : "#aaa"} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-500 mx-5 my-5 rounded-xl py-3 items-center justify-center"
          onPress={onLogoutPress}
          disabled={authLoading || !authAvailable}
        >
          {authLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">
                Logout
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Version */}
        <Text className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs mb-5`}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}