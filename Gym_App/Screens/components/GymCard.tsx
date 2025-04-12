import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GymData } from "Gym_App/types";

interface GymCardProps {
  gym: GymData;
  onPress: () => void;
  showDistance?: boolean; 
}

export const GymCard: React.FC<GymCardProps> = memo(({ gym, onPress }) => (
  <TouchableOpacity
    className="mr-4 w-80 rounded-2xl overflow-hidden bg-white shadow-md"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image
      source={{ uri: gym.imageUrl }}
      className="w-full h-40"
      resizeMode="cover" />
    {gym.isRegistered && (
      <View className="absolute top-3 right-3 bg-green-600 px-2 py-1 rounded-lg">
        <Text className="text-white text-xs font-bold">Registered</Text>
      </View>
    )}
    {gym.distance && (
      <View className="absolute top-3 left-3 bg-blue-600 px-2 py-1 rounded-lg">
        <Text className="text-white text-xs font-bold">{gym.distance}</Text>
      </View>
    )}
    <View className="p-3">
      <Text
        className="text-lg font-bold text-gray-800 mb-1"
        numberOfLines={1}
      >
        {gym.gymName}
      </Text>
      <Text className="text-xs text-gray-600 mb-2" numberOfLines={1}>
        {gym.location.address}, {gym.location.city}, {gym.location.state}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View>
          <Ionicons name="star" size={14} color="#FFD700" />
          </View>
          <Text className="text-xs text-gray-700 font-medium ml-1">
            {gym.rating?.toFixed(1) || "4.5"}
          </Text>
        </View>

        {gym.facilities?.gymType && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-xs text-gray-700" numberOfLines={1}>
              {gym.facilities.gymType}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
));

export default GymCard;
