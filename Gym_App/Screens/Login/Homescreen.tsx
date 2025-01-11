import React from "react";
import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// @ts-ignore
const HandleLogin = ({ navigation }) => {
  // Function to handle the login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        Alert.alert("Error", "Please enter a valid email");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(FireBase_Auth, email, password);
        // Get user data from Firestore
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.type === "user"||userData.type === "") {
            navigation.navigate("UserHome");
          } else if (userData.type === "trainer") {
            navigation.navigate("TrainerHome");
          }
        } else {
          Alert.alert("Error", "User data not found");
        }
      } catch (error: any) {
        setError(error.message);
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

  // Return the Login Screen
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView className="flex-1">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-black text-2xl mb-4">Login</Text>
          <TextInput
            className="w-full border-2 border-black rounded-lg p-2 mb-4"
            placeholder="Enter your Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            className="w-full border-2 border-black rounded-lg p-2 mb-4"
            placeholder="Enter your Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
          <TouchableOpacity
            className="bg-blue-500 text-white p-2 rounded-lg mb-2 w-40"
            onPress={() => {
              handleSignIn();
            }}
          >
            <Text className=" text-white  text-center">LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 text-white p-2 rounded-lg mb-2 w-40"
            onPress={() => navigation.navigate("Forgot_Password")}
          >
            <Text className=" text-white  text-center">Forgot Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 text-white p-2 rounded-lg mb-2 w-40"
            onPress={() => navigation.navigate("User_SignUp")}
          >
            <Text className=" text-white  text-center">
              Create User Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg p-2 mb-2 w-40"
            onPress={() => navigation.navigate("Trainer_SignUp")}
          >
            <Text className=" text-white  text-center">
              Create Trainer Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HandleLogin;
