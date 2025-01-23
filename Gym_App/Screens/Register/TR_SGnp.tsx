import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { styleText } from "util";
//@ts-ignore
const TR_SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [TrainerData, setTrainerData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    gymName: "",
    gymAddress: "",
    gymCity: "",
    gymState: "",
    gymPhone: "",
    gymEmail: "",
    gymWebsite: "",
  });

  const validate = async () => {
    // Basic validations
    if (!TrainerData.email || !TrainerData.password || !TrainerData.name) {
      return "Please fill in all required fields";
    }

    // Email & Phone validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(TrainerData.email)) {
      return "Please enter a valid email";
    }
    if (!/^[1-9]\d{9}$/.test(TrainerData.phone)) {
      return "Please enter a valid 10-digit phone number not starting with 0";
    }

    try {
      // Check MongoDB
      const checkDb = await axios.get(
        "https://gym-dhlm.onrender.com/Register/Trainers",
      );
      const trainers = checkDb.data.data;
      if (
        trainers.some(
          (trainer: { email: string }) => trainer.email === TrainerData.email,
        )
      ) {
        return "Email already exists in trainers";
      }

      // Check Users collection
      const checkUsers = await axios.get(
        "https://gym-dhlm.onrender.com/Register/Users",
      );
      const users = checkUsers.data.data;
      if (
        users.some(
          (user: { email: string }) => user.email === TrainerData.email,
        )
      ) {
        return "Email already exists in users";
      }
      return null;
    } catch (error) {
      console.error("Validation error:", error);
      return "Error checking email";
    }
  };

  const handleNext = async () => {
    const error = await validate();
    if (error) {
      setError(error);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://gym-dhlm.onrender.com/Register/Trainers",
        {
          ...TrainerData,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      );
      Alert.alert(
        "Success",
        "Registration successful! Wait for admin approval.",
      );
      navigation.navigate("HomeScreen");
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "border-2 border-gray-300 p-2 mb-4 rounded";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 p-4"
      >
        {error && (
          <Text className="text-red-500 text-center text-2xl mb-4">
            {error}
          </Text>
        )}

        {step === 1 ? (
          <View className="flex-1 justify-center relative">
            <Text className="text-2xl font-bold text-center mb-6">
              Personal Details
            </Text>
            <TextInput
              className={inputStyle}
              placeholder="Email"
              value={TrainerData.email}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, email: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View className="relative flex-row items-center">
              <TextInput
                className={`${inputStyle} flex-1 p-2 rounded pr-12`}
                placeholder="Password"
                value={TrainerData.password}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, password: text })
                }
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-3"
              >
                <Text className="mb-3">
                  {showPassword ? "Hide Password" : "Show Password"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className={inputStyle}
              placeholder="Name"
              value={TrainerData.name}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, name: text })
              }
            />
            <TextInput
              className={inputStyle}
              placeholder="Phone"
              value={TrainerData.phone}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, phone: text })
              }
              keyboardType="phone-pad"
            />
            {/* ...other step 1 inputs... */}
            <Button title="Next" onPress={handleNext} />
          </View>
        ) : (
          <View>
            <Text className="text-2xl font-bold text-center mb-6">
              Gym Details
            </Text>
            <TextInput
              className={inputStyle}
              placeholder="Gym Name"
              value={TrainerData.gymName}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymName: text })
              }
            />
            <TextInput
              className={inputStyle}
              placeholder="Gym Address"
              value={TrainerData.gymAddress}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymAddress: text })
              }
            />
            <TextInput
              className={inputStyle}
              placeholder="City"
              value={TrainerData.gymCity}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymCity: text })
              }
            />
            <TextInput
              className={inputStyle}
              placeholder="State"
              value={TrainerData.gymState}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymState: text })
              }
            />
            <TextInput
              className={inputStyle}
              placeholder="Gym Phone"
              value={TrainerData.gymPhone}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymPhone: text })
              }
              keyboardType="phone-pad"
            />
            <TextInput
              className={inputStyle}
              placeholder="Gym Email"
              value={TrainerData.gymEmail}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymEmail: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className={inputStyle}
              placeholder="Gym Website"
              value={TrainerData.gymWebsite}
              onChangeText={(text) =>
                setTrainerData({ ...TrainerData, gymWebsite: text })
              }
              autoCapitalize="none"
            />

            {/* ...gym details inputs... */}
            <View className="flex-row justify-between mt-4">
              <Button title="Back" onPress={() => setStep(1)} />
              <Button
                title={loading ? "Submitting..." : "Submit"}
                onPress={handleSubmit}
                disabled={loading}
              />
            </View>
            {loading && <ActivityIndicator className="mt-4" />}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TR_SignUp;
