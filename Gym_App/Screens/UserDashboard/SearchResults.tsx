import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, limit } from "firebase/firestore";
import { FireBase_DB, FireBase_Auth } from "../../Backend/firebase";
import { GOOGLE_PLACES_API_KEY } from '@env';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import axios from 'axios';
import { API_URL } from '@env';
import { GYM_IMAGES } from './constants/assetUrls';
import { getRandomItem } from './utils/helpers';
import { THEME } from './constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  facilities?: {
    gymType?: string;
    hasPool?: boolean;
    hasClasses?: boolean;
    hasCardio?: boolean;
    hasWeights?: boolean;
  };
  source: 'app' | 'google' | 'registered';
  isRegistered?: boolean;
  distance?: string;
  trainers?: any[];
  membershipType?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

type RootStackParamList = {
  SearchResults: { query?: string };
  GymDetails: { gymId: string };
  ExternalGymDetails: { placeId: string };
  UserHome: undefined;
};

type SearchResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SearchResults'
>;

type SearchResultsScreenRouteProp = RouteProp<
  RootStackParamList,
  'SearchResults'
>;

type Props = {
  navigation: SearchResultsScreenNavigationProp;
  route: SearchResultsScreenRouteProp;
};

// User location storage key - same as in UserHome.tsx
const LOCATION_STORAGE_KEY = 'userLocation';

const SearchResults: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route.params?.query || '';
  
  const [searchText, setSearchText] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<GymData[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load saved user location from AsyncStorage
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (storedLocation) {
          setUserLocation(JSON.parse(storedLocation));
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
    };
    
    loadSavedLocation();
  }, []);
  
  // Helper function to calculate distance between two coordinates (in miles)
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
  
  // Fetch gyms from API and database
  const fetchGyms = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const results: GymData[] = [];
      
      // Get user's registered gyms if authenticated
      const currentUser = FireBase_Auth.currentUser;
      if (currentUser) {
        try {
          const response = await axios.get(
            `${API_URL}/Register/gyms/${currentUser.uid}`,
            {
              headers: {
                'Authorization': `Bearer ${await currentUser.getIdToken()}`
              }
            }
          );
          
          if (response.data?.gyms?.length > 0) {
            const registeredGyms = response.data.gyms
              .filter((gym: any) => 
                gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (gym.address && gym.address.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((gym: any) => ({
                id: gym.id,
                gymName: gym.name || 'Unnamed Gym',
                location: {
                  address: gym.address || 'No address',
                  city: gym.city || '',
                  state: gym.state || ''
                },
                rating: gym.rating || 4.5,
                imageUrl: gym.imageUrl || getRandomItem(GYM_IMAGES),
                facilities: gym.facilities || {},
                source: 'registered',
                isRegistered: true,
                trainers: gym.trainers || [],
                membershipType: gym.membershipType,
                distance: gym.distance || '0.0 mi'
              }));
            
            results.push(...registeredGyms);
          }
        } catch (error) {
          console.error('Error fetching registered gyms:', error);
        }
      }
      
      // Fetch gyms from database if needed based on filter
      if (selectedFilter === 'all' || selectedFilter === 'nearby') {
        try {
          const gymsRef = collection(FireBase_DB, 'gyms');
          const gymsQuery = query(gymsRef, limit(20));
          const querySnapshot = await getDocs(gymsQuery);
          
          if (!querySnapshot.empty) {
            const appGyms = querySnapshot.docs
              .map(doc => {
                const data = doc.data();
                
                // Calculate distance if user location is available and gym has coordinates
                let distance;
                if (userLocation && data.coordinates) {
                  const actualDistance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    data.coordinates.latitude,
                    data.coordinates.longitude
                  );
                  distance = `${actualDistance.toFixed(1)} mi`;
                }
                
                return {
                  id: doc.id,
                  gymName: data.gymName || 'Unnamed Gym',
                  location: data.location || { address: 'No address', city: '', state: '' },
                  rating: data.rating || 4.5,
                  imageUrl: data.imageUrl || getRandomItem(GYM_IMAGES),
                  facilities: data.facilities || {},
                  distance: distance,
                  source: 'app' as const
                };
              })
              .filter(gym => 
                gym.gymName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gym.location.address.toLowerCase().includes(searchQuery.toLowerCase())
              );
            
            // Filter out duplicates from registered gyms
            const uniqueAppGyms = appGyms.filter(appGym => 
              !results.some(existingGym => existingGym.id === appGym.id)
            );
            
            results.push(...uniqueAppGyms);
          }
        } catch (error) {
          console.error('Error fetching app gyms:', error);
        }
      }
      
      // Get Google Places results with location bias if available
      try {
        let placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}+gym&key=${GOOGLE_PLACES_API_KEY}`;
        
        // Add location bias if we have user location
        if (userLocation) {
          placesUrl += `&location=${userLocation.latitude},${userLocation.longitude}&radius=50000`;
        }
        
        const placesResponse = await fetch(placesUrl);
        
        if (placesResponse.ok) {
          const data = await placesResponse.json();
          
          const googleGyms = data.results
            .filter((place: any) => 
              place.types.includes('gym') || 
              place.name.toLowerCase().includes('gym') ||
              place.name.toLowerCase().includes('fitness')
            )
            .map((place: any) => {
              // Calculate distance if we have user location and place has location
              let distance;
              if (userLocation && place.geometry?.location) {
                const placeLat = place.geometry.location.lat;
                const placeLng = place.geometry.location.lng;
                distance = calculateDistance(
                  userLocation.latitude, 
                  userLocation.longitude, 
                  placeLat, 
                  placeLng
                );
              }
              
              return {
                id: `google-${place.place_id}`,
                gymName: place.name,
                location: {
                  address: place.formatted_address,
                  city: '', 
                  state: ''
                },
                rating: place.rating || 4.0,
                imageUrl: place.photos?.[0]?.photo_reference 
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                  : getRandomItem(GYM_IMAGES),
                facilities: {},
                distance: distance ? `${distance.toFixed(1)} mi` : undefined,
                source: 'google' as const
              };
            });
          
          // Filter out any duplicates
          const uniqueGoogleGyms = googleGyms.filter((googleGym: { gymName: string; location: { address: string; }; }) => 
            !results.some(existingGym => 
              existingGym.gymName.toLowerCase() === googleGym.gymName.toLowerCase() &&
              existingGym.location.address.toLowerCase() === googleGym.location.address.toLowerCase()
            )
          );
          
          results.push(...uniqueGoogleGyms);
        }
      } catch (error) {
        console.error('Error fetching from Google Places:', error);
      }
      
      // Filter results based on selected filter
      let filteredResults = results;
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'registered') {
          filteredResults = results.filter(gym => gym.source === 'registered');
        } else if (selectedFilter === 'nearby') {
          // Sort by actual distance if available
          filteredResults = results.sort((a, b) => {
            const aDistance = a.distance ? parseFloat(a.distance) : 999;
            const bDistance = b.distance ? parseFloat(b.distance) : 999;
            return aDistance - bDistance;
          });
        } else if (selectedFilter === 'highRated') {
          filteredResults = results.filter(gym => (gym.rating || 0) >= 4.5);
        } else if (['weights', 'cardio', 'pool', 'classes'].includes(selectedFilter)) {
          // Filter by facility - can only apply to app and registered gyms with known facilities
          const facilityMap: Record<string, string> = {
            'weights': 'hasWeights',
            'cardio': 'hasCardio',
            'pool': 'hasPool',
            'classes': 'hasClasses'
          };
          
          filteredResults = results.filter(gym => 
            gym.source !== 'google' && 
            gym.facilities && 
            gym.facilities[facilityMap[selectedFilter] as keyof typeof gym.facilities]
          );
        }
      }
      
      // Sort results - registered first, then by relevance/rating
      filteredResults.sort((a, b) => {
        if (a.source === 'registered' && b.source !== 'registered') return -1;
        if (a.source !== 'registered' && b.source === 'registered') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching gyms:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, userLocation]);
  
  // Fetch Google Place predictions for autocomplete
  const fetchPredictions = useCallback(async (text: string) => {
    if (!text.trim()) {
      setPredictions([]);
      return;
    }
    
    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&types=establishment&strictbounds=false&key=${GOOGLE_PLACES_API_KEY}`;
      
      // Add location bias if we have user location
      if (userLocation) {
        url += `&location=${userLocation.latitude},${userLocation.longitude}&radius=50000`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        // Filter to gym-related predictions
        const gymPredictions = data.predictions
          .filter((prediction: any) => 
            prediction.description.toLowerCase().includes('gym') ||
            prediction.description.toLowerCase().includes('fitness') ||
            prediction.types.some((type: string) => 
              type === 'gym' || type === 'health' || type === 'establishment'
            )
          )
          .slice(0, 5);
          
        setPredictions(gymPredictions);
      }
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      setPredictions([]);
    }
  }, [userLocation]);
  
  // Handle search text change with debouncing
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Fetch predictions immediately
    fetchPredictions(text);
    
    // Debounce the full search
    searchTimeoutRef.current = setTimeout(() => {
      fetchGyms(text);
    }, 500);
  };
  
  // Handle prediction selection
  const handlePredictionSelect = (prediction: any) => {
    setSearchText(prediction.description);
    setPredictions([]);
    fetchGyms(prediction.description);
  };
  
  // Handle filter selection
  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    fetchGyms(searchText);
  };
  
  // Handle gym selection
  const handleGymSelect = (gym: GymData) => {
    if (gym.source === 'google') {
      navigation.navigate('ExternalGymDetails', { placeId: gym.id.replace('google-', '') });
    } else {
      navigation.navigate('GymDetails', { gymId: gym.id });
    }
  };
  
  // Initial search if query provided
  useEffect(() => {
    if (initialQuery) {
      fetchGyms(initialQuery);
    }
  }, [initialQuery, fetchGyms]);
  
  const getFilterLabel = (filter: string) => {
    switch(filter) {
      case 'all': return 'All';
      case 'nearby': return 'Nearby';
      case 'registered': return 'My Gyms';
      case 'weights': return 'Weights';
      case 'cardio': return 'Cardio';
      case 'pool': return 'Swimming';
      case 'classes': return 'Classes';
      case 'highRated': return '4.5+';
      default: return filter;
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Pressable
          className="p-2 mr-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <View className="flex-1 flex-row items-center px-3 py-2 bg-gray-100 rounded-lg">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search gyms, fitness centers..."
            value={searchText}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchText ? (
            <Pressable 
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
                setPredictions([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          ) : null}
        </View>
      </View>
      
      {/* Location Indicator */}
      {userLocation && (
        <View className="flex-row items-center px-4 py-2 bg-blue-50">
          <Ionicons name="location" size={16} color={THEME.colors.blue} />
          <Text className="ml-1 text-sm text-blue-700">
            Using your location for better results
          </Text>
        </View>
      )}
      
      {/* Predictions (Google Places Autocomplete) */}
      {predictions.length > 0 && (
        <View className="mx-4 -mt-2 bg-white border border-gray-200 rounded-lg shadow-sm z-10">
          {predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.place_id}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
              onPress={() => handlePredictionSelect(prediction)}
            >
              <Ionicons name="location-outline" size={16} color="#6b7280" className="mr-3" />
              <Text className="text-sm text-gray-800">
                {prediction.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Filter Chips */}
      <View className="px-4 py-3">
        <FlatList
          horizontal
          data={['all', 'nearby', 'registered', 'weights', 'cardio', 'pool', 'classes', 'highRated']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-3 py-1.5 mr-2 rounded-full ${selectedFilter === item ? 'bg-blue-600' : 'bg-gray-100'}`}
              onPress={() => handleFilterSelect(item)}
            >
              <Text 
                className={`text-sm ${selectedFilter === item ? 'text-white' : 'text-gray-600'}`}
              >
                {getFilterLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Results */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text className="mt-4 text-base text-gray-500">
            Searching for gyms...
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mx-4 mb-4 bg-white rounded-lg overflow-hidden shadow"
              onPress={() => handleGymSelect(item)}
            >
              <View className="relative h-36">
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-full"
                />
                {item.source === 'google' && (
                  <View className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black bg-opacity-60">
                    <Text className="text-xs font-bold text-white">
                      Google
                    </Text>
                  </View>
                )}
                {item.source === 'registered' && (
                  <View className="absolute top-2 right-2 px-2 py-1 rounded-md bg-blue-600">
                    <Text className="text-xs font-bold text-white">
                      My Gym
                    </Text>
                  </View>
                )}
                {item.trainers && item.trainers.length > 0 && (
                  <View className="absolute bottom-2 right-2 flex-row items-center px-2 py-1 rounded-md bg-green-600">
                    <Ionicons name="person" size={12} color="white" />
                    <Text className="ml-1 text-xs font-bold text-white">
                      {item.trainers.length} Trainer{item.trainers.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
              <View className="p-3">
                <Text className="text-base font-bold text-gray-800 mb-1">
                  {item.gymName}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  {item.location.address}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-amber-500 mr-1">
                    {'★'.repeat(Math.round(item.rating || 0))}
                  </Text>
                  <Text className="text-sm text-gray-800 mr-2">
                    {item.rating}
                  </Text>
                  {item.distance && (
                    <Text className="ml-auto text-sm text-gray-500">
                      {item.distance}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : searchText ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="search-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-base text-gray-500 text-center">
            No gyms found matching your search. Try different keywords or filters.
          </Text>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="fitness-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-base text-gray-500 text-center">
            Search for gyms by name, location, or facilities
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchResults;