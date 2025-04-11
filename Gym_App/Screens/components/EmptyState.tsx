// components/EmptyState.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../UserDashboard/constants/theme";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction
}) => {
  return (
    <View className="py-8 items-center">
      {/* Wrap the Ionicons in a View to avoid text string error */}
      <View>
        <Ionicons name={icon} size={64} color="#d1d5db" />
      </View>
      <Text className="mt-4 text-lg font-bold text-gray-800">{title}</Text>
      <Text className="mt-2 text-sm text-center text-gray-500 max-w-[250px]">
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-4 px-6 py-2 bg-blue-500 rounded-lg"
          onPress={onAction}
        >
          <Text className="text-white font-medium">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};