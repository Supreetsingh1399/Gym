import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import axios from "axios";
//@ts-ignore
const GymRegistrationWizard = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [gymData, setGymData] = useState({
    gymName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    location: { address: "", city: "", state: "", zipCode: "" },
    facilities: { gymType: "", equipment: "", operatingHours: "" },
    pricing: { planName: "", price: "", duration: "" },
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleChange = (field: string, value: string) => {
    setGymData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("https://gym-dhlm.onrender.com/Register/Gym", {
        ...gymData,
        status: "pending",
      });
      Alert.alert("Success", "Gym registration submitted for approval.");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to register gym. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {step === 1 && (
        <View>
          <Text>Step 1: Gym Details</Text>
          <TextInput placeholder="Gym Name" onChangeText={(text) => handleChange("gymName", text)} />
          <TextInput placeholder="Owner Name" onChangeText={(text) => handleChange("ownerName", text)} />
          <TextInput placeholder="Contact Number" keyboardType="phone-pad" onChangeText={(text) => handleChange("contactNumber", text)} />
          <Button title="Next" onPress={handleNext} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text>Step 2: Location</Text>
          <TextInput placeholder="Address" onChangeText={(text) => handleChange("location.address", text)} />
          <TextInput placeholder="City" onChangeText={(text) => handleChange("location.city", text)} />
          <TextInput placeholder="State" onChangeText={(text) => handleChange("location.state", text)} />
          <TextInput placeholder="Zip Code" keyboardType="numeric" onChangeText={(text) => handleChange("location.zipCode", text)} />
          <Button title="Back" onPress={handleBack} />
          <Button title="Next" onPress={handleNext} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Text>Step 3: Facilities</Text>
          <TextInput placeholder="Gym Type" onChangeText={(text) => handleChange("facilities.gymType", text)} />
          <TextInput placeholder="Equipment (comma separated)" onChangeText={(text) => handleChange("facilities.equipment", text)} />
          <TextInput placeholder="Operating Hours" onChangeText={(text) => handleChange("facilities.operatingHours", text)} />
          <Button title="Back" onPress={handleBack} />
          <Button title="Next" onPress={handleNext} />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text>Step 4: Pricing</Text>
          <TextInput placeholder="Plan Name" onChangeText={(text) => handleChange("pricing.planName", text)} />
          <TextInput placeholder="Price" keyboardType="numeric" onChangeText={(text) => handleChange("pricing.price", text)} />
          <TextInput placeholder="Duration" onChangeText={(text) => handleChange("pricing.duration", text)} />
          <Button title="Back" onPress={handleBack} />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
    </ScrollView>
  );
};

export default GymRegistrationWizard;
