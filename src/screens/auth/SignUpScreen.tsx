import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (
      !userData.email ||
      !userData.password ||
      !userData.name ||
      !userData.phone
    ) {
      setError('Please fill in all required fields.');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError('Please enter a valid email.');
      return;
    } else if (userData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    } else if (userData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Clear any previous errors
    setError('');
    setLoading(true);

    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with actual user registration
      console.log('User registered:', userData);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created! Please check your email for verification.',
      });
      
      navigation.navigate('Login');
    } catch (err) {
      console.error('Signup error:', err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to create account. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1 p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="person-add" size={32} color="#0091EA" />
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </Text>

          {/* Error message display */}
          {error ? (
            <View className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="person-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your name"
                value={userData.name}
                onChangeText={(text: string) =>
                  setUserData({ ...userData, name: text })
                }
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="mail-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={userData.email}
                onChangeText={(text: string) =>
                  setUserData({ ...userData, email: text })
                }
              />
            </View>
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="call-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={userData.phone}
                onChangeText={(text: string) =>
                  setUserData({ ...userData, phone: text })
                }
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Create a password (min 6 characters)"
                secureTextEntry={!showPassword}
                value={userData.password}
                onChangeText={(text: string) =>
                  setUserData({ ...userData, password: text })
                }
              />
              <TouchableOpacity onPress={togglePasswordVisibility} className="p-2">
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#555" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#555" />
              <TextInput
                className="flex-1 py-3 px-2 text-gray-700"
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-3 rounded-lg items-center justify-center mb-4 ${
              loading ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mb-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-blue-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen; 