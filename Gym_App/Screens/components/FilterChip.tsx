import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { THEME } from "../UserDashboard/constants/theme";

interface FilterChipProps {
  /**
   * Text to display in the chip
   */
  label: string;

  /**
   * Whether the chip is selected
   */
  selected?: boolean;

  /**
   * Function to call when chip is pressed
   */
  onPress: () => void;

  /**
   * Optional custom color override
   */
  color?: string;
}

/**
 * FilterChip component for searchable/filterable content
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  color = THEME.colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  selectedLabel: {
    color: "white",
    fontWeight: "600",
  },
});
