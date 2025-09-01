import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any valid email and a password of "password" works
      if (password === 'password') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful!',
        });
        navigation.navigate('Home');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Login failed. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 justify-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="fitness" size={32} color="#0091EA" />
          </View>
          <Text className="text-2xl font-bold text-blue-600 mt-2">GymBuddy</Text>
        </View>

        <View className="px-8">
          <Text className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</Text>
          <Text className="text-base text-gray-500 mb-6">Sign in to continue</Text>

          {/* Email Input */}
          <View className="flex-row items-center mb-1 border border-gray-300 rounded-lg bg-gray-50 px-2">
            <View className="px-2 py-3">
              <Ionicons name="mail-outline" size={22} color="#0091EA" />
            </View>
            <TextInput
              className={`flex-1 py-3 px-2 text-base text-gray-700 ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="Email Address"
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>
          {emailError ? (
            <Text className="text-red-500 text-xs mb-2 ml-1">{emailError}</Text>
          ) : (
            <View className="h-5" />
          )}

          {/* Password Input */}
          <View className="flex-row items-center mb-1 border border-gray-300 rounded-lg bg-gray-50 px-2">
            <View className="px-2 py-3">
              <Ionicons name="lock-closed-outline" size={22} color="#0091EA" />
            </View>
            <TextInput
              className={`flex-1 py-3 px-2 text-base text-gray-700 ${
                passwordError ? "border-red-500" : ""
              }`}
              placeholder="Password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="px-2"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#0091EA"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text className="text-red-500 text-xs mb-2 ml-1">{passwordError}</Text>
          ) : (
            <View className="h-5" />
          )}

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            className="self-end mb-5"
          >
            <Text className="text-blue-500 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            className={`py-3 px-6 rounded-lg items-center justify-center ${
              loading ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Section */}
          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Alternative Sign Up Options */}
          <View className="mt-6">
            <Text className="text-gray-500 text-center mb-4">Or continue as</Text>
            
            <View className="flex-row justify-center">
              {/* Gym Owner Registration */}
              <TouchableOpacity 
                className="flex-row items-center bg-blue-50 py-3 px-6 rounded-lg border border-blue-200"
                onPress={() => {
                  Toast.show({
                    type: 'info',
                    text1: 'Coming Soon',
                    text2: 'Gym owner registration will be available soon!',
                  });
                }}
              >
                <Ionicons name="fitness-outline" size={20} color="#0091EA" />
                <Text className="ml-2 text-blue-700 font-medium">Gym Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen; 