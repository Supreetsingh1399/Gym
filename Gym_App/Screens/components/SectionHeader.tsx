import { View, TouchableOpacity, Text } from "react-native";

// Add customTitleClass to your props interface
interface SectionHeaderProps {
  title: string;
  onSeeAllPress?: () => void;
  isDarkMode?: boolean;
  customTitleClass?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onSeeAllPress, 
  isDarkMode,
  customTitleClass 
}) => {
  return (
    <View className="flex-row justify-between items-center py-4 px-6">
      <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} ${customTitleClass || ''}`}>
        {title}
      </Text>
      {onSeeAllPress && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};