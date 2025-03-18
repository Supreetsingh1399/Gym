import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TrainerHome() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">Trainer Dashboard</Text>
          <Text className="text-base text-gray-600">Welcome to your trainer portal</Text>
        </View>
        
        {/* Quick Actions */}
        <View className="p-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-white w-[48%] p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="people-outline" size={24} color="#0091EA" />
              </View>
              <Text className="text-gray-800 font-medium">My Clients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white w-[48%] p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={24} color="#38b883" />
              </View>
              <Text className="text-gray-800 font-medium">Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white w-[48%] p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                <Ionicons name="barbell-outline" size={24} color="#8e44ad" />
              </View>
              <Text className="text-gray-800 font-medium">Workouts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white w-[48%] p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-2">
                <Ionicons name="settings-outline" size={24} color="#e67e22" />
              </View>
              <Text className="text-gray-800 font-medium">Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Status Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Status</Text>
          <View className="bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-800">Account Status: <Text className="font-medium">Active</Text></Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-gray-100">
              <Text className="text-gray-600">Total Clients</Text>
              <Text className="text-gray-800 font-bold">0</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-gray-100">
              <Text className="text-gray-600">Today's Sessions</Text>
              <Text className="text-gray-800 font-bold">0</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-gray-100">
              <Text className="text-gray-600">This Week's Sessions</Text>
              <Text className="text-gray-800 font-bold">0</Text>
            </View>
          </View>
        </View>
        
        {/* Coming Soon Section */}
        <View className="px-6 mb-6">
          <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Text className="text-base font-medium text-blue-800 mb-2">Coming Soon</Text>
            <Text className="text-sm text-blue-700">
              We're working on new features for trainers including client management,
              workout planning, and progress tracking tools.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
