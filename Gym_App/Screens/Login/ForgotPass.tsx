import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";
import { FireBase_Auth } from "../../Backend/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

type ForgotPassProps = {
  navigation: NavigationProp<any>;
};

const ForgotPass = ({ navigation }: ForgotPassProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

// Function to handle the reset password

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter email");
      return;
    }
    else if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    try {
      await sendPasswordResetEmail(FireBase_Auth, email);
      navigation.navigate("Login");
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
      console.log(error);
    }
  };
//   Return the Your Password Reset Screen


  return (
    <SafeAreaView className="flex-1 justify-center items-center w-full h-full">
      <KeyboardAvoidingView className="h-full w-full justify-center">
        <View className="text-center border-2 border-black bg-blue-100 p-4 m-4">
          <Text className="text-black text-center text-2xl mb-3">
            Forgot Password
          </Text>
          <TextInput
            className="text-sm border-2 border-black rounded-lg p-2 mb-4"
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {error ? (
            <Text className="text-red-500 mb-2">{error}</Text>
          ) : null}
          <Button title="Submit" onPress={handleResetPassword} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPass;