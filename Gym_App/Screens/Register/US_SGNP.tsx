import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";
import { FireBase_Auth } from "../../Backend/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { getFirestore, setDoc, doc } from "firebase/firestore";

type UserSignUpProps = {
  navigation: NavigationProp<any>;
};

const US_SignUp: React.FC<UserSignUpProps> = ({ navigation }) => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!userData.email || !userData.password || !userData.name || !userData.phone) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (userData.password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
  
    setError("");
    setLoading(true);
  
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        FireBase_Auth,
        userData.email,
        userData.password
      );
  
      console.log("Firebase user created:", userCredential.user.uid);
  
      // Save to MongoDB
      const mongoResponse = await axios.post(
        "http://192.168.2.216:5000/Register/Users",
        {
          uid: userCredential.user.uid,
          ...userData,
          type: "user",
          status: "active",
          createdAt: new Date().toISOString()
        }
      );
  
      console.log("MongoDB response:", mongoResponse.data);
      
      Alert.alert("Success", "Registration successful!");
      navigation.navigate("Login");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = 
        error.code === "auth/email-already-in-use"
          ? "Email already registered"
          : error.response?.data?.message || error.message || "Registration failed";
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <KeyboardAvoidingView>
        <View className="p-4">
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Enter your Name"
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
          />
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Enter your Email"
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Enter your Password"
            value={userData.password}
            onChangeText={(text) => setUserData({ ...userData, password: text })}
            keyboardType="default"
            secureTextEntry
          />
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            keyboardType="default"
            secureTextEntry
          />
          <TextInput
            className="border-2 border-black p-2 mb-4 rounded"
            placeholder="Enter your Phone"
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
            keyboardType="phone-pad"
          />
          <Button 
            title={loading ? "Loading..." : "Sign Up"} 
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default US_SignUp;