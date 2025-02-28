import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import axios from "axios";

interface GymData {
  gymName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  facilities: {
    gymType: string;
    operatingHours: {
      weekdays: string;
      weekends: string;
    };
  };
  pricing: {
    planName: string;
    price: string;
    duration: string;
  };
  status: string;
}
//@ts-ignore
const GymRegistrationWizard = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [gymData, setGymData] = useState<GymData>({
    gymName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    location: { address: "", city: "", state: "", zipCode: "" },
    facilities: {
      gymType: "",
      operatingHours: { weekdays: "", weekends: "" }, // ✅ Required fields added
    },
    pricing: { planName: "", price: "", duration: "" },
    status: "pending",
  });

  // Function to update fields
  const handleChange = (field: string, value: string) => {
    setGymData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to update nested fields
  const handleNestedChange = (
    parent: keyof GymData,
    field: string,
    value: string,
  ) => {
    setGymData((prev) => ({
      ...prev,
      [parent]:
        typeof prev[parent] === "object"
          ? { ...prev[parent], [field]: value }
          : prev[parent],
    }));
  };

  // Form Submission
  const handleSubmit = async () => {
    console.log("Submitting Data:", gymData); // ✅ Debugging
    try {
      const response = await axios.post(
        "https://gym-dhlm.onrender.com/Register/Gyms",
        gymData,
      );
      Alert.alert("Success", "Gym registration submitted for approval.");
      navigation.navigate("HomeScreen");
    } catch (error) {
      // console.error("Error:", error.response?.data || error.message);
      Alert.alert("Error,Failed to register gym.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {step === 1 && (
        <View>
          <Text>Step 1: Gym Details</Text>
          <TextInput
            placeholder="Gym Name"
            onChangeText={(text) => handleChange("gymName", text)}
          />
          <TextInput
            placeholder="Owner Name"
            onChangeText={(text) => handleChange("ownerName", text)}
          />
          <TextInput
            placeholder="Contact Number"
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={(text) =>
              handleChange("contactNumber", text.replace(/\D/g, ""))
            }
          />
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => handleChange("email", text)}
          />
          <Button title="Next" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text>Step 2: Location</Text>
          <TextInput
            placeholder="Address"
            onChangeText={(text) =>
              handleNestedChange("location", "address", text)
            }
          />
          <TextInput
            placeholder="City"
            onChangeText={(text) =>
              handleNestedChange("location", "city", text)
            }
          />
          <TextInput
            placeholder="State"
            onChangeText={(text) =>
              handleNestedChange("location", "state", text)
            }
          />
          <TextInput
            placeholder="Zip Code"
            keyboardType="numeric"
            onChangeText={(text) =>
              handleNestedChange("location", "zipCode", text)
            }
          />
          <Button title="Back" onPress={() => setStep(1)} />
          <Button title="Next" onPress={() => setStep(3)} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Text>Step 3: Facilities</Text>
          <TextInput
            placeholder="Gym Type"
            onChangeText={(text) =>
              handleNestedChange("facilities", "gymType", text)
            }
          />
          <TextInput
            placeholder="Weekday Hours"
            onChangeText={(text) =>
              handleNestedChange("facilities", "operatingHours.weekdays", text)
            }
          />
          <TextInput
            placeholder="Weekend Hours"
            onChangeText={(text) =>
              handleNestedChange("facilities", "operatingHours.weekends", text)
            }
          />
          <Button title="Back" onPress={() => setStep(2)} />
          <Button title="Next" onPress={() => setStep(4)} />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text>Step 4: Pricing</Text>
          <TextInput
            placeholder="Plan Name"
            onChangeText={(text) => handleChange("pricing.planName", text)}
          />
          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            onChangeText={(text) => handleChange("pricing.price", text)}
          />
          <TextInput
            placeholder="Duration"
            onChangeText={(text) => handleChange("pricing.duration", text)}
          />
          <Button title="Back" onPress={() => setStep(3)} />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
    </ScrollView>
  );
};

export default GymRegistrationWizard;
