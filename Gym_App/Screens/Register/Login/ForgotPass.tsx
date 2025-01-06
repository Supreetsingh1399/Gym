import { Button, KeyboardAvoidingView, SafeAreaView, TextInput, View, Text } from "react-native";

import { NavigationProp } from '@react-navigation/native';

interface ForgotPassProps {
    navigation: NavigationProp<any>;
}

const ForgotPass = ({ navigation }: ForgotPassProps) => {
    return (
        <SafeAreaView className="flex-1 justify-center items-center">
            <KeyboardAvoidingView>
            <View className="text-center border-2 border-black bg-amber-200 p-4 m-4">
                <Text className="text-black">Forgot Password</Text>
                <TextInput className="border-2 border-black" placeholder="Enter your Email"  underlineColorAndroid={'black'}/>
                <Button title="Submit" onPress={() => console.log("you are in Forgot password page....")} />
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
export default ForgotPass;