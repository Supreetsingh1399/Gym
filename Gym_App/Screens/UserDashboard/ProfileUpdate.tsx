import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@env";
import ToastManager,{showToast} from "../components/ToastManager";
import { useUser } from '../components/UserContext';
// import * as ImagePicker from "expo-image-picker";
// import { Picker } from "@react-native-picker/picker";
import { useTheme } from '../components/ThemeContext';
// Define interfaces
interface ProfileUpdateProps {
  navigation: any;
  route: {
    params: {
      userData: any;
      darkMode: boolean;
      onProfileUpdate?: () => void; // Optional callback for profile updates
    };
  };
}

export default function ProfileUpdate({ navigation, route }: ProfileUpdateProps) {
  // Get user data from route params
  const { userData} = route.params;
  const { userData: contextUserData, updateUserProfile, loading: contextLoading } = useUser();
  
  // State variables for all editable user fields
  const [name, setName] = useState(userData?.name || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [height, setHeight] = useState(userData?.height || "");
  const [weight, setWeight] = useState(userData?.weight || "");
  const [fitnessGoal, setFitnessGoal] = useState(userData?.fitnessGoal || "");
  const [profilePic, setProfilePic] = useState(userData?.profilePic || null);
  
  // Unit preferences
  const [isMetricHeight, setIsMetricHeight] = useState(
    height.includes("cm") || height.includes("m")
  );
  const [isMetricWeight, setIsMetricWeight] = useState(
    weight.includes("kg") || !weight.includes("lbs")
  );

  // Parsed numeric values
  const [heightValue, setHeightValue] = useState("");
  const [weightValue, setWeightValue] = useState("");
    const toast = ToastManager;
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useTheme();
  
  // Parse initial values
  useEffect(() => {
    if (height) {
      const numericValue = parseFloat(height.replace(/[^\d.]/g, ""));
      if (!isNaN(numericValue)) {
        setHeightValue(numericValue.toString());
      }
    }
    if (weight) {
      const numericValue = parseFloat(weight.replace(/[^\d.]/g, ""));
      if (!isNaN(numericValue)) {
        setWeightValue(numericValue.toString());
      }
    }
  }, []);

  // Convert height between units
  const toggleHeightUnit = () => {
    if (heightValue) {
      const numericValue = parseFloat(heightValue);
      if (!isNaN(numericValue)) {
        if (isMetricHeight) {
          // Convert from cm to feet/inches (roughly)
          const inchesTotal = numericValue / 2.54;
          const feet = Math.floor(inchesTotal / 12);
          const inches = Math.round(inchesTotal % 12);
          setHeightValue(`${feet}'${inches}"`);
        } else {
          // Convert from feet/inches to cm
          const heightParts = heightValue.split("'");
          if (heightParts.length === 2) {
            const feet = parseFloat(heightParts[0]);
            const inches = parseFloat(heightParts[1].replace('"', ''));
            if (!isNaN(feet) && !isNaN(inches)) {
              const totalInches = (feet * 12) + inches;
              const cm = Math.round(totalInches * 2.54);
              setHeightValue(cm.toString());
            }
          } else {
            // If not in proper format, just use a rough conversion
            setHeightValue(Math.round(numericValue * 2.54).toString());
          }
        }
      }
    }
    setIsMetricHeight(!isMetricHeight);
  };

  // Convert weight between units
  const toggleWeightUnit = () => {
    if (weightValue) {
      const numericValue = parseFloat(weightValue);
      if (!isNaN(numericValue)) {
        if (isMetricWeight) {
          // Convert from kg to lbs
          setWeightValue(Math.round(numericValue * 2.20462).toString());
        } else {
          // Convert from lbs to kg
          setWeightValue(Math.round(numericValue / 2.20462).toString());
        }
      }
    }
    setIsMetricWeight(!isMetricWeight);
  };

  // Format height and weight with units
  const getFormattedHeight = () => {
    if (!heightValue) return "";
    if (isMetricHeight) {
      return heightValue.includes("'") ? heightValue : `${heightValue}cm`;
    } else {
      return heightValue.includes("cm") ? heightValue : `${heightValue}`;
    }
  };

  const getFormattedWeight = () => {
    if (!weightValue) return "";
    if (isMetricWeight) {
      return `${weightValue}kg`;
    } else {
      return `${weightValue}lbs`;
    }
  };

 // Inside ProfileUpdate.tsx
// Update the handleSaveChanges function:

// Updated handleSaveChanges function in ProfileUpdate.tsx
const handleSaveChanges = async () => {
  // Validate inputs
  if (!name.trim()) {
    showToast.error("Error", "Name cannot be empty");
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Prepare updated user data
    const updatedUserData = {
      name,
      phone,
      height: getFormattedHeight(),
      weight: getFormattedWeight(),
      fitnessGoal,
      profilePic,
      // Keep other data that we're not updating
      email: userData.email,
      membership: userData.membership,
      trainer: userData.trainer,
    };
    
    // Use updateUserProfile from UserContext
    const success = await updateUserProfile(updatedUserData);
    
    if (success) {
      showToast.success("Success", "Profile updated successfully");
      
      // Simplest approach - just go back
      navigation.goBack();
      
      // If you need to call a callback from the route params, do it here
      if (route.params?.onProfileUpdate) {
        route.params.onProfileUpdate();
      }
      
    } else {
      showToast.error("Error", "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showToast.error("Error", "Failed to update profile. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  return (
    <SafeAreaView className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4">
            <TouchableOpacity 
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              onPress={() => navigation.goBack()}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={darkMode ? "#ffffff" : "#000000"} 
              />
            </TouchableOpacity>
            <Text className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Edit Profile
            </Text>
            <View className="w-10" />
          </View>

          {/* Profile Placeholder */}
          <View className="items-center my-5">
            <View className={`w-24 h-24 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} justify-center items-center border-2 border-blue-500`}>
              <Text className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {name.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className={`mt-2 text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {userData?.email || "User"}
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-4 mb-6">
            {/* Name */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </Text>
              <View className={`flex-row items-center border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg px-3`}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={darkMode ? "#9ca3af" : "#6b7280"} 
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className={`flex-1 h-12 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                  placeholder="Enter your full name"
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone Number
              </Text>
              <View className={`flex-row items-center border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg px-3`}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={darkMode ? "#9ca3af" : "#6b7280"} 
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  className={`flex-1 h-12 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Height with unit toggle */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Height
                </Text>
                <View className="flex-row items-center">
                  <Text className={`text-xs mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isMetricHeight ? "Metric (cm)" : "Imperial (ft/in)"}
                  </Text>
                  <Switch
                    value={isMetricHeight}
                    onValueChange={toggleHeightUnit}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor="#f4f3f4"
                  />
                </View>
              </View>
              <View className={`flex-row items-center border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg px-3`}>
                <Ionicons 
                  name="resize-outline" 
                  size={20} 
                  color={darkMode ? "#9ca3af" : "#6b7280"} 
                />
                <TextInput
                  value={heightValue}
                  onChangeText={setHeightValue}
                  className={`flex-1 h-12 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                  placeholder={isMetricHeight ? "Enter height (cm)" : "Enter height (ft'in\")"}
                  keyboardType="numeric"
                />
                <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isMetricHeight ? "cm" : "ft/in"}
                </Text>
              </View>
            </View>

            {/* Weight with unit toggle */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weight
                </Text>
                <View className="flex-row items-center">
                  <Text className={`text-xs mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isMetricWeight ? "Metric (kg)" : "Imperial (lbs)"}
                  </Text>
                  <Switch
                    value={isMetricWeight}
                    onValueChange={toggleWeightUnit}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor="#f4f3f4"
                  />
                </View>
              </View>
              <View className={`flex-row items-center border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg px-3`}>
                <Ionicons 
                  name="fitness-outline" 
                  size={20} 
                  color={darkMode ? "#9ca3af" : "#6b7280"} 
                />
                <TextInput
                  value={weightValue}
                  onChangeText={setWeightValue}
                  className={`flex-1 h-12 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                  placeholder={isMetricWeight ? "Enter weight (kg)" : "Enter weight (lbs)"}
                  keyboardType="numeric"
                />
                <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isMetricWeight ? "kg" : "lbs"}
                </Text>
              </View>
            </View>

            {/* Fitness Goal */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fitness Goal
              </Text>
              <View className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg px-3 py-2`}>
                <TextInput
                  value={fitnessGoal}
                  onChangeText={setFitnessGoal}
                  className={`h-24 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                  placeholder="Describe your fitness goals"
                  multiline={true}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-4 items-center my-2"
              onPress={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              className={`border rounded-lg py-4 items-center my-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}