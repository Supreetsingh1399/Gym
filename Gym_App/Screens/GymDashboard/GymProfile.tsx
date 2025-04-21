import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GymProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="items-center pt-6 pb-4">
        <View className="relative">
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }}
            className="w-28 h-28 rounded-full border-4 border-indigo-600"
          />
          <TouchableOpacity className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full">
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-white text-xl font-bold mt-4">FitZone Gym</Text>
        <Text className="text-gray-400">admin@fitzone.com</Text>
        
        <TouchableOpacity className="bg-indigo-600 py-2 px-6 rounded-lg mt-4">
          <Text className="text-white font-medium">Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View className="bg-gray-800 rounded-t-3xl p-5">
        <Text className="text-white text-lg font-bold mb-4">Gym Information</Text>
        
        <View className="bg-gray-700 rounded-xl p-4 mb-5">
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={22} color="#6366f1" />
            <Text className="text-white text-base ml-3">123 Fitness Street, Healthville</Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="call" size={22} color="#6366f1" />
            <Text className="text-white text-base ml-3">(555) 123-4567</Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="time" size={22} color="#6366f1" />
            <Text className="text-white text-base ml-3">Mon-Fri: 6am-10pm, Sat-Sun: 8am-8pm</Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="people" size={22} color="#6366f1" />
            <Text className="text-white text-base ml-3">17 Active Trainers</Text>
          </View>
        </View>
        
        <Text className="text-white text-lg font-bold mb-4">App Settings</Text>
        
        <View className="bg-gray-700 rounded-xl p-4 mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="notifications" size={22} color="#6366f1" />
              <Text className="text-white text-base ml-3">Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#374151", true: "#4f46e5" }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#9ca3af"}
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="moon" size={22} color="#6366f1" />
              <Text className="text-white text-base ml-3">Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: "#374151", true: "#4f46e5" }}
              thumbColor={darkModeEnabled ? "#ffffff" : "#9ca3af"}
              onValueChange={setDarkModeEnabled}
              value={darkModeEnabled}
            />
          </View>
          
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="language" size={22} color="#6366f1" />
            <Text className="text-white text-base ml-3">Language</Text>
            <Text className="text-gray-400 ml-auto">English</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" className="ml-1" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className="bg-gray-700 rounded-xl p-4 flex-row items-center">
          <Ionicons name="log-out" size={22} color="#ef4444" />
          <Text className="text-red-500 text-base ml-3 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
