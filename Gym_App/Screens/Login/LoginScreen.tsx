import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { FireBase_Auth } from "Gym_App/Backend/firebase";

//@ts-ignore
const HandleLogin = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSignIn = async () => {
    if (loading) return; // Prevent multiple login attempts
    if (!email || !password)
      return Alert.alert("Error", "Enter email and password");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Alert.alert("Error", "Invalid email format");

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        FireBase_Auth,
        email,
        password,
      );
      const userId = userCredential.user.uid;
      console.log("Auth successful, UID:", userId);

      const db = getFirestore();
      const [userDoc, trainerDoc] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDoc(doc(db, "Trainers", userId)),
      ]);

      if (trainerDoc.exists() && trainerDoc.data()?.type === "trainer") {
        navigation.replace("TrainerHome");
      } else if (userDoc.exists() && userDoc.data()?.type === "user") {
        navigation.replace("UserTabs");
      } else {
        Alert.alert("Error", "Account type not found. Please register first.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1 justify-center px-6">
        <View className="items-center">
          <Text className="text-black text-3xl font-semibold mb-6">Login</Text>

          <TextInput
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-lg"
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View className="relative w-full mb-4">
            <TextInput
              className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-lg"
              placeholder="Enter your Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="absolute right-4 top-4"
            >
              <Text className="text-blue-500">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="w-full bg-blue-500 py-3 rounded-lg mb-3"
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg text-center">LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Forgot_Password")}
          >
            <Text className="text-blue-500 text-lg mb-3">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-gray-200 py-3 rounded-lg mb-3"
            onPress={() => navigation.navigate("User_SignUp")}
          >
            <Text className="text-black text-lg text-center">
              Create User Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-gray-200 py-3 rounded-lg"
            onPress={() => navigation.navigate("Gym_rgn")}
          >
            <Text className="text-black text-lg text-center">
              Create Gym Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HandleLogin;
