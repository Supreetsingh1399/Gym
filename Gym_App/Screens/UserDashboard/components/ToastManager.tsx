import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Custom toast component with NativeWind styling
const ToastManager = () => {
  // Define custom toast configurations
  const toastConfig = {
    // Override the default success type
    success: (props: { text1: string; text2?: string }) => (
      <View className="mb-5 px-6 py-4 bg-green-100 border-l-4 border-green-600 shadow-lg rounded-lg min-w-[250px] max-w-[90%] mx-4">
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
          <Text className="ml-2 font-bold text-green-800">{props.text1}</Text>
        </View>
        {props.text2 && (
          <Text className="ml-8 text-sm text-green-700 mt-1">{props.text2}</Text>
        )}
      </View>
    ),
    
    // Override the default error type
    error: (props: { text1: string; text2?: string }) => (
      <View className="mb-5 px-6 py-4 bg-red-100 border-l-4 border-red-600 shadow-lg rounded-lg min-w-[250px] max-w-[90%] mx-4">
        <View className="flex-row items-center">
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <Text className="ml-2 font-bold text-red-800">{props.text1}</Text>
        </View>
        {props.text2 && (
          <Text className="ml-8 text-sm text-red-700 mt-1">{props.text2}</Text>
        )}
      </View>
    ),
    
    // Override the default info type
    info: (props: { text1: string; text2?: string }) => (
      <View className="mb-5 px-6 py-4 bg-blue-100 border-l-4 border-blue-600 shadow-lg rounded-lg min-w-[250px] max-w-[90%] mx-4">
        <View className="flex-row items-center">
          <Ionicons name="information-circle" size={24} color="#2563EB" />
          <Text className="ml-2 font-bold text-blue-800">{props.text1}</Text>
        </View>
        {props.text2 && (
          <Text className="ml-8 text-sm text-blue-700 mt-1">{props.text2}</Text>
        )}
      </View>
    ),
    
    // Add a custom warning type
    warning: (props: { text1: string; text2?: string }) => (
      <View className="mb-5 px-6 py-4 bg-yellow-100 border-l-4 border-yellow-600 shadow-lg rounded-lg min-w-[250px] max-w-[90%] mx-4">
        <View className="flex-row items-center">
          <Ionicons name="warning" size={24} color="#D97706" />
          <Text className="ml-2 font-bold text-yellow-800">{props.text1}</Text>
        </View>
        {props.text2 && (
          <Text className="ml-8 text-sm text-yellow-700 mt-1">{props.text2}</Text>
        )}
      </View>
    ),
    
    // Add a custom location type
    location: (props: { text1: string; text2?: string }) => (
      <View className="mb-5 px-6 py-4 bg-indigo-100 border-l-4 border-indigo-600 shadow-lg rounded-lg min-w-[250px] max-w-[90%] mx-4">
        <View className="flex-row items-center">
          <Ionicons name="location" size={24} color="#4F46E5" />
          <Text className="ml-2 font-bold text-indigo-800">{props.text1}</Text>
        </View>
        {props.text2 && (
          <Text className="ml-8 text-sm text-indigo-700 mt-1">{props.text2}</Text>
        )}
      </View>
    )
  };
//@ts-ignore
  return <Toast config={toastConfig} position="top" />;
};

// Helper functions to show different toast types
export const showToast = {
  success: (title: any, message: any) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  
  error: (title: any, message: any) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  
  info: (title: any, message: any) => {
    Toast.show({
      type: 'info',
      text1: title || 'Information',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  
  warning: (title: any, message: any) => {
    Toast.show({
      type: 'warning',
      text1: title || 'Warning',
      text2: message,
      visibilityTime: 3500,
      autoHide: true,
    });
  },
  
  location: (title: any, message: any) => {
    Toast.show({
      type: 'location',
      text1: title || 'Location',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
    });
  }
};

export default ToastManager;