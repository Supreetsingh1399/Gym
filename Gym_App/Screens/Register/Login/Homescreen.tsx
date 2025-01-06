import React from 'expo';
import { View, Text, TextInput, Button, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore 
const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView className="flex-1">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-black text-2xl mb-4">Login</Text>
          <TextInput
            className="w-full border-2 border-black rounded-lg p-2 mb-4"
            placeholder="Enter your Email"
          />
          <TextInput
            className="w-full border-2 border-black rounded-lg p-2 mb-4"
            placeholder="Enter your Password"
            secureTextEntry
          />
          <Button title="Login" onPress={() => navigation.navigate("Details")} />
          <Button
            title="Create User Account"
            onPress={() => navigation.navigate("User_SignUp")}
          />
          <Button
            title="Create Trainer Account"
            onPress={() => navigation.navigate("Trainer_SignUp")}
          />
          <Button
            title="Forgot Password"
            onPress={() => navigation.navigate("Forgot_Password")}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;