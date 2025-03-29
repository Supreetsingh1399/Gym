import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

interface SectionHeaderProps {
  title: string;
  onSeeAllPress: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = memo(({ title, onSeeAllPress }) => {
  return (
    <View className="flex-row justify-between items-center px-6 mb-4">
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
      <TouchableOpacity 
        onPress={onSeeAllPress}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Text className="text-blue-500 font-medium">See All</Text>
      </TouchableOpacity>
    </View>
  );
});