import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap; // MaterialIcons icon name
  message: string;
  title: string;
  actionLabel: string;
  // onAction:string;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => {
  return (
    <View className="py-8 px-6 items-center">
      <MaterialIcons name={icon} size={48} color="#cbd5e0" />
      <Text className="text-gray-500 text-center mt-4">{message}</Text>
    </View>
  );
};
