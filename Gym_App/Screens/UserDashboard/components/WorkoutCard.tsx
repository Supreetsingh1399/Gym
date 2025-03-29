import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import from the correct location or define the type inline
interface WorkoutData {
    imageUrl: string;
    title: string;
    description: string;
    duration: string;
    level: string;
}

interface WorkoutCardProps {
  workout: WorkoutData;
  onPress: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = memo(({ workout, onPress }) => {
  return (
    <TouchableOpacity 
      className="mr-4 w-72 rounded-2xl overflow-hidden bg-white shadow-md"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: workout.imageUrl }}
        className="w-full h-36"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={1}>
          {workout.title}
        </Text>
        <Text className="text-xs text-gray-600 mb-2" numberOfLines={1}>
          {workout.description}
        </Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">{workout.duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="fitness-outline" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">{workout.level}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});