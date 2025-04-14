// NearbyGymsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GymListCard } from "../components/GymListCard";
import { EmptyState } from "../components/EmptyState";
import { THEME } from "./constants/theme";
import { GOOGLE_PLACES_API_KEY } from "@env";
import * as Location from "expo-location";
import { GYM_IMAGES } from "./constants/assetUrls";
import { getRandomItem } from "./utils/helpers";
 
import { API_URL } from "@env";
import axios from "axios";
import { FireBase_Auth } from "../../Backend/firebase";

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
    gymType: string;
    [key: string]: any;
  };
  distance?: string;
  source?: string;
}

const NearbyGymsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<GymData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userLocation, setUserLocation] = useState<any>(route.params?.userLocation || null);
  
  // Get more detailed user location on component mount
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    } else {
      fetchNearbyGyms();
    }
  }, [userLocation]);

  // Update filtered gyms whenever gyms or search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGyms(gyms);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = gyms.filter(
        gym => 
          gym.gymName.toLowerCase().includes(query) ||
          gym.location.address.toLowerCase().includes(query) ||
          gym.location.city.toLowerCase().includes(query) ||
          (gym.facilities?.gymType && gym.facilities.gymType.toLowerCase().includes(query))
      );
      setFilteredGyms(filtered);
    }
  }, [gyms, searchQuery]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Access Required",
          "Please enable location services to find gyms near you.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setLoading(false);
    }
  };

  // Calculate distance between coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
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

  // Extract city from address string
  const extractCityFromAddress = (address: string): string => {
    const parts = address.split(",");
    return parts.length > 1 ? parts[parts.length - 2].trim() : "";
  };

  // Extract state from address string
  const extractStateFromAddress = (address: string): string => {
    const parts = address.split(",");
    if (parts.length > 1) {
      const statePart = parts[parts.length - 1].trim();
      const stateMatch = statePart.match(/[A-Z]{2}/);
      return stateMatch ? stateMatch[0] : "";
    }
    return "";
  };

  // Determine gym type based on Google Place types
  const determineGymType = (types: string[]): string => {
    if (types.some(t => t.includes("crossfit"))) return "CrossFit";
    if (types.some(t => t.includes("yoga"))) return "Yoga Studio";
    if (types.includes("gym") || types.includes("fitness_center")) return "Fitness Center";
    if (types.includes("health")) return "Health Club";
    return "Fitness Facility";
  };

  // Get random item from array
  const getRandomItem = (array: any[]): any => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Fetch nearby gyms from Google Places API
  const fetchNearbyGyms = async () => {
    if (!userLocation || !GOOGLE_PLACES_API_KEY) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Using a larger radius for the full list view
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=20000&type=gym&key=${GOOGLE_PLACES_API_KEY}`;
      
      const placesResponse = await fetch(placesUrl);
      
      if (!placesResponse.ok) {
        console.error("Google Places API error:", placesResponse.status);
        setLoading(false);
        return;
      }
      
      const data = await placesResponse.json();
      
      if (!data.results || data.results.length === 0) {
        setGyms([]);
        setLoading(false);
        return;
      }
      
      const googleGyms = data.results
        .filter(
          (place: any) =>
            place.types?.some((type: string) => 
              ['gym', 'health', 'fitness_center', 'sports_center'].includes(type)
            ) ||
            place.name.toLowerCase().includes("gym") ||
            place.name.toLowerCase().includes("fitness")
        )
        .map((place: any) => {
          // Calculate distance
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
      googleGyms.sort((a: any, b: any) => {
        const distA = parseFloat(a.distance?.replace(" mi", "") || "999");
        const distB = parseFloat(b.distance?.replace(" mi", "") || "999");
        return distA - distB;
      });
      
      setGyms(googleGyms);
      setFilteredGyms(googleGyms);
    } catch (error) {
      console.error("Error fetching nearby gyms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refreshing
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearchQuery("");
    await fetchNearbyGyms();
  }, [userLocation]);

  // Handle gym press - FIXED to navigate properly based on gym source
  const handleGymPress = (gymId: string) => {
    // Extract the actual place ID if it starts with "google-"
    if (gymId.startsWith("google-")) {
      const placeId = gymId.substring(7); // Remove "google-" prefix
      const selectedGym = gyms.find(gym => gym.id === gymId);
      
      navigation.navigate("ExternalGymDetails", { 
        placeId: placeId,
        sourceType: "google",
        gymData: selectedGym
      });
    } else {
      // For internally registered gyms
      navigation.navigate("GymDetails", { gymId });
    }
  };

  // Handle search query change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Render list item
  const renderGymItem = ({ item }: { item: GymData }) => (
    <GymListCard 
      gym={item} 
      onPress={() => handleGymPress(item.id)} 
      showDistance={true}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4"
        >
          <View>
          <Ionicons name="arrow-back" size={24} color="#000" /></View>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Nearby Gyms</Text>
      </View>
      
      
      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text className="mt-4 text-gray-600">Finding gyms near you...</Text>
        </View>
      ) : filteredGyms.length > 0 ? (
        <FlatList
          data={filteredGyms}
          renderItem={renderGymItem}
          keyExtractor={(item:any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.colors.primary]}
            />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          {searchQuery ? (
            <EmptyState
              icon="search-outline"
              title="No matching gyms found"
              message="Try adjusting your search or check for gyms in a wider area."
              actionLabel="Clear Search"
              onAction={clearSearch}
            />
          ) : (
            <EmptyState
              icon="location-outline"
              title="No gyms found nearby"
              message="Try refreshing your location or expanding your search area."
              actionLabel="Refresh"
              onAction={fetchNearbyGyms}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export { NearbyGymsScreen };



const PopularGymsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [gyms, setGyms] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(route.params?.userLocation || null);
  
  // Get more detailed user location on component mount
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    } else {
      fetchPopularGyms();
    }
  }, [userLocation]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Access Required",
          "Please enable location services to find gyms near you.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error getting location:", error);
      setLoading(false);
    }
  };

  // Extract city from address string
  const extractCityFromAddress = (address: string): string => {
    const parts = address.split(",");
    return parts.length > 1 ? parts[parts.length - 2].trim() : "";
  };

  // Extract state from address string
  const extractStateFromAddress = (address: string): string => {
    const parts = address.split(",");
    if (parts.length > 1) {
      const statePart = parts[parts.length - 1].trim();
      const stateMatch = statePart.match(/[A-Z]{2}/);
      return stateMatch ? stateMatch[0] : "";
    }
    return "";
  };

  // Determine gym type based on Google Place types
  const determineGymType = (types: string[]): string => {
    if (types.includes("gym")) return "Fitness Center";
    if (types.includes("health")) return "Health Club";
    if (types.some(type => type.includes("yoga"))) return "Yoga Studio";
    if (types.some(type => type.includes("crossfit"))) return "CrossFit";
    return "Fitness Facility";
  };

  // Fetch popular gyms from Google Places API
  const fetchPopularGyms = async () => {
    if (!userLocation || !GOOGLE_PLACES_API_KEY) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Using a larger radius for the full list view
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=30000&type=gym&rankby=prominence&key=${GOOGLE_PLACES_API_KEY}`;
      
      const placesResponse = await fetch(placesUrl);
      
      if (!placesResponse.ok) {
        console.error("Google Places API error:", placesResponse.status);
        setLoading(false);
        return;
      }
      
      const data = await placesResponse.json();
      
      if (!data.results || data.results.length === 0) {
        setGyms([]);
        setLoading(false);
        return;
      }
      
      const highRatedGyms = data.results
        .filter(
          (place: any) =>
            (place.types?.includes("gym") ||
            place.name.toLowerCase().includes("gym") ||
            place.name.toLowerCase().includes("fitness")) &&
            place.rating >= 4.0  // Only 4+ rated gyms
        )
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
      highRatedGyms.sort((a: any, b: any) => b.rating - a.rating);
      
      setGyms(highRatedGyms);
    } catch (error) {
      console.error("Error fetching popular gyms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refreshing
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPopularGyms();
  }, [userLocation]);

  // Handle gym press
  const handleGymPress = (gymId: string) => {
    navigation.navigate("GymDetails", { gymId });
  };

  // Render list item
  const renderGymItem = ({ item }: { item: any }) => (
    <GymListCard 
      gym={item} 
      onPress={() => handleGymPress(item.id)} 
      showRating={true}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Popular Gyms</Text>
      </View>
      
      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text className="mt-4 text-gray-600">Finding popular gyms...</Text>
        </View>
      ) : gyms.length > 0 ? (
        <FlatList
          data={gyms}
          renderItem={renderGymItem}
          keyExtractor={(item:any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
            refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[THEME.colors.primary]}
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center px-6">
              <EmptyState
                icon="star-outline"
                title="No popular gyms found"
                message="Try refreshing your location or expanding your search area."
                actionLabel="Refresh"
                onAction={fetchPopularGyms}
              />
            </View>
          )}
        </SafeAreaView>
      );
    };
    
    export {PopularGymsScreen};
    
    // RegisteredGymsScreen.tsx
 
    
    const RegisteredGymsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
      const [loading, setLoading] = useState<boolean>(true);
      const [refreshing, setRefreshing] = useState<boolean>(false);
      const [gyms, setGyms] = useState<any[]>([]);
    
      // Fetch registered gyms on component mount
      useEffect(() => {
        fetchRegisteredGyms();
      }, []);
    
      // Fetch gyms the user has registered with
      const fetchRegisteredGyms = async () => {
        if (!FireBase_Auth || !FireBase_Auth.currentUser) {
          setGyms([]);
          setLoading(false);
          return;
        }
    
        try {
          setLoading(true);
    
          const currentUser = FireBase_Auth.currentUser;
          if (!currentUser) {
            setGyms([]);
            setLoading(false);
            return;
          }
    
          let token;
          try {
            token = await currentUser.getIdToken();
          } catch (tokenError) {
            console.error("Error getting token:", tokenError);
            setGyms([]);
            setLoading(false);
            return;
          }
    
          const response = await axios.get(
            `${API_URL}/Register/Gyms`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
            }
          );
          console.log("Registered gyms response:", response.data);
    
          if (
            !response.data ||
            !response.data.gyms ||
            response.data.gyms.length === 0
          ) {
            setGyms([]);
            setLoading(false);
            return;
          }
    
          // Convert API response to GymData format
          const registeredGyms = response.data.gyms.map((gym: any) => ({
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
    
          setGyms(registeredGyms);
        } catch (error) {
          console.error("Error fetching registered gyms:", error);
          setGyms([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };
    
      // Handle refreshing
      const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRegisteredGyms();
      }, []);
    
      // Handle gym press
      const handleGymPress = (gymId: string) => {
        navigation.navigate("GymDetails", { gymId });
      };
    
      // Handle find gyms press
      const handleFindGyms = () => {
        navigation.navigate("AllGyms");
      };
    
      // Render list item
      const renderGymItem = ({ item }: { item: any }) => (
        <GymListCard 
          gym={item} 
          onPress={() => handleGymPress(item.id)} 
          showMembership={true}
        />
      );
    
      return (
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">Your Gyms</Text>
          </View>
          
          {/* Content */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text className="mt-4 text-gray-600">Loading your gyms...</Text>
            </View>
          ) : gyms.length > 0 ? (
            <FlatList
              data={gyms}
              renderItem={renderGymItem}
              keyExtractor={(item:any) => item.id}
              contentContainerStyle={{ padding: 16 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[THEME.colors.primary]}
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center px-6">
                 {/* <Ionicons name="fitness-outline" size={20} color="#0091EA" /> */}
              <EmptyState
               //@ts-ignore
               icon="fitness-outline"
                title="No registered gyms"
                message="You haven't registered with any gyms yet. Register with gyms to see them here."
                actionLabel="Find Gyms"
                onAction={handleFindGyms}
              />
            </View>
          )}
        </SafeAreaView>
      );
    };
    
    export { RegisteredGymsScreen };