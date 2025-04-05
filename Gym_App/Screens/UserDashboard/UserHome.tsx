import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GOOGLE_PLACES_API_KEY } from '@env';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Alert,
  ImageBackground
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Firebase
import { FireBase_Auth, FireBase_DB, isFirebaseReady } from "../../Backend/firebase";
import { collection, getDocs, query, limit, orderBy, getDoc, doc } from "firebase/firestore";

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
interface GymData {
  id: string;
  gymName: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  rating: number;
  imageUrl: string;
  facilities?: any;
  distance?: string;
  source?: string;
  isRegistered?: boolean;
  trainers?: any[];
  membershipType?: string;
}

interface WorkoutData {
  id: string;
  title: string;
  duration: string;
  level: string;
  imageUrl: string;
  trainer: string;
  description: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface NavigationProps {
  navigation: any;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// User location storage key
const LOCATION_STORAGE_KEY = 'userLocation';
const LOCATION_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

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
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  
  // Data states
  const [registeredGyms, setRegisteredGyms] = useState<GymData[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<GymData[]>([]);
  const [popularGyms, setPopularGyms] = useState<GymData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<WorkoutData[]>([]);

  // Memoized values
  const greeting = useMemo(() => getGreetingByTime(), []);
  const motivationalQuote = useMemo(() => getRandomItem(QUOTES), []);

  // Check if Firebase services are available
  useEffect(() => {
    const checkServices = () => {
      const services = isFirebaseReady();
      if (services.auth && services.db) {
        console.log("Firebase services are available in UserHome");
        setServicesReady(true);
      } else {
        console.log("Firebase services not fully available in UserHome");
      }
    };

    // Check immediately and then every second
    checkServices();
    const interval = setInterval(checkServices, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch user data on component mount
  useEffect(() => {
    if (servicesReady) {
      getUserInfo();
      loadUserLocation();
      loadAllData();
    }
  }, [servicesReady]);
  
  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (servicesReady) {
        loadAllData();
      }
    }, [servicesReady])
  );
  
  // Load user location - this is now the central location request
  const loadUserLocation = async () => {
    try {
      setLocationLoading(true);
      
      // First try to get from AsyncStorage
      const storedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        // Check if stored location is less than expiry time old
        if (Date.now() - parsedLocation.timestamp < LOCATION_EXPIRY) {
          setUserLocation(parsedLocation);
          setLocationLoading(false);
          return;
        }
      }
      
      // If no recent stored location, request new location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Access Required',
          'Please enable location services to find gyms near you.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now()
      };
      
      // Save to state and AsyncStorage
      setUserLocation(newLocation);
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
      
      // Refresh nearby gyms with the new location
      fetchNearbyGyms(newLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Calculate distance between coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Convert degrees to radians
  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };
  
  // Get user info from auth
  const getUserInfo = async () => {
    if (!FireBase_Auth || !FireBase_Auth.currentUser || !FireBase_DB) {
      setUserName('Fitness Enthusiast');
      return;
    }

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
    if (!servicesReady) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchRegisteredGyms(),
        userLocation ? fetchNearbyGyms(userLocation) : fetchNearbyGyms(), 
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
    if (!FireBase_Auth || !FireBase_Auth.currentUser) {
      setRegisteredGyms([]);
      return;
    }

    try {
      const currentUser = FireBase_Auth.currentUser;
      if (!currentUser) {
        setRegisteredGyms([]);
        return;
      }
      
      let token;
      try {
        token = await currentUser.getIdToken();
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        setRegisteredGyms([]);
        return;
      }
    
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
        distance: gym.distance || '0.0 mi',
        source: 'registered'
      }));
      
      setRegisteredGyms(gyms);
    } catch (error) {
      console.error('Error fetching registered gyms in userHome:', error);
      setRegisteredGyms([]);
    }
  };

  // Fetch nearby gyms - now uses actual location if available
  const fetchNearbyGyms = async (location?: UserLocation) => {
    try {
      // First try to get from Google Places API with location if available
      if (location && GOOGLE_PLACES_API_KEY) {
        try {
          const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=5000&type=gym&key=${GOOGLE_PLACES_API_KEY}`;
          
          const placesResponse = await fetch(placesUrl);
          
          if (placesResponse.ok) {
            const data = await placesResponse.json();
            
            if (data.results && data.results.length > 0) {
              const googleGyms: GymData[] = data.results
                .filter((place: any) => 
                  place.types.includes('gym') || 
                  place.name.toLowerCase().includes('gym') ||
                  place.name.toLowerCase().includes('fitness')
                )
                .slice(0, 5)
                .map((place: any) => {
                  // Calculate distance
                  const distance = calculateDistance(
                    location.latitude, 
                    location.longitude, 
                    place.geometry.location.lat, 
                    place.geometry.location.lng
                  );
                  
                  return {
                    id: `google-${place.place_id}`,
                    gymName: place.name,
                    location: {
                      address: place.vicinity || 'No address',
                      city: '', 
                      state: ''
                    },
                    rating: place.rating || 4.0,
                    imageUrl: place.photos?.[0]?.photo_reference 
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                      : getRandomItem(GYM_IMAGES),
                    facilities: {},
                    distance: `${distance.toFixed(1)} mi`,
                    source: 'google'
                  };
                });
              
              setNearbyGyms(googleGyms);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching from Google Places:', error);
          // Fall back to Firebase if Google Places fails
        }
      }
      
      // Fall back to Firebase gyms if no location or Google Places failed
      if (!FireBase_DB) {
        setNearbyGyms(getMockNearbyGyms());
        return;
      }
      
      const gymsRef = collection(FireBase_DB, 'gyms');
      const gymsQuery = query(gymsRef, limit(5));
      const querySnapshot = await getDocs(gymsQuery);
      
      if (querySnapshot.empty) {
        setNearbyGyms(getMockNearbyGyms());
        return;
      }
      
      const gyms: GymData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // If we have location and gym has coordinates, calculate actual distance
        let distance = '? mi';
        if (location && data.coordinates) {
          const actualDistance = calculateDistance(
            location.latitude,
            location.longitude,
            data.coordinates.latitude,
            data.coordinates.longitude
          );
          distance = `${actualDistance.toFixed(1)} mi`;
        } else {
          // Otherwise use random distance for demo purposes
          distance = getRandomDistance();
        }
        
        return {
          id: doc.id,
          gymName: data.gymName || 'Unnamed Gym',
          location: data.location || { address: 'No address', city: '', state: '' },
          rating: data.rating || 4.5,
          imageUrl: data.imageUrl || getRandomItem(GYM_IMAGES),
          facilities: data.facilities,
          distance: distance,
          source: 'app'
        };
      });
      
      // Sort by distance if available
      if (location) {
        gyms.sort((a, b) => {
          const distA = parseFloat(a.distance?.replace(' mi', '') || '999');
          const distB = parseFloat(b.distance?.replace(' mi', '') || '999');
          return distA - distB;
        });
      }
      
      setNearbyGyms(gyms);
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      setNearbyGyms(getMockNearbyGyms());
    }
  };

  // Fetch popular gyms - optimized with proper error handling
  const fetchPopularGyms = async () => {
    if (!FireBase_DB) {
      setPopularGyms(getMockPopularGyms());
      return;
    }
    
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
          facilities: data.facilities,
          source: 'app'
        };
      });
      
      setPopularGyms(gyms);
    } catch (error) {
      console.error('Error fetching popular gyms:', error);
      setPopularGyms(getMockPopularGyms());
    }
  };

  // Fetch popular workouts
  const fetchPopularWorkouts = async () => {
    if (!FireBase_DB) {
      setPopularWorkouts(getMockWorkouts());
      return;
    }
    
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
      distance: '0.8 mi',
      source: 'app'
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
      distance: '1.2 mi',
      source: 'app'
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
      distance: '1.7 mi',
      source: 'app'
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
      },
      source: 'app'
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
      },
      source: 'app'
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
      },
      source: 'app'
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

  // Handler for refreshing the screen
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUserLocation();
      await loadAllData();
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  // If Firebase services are not ready
  if (!servicesReady) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0091EA" />
        <Text className="mt-4 text-gray-600">Initializing services...</Text>
      </SafeAreaView>
    );
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
        
        {/* Location indicator */}
        <View className="flex-row items-center mt-2">
          <Ionicons 
            name="location" 
            size={16} 
            color={userLocation ? THEME.colors.green : THEME.colors.primary} 
          />
          <Text className="ml-1 text-sm text-gray-600">
            {userLocation 
              ? "Using your current location" 
              : "Location services not enabled"}
          </Text>
          {locationLoading && (
            <ActivityIndicator 
              size="small" 
              color={THEME.colors.primary} 
              style={{ marginLeft: 8 }}
            />
          )}
          {!userLocation && !locationLoading && (
            <TouchableOpacity
              className="ml-2 px-2 py-1 bg-blue-100 rounded-full"
              onPress={loadUserLocation}
            >
              <Text className="text-xs text-blue-600 font-medium">Enable</Text>
            </TouchableOpacity>
          )}
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
                {nearbyGyms.map((gym) => (
                  <GymCard 
                    key={gym.id} 
                    gym={gym} 
                    onPress={() => handleGymPress(gym.id)} 
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="px-6">
                <TouchableOpacity 
                  className="bg-blue-50 py-3 px-4 rounded-lg flex-row items-center justify-center"
                  onPress={loadUserLocation}
                >
                  <Ionicons name="location-outline" size={20} color={THEME.colors.blue} />
                  <Text className="ml-2 text-blue-600">
                    Enable location to see gyms near you
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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