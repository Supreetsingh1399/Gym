import React, { useState } from 'react';
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
import { NavigationProp } from "@react-navigation/native";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { Ionicons } from '@expo/vector-icons';

// Define interfaces for our data structure
interface Props {
  navigation: NavigationProp<any>;
}

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
  profilePic: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  membership: UserMembership;
  trainer: UserTrainer;
}

export default function UserProfile({ navigation }: Props) {
  // State for settings
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock user data
  const user: UserData = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1234567890",
    profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
    height: "5'11\"",
    weight: "180 lbs",
    fitnessGoal: "Build muscle & improve strength",
    membership: {
      gym: "FitZone Gym",
      type: "Premium",
      expiry: "Dec 31, 2025",
      active: true,
    },
    trainer: {
      name: "Mike Johnson",
      experience: "5 years",
      imageUrl: "https://randomuser.me/api/portraits/men/41.jpg"
    },
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await FireBase_Auth.signOut();
      // Navigation should be handled by the auth state change in App.tsx
    } catch (error) {
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: handleLogout, style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-5 py-2.5 border-b border-gray-100">
          <Text className="text-lg font-bold text-gray-800">My Profile</Text>
        </View>

        {/* Profile Information */}
        <View className="flex-row items-center px-5 py-5">
          <Image
            source={{ uri: user.profilePic }}
            className="w-20 h-20 rounded-full border-3 border-gray-100"
          />
          <View className="flex-1 ml-4">
            <Text className="text-xl font-bold text-gray-800 mb-1">{user.name}</Text>
            <Text className="text-sm text-gray-600 mb-1">{user.email}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text className="text-sm text-gray-600">{user.phone}</Text>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
            <Ionicons name="pencil" size={18} color="#0091EA" />
          </TouchableOpacity>
        </View>

        {/* Physical Stats */}
        <View className="flex-row mx-5 my-2.5 bg-gray-50 rounded-xl p-4 justify-between">
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-gray-800 mb-1">{user.height}</Text>
            <Text className="text-xs text-gray-600">Height</Text>
          </View>
          <View className="h-[80%] w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-gray-800 mb-1">{user.weight}</Text>
            <Text className="text-xs text-gray-600">Weight</Text>
          </View>
          <View className="h-[80%] w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-base font-bold text-gray-800 mb-1">22.1</Text>
            <Text className="text-xs text-gray-600">BMI</Text>
          </View>
        </View>

        {/* Fitness Goal */}
        <View className="mx-5 my-2.5 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="flag" size={20} color="#0091EA" />
            <Text className="text-base font-bold text-gray-800 ml-2">Fitness Goal</Text>
          </View>
          <Text className="text-sm text-gray-700 ml-7">{user.fitnessGoal}</Text>
        </View>

        {/* Membership Details */}
        <View className="mx-5 my-2.5 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="card" size={20} color="#0091EA" />
            <Text className="text-base font-bold text-gray-800 ml-2">Membership</Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-4 mt-1 ml-7">
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-base font-bold text-gray-800">{user.membership.gym}</Text>
              <View className={`px-2 py-1 rounded-lg ${user.membership.active ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${user.membership.active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.membership.active ? 'Active' : 'Expired'}
                </Text>
              </View>
            </View>
            <View className="mt-2.5">
              <View className="flex-row mb-1.5">
                <Text className="text-sm text-gray-600 w-[70px]">Type:</Text>
                <Text className="text-sm text-gray-800 font-medium">{user.membership.type}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-gray-600 w-[70px]">Expires:</Text>
                <Text className="text-sm text-gray-800 font-medium">{user.membership.expiry}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trainer */}
        <View className="mx-5 my-2.5 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="fitness" size={20} color="#0091EA" />
            <Text className="text-base font-bold text-gray-800 ml-2">Personal Trainer</Text>
          </View>
          <View className="flex-row bg-gray-50 rounded-lg p-4 mt-1 ml-7">
            <Image
              source={{ uri: user.trainer.imageUrl }}
              className="w-[60px] h-[60px] rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-gray-800 mb-1">{user.trainer.name}</Text>
              <Text className="text-sm text-gray-600 mb-2">{user.trainer.experience} experience</Text>
              <TouchableOpacity className="bg-blue-500 rounded py-1 px-2.5 self-start">
                <Text className="text-xs text-white font-medium">Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="mx-5 my-2.5 bg-white rounded-xl p-4 border border-gray-100">
          <View className="flex-row items-center mb-2.5">
            <Ionicons name="settings-outline" size={20} color="#0091EA" />
            <Text className="text-base font-bold text-gray-800 ml-2">Settings</Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={22} color="#555" />
              <Text className="text-base text-gray-800 ml-2.5">Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d0d0d0', true: '#aed6f1' }}
              thumbColor={notifications ? '#0091EA' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={22} color="#555" />
              <Text className="text-base text-gray-800 ml-2.5">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#d0d0d0', true: '#aed6f1' }}
              thumbColor={darkMode ? '#0091EA' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => Alert.alert("Coming Soon", "This feature will be available soon!")}
          >
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={22} color="#555" />
              <Text className="text-base text-gray-800 ml-2.5">Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => Alert.alert("Coming Soon", "This feature will be available soon!")}
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={22} color="#555" />
              <Text className="text-base text-gray-800 ml-2.5">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-500 mx-5 my-5 rounded-xl py-3 items-center justify-center"
          onPress={confirmLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">Logout</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Version */}
        <Text className="text-center text-gray-400 text-xs mb-5">Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
