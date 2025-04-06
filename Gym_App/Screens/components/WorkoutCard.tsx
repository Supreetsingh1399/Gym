// components/WorkoutCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../UserDashboard/constants/theme";

// Types
interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  imageUrl: string;
}

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    duration: string;
    level: string;
    imageUrl: string;
    trainer: string;
    description: string;
    category?: string;
    calories?: string;
    exercises?: Exercise[];
  };
  onPress: () => void;
  compact?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  compact = false,
}) => {
  // Count how many exercises the workout contains
  const exerciseCount = workout.exercises?.length || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-4 bg-white rounded-xl overflow-hidden shadow-sm ${compact ? "w-36" : "w-64"}`}
      style={compact ? styles.compactCard : styles.card}
    >
      <Image
        source={{ uri: workout.imageUrl }}
        className={compact ? "h-20 w-full" : "h-36 w-full"}
        style={styles.image}
      />

      <View className="p-3">
        <Text
          className={`font-bold text-gray-800 ${compact ? "text-sm" : "text-base"}`}
          numberOfLines={1}
        >
          {workout.title}
        </Text>

        <View className="flex-row items-center mt-1">
          {/* Wrap Icon in View to prevent "text strings must be rendered within a <Text>" error */}
          <View>
            <Ionicons
              name="time-outline"
              size={compact ? 12 : 14}
              color={THEME.colors.primary}
            />
          </View>
          <Text
            className={`ml-1 text-gray-600 ${compact ? "text-xs" : "text-sm"}`}
          >
            {workout.duration}
          </Text>

          <View className="ml-2 px-2 py-0.5 bg-blue-50 rounded-full">
            <Text
              className={`text-blue-600 ${compact ? "text-xs" : "text-xs"}`}
            >
              {workout.level}
            </Text>
          </View>
        </View>

        {!compact && (
          <>
            <View className="flex-row items-center mt-2">
              {/* Wrap Icon in View */}
              <View>
                <Ionicons
                  name="fitness-outline"
                  size={14}
                  color={THEME.colors.primary}
                />
              </View>
              <Text className="ml-1 text-gray-600 text-sm">
                {exerciseCount} exercises
              </Text>

              {workout.category && (
                <View className="ml-2 px-2 py-0.5 bg-purple-50 rounded-full">
                  <Text className="text-purple-600 text-xs">
                    {workout.category}
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-2 pt-2 border-t border-gray-100">
              <Text className="text-gray-500 text-xs" numberOfLines={2}>
                {workout.description}
              </Text>
            </View>
          </>
        )}

        {compact && exerciseCount > 0 && (
          <Text className="text-gray-500 text-xs mt-1">
            {exerciseCount} exercises
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 12,
    backgroundColor: "white",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactCard: {
    width: 140,
    borderRadius: 10,
    backgroundColor: "white",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    resizeMode: "cover",
  },
});
