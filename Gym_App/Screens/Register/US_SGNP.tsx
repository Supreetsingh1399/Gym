import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";

//@ts-ignore
const US_SignUp = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <KeyboardAvoidingView>
        <View className="text-center">
          <Text>Welcome, Ready for your Journey with us...</Text>
          <TextInput
            className="border-2 border-black"
            placeholder="Enter your Name"
          />
          <TextInput
            className="border-2 border-black"
            placeholder="Enter your Email"
          />
          <TextInput
            className="border-2 border-black"
            placeholder="Enter your Password"
            secureTextEntry
          />
          <TextInput
            className="border-2 border-black"
            placeholder="Confirm Your Password"
            secureTextEntry
          />
          <TextInput
            className="border-2 border-black"
            placeholder="Enter your Phone"
          />
          <Button title="Sign Up" onPress={() => console.log("hello")} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default US_SignUp;
