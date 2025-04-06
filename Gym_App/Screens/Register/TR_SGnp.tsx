// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TextInput,
//   Text,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import axios from "axios";
// import { Ionicons } from "@expo/vector-icons";
// import { FireBase_Auth } from "../../Backend/firebase";
// import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import { getFirestore, setDoc, doc } from "firebase/firestore";

// //@ts-ignore
// const TR_SignUp = ({ navigation }) => {
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };
//   const [TrainerData, setTrainerData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     gymName: "",
//     gymAddress: "",
//     gymCity: "",
//     gymState: "",
//     gymPhone: "",
//     gymEmail: "",
//     gymWebsite: "",
//     experience: "",
//     specialties: "",
//     certifications: "",
//   });
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const validate = async () => {
//     // Basic validations
//     if (!TrainerData.email || !TrainerData.password || !TrainerData.name) {
//       return "Please fill in all required fields";
//     }

//     // Email & Phone validations
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(TrainerData.email)) {
//       return "Please enter a valid email";
//     }
//     if (!/^\d{10}$/.test(TrainerData.phone)) {
//       return "Please enter a valid 10-digit phone number";
//     }

//     // Password validations
//     if (TrainerData.password.length < 6) {
//       return "Password must be at least 6 characters";
//     }
//     if (TrainerData.password !== confirmPassword) {
//       return "Passwords do not match";
//     }

//     return null; // No errors
//   };

//   const validateGymInfo = () => {
//     if (!TrainerData.gymName || !TrainerData.gymAddress || !TrainerData.gymCity || !TrainerData.gymState) {
//       return "Please provide gym name, address, city and state";
//     }

//     if (TrainerData.gymPhone && !/^\d{10}$/.test(TrainerData.gymPhone)) {
//       return "Please enter a valid gym phone number";
//     }

//     if (TrainerData.gymEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(TrainerData.gymEmail)) {
//       return "Please enter a valid gym email";
//     }

//     return null; // No errors
//   };

//   const validateExperience = () => {
//     if (!TrainerData.experience) {
//       return "Please provide your experience";
//     }

//     return null; // No errors
//   };

//   const handleNext = async () => {
//     setError("");

//     if (step === 1) {
//       const validationError = await validate();
//       if (validationError) {
//         setError(validationError);
//         return;
//       }
//     } else if (step === 2) {
//       const validationError = validateGymInfo();
//       if (validationError) {
//         setError(validationError);
//         return;
//       }
//     } else if (step === 3) {
//       const validationError = validateExperience();
//       if (validationError) {
//         setError(validationError);
//         return;
//       }
//     }

//     setStep(step + 1);
//   };

//   const handleBack = () => {
//     setStep(step - 1);
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       // Create user account with Firebase Authentication
//       const userCredential = await createUserWithEmailAndPassword(
//         FireBase_Auth,
//         TrainerData.email,
//         TrainerData.password
//       );

//       const user = userCredential.user;

//       // Send email verification
//       await sendEmailVerification(user);

//       // Save trainer profile in Firestore
//       const db = getFirestore();
//       await setDoc(doc(db, "Trainers", user.uid), {
//         name: TrainerData.name,
//         email: TrainerData.email,
//         phone: TrainerData.phone,
//         type: "trainer", // Specify this is a trainer account
//         gym: {
//           name: TrainerData.gymName,
//           address: TrainerData.gymAddress,
//           city: TrainerData.gymCity,
//           state: TrainerData.gymState,
//           phone: TrainerData.gymPhone,
//           email: TrainerData.gymEmail,
//           website: TrainerData.gymWebsite,
//         },
//         experience: TrainerData.experience,
//         specialties: TrainerData.specialties,
//         certifications: TrainerData.certifications,
//         status: "pending", // Trainers need approval
//         createdAt: new Date().toISOString(),
//       });

//       // Registration success
//       Alert.alert(
//         "Registration Submitted",
//         "Your trainer account has been created and is pending approval. You'll be notified once approved.",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.navigate("LoginScreen"),
//           },
//         ]
//       );
//     } catch (error: any) {
//       console.error("Trainer registration error:", error);
//       if (error.code === "auth/email-already-in-use") {
//         setError("This email is already registered. Please login instead.");
//       } else {
//         setError("Failed to create account. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPersonalInfoForm = () => {
//     return (
//       <View className="w-full">
//         <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
//           Trainer Registration
//         </Text>
//         <Text className="text-base text-gray-600 mb-6 text-center">
//           Step 1: Personal Information
//         </Text>

//         {/* Name Input */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="person-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter your name"
//               value={TrainerData.name}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, name: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Email Input */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Email</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="mail-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter your email"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={TrainerData.email}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, email: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Phone Input */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="call-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter your phone number"
//               keyboardType="phone-pad"
//               value={TrainerData.phone}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, phone: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Password Input */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Password</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="lock-closed-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter password"
//               secureTextEntry={!showPassword}
//               value={TrainerData.password}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, password: text })
//               }
//             />
//             <TouchableOpacity onPress={togglePasswordVisibility}>
//               <Ionicons
//                 name={showPassword ? "eye-off-outline" : "eye-outline"}
//                 size={22}
//                 color="#555"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Confirm Password Input */}
//         <View className="mb-6">
//           <Text className="text-gray-700 mb-2 font-medium">
//             Confirm Password
//           </Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="lock-closed-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Confirm password"
//               secureTextEntry={!showPassword}
//               value={confirmPassword}
//               onChangeText={setConfirmPassword}
//             />
//           </View>
//         </View>

//         {/* Navigation Buttons */}
//         <TouchableOpacity
//           className="bg-blue-600 py-3 rounded-lg items-center"
//           onPress={handleNext}
//         >
//           <Text className="text-white font-bold text-lg">Next</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderGymInfoForm = () => {
//     return (
//       <View className="w-full">
//         <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
//           Trainer Registration
//         </Text>
//         <Text className="text-base text-gray-600 mb-6 text-center">
//           Step 2: Gym Information
//         </Text>

//         {/* Gym Name */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Gym Name</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="fitness-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter gym name"
//               value={TrainerData.gymName}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, gymName: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Gym Address */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Gym Address</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="location-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Enter gym address"
//               value={TrainerData.gymAddress}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, gymAddress: text })
//               }
//             />
//           </View>
//         </View>

//         {/* City and State */}
//         <View className="flex-row mb-4">
//           <View className="flex-1 mr-2">
//             <Text className="text-gray-700 mb-2 font-medium">City</Text>
//             <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//               <Ionicons name="business-outline" size={20} color="#555" />
//               <TextInput
//                 className="flex-1 py-3 px-2 text-gray-700"
//                 placeholder="City"
//                 value={TrainerData.gymCity}
//                 onChangeText={(text) =>
//                   setTrainerData({ ...TrainerData, gymCity: text })
//                 }
//               />
//             </View>
//           </View>
//           <View className="flex-1 ml-2">
//             <Text className="text-gray-700 mb-2 font-medium">State</Text>
//             <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//               <Ionicons name="map-outline" size={20} color="#555" />
//               <TextInput
//                 className="flex-1 py-3 px-2 text-gray-700"
//                 placeholder="State"
//                 value={TrainerData.gymState}
//                 onChangeText={(text) =>
//                   setTrainerData({ ...TrainerData, gymState: text })
//                 }
//               />
//             </View>
//           </View>
//         </View>

//         {/* Gym Phone and Email */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Gym Phone (Optional)</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="call-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Gym phone number"
//               keyboardType="phone-pad"
//               value={TrainerData.gymPhone}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, gymPhone: text })
//               }
//             />
//           </View>
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Gym Email (Optional)</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="mail-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="Gym email address"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={TrainerData.gymEmail}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, gymEmail: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Navigation Buttons */}
//         <View className="flex-row justify-between">
//           <TouchableOpacity
//             className="bg-gray-300 py-3 rounded-lg items-center flex-1 mr-2"
//             onPress={handleBack}
//           >
//             <Text className="text-gray-700 font-bold">Back</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="bg-blue-600 py-3 rounded-lg items-center flex-1 ml-2"
//             onPress={handleNext}
//           >
//             <Text className="text-white font-bold">Next</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderExperienceForm = () => {
//     return (
//       <View className="w-full">
//         <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
//           Trainer Registration
//         </Text>
//         <Text className="text-base text-gray-600 mb-6 text-center">
//           Step 3: Experience & Expertise
//         </Text>

//         {/* Experience */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Years of Experience</Text>
//           <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <Ionicons name="time-outline" size={20} color="#555" />
//             <TextInput
//               className="flex-1 py-3 px-2 text-gray-700"
//               placeholder="e.g., 5 years"
//               value={TrainerData.experience}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, experience: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Specialties */}
//         <View className="mb-4">
//           <Text className="text-gray-700 mb-2 font-medium">Specialties</Text>
//           <View className="border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <TextInput
//               className="py-3 px-2 text-gray-700"
//               placeholder="e.g., Weight Loss, Strength Training, Yoga"
//               multiline
//               numberOfLines={3}
//               textAlignVertical="top"
//               value={TrainerData.specialties}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, specialties: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Certifications */}
//         <View className="mb-6">
//           <Text className="text-gray-700 mb-2 font-medium">Certifications</Text>
//           <View className="border border-gray-300 rounded-lg bg-gray-50 px-3">
//             <TextInput
//               className="py-3 px-2 text-gray-700"
//               placeholder="e.g., ACE, NASM, ISSA"
//               multiline
//               numberOfLines={3}
//               textAlignVertical="top"
//               value={TrainerData.certifications}
//               onChangeText={(text) =>
//                 setTrainerData({ ...TrainerData, certifications: text })
//               }
//             />
//           </View>
//         </View>

//         {/* Navigation Buttons */}
//         <View className="flex-row justify-between">
//           <TouchableOpacity
//             className="bg-gray-300 py-3 rounded-lg items-center flex-1 mr-2"
//             onPress={handleBack}
//           >
//             <Text className="text-gray-700 font-bold">Back</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="bg-blue-600 py-3 rounded-lg items-center flex-1 ml-2"
//             onPress={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text className="text-white font-bold">Submit</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         className="flex-1"
//       >
//         <ScrollView className="flex-1 p-6">
//           {/* Progress Indicator */}
//           <View className="flex-row justify-between mb-8">
//             <View className="items-center">
//               <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                 <Text className="text-white font-bold">1</Text>
//               </View>
//               <Text className="text-xs mt-1 text-gray-600">Personal</Text>
//             </View>
//             <View className="flex-1 items-center justify-center">
//               <View className={`h-1 w-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
//             </View>
//             <View className="items-center">
//               <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                 <Text className="text-white font-bold">2</Text>
//               </View>
//               <Text className="text-xs mt-1 text-gray-600">Gym</Text>
//             </View>
//             <View className="flex-1 items-center justify-center">
//               <View className={`h-1 w-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
//             </View>
//             <View className="items-center">
//               <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                 <Text className="text-white font-bold">3</Text>
//               </View>
//               <Text className="text-xs mt-1 text-gray-600">Experience</Text>
//             </View>
//           </View>

//           {/* Error Message */}
//           {error ? (
//             <Text className="text-red-500 text-center mb-4">{error}</Text>
//           ) : null}

//           {/* Form Steps */}
//           {step === 1 && renderPersonalInfoForm()}
//           {step === 2 && renderGymInfoForm()}
//           {step === 3 && renderExperienceForm()}

//           {/* Login Link */}
//           <View className="flex-row justify-center mt-6">
//             <Text className="text-gray-600">Already have an account? </Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("LoginScreen")}
//             >
//               <Text className="text-blue-600 font-semibold">Login</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default TR_SignUp;
