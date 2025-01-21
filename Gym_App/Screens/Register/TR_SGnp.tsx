import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import {
  View,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";
//@ts-ignore
const TR_SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
  const initAuth = async () => {
    try {
      await AsyncStorage.getItem('@auth_state');
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  };
  initAuth();
const handleNext = async () => {

 if (!TrainerData.email || !TrainerData.password || !TrainerData.name) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    else if (!TrainerData.email.includes("@") || !TrainerData.email.includes(".")) {
      setError("Error, Please enter a valid email.");
      return;
    }
    else if (TrainerData.phone.length !== 10) {
      setError("Error, Please enter a valid phone number.");
      return;
    }
    else {
      const phone = TrainerData.phone;
      if (phone[0] === "0") {
        Alert.alert("Error", "Phone number cannot start with 0.");
        return;
      }
    }
    setError("");

    try {
      const methods = await fetchSignInMethodsForEmail(FireBase_Auth, TrainerData.email);
      if (methods.length === 0) {
        setStep(step + 1);
      } else {
        setError("Email already exists");
        Alert.alert("Error", "Email already exists");
      }
    } catch (error: any) {
      console.error("Email check error:", error);
      setError(error.message || "Failed to check email");
      Alert.alert("Error", error.message || "Failed to check email");
    }
  };
  const handleError = (error: any) => {
    if (
      !TrainerData.phone ||
      !TrainerData.gymName ||
      !TrainerData.gymAddress ||
      !TrainerData.gymCity ||
      !TrainerData.gymState ||
      !TrainerData.gymPhone ||
      !TrainerData.gymEmail ||
      !TrainerData.gymWebsite
    ) {
      setError("Error, Please fill in all required fields.");
      return;
    } else if (
      !TrainerData.email.includes("@") ||
      !TrainerData.email.includes(".")
    ) {
      setError("Error, Please enter a valid email.");
      return;
    } else if (TrainerData.phone.length !== 10) {
      setError("Error, Please enter a valid phone number.");
      return;
    } else if (TrainerData.gymPhone.length !== 10) {
      setError("Error,Please enter a valid phone number.");
      return;
    } else if (
      TrainerData.gymEmail.includes("@") ||
      !TrainerData.gymEmail.includes(".")
    ) {
      setError("Error,Please enter a valid email.");
      return;
    } else if (
      TrainerData.gymWebsite.includes("http") ||
      !TrainerData.gymWebsite.includes(".")
    ) {
      setError("Error,Please enter a valid website.");
      return;
    }
    else{
      const phone = TrainerData.phone;
      if (phone[0] === "0") {
        Alert.alert("Error", "Phone number cannot start with 0.");
        return;
      }
    }
    setError("");
  };
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://gym-dhlm.onrender.com/Register/Trainers",
        {
          tableName: "Trainers",
          databaseName: "Register",
          ...TrainerData,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      );
      console.log("MongoDB response:", response.data);
      setError(
        "Success,Registration successful! Wait for approval from Admin.",
      );
      navigation.navigate("HomeScreen");
    } catch (error: any) {
      handleError(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <KeyboardAvoidingView className="justify-center p-4 w-full h-full">
        <View>
            {error ? (
                    <Text className="text-red-500 text-center">{error}</Text>
                  ) : null}
          {step === 1 && (
            <View>
              <Text className="text-center text-2xl">Personal Details</Text>
              <TextInput
                placeholder="Email"
                value={TrainerData.email}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, email: text })
                }
              />
              <TextInput
                placeholder="Password"
                secureTextEntry
                value={TrainerData.password}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, password: text })
                }
              />
              <TextInput
                placeholder="Name"
                value={TrainerData.name}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, name: text })
                }
              />
              <TextInput
                placeholder="Phone"
                value={TrainerData.phone}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, phone: text })
                }
              />
              <Button title="Next" onPress={handleNext} />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="text-center text-2xl">Gym Details</Text>
              <TextInput
                placeholder="Gym Name"
                value={TrainerData.gymName}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymName: text })
                }
              />
              <TextInput
                placeholder="Gym Address"
                value={TrainerData.gymAddress}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymAddress: text })
                }
              />
              <TextInput
                placeholder="Gym City"
                value={TrainerData.gymCity}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymCity: text })
                }
              />
              <TextInput
                placeholder="Gym State"
                value={TrainerData.gymState}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymState: text })
                }
              />
              <TextInput
                placeholder="Gym Phone"
                value={TrainerData.gymPhone}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymPhone: text })
                }
              />
              <TextInput
                placeholder="Gym Email"
                value={TrainerData.gymEmail}
                keyboardType="email-address"
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymEmail: text })
                }
              />
              <TextInput
                placeholder="Gym Website"
                value={TrainerData.gymWebsite}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymWebsite: text })
                }
              />
              <Button title="Back" onPress={handleBack} />
              <Button
                title={loading ? "Submitting..." : "Submit"}
                onPress={handleSubmit}
                disabled={loading}
              />
              {loading && <ActivityIndicator />}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TR_SignUp;
