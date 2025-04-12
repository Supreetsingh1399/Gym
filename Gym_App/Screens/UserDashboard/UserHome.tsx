import { POPULAR_WORKOUTS, getMockWorkouts } from "./constants/exerciseData";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GOOGLE_PLACES_API_KEY } from "@env";
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
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
//@ts-ignore
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "@env";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Firebase
import {
  FireBase_Auth,
  FireBase_DB,
  isFirebaseReady,
} from "../../Backend/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  orderBy,
  getDoc,
  doc,
} from "@firebase/firestore";

// Import our components and utilities
import { GymCard } from "../components/GymCard";
import { WorkoutCard } from "../components/WorkoutCard";
import { SectionHeader } from "../components/SectionHeader";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { QuickActionButton } from "../components/QuickActionButton";
import { THEME } from "./constants/theme";
import { QUOTES } from "./constants/motivationalQuotes";
import { getRandomItem, getGreetingByTime } from "./utils/helpers";
import { GYM_IMAGES, WORKOUT_IMAGES } from "./constants/assetUrls";
import { MaterialIcons } from '@expo/vector-icons';

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
interface Location {
  latitude: number;
  longitude: number;
}

interface GymResult {
  id: string;
  gymName: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  rating: number;
  imageUrl: string;
  distance?: string;
  source: "google" | "internal";
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  gymType?: string; // Added gymType property
}

interface GooglePlace {
  place_id?: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  photos?: Array<{ photo_reference: string }>;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
interface WorkoutData {
  [x: string]: any;
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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

// User location storage key
const LOCATION_STORAGE_KEY = "userLocation";
const LOCATION_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Quick action buttons configuration
const QUICK_ACTIONS: Array<{
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
  screen: string;
}> = [
  {
    id: "gyms",
    icon: "fitness-outline",
    label: "Gyms",
    color: THEME.colors.blue,
    screen: "AllGyms",
  },
  {
    id: "trainers",
    icon: "person-outline",
    label: "Trainers",
    color: THEME.colors.green,
    screen: "WorkoutTrainers",
  },
  {
    id: "plans",
    icon: "clipboard-outline",
    label: "Plans",
    color: THEME.colors.purple,
    screen: "WorkoutPlans",
  },
  {
    id: "progress",
    icon: "trending-up-outline",
    label: "Progress",
    color: THEME.colors.orange,
    screen: "Progress",
  },
];

const UserHome: React.FC<NavigationProps> = ({ navigation }) => {
  // State management
  const [userName, setUserName] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [popularGymsLoading, setPopularGymsLoading] = useState<boolean>(false);

  // Data states
  const [registeredGyms, setRegisteredGyms] = useState<GymData[]>([]);
  const [nearbyGyms, setNearbyGyms] = useState<GymData[]>([]);
  const [popularGyms, setPopularGyms] = useState<GymData[]>([]);
  const [popularWorkouts, setPopularWorkouts] = useState<WorkoutData[]>([]);

  // Memoized values
  const greeting = useMemo(() => getGreetingByTime(), []);
  const motivationalQuote = useMemo(() => getRandomItem(QUOTES), []);

  // Enhanced fetchNearbyGyms function
  const fetchNearbyGyms = async (location?: UserLocation) => {
    console.log("fetchNearbyGyms called with location:", location);
    // Reset state before fetching
    setNearbyGyms([]);
    setLocationError(false);
    
    try {
      if (!location || !GOOGLE_PLACES_API_KEY) {
        console.log("Cannot fetch nearby gyms: missing location or API key");
        return;
      }
      
      // Use more specific search parameters
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=10000&type=establishment&keyword=gym,fitness&key=${GOOGLE_PLACES_API_KEY}`;

      console.log("API URL:", placesUrl.replace(GOOGLE_PLACES_API_KEY, "API_KEY_HIDDEN"));

      const response = await fetch(placesUrl);
      
      if (!response.ok) {
        console.error("Google Places API error:", response.status, await response.text());
        setLocationError(true);
        return;
      }
      
      const data = await response.json();
      console.log("Google Places API response status:", data.status);
      console.log("Results count:", data.results?.length || 0);
      
      if (!data.results || data.results.length === 0) {
        console.log("No gyms found in Google Places API");
        return;
      }

      // Better filtering for gym-related places
      const googleGyms: GymData[] = data.results
        .filter((place: any) => {
          const isGymType = place.types?.some((type: string) => 
            ['gym', 'health', 'fitness_center', 'sports_center'].includes(type)
          );
          const nameContainsGym = 
            place.name.toLowerCase().includes('gym') || 
            place.name.toLowerCase().includes('fitness') ||
            place.name.toLowerCase().includes('workout') ||
            place.name.toLowerCase().includes('athletic');
            
          return isGymType || nameContainsGym;
        })
        .slice(0, 10)
        .map((place: any) => {
          // Calculate distance
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            place.geometry.location.lat,
            place.geometry.location.lng,
          );

          return {
            id: `google-${place.place_id}`,
            gymName: place.name,
            location: {
              address: place.vicinity || "No address",
              city: extractCityFromAddress(place.vicinity || ""),
              state: extractStateFromAddress(place.vicinity || ""),
            },
            rating: place.rating || 4.0,
            imageUrl: place.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
              : getRandomItem(GYM_IMAGES),
            facilities: {
              gymType: determineGymType(place.types || []),
            },
            distance: distance,
            source: "google",
          };
        });

      // Check if we need fallback results
      if (googleGyms.length < 3) {
        // Fallback to broader search parameters
        try {
          const fallbackUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=15000&keyword=fitness&key=${GOOGLE_PLACES_API_KEY}`;
          
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.status === "OK" && fallbackData.results.length > 0) {
            const existingIds = new Set(googleGyms.map(gym => gym.id));
            
            const additionalGyms = fallbackData.results
              .filter((place: any) => !existingIds.has(`google-${place.place_id}`))
              .slice(0, 5)
              .map((place: any) => {
                // Calculate distance
                const distance = calculateDistance(
                  location.latitude,
                  location.longitude,
                  place.geometry.location.lat,
                  place.geometry.location.lng,
                );

                return {
                  id: `google-${place.place_id}`,
                  gymName: place.name,
                  location: {
                    address: place.vicinity || "No address",
                    city: extractCityFromAddress(place.vicinity || ""),
                    state: extractStateFromAddress(place.vicinity || ""),
                  },
                  rating: place.rating || 4.0,
                  imageUrl: place.photos?.[0]?.photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                    : getRandomItem(GYM_IMAGES),
                  facilities: {
                    gymType: determineGymType(place.types || []),
                  },
                  distance: distance,
                  source: "google",
                };
              });
            
            googleGyms.push(...additionalGyms);
            // Re-sort by distance
            googleGyms.sort((a, b) => {
              const distA = parseFloat(a.distance?.replace(" mi", "") || "999");
              const distB = parseFloat(b.distance?.replace(" mi", "") || "999");
              return distA - distB;
            });
          }
        } catch (fallbackError) {
          console.error("Error in fallback search:", fallbackError);
          // Continue with what we have
        }
      }

      // Sort by distance
      googleGyms.sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(" mi", "") || "999");
        const distB = parseFloat(b.distance?.replace(" mi", "") || "999");
        return distA - distB;
      });

      setNearbyGyms(googleGyms);
    } catch (error) {
      console.error("Error in fetchNearbyGyms:", error);
      setLocationError(true);
      setNearbyGyms([]);
    }
    finally {
      setLoading(false);
      setRefreshing(false);}
  };

  // Enhanced fetchPopularGyms function
  const fetchPopularGyms = async (location?: UserLocation) => {
    setPopularGyms([]);
    setPopularGymsLoading(true);
    
    try {
      if (!location || !GOOGLE_PLACES_API_KEY) {
        console.log("Cannot fetch popular gyms: missing location or API key");
        setPopularGymsLoading(false);
        return;
      }
      
      // Use more specific search parameters with prominence ranking
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=25000&type=establishment&keyword=gym,fitness&rankby=prominence&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(placesUrl);
      
      if (!response.ok) {
        console.error("Google Places API error:", response.status);
        setPopularGymsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log("No popular gyms found");
        setPopularGymsLoading(false);
        return;
      }

      // Filter for 4+ rated gyms with better type detection
      const highRatedGyms = data.results
        .filter((place: any) => {
          const isGymType = place.types?.some((type: string) => 
            ['gym', 'health', 'fitness_center', 'sports_center'].includes(type)
          );
          const nameContainsGym = 
            place.name.toLowerCase().includes('gym') || 
            place.name.toLowerCase().includes('fitness');
            
          return (isGymType || nameContainsGym) && place.rating >= 4.0;
        })
        .slice(0, 10)
        .map((place: any) => {
          return {
            id: `google-${place.place_id}`,
            gymName: place.name,
            location: {
              address: place.vicinity || "No address",
              city: extractCityFromAddress(place.vicinity || ""),
              state: extractStateFromAddress(place.vicinity || ""),
            },
            rating: place.rating || 4.0,
            imageUrl: place.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
              : getRandomItem(GYM_IMAGES),
            facilities: {
              gymType: determineGymType(place.types || []),
            },
            source: "google",
          };
        });

      // Sort by rating (highest first)
      highRatedGyms.sort((a:any, b:any) => b.rating - a.rating);
      
      setPopularGyms(highRatedGyms);
    } catch (error) {
      console.error("Error fetching popular gyms from Google:", error);
      setPopularGyms([]);
    } finally {
      setPopularGymsLoading(false);
    }
  };

  // Improved loadAllData function for local state management
  const loadAllData = async () => {
    if (!servicesReady) return;

    setLoading(true);
    setRefreshing(true);
    
    // Local data holders - will only update state once at the end
    let localRegisteredGyms: GymData[] = [];
    let localNearbyGyms: GymData[] = [];
    let localPopularGyms: GymData[] = [];
    let localWorkouts: WorkoutData[] = [];
    let hasLocationError = false;
    
    try {
      // 1. Fetch registered gyms
      try {
        if (FireBase_Auth && FireBase_Auth.currentUser) {
          const currentUser = FireBase_Auth.currentUser;
          
          let token = await currentUser.getIdToken();
          
          const response = await axios.get(
            `${API_URL}/Register/Gyms/${currentUser.uid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
            }
          );

          if (response.data && response.data.gyms && response.data.gyms.length > 0) {
            localRegisteredGyms = response.data.gyms.map((gym: any) => ({
              id: gym.id,
              gymName: gym.name || "Unnamed Gym",
              location: {
                address: gym.address || "No address",
                city: gym.city || "",
                state: gym.state || "",
              },
              rating: gym.rating || 4.5,
              imageUrl: gym.imageUrl || getRandomItem(GYM_IMAGES),
              facilities: {
                gymType: gym.gymType || "General Fitness",
                hasPool: gym.facilities?.hasPool || false,
                hasClasses: gym.facilities?.hasClasses || false,
                hasCardio: gym.facilities?.hasCardio || false,
                hasWeights: gym.facilities?.hasWeights || false,
              },
              isRegistered: true,
              trainers: gym.trainers || [],
              membershipType: gym.membershipType,
              distance: gym.distance || "0.0 mi",
              source: "registered",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching registered gyms:", error);
        // Continue with empty registered gyms
      }
      
      // 2. Fetch popular workouts
      try {
        if (FireBase_DB) {
          const workoutsRef = collection(FireBase_DB, "workouts");
          const workoutsQuery = query(
            workoutsRef,
            orderBy("popularity", "desc"),
            limit(4)
          );
          const querySnapshot = await getDocs(workoutsQuery);

          if (!querySnapshot.empty) {
            localWorkouts = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Untitled Workout",
                duration: data.duration || "30 min",
                level: data.level || "Beginner",
                imageUrl: data.imageUrl || getRandomItem(WORKOUT_IMAGES),
                trainer: data.trainer || "GymBuddy Coach",
                description:
                  data.description || "A great workout for fitness enthusiasts",
              };
            });
          } else {
            localWorkouts = getMockWorkouts();
          }
        } else {
          localWorkouts = getMockWorkouts();
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
        localWorkouts = getMockWorkouts();
      }

      // 3 & 4. If we have location, fetch location-dependent data
      if (userLocation) {
        // 3. Fetch nearby gyms
        try {
          if (GOOGLE_PLACES_API_KEY) {
            const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=10000&type=establishment&keyword=gym,fitness&key=${GOOGLE_PLACES_API_KEY}`;
            
            const response = await fetch(placesUrl);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.results && data.results.length > 0) {
                // Filter and map gym data
                localNearbyGyms = data.results
                  .filter((place: any) => {
                    const isGymType = place.types?.some((type: string) => 
                      ['gym', 'health', 'fitness_center', 'sports_center'].includes(type)
                    );
                    const nameContainsGym = 
                      place.name.toLowerCase().includes('gym') || 
                      place.name.toLowerCase().includes('fitness') ||
                      place.name.toLowerCase().includes('workout') ||
                      place.name.toLowerCase().includes('athletic');
                      
                    return isGymType || nameContainsGym;
                  })
                  .slice(0, 10)
                  .map((place: any) => {
                    const distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      place.geometry.location.lat,
                      place.geometry.location.lng
                    );
                    
                    return {
                      id: `google-${place.place_id}`,
                      gymName: place.name,
                      location: {
                        address: place.vicinity || "No address",
                        city: extractCityFromAddress(place.vicinity || ""),
                        state: extractStateFromAddress(place.vicinity || ""),
                      },
                      rating: place.rating || 4.0,
                      imageUrl: place.photos?.[0]?.photo_reference
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                        : getRandomItem(GYM_IMAGES),
                      facilities: {
                        gymType: determineGymType(place.types || []),
                      },
                      distance: distance,
                      source: "google",
                    };
                  });
                  
                // Sort by distance
                localNearbyGyms.sort((a, b) => {
                  const distA = parseFloat(a.distance?.replace(" mi", "") || "999");
                  const distB = parseFloat(b.distance?.replace(" mi", "") || "999");
                  return distA - distB;
                });
                
                // Try fallback if we don't have enough results
                if (localNearbyGyms.length < 3) {
                  try {
                    const fallbackUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=15000&keyword=fitness&key=${GOOGLE_PLACES_API_KEY}`;
                    
                    const fallbackResponse = await fetch(fallbackUrl);
                    const fallbackData = await fallbackResponse.json();
                    
                    if (fallbackData.status === "OK" && fallbackData.results.length > 0) {
                      const existingIds = new Set(localNearbyGyms.map(gym => gym.id));
                      
                      const additionalGyms = fallbackData.results
                        .filter((place: any) => !existingIds.has(`google-${place.place_id}`))
                        .slice(0, 5)
                        .map((place: any) => {
                          const distance = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            place.geometry.location.lat,
                            place.geometry.location.lng
                          );
                          
                          return {
                            id: `google-${place.place_id}`,
                            gymName: place.name,
                            location: {
                              address: place.vicinity || "No address",
                              city: extractCityFromAddress(place.vicinity || ""),
                              state: extractStateFromAddress(place.vicinity || ""),
                            },
                            rating: place.rating || 4.0,
                            imageUrl: place.photos?.[0]?.photo_reference
                              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                              : getRandomItem(GYM_IMAGES),
                            facilities: {
                              gymType: determineGymType(place.types || []),
                            },
                            distance: distance,
                            source: "google",
                          };
                        });
                      
                      localNearbyGyms = [...localNearbyGyms, ...additionalGyms];
                      
                      // Re-sort with the new gyms
                      localNearbyGyms.sort((a, b) => {
                        const distA = parseFloat(a.distance?.replace(" mi", "") || "999");
                        const distB = parseFloat(b.distance?.replace(" mi", "") || "999");
                        return distA - distB;
                      });
                    }
                  } catch (fallbackError) {
                    console.error("Error in fallback search:", fallbackError);
                  }
                }
              }
            } else {
              console.error("Google Places API error:", response.status);
              hasLocationError = true;
            }
          }
        } catch (error) {
          console.error("Error fetching nearby gyms:", error);
          hasLocationError = true;
        }
        
        // 4. Fetch popular gyms
        try {
          if (GOOGLE_PLACES_API_KEY) {
            const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=25000&type=establishment&keyword=gym,fitness&rankby=prominence&key=${GOOGLE_PLACES_API_KEY}`;
            
            const response = await fetch(placesUrl);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.results && data.results.length > 0) {
                // Filter for 4+ rated gyms
                localPopularGyms = data.results
                  .filter((place: any) => {
                    const isGymType = place.types?.some((type: string) => 
                      ['gym', 'health', 'fitness_center', 'sports_center'].includes(type)
                    );
                    const nameContainsGym = 
                      place.name.toLowerCase().includes('gym') || 
                      place.name.toLowerCase().includes('fitness');
                      
                    return (isGymType || nameContainsGym) && place.rating >= 4.0;
                  })
                  .slice(0, 10)
                  .map((place: any) => {
                    return {
                      id: `google-${place.place_id}`,
                      gymName: place.name,
                      location: {
                        address: place.vicinity || "No address",
                        city: extractCityFromAddress(place.vicinity || ""),
                        state: extractStateFromAddress(place.vicinity || ""),
                      },
                      rating: place.rating || 4.0,
                      imageUrl: place.photos?.[0]?.photo_reference
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                        : getRandomItem(GYM_IMAGES),
                      facilities: {
                        gymType: determineGymType(place.types || []),
                      },
                      source: "google",
                    };
                  });
                
                // Sort by rating
                localPopularGyms.sort((a, b) => b.rating - a.rating);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching popular gyms:", error);
        }
      }
    } catch (error) {
      console.error("Error in data loading:", error);
    } finally {
      // Update all state at once to minimize re-renders
      setRegisteredGyms(localRegisteredGyms);
      setNearbyGyms(localNearbyGyms);
      setPopularGyms(localPopularGyms);
      setPopularWorkouts(localWorkouts);
      setLocationError(hasLocationError);
      setLoading(false);
    }
  };

  // Check if Firebase services are available
  useEffect(() => {
    const checkServices = () => {
      const services = isFirebaseReady();
      if (services.auth && services.db) {
        // console.log("Firebase services are available in UserHome");
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
      const initializeData = async () => {
        await getUserInfo();
        await loadUserLocation(); // This now handles fetching gyms
        await fetchPopularWorkouts(); // Fetch workouts separately
      };
      
      initializeData();
    }
  }, [servicesReady]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (servicesReady) {
        loadAllData();
      }
    }, [servicesReady]),
  );

  // Load user location - this is now the central location request
  const loadUserLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(false);
      
      // Request new location immediately
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(true);
        setLocationLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };
      
      // Save to state and AsyncStorage
      setUserLocation(newLocation);
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
      
      // Force fetch gyms with the new location
      console.log("Forcing gym data refresh with new location");
      await Promise.all([
        fetchNearbyGyms(newLocation),
        fetchPopularGyms(newLocation)
      ]);
      
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
     
      if (status !== "granted") {
        Alert.alert(
          "Location Access Required",
          "Please enable location services to find gyms near you.",
          [{ text: "OK" }],
        );
        setLocationLoading(false);
        return;
      }
      
      // Save to state and AsyncStorage
      setUserLocation(newLocation);
      await AsyncStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(newLocation),
      );
       // Immediately fetch gyms with the new location
    console.log("Location updated, fetching nearby and popular gyms...");
    await Promise.all([
      fetchNearbyGyms(newLocation),
      fetchPopularGyms(newLocation)
    ]);
    } catch (error) {
      console.error("Error getting location:", error);
      // Handle the error state in UI
      setLocationError(true);
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Calculate distance between coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): string => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1) + " mi";
  };
  
  // Generate unique ID for places without place_id
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  // Process place into gym result with types
  const processPlaceToGym = (
    place: {
      place_id?: string;
      name: string;
      vicinity?: string;
      formatted_address?: string;
      rating?: number;
      photos?: { photo_reference: string }[];
      geometry?: {
        location: {
          lat: number;
          lng: number;
        };
      };
      types?: string[];
    },
    distance?: string,
  ): GymResult => {
    // Default coordinates if geometry is missing
    const coordinates = place.geometry?.location || { lat: 0, lng: 0 };
    
    return {
      id: place.place_id ? `google-${place.place_id}` : `google-${generateId()}`,
      gymName: place.name,
      location: {
        address: place.vicinity || place.formatted_address || "",
        city: extractCityFromAddress(place.vicinity || place.formatted_address || ""),
        state: extractStateFromAddress(place.vicinity || place.formatted_address || ""),
      },
      rating: place.rating || 4.0,
      imageUrl: place.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        : getRandomItem(GYM_IMAGES),
      distance: distance || "",
      source: "google",
      geometry: {
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng
        }
      },
      gymType: determineGymType(place.types || [])
    };
  };
  
  // Extract city from address string
  const extractCityFromAddress = (address: string): string => {
    // Simple extraction - would need refinement for production
    const parts = address.split(",");
    return parts.length > 1 ? parts[parts.length - 2].trim() : "";
  };
  
  // Extract state from address string
  const extractStateFromAddress = (address: string): string => {
    // Simple extraction - would need refinement for production
    const parts = address.split(",");
    if (parts.length > 1) {
      const statePart = parts[parts.length - 1].trim();
      const stateMatch = statePart.match(/[A-Z]{2}/);
      return stateMatch ? stateMatch[0] : "";
    }
    return "";
  };
  
  // Better gym type classification
  const determineGymType = (types: string[]): string => {
    const typeMap = {
      gym: "Fitness Center",
      health: "Health Club",
      fitness_center: "Fitness Center",
      sports_center: "Sports Center"
    };
    
    // Check for specific gym types first
    if (types.some(t => t.includes("yoga"))) return "Yoga Studio";
    if (types.some(t => t.includes("pilates"))) return "Pilates Studio";
    if (types.some(t => t.includes("crossfit"))) return "CrossFit";
    if (types.some(t => t.includes("boxing"))) return "Boxing Gym";
    if (types.some(t => t.includes("martial"))) return "Martial Arts";
    
    // Then look for general gym types
    for (const type of types) {
      for (const [key, value] of Object.entries(typeMap)) {
        if (type.includes(key)) return value;
      }
    }
    
    return "Fitness Facility";
  };

  // Get user info from auth
  const getUserInfo = async () => {
    if (!FireBase_Auth || !FireBase_Auth.currentUser || !FireBase_DB) {
      setUserName("Fitness Enthusiast");
      return;
    }

    try {
      const currentUser = FireBase_Auth.currentUser;
      if (!currentUser?.uid) {
        setUserName("Fitness Enthusiast");
        return;
      }

      const userDoc = await getDoc(doc(FireBase_DB, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name?.split(" ")[0] || "Fitness Enthusiast");
      } else {
        setUserName("Fitness Enthusiast");
      }
    } catch (error) {
      console.error("Error getting user info:", error);
      setUserName("Fitness Enthusiast");
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

      console.log(
        "Making API request to:",
        `${API_URL}/Register/Gyms/${currentUser.uid}`,
      );

      const response = await axios.get(
        `${API_URL}/Register/Gyms/${currentUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        },
      );

      if (
        !response.data ||
        !response.data.gyms ||
        response.data.gyms.length === 0
      ) {
        setRegisteredGyms([]);
        return;
      }

      // Convert API response to GymData format
      const gyms: GymData[] = response.data.gyms.map((gym: any) => ({
        id: gym.id,
        gymName: gym.name || "Unnamed Gym",
        location: {
          address: gym.address || "No address",
          city: gym.city || "",
          state: gym.state || "",
        },
        rating: gym.rating || 4.5,
        imageUrl: gym.imageUrl || getRandomItem(GYM_IMAGES),
        facilities: {
          gymType: gym.gymType || "General Fitness",
          hasPool: gym.facilities?.hasPool || false,
          hasClasses: gym.facilities?.hasClasses || false,
          hasCardio: gym.facilities?.hasCardio || false,
          hasWeights: gym.facilities?.hasWeights || false,
        },
        isRegistered: true,
        trainers: gym.trainers || [],
        membershipType: gym.membershipType,
        distance: gym.distance || "0.0 mi",
        source: "registered",
      }));

      setRegisteredGyms(gyms);
    } catch (error) {
      console.error("Error fetching registered gyms in userHome:", error);
      setRegisteredGyms([]);
    }
  };

  // Fetch popular workouts
  const fetchPopularWorkouts = async () => {
    if (!FireBase_DB) {
      setPopularWorkouts(getMockWorkouts());
      return;
    }

    try {
      // First try to get from Firebase if available
      const workoutsRef = collection(FireBase_DB, "workouts");
      const workoutsQuery = query(
        workoutsRef,
        orderBy("popularity", "desc"),
        limit(4),
      );
      const querySnapshot = await getDocs(workoutsQuery);

      if (querySnapshot.empty) {
        // If no Firebase data, use our hardcoded workouts
        setPopularWorkouts(getMockWorkouts());
        return;
      }

      const workouts: WorkoutData[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled Workout",
          duration: data.duration || "30 min",
          level: data.level || "Beginner",
          imageUrl: data.imageUrl || getRandomItem(WORKOUT_IMAGES),
          trainer: data.trainer || "GymBuddy Coach",
          description:
            data.description || "A great workout for fitness enthusiasts",
        };
      });

      setPopularWorkouts(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      // Fallback to hardcoded workouts
      setPopularWorkouts(getMockWorkouts());
    }
  };

  // Get random distance - for mock data only
  const getRandomDistance = () => {
    const distances = ["0.8 mi", "1.2 mi", "1.7 mi", "2.3 mi", "3.1 mi"];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  // Mock data generators
  const getMockNearbyGyms = (): GymData[] => [
    {
      id: "nearby1",
      gymName: "FitZone Gym & Fitness",
      location: {
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
      },
      rating: 4.8,
      imageUrl: GYM_IMAGES[0],
      facilities: {
        gymType: "Full Service",
      },
      distance: "0.8 mi",
      source: "app",
    },
    {
      id: "nearby2",
      gymName: "PowerHouse Fitness Center",
      location: {
        address: "456 Elm St",
        city: "Somewhere",
        state: "CA",
      },
      rating: 4.6,
      imageUrl: GYM_IMAGES[1],
      facilities: {
        gymType: "Bodybuilding",
      },
      distance: "1.2 mi",
      source: "app",
    },
    {
      id: "nearby3",
      gymName: "Iron Paradise",
      location: {
        address: "789 Oak St",
        city: "Elsewhere",
        state: "CA",
      },
      rating: 4.9,
      imageUrl: GYM_IMAGES[2],
      facilities: {
        gymType: "Strength & Conditioning",
      },
      distance: "1.7 mi",
      source: "app",
    },
  ];

  const getMockPopularGyms = (): GymData[] => [
    {
      id: "popular1",
      gymName: "Elite Fitness Club",
      location: {
        address: "100 Fitness Blvd",
        city: "Fitnessopolis",
        state: "CA",
      },
      rating: 4.9,
      imageUrl: GYM_IMAGES[3],
      facilities: {
        gymType: "Luxury Fitness",
      },
      source: "app",
    },
    {
      id: "popular2",
      gymName: "CrossTrain Performance",
      location: {
        address: "200 Athletic Dr",
        city: "Sportsville",
        state: "CA",
      },
      rating: 4.8,
      imageUrl: GYM_IMAGES[0],
      facilities: {
        gymType: "CrossFit",
      },
      source: "app",
    },
    {
      id: "popular3",
      gymName: "Zen Fitness Studio",
      location: {
        address: "300 Peaceful Pl",
        city: "Harmony",
        state: "CA",
      },
      rating: 4.7,
      imageUrl: GYM_IMAGES[2],
      facilities: {
        gymType: "Yoga & Pilates",
      },
      source: "app",
    },
  ];

  // Also update getMockWorkouts to use the imported version:
  const getMockWorkouts = (): WorkoutData[] => {
    return POPULAR_WORKOUTS.slice(0, 4);
  };

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

  // Navigation handlers for "See All" screens
  const handleSeeAllNearbyGyms = useCallback(() => {
    navigation.navigate("NearbyGyms", { userLocation });
  }, [navigation, userLocation]);

  const handleSeeAllPopularGyms = useCallback(() => {
    navigation.navigate("PopularGyms", { userLocation });
  }, [navigation, userLocation]);

  const handleSeeAllRegisteredGyms = useCallback(() => {
    navigation.navigate("RegisteredGyms");
  }, [navigation]);

  // Memoized navigation handlers to prevent unnecessary re-renders
  const handleGymPress = useCallback(
    (gymId: string) => {
      // Extract the actual place ID if it starts with "google-"
      let placeId = gymId;
      let sourceType = "custom";
      
      if (gymId.startsWith("google-")) {
        placeId = gymId.substring(7); // Remove "google-" prefix
        sourceType = "google";
      }
      
      // Find the selected gym to pass more data if needed
      const selectedGym = [...nearbyGyms, ...popularGyms, ...registeredGyms]
        .find(gym => gym.id === gymId);
      
      // For registered gyms, navigate to internal details
      if (selectedGym?.source === "registered") {
        navigation.navigate("GymDetails", { gymId });
        return;
      }
      
      // For Google Places gyms, navigate to external details with the clean ID
      navigation.navigate("ExternalGymDetails", { 
        placeId: placeId,
        sourceType: sourceType,
        // Can also pass additional data if needed
        gymData: selectedGym
      });
    },
    [navigation, nearbyGyms, popularGyms, registeredGyms]
  );
  const handleWorkoutPress = useCallback(
    (workoutId: string) => {
      navigation.navigate("WorkoutDetails", { workoutId });
    },
    [navigation],
  );

  const handleExercisePress = useCallback(
    (exerciseId: string) => {
      navigation.navigate("ExerciseDetail", { exerciseId });
    },
    [navigation],
  );

  const handleProfilePress = useCallback(() => {
    navigation.navigate("UserProfile");
  }, [navigation]);

  // Handle search press - navigate to search screen
  const handleSearchPress = useCallback(() => {
    navigation.navigate("SearchResults");
  }, [navigation]);



  // If Firebase services are not ready
  if (!servicesReady) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0091EA" />
        <Text className="mt-4 text-gray-600">Initializing services...</Text>
      </SafeAreaView>
    );
  }
//   // Add this useEffect to debug loading issues
// useEffect(() => {
//   console.log("DATA STATE CHECK:", {
//     userLocation: !!userLocation,
//     nearbyGyms: nearbyGyms.length,
//     popularGyms: popularGyms.length,
//     locationError,
//     servicesReady,
//     loading
//   });
// }, [userLocation, nearbyGyms, popularGyms, locationError, servicesReady, loading]);

  // Main component render
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={THEME.colors.background}
      />

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
            android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
          >
            <View className="w-[60px] h-[60px] bg-gray-200 rounded-full justify-center items-center">
  <Text className="text-2xl font-bold text-gray-700">
    {userName.charAt(0).toUpperCase() || "U"}
  </Text>
</View>
          </Pressable>
        </View>

        {/* Location indicator */}
<View className="flex-row items-center mt-2">
  {/* Wrap Ionicons in View */}
  <View>
    <Ionicons
      name="location"
      size={16}
      color={userLocation ? THEME.colors.green : THEME.colors.primary}
    />
  </View>
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
  {/* Wrap Ionicons in View */}
  <View>
    <Ionicons name="search" size={20} color="#6b7280" />
  </View>
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

          {/* Your Gyms Section - Shows gyms the user has signed up for */}
          <View className="mt-2 mb-6">
            <SectionHeader
              title="Your Gyms"
              onSeeAllPress={handleSeeAllRegisteredGyms}
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
                    //@ts-ignore
                    showMembership={true}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="px-6">
                <EmptyState
                  icon="fitness-outline"
                  title="No registered gyms"
                  message="Register with your favorite gyms to see them here."
                  actionLabel="Find Gyms"
                  onAction={() => navigation.navigate("AllGyms")}
                />
              </View>
            )}
          </View>

          {/* Nearby Gyms Section - Strictly from Google Maps */}
          <View className="mb-6">
          <SectionHeader
            title="Nearby Gyms"
            onSeeAllPress={handleSeeAllNearbyGyms}
          />
          
    
    {locationLoading ? (
      <View className="pl-6 py-3 flex-row items-center">
        <ActivityIndicator size="small" color={THEME.colors.primary} />
        <Text className="ml-2 text-sm text-gray-500">Finding gyms near you...</Text>
      </View>
    ) : locationError || !userLocation ? (
      <View className="px-6">
        <TouchableOpacity
          className="bg-blue-50 py-3 px-4 rounded-lg flex-row items-center justify-center"
          onPress={loadUserLocation}
        >
          <View>
            <Ionicons
              name="location-outline"
              size={20}
              color={THEME.colors.blue}
            />
          </View>
          <Text className="ml-2 text-blue-600">
            Enable location to see gyms near you
          </Text>
        </TouchableOpacity>
      </View>
    ) :  (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-6"
      >
        {nearbyGyms.length > 0 ? (
          nearbyGyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onPress={() => handleGymPress(gym.id)}
              showDistance={true}
            />
          ))
        ) : (
          <View className="pl-6 pr-6 py-4">
            <EmptyState
              icon="location-outline"
              title="No gyms found nearby"
              message="Try refreshing your location or expanding your search area."
              actionLabel="Refresh Location"
              onAction={loadUserLocation}
            />
          </View>
        )}
      </ScrollView>
    )}
  </View>

{/* Popular Gyms Section - Fixed with proper icon wrapping and retry functionality */}
<View className="mb-6">
          <SectionHeader
            title="Popular Gyms"
            onSeeAllPress={handleSeeAllPopularGyms}
          />
    
    {!userLocation ? (
      <View className="px-6">
        <TouchableOpacity
          className="bg-blue-50 py-3 px-4 rounded-lg flex-row items-center justify-center"
          onPress={loadUserLocation}
        >
          <View>
            <Ionicons
              name="star-outline"
              size={20}
              color={THEME.colors.blue}
            />
          </View>
          <Text className="ml-2 text-blue-600">
            Enable location to see popular gyms
          </Text>
        </TouchableOpacity>
      </View>
    ) : popularGymsLoading ? (
      <View className="pl-6 py-3 flex-row items-center">
        <ActivityIndicator size="small" color={THEME.colors.primary} />
        <Text className="ml-2 text-sm text-gray-500">Finding popular gyms...</Text>
      </View>
    ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-6"
      >
        {popularGyms.length > 0 ? (
          popularGyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onPress={() => handleGymPress(gym.id)}
              //@ts-ignore
              showRating={true}
            />
          ))
        ) : (
          <View className="pl-6 pr-6 py-4">
            <EmptyState
              icon="star-outline"
              title="No popular gyms found"
              message="Try again later or change your location."
              actionLabel="Refresh"
              onAction={() => fetchPopularGyms(userLocation)}
            />
          </View>
        )}
      </ScrollView>
    )}
        </View>


          {/* Workouts Section */}
          <View className="mb-6">
            <SectionHeader title="Popular Workouts" />
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
                    description:
                      workout.description || "No description available",
                    // Add the count of exercises if available
                    exerciseCount: workout.exercises?.length || 0,
                  }}
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Motivational Quote Section */}
          <View className="mx-6 mb-8">
            <ImageBackground
              source={{
                uri: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3ltJTIwbW90aXZhdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60", 
              }}
              className="rounded-2xl overflow-hidden h-[180px] justify-center"
              imageStyle={{ opacity: 0.7, backgroundColor: "#000" }}
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