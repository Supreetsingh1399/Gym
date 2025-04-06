// screens/ExerciseDetail.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "./constants/theme";
import { EXERCISES } from "./constants/exerciseData";

const { width } = Dimensions.get("window");

const ExerciseDetail = ({ route, navigation }: any) => {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch exercise details
    const fetchExerciseDetails = () => {
      setLoading(true);
      try {
        // Find exercise by ID from our local data
        const exerciseData = EXERCISES.find((ex) => ex.id === exerciseId);

        if (exerciseData) {
          setExercise(exerciseData);
        } else {
          // Handle exercise not found
          console.error("Exercise not found:", exerciseId);
        }
      } catch (error) {
        console.error("Error fetching exercise details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [exerciseId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text className="mt-4 text-gray-600">Loading exercise details...</Text>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={THEME.colors.primary}
        />
        <Text className="mt-4 text-gray-800 font-bold text-lg">
          Exercise Not Found
        </Text>
        <Text className="mt-2 text-gray-600 text-center px-8">
          We couldn't find the exercise you're looking for.
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={THEME.colors.background}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exercise Header */}
        <View className="relative">
          <Image
            source={{ uri: exercise.imageUrl }}
            style={{ width: width, height: width * 0.7 }}
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute top-4 left-4 bg-white rounded-full p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Exercise Name and Info */}
        <View className="bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">
            {exercise.name}
          </Text>

          <View className="flex-row mt-2 flex-wrap">
            <View className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-blue-600 font-medium">
                <Ionicons name="barbell-outline" size={14} /> {exercise.muscle}
              </Text>
            </View>

            <View className="bg-green-50 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-green-600 font-medium">
                <Ionicons name="fitness-outline" size={14} />{" "}
                {exercise.equipment}
              </Text>
            </View>

            <View className="bg-orange-50 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-orange-600 font-medium">
                <Ionicons name="stats-chart-outline" size={14} />{" "}
                {exercise.difficulty}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 mt-3">{exercise.description}</Text>
        </View>

        {/* Instruction Steps */}
        <View className="mt-4 px-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">
            Instructions
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm">
            {exercise.instructions.map((instruction: string, index: number) => (
              <View key={index} className="flex-row mb-4 last:mb-0">
                <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mt-0.5 mr-3">
                  <Text className="text-blue-600 font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700">{instruction}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View className="mt-6 px-4">
          <Text className="text-gray-800 font-bold text-lg mb-2">
            Tips & Advice
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-start mb-3">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={THEME.colors.green}
                style={{ marginTop: 2 }}
              />
              <Text className="text-gray-700 ml-2 flex-1">
                Focus on proper form rather than lifting heavy weights or doing
                many reps.
              </Text>
            </View>

            <View className="flex-row items-start mb-3">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={THEME.colors.green}
                style={{ marginTop: 2 }}
              />
              <Text className="text-gray-700 ml-2 flex-1">
                Breathe out during the exertion phase and breathe in during the
                relaxation phase.
              </Text>
            </View>

            <View className="flex-row items-start">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={THEME.colors.green}
                style={{ marginTop: 2 }}
              />
              <Text className="text-gray-700 ml-2 flex-1">
                If you feel pain (not just muscle fatigue), stop immediately to
                avoid injury.
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Sets & Reps */}
        <View className="mt-6 px-4">
          <Text className="text-gray-800 font-bold text-lg mb-2">
            Recommended Sets & Reps
          </Text>

          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-600 font-medium">Level</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-600 font-medium">Sets</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-600 font-medium">Reps</Text>
              </View>
            </View>

            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-700">Beginner</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">2-3</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">8-12</Text>
              </View>
            </View>

            <View className="flex-row border-b border-gray-100">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-700">Intermediate</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">3-4</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">10-15</Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 p-3 bg-gray-50">
                <Text className="text-gray-700">Advanced</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">4-5</Text>
              </View>
              <View className="flex-1 p-3">
                <Text className="text-gray-700">12-20</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Watch Video Button - For future enhancement */}
        <View className="mt-6 px-4">
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-xl items-center flex-row justify-center"
            onPress={() => alert("Video functionality coming soon!")}
          >
            <Ionicons name="play-circle-outline" size={24} color="#fff" />
            <Text className="text-white font-bold text-lg ml-2">
              Watch Video
            </Text>
          </TouchableOpacity>
        </View>

        {/* Spacing at bottom */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciseDetail;
