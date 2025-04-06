import "react-native-get-random-values";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { GOOGLE_PLACES_API_KEY } from "@env";
import { GYM_IMAGES } from "./constants/assetUrls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GymSplineView from "../components/GymSplineView";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

// Define types
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

type SearchResultsProps = NativeStackScreenProps<
  RootStackParamList,
  "SearchResults"
>;

// Helper functions
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const getRandomItem = <T extends any>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const SearchResults: React.FC<SearchResultsProps> = ({ navigation, route }) => {
  // State with proper type annotations
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<GymResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<string>("undetermined");
  const [showSplineView, setShowSplineView] = useState<boolean>(false);
  const [selectedGym, setSelectedGym] = useState<GymResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Location permission and fetching with types
  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status === "granted" ? "granted" : "denied");

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const newLocation: Location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(newLocation);
        await AsyncStorage.setItem("userLocation", JSON.stringify(newLocation));
      }
    } catch (error) {
      setErrorMsg("Could not get your location. Please check permissions.");
      console.error("Error requesting location permission:", error);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    const initLocation = async (): Promise<void> => {
      try {
        const storedLocation = await AsyncStorage.getItem("userLocation");
        if (storedLocation) {
          setUserLocation(JSON.parse(storedLocation));
        } else {
          requestLocationPermission();
        }
      } catch (error) {
        console.error("Error initializing location:", error);
        requestLocationPermission();
      }
    };

    initLocation();
  }, []);

  // Distance calculation with types
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
    return (R * c).toFixed(1) + " mi";
  };

  // Process place into gym result with types
  const processPlaceToGym = (
    place: GooglePlace,
    distance?: string,
  ): GymResult => ({
    id: place.place_id ? `google-${place.place_id}` : `google-${generateId()}`,
    gymName: place.name,
    location: {
      address: place.vicinity || place.formatted_address || "",
      city: "",
      state: "",
    },
    rating: place.rating || 4.0,
    imageUrl: place.photos?.[0]?.photo_reference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      : getRandomItem(GYM_IMAGES),
    distance,
    source: "google",
    geometry: place.geometry,
  });

  // Search nearby gyms with types
  const searchNearbyGyms = async (): Promise<void> => {
    if (!userLocation) {
      setErrorMsg("Location is required to search nearby gyms");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=10000&type=gym&keyword=fitness&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(nearbyUrl);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`API returned status: ${data.status}`);
      }

      const nearbyGyms: GymResult[] = data.results.map((place: GooglePlace) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.geometry?.location.lat || 0,
          place.geometry?.location.lng || 0,
        );

        return processPlaceToGym(place, distance);
      });

      setSearchResults(nearbyGyms);
    } catch (error) {
      console.error("Error searching nearby gyms:", error);
      setErrorMsg("Could not load nearby gyms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search gyms by query with types
  const searchGyms = async (placeDetails: GooglePlaceDetail): Promise<void> => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const results: GymResult[] = [];

      if (placeDetails) {
        let distance: string | undefined;
        if (userLocation && placeDetails.geometry?.location) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            placeDetails.geometry.location.lat,
            placeDetails.geometry.location.lng,
          );
        }

        results.push(
          processPlaceToGym(placeDetails as unknown as GooglePlace, distance),
        );
      }

      // Add nearby gyms if we have user location and less than 5 results
      if (userLocation && results.length < 5) {
        try {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=10000&type=gym&keyword=fitness&key=${GOOGLE_PLACES_API_KEY}`;

          const response = await fetch(nearbyUrl);
          const data = await response.json();

          if (data.status === "OK") {
            const nearbyGyms: GymResult[] = data.results.map(
              (place: GooglePlace) => {
                const distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  place.geometry?.location.lat || 0,
                  place.geometry?.location.lng || 0,
                );

                return processPlaceToGym(place, distance);
              },
            );

            results.push(...nearbyGyms);
          }
        } catch (nearbyError) {
          console.error("Error fetching nearby gyms:", nearbyError);
          // Continue with current results
        }
      }

      // Apply filters
      let filteredResults = results;
      if (selectedFilter === "nearby" && userLocation) {
        filteredResults = results.sort((a, b) => {
          const aDistance = a.distance
            ? parseFloat(a.distance.split(" ")[0])
            : 999;
          const bDistance = b.distance
            ? parseFloat(b.distance.split(" ")[0])
            : 999;
          return aDistance - bDistance;
        });
      } else if (selectedFilter === "highRated") {
        filteredResults = results.filter((gym) => gym.rating >= 4.5);
      }

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching gyms:", error);
      setErrorMsg("Could not complete your search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers with types
  const handleGymSelect = (gym: GymResult): void => {
    setSelectedGym(gym);
    setShowSplineView(true);
  };

  const handleFilterSelect = (filterId: string): void => {
    setSelectedFilter(filterId);

    // Immediately apply the filter if we have results
    if (searchResults.length > 0) {
      let filtered = [...searchResults];

      if (filterId === "nearby" && userLocation) {
        filtered = filtered.sort((a, b) => {
          const aDistance = a.distance
            ? parseFloat(a.distance.split(" ")[0])
            : 999;
          const bDistance = b.distance
            ? parseFloat(b.distance.split(" ")[0])
            : 999;
          return aDistance - bDistance;
        });
      } else if (filterId === "highRated") {
        filtered = filtered.filter((gym) => gym.rating >= 4.5);
      }

      setSearchResults(filtered);
    } else {
      // If no results yet, search nearby when selecting "nearby" filter
      if (filterId === "nearby") {
        searchNearbyGyms();
      }
    }
  };

  const getFilterLabel = (filter: string): string => {
    switch (filter) {
      case "all":
        return "All";
      case "nearby":
        return "Nearby";
      case "highRated":
        return "4.5+";
      default:
        return filter;
    }
  };

  const handleBackFromSpline = (): void => {
    setShowSplineView(false);
    setSelectedGym(null);
  };

  const handleContinueToGym = (): void => {
    setShowSplineView(false);
    if (selectedGym?.source === "google") {
      navigation.navigate("ExternalGymDetails", {
        placeId: selectedGym.id.replace("google-", ""),
      });
    } else {
      navigation.navigate("GymDetails", {
        gymId: selectedGym?.id || "",
      });
    }
  };

  // Render 3D spline view modal
  if (showSplineView && selectedGym) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-row items-center justify-between p-3 border-b border-gray-200">
          <Pressable className="p-2" onPress={handleBackFromSpline}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-800">
            {selectedGym.gymName}
          </Text>
          <Pressable className="p-2" onPress={handleContinueToGym}>
            <Ionicons name="arrow-forward" size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-1">
          <GymSplineView gym={selectedGym} />
        </View>

        <TouchableOpacity
          className="m-4 p-3 bg-blue-600 rounded-lg"
          onPress={handleContinueToGym}
        >
          <Text className="text-white text-center font-bold">
            View Gym Details
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center p-3 border-b border-gray-200">
        <Pressable className="p-2 mr-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>

        <View className="flex-1">
          <GooglePlacesAutocomplete
            placeholder="Search for gyms, fitness centers..."
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details) {
                searchGyms(details);
              }
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: "en",
              types: "establishment",
              keyword: "gym fitness",
              components: "country:us",
              ...(userLocation && {
                location: `${userLocation.latitude},${userLocation.longitude}`,
                radius: "50000",
              }),
            }}
            styles={{
              container: { flex: 1 },
              textInputContainer: {
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                padding: 0,
              },
              textInput: {
                height: 38,
                color: "#1f2937",
                fontSize: 16,
                backgroundColor: "#f3f4f6",
              },
              predefinedPlacesDescription: {
                color: "#1e3a8a",
              },
              row: {
                backgroundColor: "white",
                padding: 13,
                height: 44,
                flexDirection: "row",
              },
              separator: {
                height: 1,
                backgroundColor: "#e5e7eb",
              },
              description: {
                fontSize: 14,
              },
              loader: {
                flexDirection: "row",
                justifyContent: "flex-end",
                height: 20,
              },
            }}
            renderRow={(data) => (
              <View className="flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#6b7280"
                  style={{ marginRight: 12 }}
                />
                <Text className="text-sm text-gray-700">
                  {data.description || data.structured_formatting?.main_text}
                </Text>
              </View>
            )}
            enablePoweredByContainer={false}
            debounce={300}
            nearbyPlacesAPI="GooglePlacesSearch"
          />
        </View>
      </View>

      {/* Location Indicator */}
      {userLocation ? (
        <View className="flex-row items-center p-2 bg-blue-50">
          <Ionicons name="location" size={16} color="#3b82f6" />
          <Text className="ml-1 text-sm text-blue-700">
            Using your location for better results
          </Text>
        </View>
      ) : locationPermissionStatus === "denied" ? (
        <TouchableOpacity
          className="flex-row items-center p-2 bg-amber-50"
          onPress={requestLocationPermission}
        >
          <Ionicons name="warning" size={16} color="#f59e0b" />
          <Text className="ml-1 text-sm text-amber-700">
            Enable location for nearby gyms
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Filter Chips */}
      <View className="p-3">
        <FlatList
          horizontal
          data={["all", "nearby", "highRated"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-3 py-1.5 mr-2 rounded-full ${
                selectedFilter === item ? "bg-blue-600" : "bg-gray-100"
              }`}
              onPress={() => handleFilterSelect(item)}
            >
              <Text
                className={`text-sm ${
                  selectedFilter === item ? "text-white" : "text-gray-600"
                }`}
              >
                {getFilterLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Error message */}
      {errorMsg && (
        <View className="mx-4 mb-2 p-2 bg-red-50 rounded">
          <Text className="text-sm text-red-600">{errorMsg}</Text>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
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
                  style={{ width: "100%", height: "100%" }}
                />
                {item.source === "google" && (
                  <View
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black bg-opacity-60"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: "rgba(0,0,0,0.6)",
                    }}
                  >
                    <Text
                      className="text-xs font-bold text-white"
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      Google
                    </Text>
                  </View>
                )}
                {item.distance && (
                  <View
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-blue-600"
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: "#2563eb",
                    }}
                  >
                    <Text
                      className="text-xs font-bold text-white"
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      {item.distance}
                    </Text>
                  </View>
                )}
              </View>
              <View className="p-3">
                <Text
                  className="text-base font-bold text-gray-800 mb-1"
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {item.gymName}
                </Text>
                <Text
                  className="text-sm text-gray-500 mb-2"
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}
                >
                  {item.location.address}
                </Text>
                <View className="flex-row items-center">
                  <Text
                    className="text-amber-500 mr-1"
                    style={{ color: "#f59e0b", marginRight: 4 }}
                  >
                    {"★".repeat(Math.round(item.rating || 0))}
                  </Text>
                  <Text
                    className="text-sm text-gray-800"
                    style={{ fontSize: 14, color: "#1f2937" }}
                  >
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="fitness-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-base text-gray-500 text-center">
            Search for gyms by name, location, or tap "Nearby" to find gyms near
            you
          </Text>
          {userLocation && (
            <TouchableOpacity
              className="mt-6 px-6 py-2 bg-blue-600 rounded-full"
              onPress={searchNearbyGyms}
            >
              <Text className="text-white font-semibold">Find Nearby Gyms</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchResults;
