import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GOOGLE_PLACES_API_KEY } from '@env';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Pressable
} from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FireBase_Auth, FireBase_DB } from "Gym_App/Backend/firebase";
import { collection, getDocs, query, limit, orderBy, where, getDoc, doc } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import {API_URL} from '@env';

// Import our components and utilities
import { GymCard } from './components/GymCard';
import { WorkoutCard } from './components/WorkoutCard';
import { SectionHeader } from './components/SectionHeader';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { QuickActionButton } from './components/QuickActionButton';
import { THEME } from './constants/theme';
import { QUOTES } from './constants/motivationalQuotes';
import { getRandomItem, getGreetingByTime } from './utils/helpers';
import { GYM_IMAGES, WORKOUT_IMAGES } from './constants/assetUrls';

// Types
import { GymData, WorkoutData, NavigationProps } from 'Gym_App/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Quick action buttons configuration
const QUICK_ACTIONS: Array<{
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  screen: string;
}> = [
  { 
    id: 'gyms', 
    icon: 'fitness-outline', 
    label: 'Gyms', 
    color: THEME.colors.blue,
    screen: 'AllGyms' 
  },
  { 
    id: 'trainers', 
    icon: 'person-outline', 
    label: 'Trainers', 
    color: THEME.colors.green,
    screen: 'Trainers' 
  },
  { 
    id: 'plans', 
    icon: 'clipboard-outline', 
    label: 'Plans', 
    color: THEME.colors.purple,
    screen: 'WorkoutPlans' 
  },
  { 
    id: 'progress', 
    icon: 'trending-up-outline', 
    label: 'Progress', 
    color: THEME.colors.orange, 
    screen: 'Progress'
  }
];

const UserHome: React.FC<NavigationProps> = ({ navigation }) => {
  // State management
  const [userName, setUserName] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Data states
  const [registeredGyms, setRegisteredGyms] = useState<GymData[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<GymData[]>([]);
  const [popularGyms, setPopularGyms] = useState<GymData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<WorkoutData[]>([]);

  // Memoized values
  const greeting = useMemo(() => getGreetingByTime(), []);
  const motivationalQuote = useMemo(() => getRandomItem(QUOTES as any[]), []);
  
  // Fetch user data on component mount
  useEffect(() => {
    getUserInfo();
    loadAllData();
  }, []);
  
  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );
  
  // Get user info from auth
  const getUserInfo = async () => {
    try {
      const currentUser = FireBase_Auth.currentUser;
      if (!currentUser?.uid) {
        setUserName('Fitness Enthusiast');
        return;
      }

      const userDoc = await getDoc(doc(FireBase_DB, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name?.split(' ')[0] || 'Fitness Enthusiast');
      } else {
        setUserName('Fitness Enthusiast');
      }
    } catch (error) {
      console.error("Error getting user info:", error);
      setUserName('Fitness Enthusiast');
    }
  };

  // Load all data in parallel
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRegisteredGyms(),
        fetchNearbyGyms(), 
        fetchPopularGyms(),
        fetchPopularWorkouts()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch gyms the user has registered with - Updated to use axios
  const fetchRegisteredGyms = async () => {
    try {
      const currentUser = FireBase_Auth.currentUser;
      if (!currentUser) {
        setRegisteredGyms([]);
        return;
      }
      const token = await currentUser.getIdToken();
    
      console.log("Making API request to:", `${API_URL}/Register/Gyms/${currentUser.uid}`);
      
      const response = await axios.get(
        `${API_URL}/Register/Gyms/${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000 
        }
      );
      
      if (!response.data || !response.data.gyms || response.data.gyms.length === 0) {
        setRegisteredGyms([]);
        return;
      }
      
      // Convert API response to GymData format
      const gyms: GymData[] = response.data.gyms.map((gym: any) => ({
        id: gym.id,
        gymName: gym.name || 'Unnamed Gym',
        location: {
          address: gym.address || 'No address',
          city: gym.city || '',
          state: gym.state || ''
        },
        rating: gym.rating || 4.5,
        imageUrl: gym.imageUrl || getRandomItem(GYM_IMAGES),
        facilities: {
          gymType: gym.gymType || 'General Fitness',
          hasPool: gym.facilities?.hasPool || false,
          hasClasses: gym.facilities?.hasClasses || false,
          hasCardio: gym.facilities?.hasCardio || false,
          hasWeights: gym.facilities?.hasWeights || false
        },
        isRegistered: true,
        trainers: gym.trainers || [],
        membershipType: gym.membershipType,
        distance: gym.distance || '0.0 mi'
      }));
      
      setRegisteredGyms(gyms);
    } catch (error) {
      console.error('Error fetching registered gyms in userHome:', error);
      setRegisteredGyms([]);
    }
  };

  // Fetch nearby gyms - optimized query with distance calculation
  const fetchNearbyGyms = async () => {
    try {
      // In a real app, you would use geolocation here
      const gymsRef = collection(FireBase_DB, 'gyms');
      const gymsQuery = query(gymsRef, limit(5));
      const querySnapshot = await getDocs(gymsQuery);
      
      if (querySnapshot.empty) {
        setNearbyGyms(getMockNearbyGyms());
        return;
      }
      
      const gyms: GymData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          gymName: data.gymName || 'Unnamed Gym',
          location: data.location || { address: 'No address', city: '', state: '' },
          rating: data.rating || 4.5,
          imageUrl: data.imageUrl || getRandomItem(GYM_IMAGES),
          facilities: data.facilities,
          distance: getRandomDistance() // In a real app, calculate actual distance
        };
      });
      
      setNearbyGyms(gyms);
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      setNearbyGyms(getMockNearbyGyms());
    }
  };

  // Fetch popular gyms - optimized with proper error handling
  const fetchPopularGyms = async () => {
    try {
      const gymsRef = collection(FireBase_DB, 'gyms');
      const gymsQuery = query(gymsRef, orderBy('rating', 'desc'), limit(5));
      const querySnapshot = await getDocs(gymsQuery);
      
      if (querySnapshot.empty) {
        setPopularGyms(getMockPopularGyms());
        return;
      }
      
      const gyms: GymData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          gymName: data.gymName || 'Unnamed Gym',
          location: data.location || { address: 'No address', city: '', state: '' },
          rating: data.rating || 4.7,
          imageUrl: data.imageUrl || getRandomItem(GYM_IMAGES),
          facilities: data.facilities
        };
      });
      
      setPopularGyms(gyms);
    } catch (error) {
      console.error('Error fetching popular gyms:', error);
      setPopularGyms(getMockPopularGyms());
    }
  };

  // Fetch popular workouts - optimized with proper error handling
  const fetchPopularWorkouts = async () => {
    try {
      const workoutsRef = collection(FireBase_DB, 'workouts');
      const workoutsQuery = query(workoutsRef, orderBy('popularity', 'desc'), limit(4));
      const querySnapshot = await getDocs(workoutsQuery);
      
      if (querySnapshot.empty) {
        setPopularWorkouts(getMockWorkouts());
        return;
      }
      
      const workouts: WorkoutData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Workout',
          duration: data.duration || '30 min',
          level: data.level || 'Beginner',
          imageUrl: data.imageUrl || getRandomItem(WORKOUT_IMAGES),
          trainer: data.trainer || 'GymBuddy Coach',
          description: data.description || 'A great workout for fitness enthusiasts'
        };
      });
      
      setPopularWorkouts(workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setPopularWorkouts(getMockWorkouts());
    }
  };

  // Get random distance - for mock data only
  const getRandomDistance = () => {
    const distances = ['0.8 mi', '1.2 mi', '1.7 mi', '2.3 mi', '3.1 mi'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  // Mock data generators
  const getMockNearbyGyms = (): GymData[] => [
    {
      id: 'nearby1',
      gymName: 'FitZone Gym & Fitness',
      location: {
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA'
      },
      rating: 4.8,
      imageUrl: GYM_IMAGES[0],
      facilities: {
        gymType: 'Full Service'
      },
      distance: '0.8 mi'
    },
    {
      id: 'nearby2',
      gymName: 'PowerHouse Fitness Center',
      location: {
        address: '456 Elm St',
        city: 'Somewhere',
        state: 'CA'
      },
      rating: 4.6,
      imageUrl: GYM_IMAGES[1],
      facilities: {
        gymType: 'Bodybuilding'
      },
      distance: '1.2 mi'
    },
    {
      id: 'nearby3',
      gymName: 'Iron Paradise',
      location: {
        address: '789 Oak St',
        city: 'Elsewhere',
        state: 'CA'
      },
      rating: 4.9,
      imageUrl: GYM_IMAGES[2],
      facilities: {
        gymType: 'Strength & Conditioning'
      },
      distance: '1.7 mi'
    },
  ];

  const getMockPopularGyms = (): GymData[] => [
    {
      id: 'popular1',
      gymName: 'Elite Fitness Club',
      location: {
        address: '100 Fitness Blvd',
        city: 'Fitnessopolis',
        state: 'CA'
      },
      rating: 4.9,
      imageUrl: GYM_IMAGES[3],
      facilities: {
        gymType: 'Luxury Fitness'
      }
    },
    {
      id: 'popular2',
      gymName: 'CrossTrain Performance',
      location: {
        address: '200 Athletic Dr',
        city: 'Sportsville',
        state: 'CA'
      },
      rating: 4.8,
      imageUrl: GYM_IMAGES[0],
      facilities: {
        gymType: 'CrossFit'
      }
    },
    {
      id: 'popular3',
      gymName: 'Zen Fitness Studio',
      location: {
        address: '300 Peaceful Pl',
        city: 'Harmony',
        state: 'CA'
      },
      rating: 4.7,
      imageUrl: GYM_IMAGES[2],
      facilities: {
        gymType: 'Yoga & Pilates'
      }
    },
  ];

  const getMockWorkouts = (): WorkoutData[] => [
    {
      id: 'workout1',
      title: 'Full Body Strength',
      duration: '45 min',
      level: 'Intermediate',
      imageUrl: WORKOUT_IMAGES[0],
      trainer: 'Alex Johnson',
      description: 'Complete full body workout focusing on compound movements'
    },
    {
      id: 'workout2',
      title: 'HIIT Cardio Blast',
      duration: '30 min',
      level: 'Advanced',
      imageUrl: WORKOUT_IMAGES[1],
      trainer: 'Sarah Chen',
      description: 'High-intensity interval training to maximize calorie burn'
    },
    {
      id: 'workout3',
      title: 'Core & Abs Builder',
      duration: '20 min',
      level: 'Beginner',
      imageUrl: WORKOUT_IMAGES[2],
      trainer: 'Mike Torres',
      description: 'Focus on core strength with effective ab exercises'
    },
    {
      id: 'workout4',
      title: 'Upper Body Focus',
      duration: '35 min',
      level: 'Intermediate',
      imageUrl: WORKOUT_IMAGES[3],
      trainer: 'David Kim',
      description: 'Build strength in arms, chest, back and shoulders'
    },
  ];

  // Memoized navigation handlers to prevent unnecessary re-renders
  const handleGymPress = useCallback((gymId: string) => {
    navigation.navigate('GymDetails', { gymId });
  }, [navigation]);
  
  const handleWorkoutPress = useCallback((workoutId: string) => {
    navigation.navigate('WorkoutDetails', { workoutId });
  }, [navigation]);
  
  const handleSeeAllGyms = useCallback(() => {
    navigation.navigate('AllGyms');
  }, [navigation]);
  
  const handleSeeAllNearbyGyms = useCallback(() => {
    navigation.navigate('NearbyGyms');
  }, [navigation]);
  
  const handleSeeAllPopularGyms = useCallback(() => {
    navigation.navigate('PopularGyms');
  }, [navigation]);
  
  const handleSeeAllWorkouts = useCallback(() => {
    navigation.navigate('AllWorkouts');
  }, [navigation]);
  
  const handleProfilePress = useCallback(() => {
    navigation.navigate('UserProfile');
  }, [navigation]);
  
  // Handle search press - navigate to search screen
  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchResults');
  }, [navigation]);

  // Render quick action buttons
  const renderQuickActions = () => (
    <View className="flex-row justify-between px-6 py-4">
      {QUICK_ACTIONS.map(action => (
        <QuickActionButton
          key={action.id}
          icon={action.icon}
          label={action.label}
          color={action.color}
          onPress={() => navigation.navigate(action.screen)}
        />
      ))}
    </View>
  );

  function onRefresh(): void {
    throw new Error('Function not implemented.');
  }

  // Main component render
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      
      {/* Fixed Header Section */}
      <View className="px-6 py-4 bg-white shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg text-gray-600">{greeting}</Text>
            <Text className="text-2xl font-bold text-gray-800">{userName}</Text>
          </View>
          <Pressable 
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={handleProfilePress}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          >
            <Ionicons name="person" size={20} color={THEME.colors.primary} />
          </Pressable>
        </View>
        
        {/* Search Bar - Now a button that navigates to search screen */}
        <Pressable 
          className="mt-4 flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={20} color="#6b7280" />
          <Text className="flex-1 ml-2 text-gray-500">
            Search gyms by name, city, or type...
          </Text>
        </Pressable>
      </View>
      
      {/* Main Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[THEME.colors.primary]} 
            />
          }
        >
          {/* Quick Action Buttons */}
          {renderQuickActions()}

          {/* Registered Gyms Section */}
          <View className="mt-2 mb-6">
            <SectionHeader 
              title="Your Gyms" 
              onSeeAllPress={() => navigation.navigate('RegisteredGyms')} 
            />
            
            {registeredGyms.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="pl-6"
              >
                {registeredGyms.map((gym) => (
                  <GymCard 
                    key={gym.id} 
                    gym={gym} 
                    onPress={() => handleGymPress(gym.id)} 
                  />
                ))}
              </ScrollView>
            ) : (
              <EmptyState 
                icon="fitness-center" 
                message="You haven't registered with any gyms yet. Find a gym to get started!" 
              />
            )}
          </View>

          {/* Nearby Gyms Section */}
          <View className="mb-6">
            <SectionHeader 
              title="Gyms Near You" 
              onSeeAllPress={handleSeeAllNearbyGyms} 
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pl-6"
            >
              {nearbyGyms.map((gym) => (
                <GymCard 
                  key={gym.id} 
                  gym={gym} 
                  onPress={() => handleGymPress(gym.id)} 
                />
              ))}
            </ScrollView>
          </View>

          {/* Popular Gyms Section */}
          <View className="mb-6">
            <SectionHeader 
              title="Popular Gyms" 
              onSeeAllPress={handleSeeAllPopularGyms} 
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pl-6"
            >
              {popularGyms.map((gym) => (
                <GymCard 
                  key={gym.id} 
                  gym={gym} 
                  onPress={() => handleGymPress(gym.id)} 
                />
              ))}
            </ScrollView>
          </View>

          {/* Workouts Section */}
          <View className="mb-6">
            <SectionHeader 
              title="Popular Workouts" 
              onSeeAllPress={handleSeeAllWorkouts} 
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pl-6"
            >
              {popularWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={{
                    ...workout,
                    description: workout.description || 'No description available'
                  }} 
                  onPress={() => handleWorkoutPress(workout.id)} 
                />
              ))}
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
                  "{motivationalQuote.quote}"
                </Text>
                <Text className="text-white text-right mt-2 italic">
                  - {motivationalQuote.author}
                </Text>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default UserHome;