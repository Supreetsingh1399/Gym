import React, { useState } from "react";
import axios from "axios";
import {
  View,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//@ts-ignore
const TR_SignUp = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [TrainerData, setTrainerData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    gymName: "",
    gymAddress: "",
    gymCity: "",
    gymState: "",
    gymZip: "",
    gymCountry: "",
    gymPhone: "",
    gymEmail: "",
    gymWebsite: "",
    Availability: "",
    Price: "",
    Description: "",
    Speciality: "",
    Age: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/trainer/register", {
        ...TrainerData,
        status: "pending",
      }); //mark as pending
      alert("Sign Up Successfull! Please wait for admin approval");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <KeyboardAvoidingView>
        <View>
          {step === 1 && (
            <View>
              <Text className="text-red-500 text-center">
                Personal Details..
              </Text>
              <TextInput
                placeholder="Enter your Email"
                value={TrainerData.email}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, email: text })
                }
              />
              <TextInput
                placeholder="Enter your Password"
                value={TrainerData.password}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, password: text })
                }
              />
              <TextInput
                placeholder="Enter your Name"
                value={TrainerData.name}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, name: text })
                }
              />
              <TextInput
                placeholder="Enter your Phone"
                value={TrainerData.phone}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, phone: text })
                }
              />
              <Button title="Next" onPress={handleNext} />
            </View>
          )}
          {step === 2 && (
            <View>
              <Text className="text-red-500 text-center">
                Professional & GYM Details..
              </Text>
              <TextInput
                placeholder="Enter your Gym Name"
                value={TrainerData.gymName}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymName: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Address"
                value={TrainerData.gymAddress}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymAddress: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym City"
                value={TrainerData.gymCity}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymCity: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym State"
                value={TrainerData.gymState}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymState: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Zip"
                value={TrainerData.gymZip}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymZip: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Country"
                value={TrainerData.gymCountry}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymCountry: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Phone"
                value={TrainerData.gymPhone}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymPhone: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Email"
                value={TrainerData.gymEmail}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymEmail: text })
                }
              />
              <TextInput
                placeholder="Enter your Gym Website"
                value={TrainerData.gymWebsite}
                onChangeText={(text) =>
                  setTrainerData({ ...TrainerData, gymWebsite: text })
                }
              />
              <Button title="Back" onPress={handleBack} />
              <Button title="Submit" onPress={handleSubmit} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default TR_SignUp;
