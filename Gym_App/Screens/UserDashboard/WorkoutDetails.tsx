// screens/WorkoutDetails.tsx
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
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "./constants/theme";
import { WorkoutCard } from "../components/WorkoutCard";
import { getWorkoutById, getRelatedWorkouts } from "./constants/exerciseData";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    description: string;
    muscle: string;
    equipment: string;
    difficulty: string;
    instructions: string[];
    imageUrl: string;
  };
  index: number;
  onPress: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
    >
      <View className="bg-blue-50 w-12 items-center justify-center">
        <Text className="text-blue-600 font-bold text-lg">{index + 1}</Text>
      </View>

      <Image source={{ uri: exercise.imageUrl }} className="w-20 h-20" />

      <View className="flex-1 p-3">
        <Text className="font-bold text-gray-800">{exercise.name}</Text>

        <View className="flex-row items-center mt-1">
          <Ionicons
            name="barbell-outline"
            size={14}
            color={THEME.colors.primary}
          />
          <Text className="ml-1 text-gray-600 text-sm">{exercise.muscle}</Text>

          <View className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full">
            <Text className="text-gray-600 text-xs">{exercise.equipment}</Text>
          </View>
        </View>

        <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
          {exercise.description}
        </Text>
      </View>

      <View className="justify-center pr-3">
        <Ionicons
          name="chevron-forward"
          size={20}
          color={THEME.colors.secondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const WorkoutDetails = ({ route, navigation }: any) => {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<any>(null);
  const [relatedWorkouts, setRelatedWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch workout details
    const fetchWorkoutDetails = () => {
      setLoading(true);
      try {
        // Get workout by ID from our local data
        const workoutData = getWorkoutById(workoutId);

        if (workoutData) {
          setWorkout(workoutData);

          // Get related workouts
          const related = getRelatedWorkouts(workoutId);
          setRelatedWorkouts(related);
        } else {
          // Handle workout not found
          console.error("Workout not found:", workoutId);
        }
      } catch (error) {
        console.error("Error fetching workout details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  const handleStartWorkout = () => {
    // Navigate to workout session screen or show a modal
    // This would be implemented based on your app's flow
    alert("Starting workout: " + workout?.title);
  };

  const handleExercisePress = (exerciseId: string) => {
    // Navigate to exercise detail screen
    navigation.navigate("ExerciseDetail", { exerciseId });
  };

  const handleWorkoutPress = (id: string) => {
    // Navigate to another workout detail
    navigation.navigate("WorkoutDetails", { workoutId: id });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text className="mt-4 text-gray-600">Loading workout details...</Text>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={THEME.colors.primary}
        />
        <Text className="mt-4 text-gray-800 font-bold text-lg">
          Workout Not Found
        </Text>
        <Text className="mt-2 text-gray-600 text-center px-8">
          We couldn't find the workout you're looking for.
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
        {/* Workout Header */}
        <View className="relative">
          <Image source={{ uri: workout.imageUrl }} className="w-full h-56" />

          <TouchableOpacity
            className="absolute top-4 left-4 bg-white rounded-full p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
            <Text className="text-white text-2xl font-bold">
              {workout.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person" size={16} color="#fff" />
              <Text className="text-white ml-1">{workout.trainer}</Text>
            </View>
          </View>
        </View>
        {/* Workout Info */}
        <View className="bg-white p-4 shadow-sm">
          <View className="flex-row justify-between">
            <View className="flex-1 items-center p-2">
              <Text className="text-gray-500 text-xs">Duration</Text>
              <Text className="text-gray-800 font-bold">
                {workout.duration}
              </Text>
            </View>

            <View className="flex-1 items-center p-2 border-x border-gray-100">
              <Text className="text-gray-500 text-xs">Level</Text>
              <Text className="text-gray-800 font-bold">{workout.level}</Text>
            </View>

            <View className="flex-1 items-center p-2">
              <Text className="text-gray-500 text-xs">Calories</Text>
              <Text className="text-gray-800 font-bold">
                {workout.calories || "300-400"}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-800 font-bold text-lg">Description</Text>
            <Text className="text-gray-600 mt-1">{workout.description}</Text>
          </View>
        </View>
        {/* Exercise List */}
        <View className="mt-4 px-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">
            Exercises ({workout.exercises?.length || 0})
          </Text>

          {workout.exercises && workout.exercises.length > 0 ? (
            workout.exercises.map((exercise: any, index: any) => (
              <ExerciseCard
                // Use the combination of exercise id and index as the key
                key={`${exercise.id}-${index}`}
                exercise={exercise}
                index={index}
                onPress={() => handleExercisePress(exercise.id)}
              />
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Ionicons
                name="fitness-outline"
                size={48}
                color={THEME.colors.primary}
              />
              <Text className="text-gray-800 font-bold mt-2">
                No Exercises Found
              </Text>
              <Text className="text-gray-500 text-center mt-1">
                This workout doesn't have any exercises yet.
              </Text>
            </View>
          )}
        </View>
        {/* Instructions */}
        <View className="mt-6 px-4">
          <Text className="text-gray-800 font-bold text-lg mb-2">
            How to Use This Workout
          </Text>

          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-start mb-3">
              <View className="bg-blue-100 w-6 h-6 rounded-full items-center justify-center mt-0.5">
                <Text className="text-blue-600 font-bold">1</Text>
              </View>
              <Text className="text-gray-700 ml-2 flex-1">
                Complete each exercise in the order shown above.
              </Text>
            </View>

            <View className="flex-row items-start mb-3">
              <View className="bg-blue-100 w-6 h-6 rounded-full items-center justify-center mt-0.5">
                <Text className="text-blue-600 font-bold">2</Text>
              </View>
              <Text className="text-gray-700 ml-2 flex-1">
                For each exercise, do 3 sets of 12-15 reps, resting 30-60
                seconds between sets.
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="bg-blue-100 w-6 h-6 rounded-full items-center justify-center mt-0.5">
                <Text className="text-blue-600 font-bold">3</Text>
              </View>
              <Text className="text-gray-700 ml-2 flex-1">
                Rest 1-2 minutes between different exercises. Take longer rest
                periods as needed.
              </Text>
            </View>
          </View>
        </View>
        {/* Start Workout Button */}
        <View className="mt-6 px-4">
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-xl items-center"
            onPress={handleStartWorkout}
          >
            <Text className="text-white font-bold text-lg">Start Workout</Text>
          </TouchableOpacity>
        </View>
        {/* Related Workouts */}
        {relatedWorkouts.length > 0 && (
          <View className="mt-8 mb-6">
            <Text className="text-gray-800 font-bold text-lg px-4 mb-4">
              You Might Also Like
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
            >
              {relatedWorkouts.map((relatedWorkout) => (
                <WorkoutCard
                  key={relatedWorkout.id}
                  workout={relatedWorkout}
                  onPress={() => handleWorkoutPress(relatedWorkout.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
        {/* Spacing at bottom */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutDetails;
