// GymListCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../UserDashboard/constants/theme";

interface GymProps {
  id: string;
  gymName: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  rating: number;
  imageUrl: string;
  facilities?: any;
  distance?: string;
  source?: string;
  isRegistered?: boolean;
  membershipType?: string;
}

interface GymListCardProps {
  gym: GymProps;
  onPress: () => void;
  showDistance?: boolean;
  showRating?: boolean;
  showMembership?: boolean;
}

export const GymListCard: React.FC<GymListCardProps> = ({
  gym,
  onPress,
  showDistance = false,
  showRating = false,
  showMembership = false,
}) => {
  // Format address for display
  const formattedAddress = () => {
    const address = gym.location.address || "";
    const city = gym.location.city || "";
    const state = gym.location.state || "";
    
    if (city && state) {
      return `${address}, ${city}, ${state}`;
    } else if (address) {
      return address;
    }
    return "Address not available";
  };

  // Determine gym type
  const gymType = gym.facilities?.gymType || "Fitness Center";

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color={THEME.colors.yellow} />
        );
      } else if (i === fullStars && halfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color={THEME.colors.yellow} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color={THEME.colors.yellow} />
        );
      }
    }
    
    return (
      <View className="flex-row items-center">
        <View className="flex-row">{stars}</View>
        <Text className="ml-1 text-gray-700">{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row">
        {/* Gym Image */}
        <Image
          source={{ uri: gym.imageUrl }}
          className="w-24 h-24 rounded-l-lg"
          resizeMode="cover"
        />
        
        {/* Gym Details */}
        <View className="flex-1 p-3">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
            {gym.gymName}
          </Text>
          
          <Text className="text-xs text-gray-500 font-medium">
            {gymType}
          </Text>
          
          <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
            {formattedAddress()}
          </Text>
          
          <View className="flex-row justify-between items-center mt-1">
            {/* Rating */}
            {(showRating || (!showDistance && !showMembership)) && (
              renderStars(gym.rating)
            )}
            
            {/* Distance */}
            {showDistance && gym.distance && (
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color={THEME.colors.blue} />
                <Text className="ml-1 text-blue-600 font-medium">
                  {gym.distance}
                </Text>
              </View>
            )}
            
            {/* Membership */}
            {showMembership && gym.isRegistered && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={14} color={THEME.colors.green} />
                <Text className="ml-1 text-green-600 font-medium">
                  {gym.membershipType || "Member"}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Arrow */}
        <View className="justify-center pr-3">
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};