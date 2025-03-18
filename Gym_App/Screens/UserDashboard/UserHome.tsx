import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FireBase_Auth, FireBase_DB } from "Gym_App/Backend/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";

// Define types
type UserHomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Featured workouts data type
type FeaturedWorkout = {
  id: string;
  title: string;
  duration: string;
  level: string;
  imageUrl: string;
};

// Gym data type
type GymData = {
  id: string;
  name: string;
  address: string;
  rating: number;
  imageUrl: string;
};

const UserHome: React.FC<UserHomeScreenProps> = ({ navigation }) => {
  const [greeting, setGreeting] = useState<string>('Good morning');
  const [userName, setUserName] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [featuredWorkouts, setFeaturedWorkouts] = useState<FeaturedWorkout[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<GymData[]>([]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Get user name from auth
    const currentUser = FireBase_Auth.currentUser;
    if (currentUser?.displayName) {
      setUserName(currentUser.displayName.split(' ')[0]);
    } else {
      setUserName('Fitness Enthusiast');
    }

    // Fetch initial data
    fetchFeaturedWorkouts();
    fetchNearbyGyms();
  }, []);

  // Fetch featured workouts from Firestore
  const fetchFeaturedWorkouts = async () => {
    try {
      const workoutsRef = collection(FireBase_DB, 'workouts');
      const workoutsQuery = query(workoutsRef, orderBy('popularity', 'desc'), limit(5));
      const querySnapshot = await getDocs(workoutsQuery);
      
      const workouts: FeaturedWorkout[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        workouts.push({
          id: doc.id,
          title: data.title || 'Untitled Workout',
          duration: data.duration || '30 min',
          level: data.level || 'Beginner',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
        });
      });
      
      // If no workouts found, use mock data
      if (workouts.length === 0) {
        setFeaturedWorkouts(getMockWorkouts());
      } else {
        setFeaturedWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setFeaturedWorkouts(getMockWorkouts());
    }
  };

  // Fetch nearby gyms from Firestore
  const fetchNearbyGyms = async () => {
    try {
      const gymsRef = collection(FireBase_DB, 'gyms');
      const gymsQuery = query(gymsRef, limit(5));
      const querySnapshot = await getDocs(gymsQuery);
      
      const gyms: GymData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        gyms.push({
          id: doc.id,
          name: data.name || 'Unnamed Gym',
          address: data.address || 'No address available',
          rating: data.rating || 4.5,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
        });
      });
      
      // If no gyms found, use mock data
      if (gyms.length === 0) {
        setNearbyGyms(getMockGyms());
      } else {
        setNearbyGyms(gyms);
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      setNearbyGyms(getMockGyms());
    }
  };

  // Pull to refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFeaturedWorkouts(), fetchNearbyGyms()]);
    setRefreshing(false);
  };

  // Mock data for featured workouts
  const getMockWorkouts = (): FeaturedWorkout[] => [
    {
      id: '1',
      title: 'Full Body Strength',
      duration: '45 min',
      level: 'Intermediate',
      imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHdvcmtvdXR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '2',
      title: 'HIIT Cardio Blast',
      duration: '30 min',
      level: 'Advanced',
      imageUrl: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8d29ya291dHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '3',
      title: 'Core & Abs Builder',
      duration: '20 min',
      level: 'Beginner',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8d29ya291dHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '4',
      title: 'Upper Body Focus',
      duration: '35 min',
      level: 'Intermediate',
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8d29ya291dHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
    },
  ];

  // Mock data for nearby gyms
  const getMockGyms = (): GymData[] => [
    {
      id: '1',
      name: 'FitZone Gym & Fitness',
      address: '123 Main St, Anytown',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '2',
      name: 'PowerHouse Fitness Center',
      address: '456 Elm St, Somewhere',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: '3',
      name: 'Iron Paradise',
      address: '789 Oak St, Elsewhere',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Z3ltfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
    },
  ];

  // Renders a single featured workout card
  const renderWorkoutCard = (workout: FeaturedWorkout) => (
    <TouchableOpacity 
      key={workout.id}
      className="mr-4 w-[280px] rounded-2xl overflow-hidden bg-white shadow-sm"
      onPress={() => navigation.navigate('WorkoutDetails', { workoutId: workout.id })}
    >
      <Image 
        source={{ uri: workout.imageUrl }}
        className="w-full h-[150px]"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1">{workout.title}</Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">{workout.duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="fitness-outline" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">{workout.level}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renders a single nearby gym card
  const renderGymCard = (gym: GymData) => (
    <TouchableOpacity 
      key={gym.id}
      className="mr-4 w-[280px] rounded-2xl overflow-hidden bg-white shadow-sm"
      onPress={() => navigation.navigate('GymDetails', { gymId: gym.id })}
    >
      <Image 
        source={{ uri: gym.imageUrl }}
        className="w-full h-[150px]"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1">{gym.name}</Text>
        <Text className="text-xs text-gray-600 mb-2">{gym.address}</Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text className="text-xs text-gray-700 font-medium ml-1">{gym.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Main component render
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="px-6 py-4 bg-white shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg text-gray-600">{greeting}</Text>
              <Text className="text-2xl font-bold text-gray-800">{userName}</Text>
            </View>
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={() => navigation.navigate('UserProfile')}
            >
              <Ionicons name="person" size={20} color="#0091EA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View className="flex-row justify-between px-6 py-4">
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('Gyms')}
          >
            <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center mb-1">
              <Ionicons name="fitness" size={24} color="#fff" />
            </View>
            <Text className="text-xs text-gray-700 font-medium">Gyms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('Trainers')}
          >
            <View className="w-14 h-14 rounded-full bg-green-500 items-center justify-center mb-1">
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <Text className="text-xs text-gray-700 font-medium">Trainers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('WorkoutPlans')}
          >
            <View className="w-14 h-14 rounded-full bg-purple-500 items-center justify-center mb-1">
              <Ionicons name="clipboard" size={24} color="#fff" />
            </View>
            <Text className="text-xs text-gray-700 font-medium">Plans</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center"
            onPress={() => navigation.navigate('Progress')}
          >
            <View className="w-14 h-14 rounded-full bg-orange-500 items-center justify-center mb-1">
              <Ionicons name="trending-up" size={24} color="#fff" />
            </View>
            <Text className="text-xs text-gray-700 font-medium">Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Workouts Section */}
        <View className="mt-2 mb-6">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-gray-800">Featured Workouts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllWorkouts')}>
              <Text className="text-blue-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pl-6"
          >
            {featuredWorkouts.map(workout => renderWorkoutCard(workout))}
          </ScrollView>
        </View>

        {/* Nearby Gyms Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-xl font-bold text-gray-800">Nearby Gyms</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllGyms')}>
              <Text className="text-blue-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pl-6"
          >
            {nearbyGyms.map(gym => renderGymCard(gym))}
          </ScrollView>
        </View>

        {/* Motivational Quote Section */}
        <View className="mx-6 mb-8">
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3ltJTIwbW90aXZhdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60' }}
            className="rounded-2xl overflow-hidden h-[180px] justify-center"
            imageStyle={{ opacity: 0.7, backgroundColor: '#000' }}
          >
            <View className="px-6 py-4">
              <Text className="text-2xl font-bold text-white mb-2 text-center shadow-lg">
                "The only bad workout is the one that didn't happen."
              </Text>
              <Text className="text-white text-right mt-2 italic">
                - Fitness Proverb
              </Text>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserHome;
