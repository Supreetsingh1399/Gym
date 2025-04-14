import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FireBase_Auth } from "../../Backend/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import axios from "axios";

// Define API_URL or import it from a config file
const API_URL = process.env.API_URL || "localhost:3000"; // Replace with your actual API URL

interface GymData {
  gymName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  password: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  facilities: {
    gymType: string;
    equipmentList: string;
    operatingHours: {
      weekdays: string;
      weekends: string;
    };
    trainers: { name: string; specialization: string }[];
  };
  pricing: {
    planName: string;
    price: string;
    duration: string;
  };
  status: string;
  description: string;
}

//@ts-ignore
const GymRegistrationWizard = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tempTrainerName, setTempTrainerName] = useState("");
  const [tempTrainerSpecialization, setTempTrainerSpecialization] =
    useState("");

  const [gymData, setGymData] = useState<GymData>({
    gymName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    password: "",
    description: "",
    location: { address: "", city: "", state: "", zipCode: "" },
    facilities: {
      gymType: "",
      equipmentList: "",
      operatingHours: { weekdays: "", weekends: "" },
      trainers: [],
    },
    pricing: { planName: "", price: "", duration: "" },
    status: "pending",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
    if (parent === "location") {
      setGymData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else if (parent === "facilities") {
      setGymData((prev) => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          [field]: value,
        },
      }));
    } else if (parent === "pricing") {
      setGymData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value,
        },
      }));
    }
  };

  // Function to update doubly nested fields
  const handleDoubleNestedChange = (
    parent: keyof GymData,
    child: string,
    field: string,
    value: string,
  ) => {
    if (parent === "facilities" && child === "operatingHours") {
      setGymData((prev) => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          operatingHours: {
            ...prev.facilities.operatingHours,
            [field]: value,
          },
        },
      }));
    }
  };

  // Add trainer to the list
  const addTrainer = () => {
    if (!tempTrainerName || !tempTrainerSpecialization) {
      Alert.alert("Error", "Please enter both trainer name and specialization");
      return;
    }

    setGymData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        trainers: [
          ...prev.facilities.trainers,
          {
            name: tempTrainerName,
            specialization: tempTrainerSpecialization,
          },
        ],
      },
    }));

    // Clear temporary fields
    setTempTrainerName("");
    setTempTrainerSpecialization("");
  };

  // Remove trainer from the list
  const removeTrainer = (index: number) => {
    setGymData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        trainers: prev.facilities.trainers.filter((_, i) => i !== index),
      },
    }));
  };

  // Validate basic info
  const validateBasicInfo = () => {
    if (
      !gymData.gymName ||
      !gymData.ownerName ||
      !gymData.email ||
      !gymData.contactNumber ||
      !gymData.password
    ) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gymData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!/^\d{10}$/.test(gymData.contactNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    if (gymData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (gymData.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  // Validate location info
  const validateLocation = () => {
    if (
      !gymData.location.address ||
      !gymData.location.city ||
      !gymData.location.state
    ) {
      setError("Please fill in all required location fields");
      return false;
    }
    setError("");
    return true;
  };

  // Validate facilities info
  const validateFacilities = () => {
    if (
      !gymData.facilities.gymType ||
      !gymData.facilities.operatingHours.weekdays
    ) {
      setError("Please fill in all required facility fields");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateBasicInfo()) {
      return;
    } else if (step === 2 && !validateLocation()) {
      return;
    } else if (step === 3 && !validateFacilities()) {
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // First, send gym registration to MongoDB for admin approval
      const response = await axios.post(`${API_URL}/Register/Gyms`, {
        gymName: gymData.gymName,
        ownerName: gymData.ownerName,
        contactNumber: gymData.contactNumber,
        email: gymData.email,
        password: gymData.password,
        description: gymData.description,
        location: gymData.location,
        facilities: {
          ...gymData.facilities,
          // Add these boolean fields that your app expects
          hasPool: gymData.facilities.equipmentList.toLowerCase().includes('pool'),
          hasClasses: gymData.facilities.equipmentList.toLowerCase().includes('class'),
          hasCardio: gymData.facilities.equipmentList.toLowerCase().includes('cardio') || 
                    gymData.facilities.equipmentList.toLowerCase().includes('treadmill'),
          hasWeights: true // Default assumption for a gym
        },
        pricing: gymData.pricing,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      // Registration success
      Alert.alert(
        "Registration Submitted",
        "Your gym registration has been submitted and is pending approval. You'll be notified once approved.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("LoginScreen"),
          },
        ],
      );
    } catch (error: any) {
      console.error("Gym registration error:", error);
      if (error.message.includes("email already in use")) {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(
          error.message || "Failed to create account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfoForm = () => (
    <View className="w-full">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Gym Registration
      </Text>
      <Text className="text-base text-gray-600 mb-6 text-center">
        Step 1: Basic Information
      </Text>

      {/* Gym Name */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Gym Name <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="fitness-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter gym name"
            value={gymData.gymName}
            onChangeText={(text: string) => handleChange("gymName", text)}
          />
        </View>
      </View>

      {/* Owner Name */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Owner Name <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="person-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter owner name"
            value={gymData.ownerName}
            onChangeText={(text: string) => handleChange("ownerName", text)}
          />
        </View>
      </View>

      {/* Contact Number */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Contact Number <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="call-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter 10-digit contact number"
            value={gymData.contactNumber}
            onChangeText={(text: string) => handleChange("contactNumber", text)}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      {/* Email */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Email <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="mail-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter email address"
            value={gymData.email}
            onChangeText={(text: string) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Gym Description</Text>
        <View className="border border-gray-300 rounded-lg bg-gray-50 px-3">
          <TextInput
            className="w-full py-3 px-2 text-gray-700"
            placeholder="Describe your gym (facilities, specialties, etc.)"
            value={gymData.description}
            onChangeText={(text: string) => handleChange("description", text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Password Input */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Password <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="lock-closed-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter password (min 6 characters)"
            secureTextEntry={!showPassword}
            value={gymData.password}
            onChangeText={(text: string) => handleChange("password", text)}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#0091EA"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">
          Confirm Password <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="lock-closed-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Confirm password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      </View>

      {/* Navigation Button */}
      <TouchableOpacity
        className="bg-blue-600 py-3 rounded-lg items-center"
        onPress={handleNext}
      >
        <Text className="text-white font-bold text-lg">Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationForm = () => (
    <View className="w-full">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Gym Registration
      </Text>
      <Text className="text-base text-gray-600 mb-6 text-center">
        Step 2: Location Information
      </Text>

      {/* Address */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Address <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="location-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter street address"
            value={gymData.location.address}
            onChangeText={(text: string) =>
              handleNestedChange("location", "address", text)
            }
          />
        </View>
      </View>

      {/* City */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          City <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="business-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter city"
            value={gymData.location.city}
            onChangeText={(text: string) =>
              handleNestedChange("location", "city", text)
            }
          />
        </View>
      </View>

      {/* State */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          State <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="map-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter state"
            value={gymData.location.state}
            onChangeText={(text: string) =>
              handleNestedChange("location", "state", text)
            }
          />
        </View>
      </View>

      {/* Zip Code */}
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">
          Zip Code (Optional)
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="pin-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="Enter zip code"
            value={gymData.location.zipCode}
            onChangeText={(text: string) =>
              handleNestedChange("location", "zipCode", text)
            }
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-gray-300 py-3 rounded-lg items-center flex-1 mr-2"
          onPress={handleBack}
        >
          <Text className="text-gray-700 font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center flex-1 ml-2"
          onPress={handleNext}
        >
          <Text className="text-white font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFacilitiesForm = () => (
    <View className="w-full">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Gym Registration
      </Text>
      <Text className="text-base text-gray-600 mb-6 text-center">
        Step 3: Facilities Information
      </Text>

      {/* Gym Type */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Gym Type <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="barbell-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., CrossFit, Bodybuilding, Yoga"
            value={gymData.facilities.gymType}
            onChangeText={(text: string) =>
              handleNestedChange("facilities", "gymType", text)
            }
          />
        </View>
      </View>

      {/* Equipment List */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Equipment List</Text>
        <View className="border border-gray-300 rounded-lg bg-gray-50 px-3">
          <TextInput
            className="w-full py-3 px-2 text-gray-700"
            placeholder="List major equipment available (e.g., Squat racks, Treadmills, etc.)"
            value={gymData.facilities.equipmentList}
            onChangeText={(text: string) =>
              handleNestedChange("facilities", "equipmentList", text)
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Operating Hours - Weekdays */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Operating Hours (Weekdays) <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="time-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., 6:00 AM - 10:00 PM"
            value={gymData.facilities.operatingHours.weekdays}
            onChangeText={(text: string) =>
              handleDoubleNestedChange(
                "facilities",
                "operatingHours",
                "weekdays",
                text,
              )
            }
          />
        </View>
      </View>

      {/* Operating Hours - Weekends */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">
          Operating Hours (Weekends)
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="time-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., 8:00 AM - 8:00 PM"
            value={gymData.facilities.operatingHours.weekends}
            onChangeText={(text: string) =>
              handleDoubleNestedChange(
                "facilities",
                "operatingHours",
                "weekends",
                text,
              )
            }
          />
        </View>
      </View>

      {/* Trainer Management Section */}
      <View className="mb-6 border border-gray-200 rounded-lg p-3 bg-blue-50">
        <Text className="text-gray-700 font-bold mb-3">Gym Trainers</Text>

        {/* Add new trainer */}
        <View className="mb-2">
          <Text className="text-gray-700 mb-1 text-sm">Trainer Name</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg py-2 px-3 mb-2"
            placeholder="Enter trainer name"
            value={tempTrainerName}
            onChangeText={setTempTrainerName}
          />

          <Text className="text-gray-700 mb-1 text-sm">Specialization</Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-lg py-2 px-3 mb-2"
            placeholder="e.g., Cardio, Strength, Yoga"
            value={tempTrainerSpecialization}
            onChangeText={setTempTrainerSpecialization}
          />

          <TouchableOpacity
            className="bg-green-600 py-2 rounded-lg items-center mt-1"
            onPress={addTrainer}
          >
            <Text className="text-white font-medium">Add Trainer</Text>
          </TouchableOpacity>
        </View>

        {/* Trainer list */}
        {gymData.facilities.trainers.length > 0 && (
          <View className="mt-3">
            <Text className="text-gray-700 font-medium mb-2">
              Added Trainers:
            </Text>
            {gymData.facilities.trainers.map((trainer, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-white p-2 rounded-lg mb-2 border border-gray-200"
              >
                <View className="flex-1">
                  <Text className="font-medium">{trainer.name}</Text>
                  <Text className="text-gray-600 text-sm">
                    {trainer.specialization}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeTrainer(index)}>
                  <Ionicons name="close-circle" size={22} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-gray-300 py-3 rounded-lg items-center flex-1 mr-2"
          onPress={handleBack}
        >
          <Text className="text-gray-700 font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center flex-1 ml-2"
          onPress={handleNext}
        >
          <Text className="text-white font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPricingForm = () => (
    <View className="w-full">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
        Gym Registration
      </Text>
      <Text className="text-base text-gray-600 mb-6 text-center">
        Step 4: Pricing Information
      </Text>

      {/* Plan Name */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Plan Name</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="pricetag-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., Basic, Premium, Gold"
            value={gymData.pricing.planName}
            onChangeText={(text: string) =>
              handleNestedChange("pricing", "planName", text)
            }
          />
        </View>
      </View>

      {/* Price */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Price</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="cash-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., $49.99"
            value={gymData.pricing.price}
            onChangeText={(text: string) =>
              handleNestedChange("pricing", "price", text)
            }
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Duration */}
      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-medium">Duration</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
          <Ionicons name="calendar-outline" size={20} color="#0091EA" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-700"
            placeholder="e.g., Monthly, Yearly"
            value={gymData.pricing.duration}
            onChangeText={(text: string) =>
              handleNestedChange("pricing", "duration", text)
            }
          />
        </View>
      </View>

      {/* Review Information */}
      <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <Text className="text-gray-700 font-bold mb-3">
          Registration Review
        </Text>
        <Text className="text-gray-600 mb-3 text-sm">
          Please review your information before submission. Your gym
          registration will be reviewed for approval.
        </Text>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Gym Name:</Text>
          <Text className="text-gray-600 flex-1">{gymData.gymName}</Text>
        </View>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Owner:</Text>
          <Text className="text-gray-600 flex-1">{gymData.ownerName}</Text>
        </View>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Contact:</Text>
          <Text className="text-gray-600 flex-1">{gymData.contactNumber}</Text>
        </View>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Location:</Text>
          <Text className="text-gray-600 flex-1">{`${gymData.location.city}, ${gymData.location.state}`}</Text>
        </View>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Type:</Text>
          <Text className="text-gray-600 flex-1">
            {gymData.facilities.gymType}
          </Text>
        </View>

        <View className="flex-row mb-1">
          <Text className="font-medium text-gray-700 w-1/3">Trainers:</Text>
          <Text className="text-gray-600 flex-1">
            {gymData.facilities.trainers.length} added
          </Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-gray-300 py-3 rounded-lg items-center flex-1 mr-2"
          onPress={handleBack}
        >
          <Text className="text-gray-700 font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center flex-1 ml-2"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">Submit Registration</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6">
          {/* Logo Section */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="fitness" size={32} color="#0091EA" />
            </View>
            <Text className="text-lg font-bold text-blue-600">GymBuddy</Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row justify-between mb-8">
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">Basic</Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <View
                className={`h-1 w-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
              />
            </View>
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">Location</Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <View
                className={`h-1 w-full ${step >= 3 ? "bg-blue-600" : "bg-gray-300"}`}
              />
            </View>
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${step >= 3 ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <Text className="text-white font-bold">3</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">Facilities</Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <View
                className={`h-1 w-full ${step >= 4 ? "bg-blue-600" : "bg-gray-300"}`}
              />
            </View>
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${step >= 4 ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <Text className="text-white font-bold">4</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-600">Pricing</Text>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Form Steps */}
          {step === 1 && renderBasicInfoForm()}
          {step === 2 && renderLocationForm()}
          {step === 3 && renderFacilitiesForm()}
          {step === 4 && renderPricingForm()}

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text className="text-blue-600 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GymRegistrationWizard;
