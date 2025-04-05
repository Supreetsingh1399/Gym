import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAllPress }) => {
  return (
    <View className="flex-row justify-between items-center px-6 py-2">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      
      {onSeeAllPress && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-sm text-blue-600">See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};