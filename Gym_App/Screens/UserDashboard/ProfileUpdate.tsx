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
} from "react-native";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@env";
// import * as ImagePicker from "expo-image-picker";
// import { Picker } from "@react-native-picker/picker";

// Define interfaces
interface ProfileUpdateProps {
  navigation: any;
  route: {
    params: {
      userData: any;
      darkMode: boolean;
    };
  };
}

export default function ProfileUpdate({ navigation, route }: ProfileUpdateProps) {
  // Get user data from route params
  const { userData, darkMode } = route.params;
  
  // State variables for all editable user fields
  const [name, setName] = useState(userData?.name || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [height, setHeight] = useState(userData?.height || "");
  const [weight, setWeight] = useState(userData?.weight || "");
  const [fitnessGoal, setFitnessGoal] = useState(userData?.fitnessGoal || "");
  const [profilePic, setProfilePic] = useState(userData?.profilePic || null);
  
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

//   // Handle profile picture selection
//   const handleSelectImage = async () => {
//     try {
//       // Request permission to access media library
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "We need permission to access your photos to change your profile picture.");
//         return;
//       }
      
//       // Launch image picker
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.7,
//       });
      
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setProfilePic(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error selecting image:", error);
//       Alert.alert("Error", "Failed to select image. Please try again.");
//     }
//   };

  // Handle form submission
  const handleSaveChanges = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user token
      const token = await FireBase_Auth.currentUser?.getIdToken(true);
      const userId = FireBase_Auth.currentUser?.uid;
      
      if (!userId || !token) {
        throw new Error("Authentication error");
      }
      
      // Prepare updated user data
      const updatedUserData = {
        name,
        phone,
        height,
        weight,
        fitnessGoal,
        profilePic,
        // Keep other data that we're not updating
        email: userData.email,
        membership: userData.membership,
        trainer: userData.trainer,
      };
      
      // Upload profile picture if changed (simplified - in a real app, you'd upload to storage)
      // For a complete implementation, you would:
      // 1. Upload image to Firebase Storage
      // 2. Get download URL
      // 3. Update updatedUserData.profilePic with the URL
      
      // Send update request to API
      const response = await axios.put(
        `${API_URL}/Register/Users/${userId}`,
        updatedUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      
      if (response.status === 200) {
        Alert.alert(
          "Success",
          "Profile updated successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={darkMode ? "#ffffff" : "#000000"} 
              />
            </TouchableOpacity>
            <Text className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Edit Profile
            </Text>
            <View className="w-6" />
          </View>

          {/* Profile Picture */}
          {/* <View className="items-center my-5">
            <TouchableOpacity onPress={handleSelectImage}>
              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className={`w-24 h-24 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} justify-center items-center`}>
                  <Text className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {name.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5">
                <Ionicons name="camera" size={18} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tap to change profile picture
            </Text>
          </View> */}

          {/* Form Fields */}
          <View className="px-4">
            {/* Name */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                className={`h-12 border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg px-4`}
                placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                placeholder="Enter your full name"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                className={`h-12 border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg px-4`}
                placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Height */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Height
              </Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                className={`h-12 border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg px-4`}
                placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                placeholder="Example: 180cm or 1.8m"
              />
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Weight
              </Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                className={`h-12 border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg px-4`}
                placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                placeholder="Example: 165lbs or 75kg"
              />
            </View>

            {/* Fitness Goal */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Fitness Goal
              </Text>
              <TextInput
                value={fitnessGoal}
                onChangeText={setFitnessGoal}
                className={`h-24 border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg px-4 py-2`}
                placeholderTextColor={darkMode ? "#666666" : "#9ca3af"}
                placeholder="Describe your fitness goals"
                multiline={true}
                textAlignVertical="top"
              />
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