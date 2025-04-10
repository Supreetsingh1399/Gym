import React, { memo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface QuickActionButtonProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
  onPress: () => void;
}
export const QuickActionButton: React.FC<QuickActionButtonProps> = memo(
  ({ icon, label, color, onPress }) => {
    return (
      <TouchableOpacity
        className="items-center"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={{ backgroundColor: color }}
          className="w-14 h-14 rounded-full items-center justify-center mb-1 shadow-sm"
        >
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <Text className="text-xs text-gray-700 font-medium">{label}</Text>
      </TouchableOpacity>
    );
  },
);
