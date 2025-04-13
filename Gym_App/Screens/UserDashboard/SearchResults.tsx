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
  SectionList,
  ScrollView,
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
import GymSplineView from "../components/GymSplineView"; //@ts-ignore
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

// New interface for section data
interface SectionData {
  title: string;
  data: GymResult[];
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

const isWithinRadius = (
  place: GooglePlace,
  userLocation: Location | null,
  radius: number = 50
): boolean => {
  if (!Location || !place.geometry?.location || !userLocation) return false;

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    place.geometry.location.lat,
    place.geometry.location.lng
  );

  return parseFloat(distance.split(" ")[0]) <= radius;
};

const SearchResults: React.FC<SearchResultsProps> = ({ navigation, route }) => {
  // State with proper type annotations
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<GymResult[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<GymResult[]>([]);
  const [userCity, setUserCity] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<string>("undetermined");
  const [showSplineView, setShowSplineView] = useState<boolean>(false);
  const [selectedGym, setSelectedGym] = useState<GymResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sectionedData, setSectionedData] = useState<SectionData[]>([]);

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

        // Get city from coordinates
        await getUserCityFromCoordinates(newLocation);
      }
    } catch (error) {
      setErrorMsg("Could not get your location. Please check permissions.");
      console.error("Error requesting location permission:", error);
    }
  };

  // Get city name from coordinates
  const getUserCityFromCoordinates = async (
    location: Location
  ): Promise<void> => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const cityName = reverseGeocode[0].city || "";
        setUserCity(cityName);

        // Cache city for future use
        await AsyncStorage.setItem("userCity", cityName);

        // Fetch city suggestions if we have a city name
        if (cityName) {
          await fetchCitySuggestions(cityName);
        }
      }
    } catch (error) {
      console.error("Error getting city from coordinates:", error);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    const initLocation = async (): Promise<void> => {
      try {
        // Try to get cached city first
        const cachedCity = await AsyncStorage.getItem("userCity");
        if (cachedCity) {
          setUserCity(cachedCity);
        }

        const storedLocation = await AsyncStorage.getItem("userLocation");
        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          setUserLocation(parsedLocation);

          // If we have location but no city, get city
          if (!cachedCity) {
            await getUserCityFromCoordinates(parsedLocation);
          } else {
            // If we already have the city, fetch suggestions
            await fetchCitySuggestions(cachedCity);
          }
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

  // Fetch gym suggestions based on city
  const fetchCitySuggestions = async (city: string): Promise<void> => {
    if (!city) return;

    setLoadingSuggestions(true);

    try {
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=fitness+gym+in+${encodeURIComponent(
        city
      )}&type=gym&key=${GOOGLE_PLACES_API_KEY}&radius=5000`; // Added radius parameter

      const response = await fetch(textSearchUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const cityGyms: GymResult[] = data.results
          .filter((place: GooglePlace) => {
            return place.name && (place.vicinity || place.formatted_address);
          })
          .slice(0, 5)
          .map((place: GooglePlace) => {
            let distance: string | undefined;
            if (userLocation && place.geometry?.location) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              );
            }

            return processPlaceToGym(place, distance);
          });

        if (cityGyms.length > 0) {
          setCitySuggestions(cityGyms);
          updateSectionData(searchResults, cityGyms);
        } else {
          setCitySuggestions([]);
          setErrorMsg("No gyms found in your area. Try expanding your search.");
        }
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      setCitySuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Update the sectioned data for the SectionList
  const updateSectionData = (
    results: GymResult[],
    suggestions: GymResult[]
  ): void => {
    const sections: SectionData[] = [];

    if (results.length > 0) {
      sections.push({
        title: "Search Results",
        data: results,
      });
    }

    if (suggestions.length > 0) {
      sections.push({
        title: `Popular Gyms in ${userCity}`,
        data: suggestions,
      });
    }

    setSectionedData(sections);
  };

  // Distance calculation with types
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
    return (R * c).toFixed(1) + " mi";
  };

  // Process place into gym result with types
  const processPlaceToGym = (
    place: GooglePlace,
    distance?: string
  ): GymResult => ({
    id: place.place_id ? `google-${place.place_id}` : `google-${generateId()}`,
    gymName: place.name,
    location: {
      address: place.vicinity || place.formatted_address || "",
      city: userCity,
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
          place.geometry?.location.lng || 0
        );

        return processPlaceToGym(place, distance);
      });

      setSearchResults(nearbyGyms);

      // Update sectioned data
      updateSectionData(nearbyGyms, citySuggestions);
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
      const searchQuery = placeDetails.name || "";
      let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        searchQuery
      )}+gym+fitness&type=gym&key=${GOOGLE_PLACES_API_KEY}`;

      if (userLocation) {
        searchUrl += `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`; // Changed from 50000 to 5000
      }

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const searchResults: GymResult[] = data.results
          .filter((place: GooglePlace) => {
            // Enhanced filtering criteria
            return (
              place.name &&
              (place.vicinity || place.formatted_address) &&
              // Ensure the place has valid coordinates
              place.geometry?.location?.lat &&
              place.geometry?.location?.lng &&
              // If we have user location, check if it's within 5km
              (!userLocation ||
                calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  place.geometry.location.lat,
                  place.geometry.location.lng
                ).split(" ")[0] <= "5")
            );
          })
          .map((place: GooglePlace) => {
            let distance: string | undefined;
            if (userLocation && place.geometry?.location) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              );
            }

            return processPlaceToGym(place, distance);
          })
          .sort((a: GymResult, b: GymResult) => {
            // Sort by distance first, then by rating
            const aDistance = a.distance
              ? parseFloat(a.distance.split(" ")[0])
              : 999;
            const bDistance = b.distance
              ? parseFloat(b.distance.split(" ")[0])
              : 999;
            if (aDistance === bDistance) {
              return (b.rating || 0) - (a.rating || 0);
            }
            return aDistance - bDistance;
          });

        setSearchResults(searchResults);
        updateSectionData(searchResults, citySuggestions);
      } else {
        setSearchResults([]);
        setErrorMsg(
          "No gyms found within 5km. Try a different location or search term."
        );
      }
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

      // Update sectioned data
      updateSectionData(filtered, citySuggestions);
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

  // Render gym card
  const renderGymCard = (item: GymResult) => (
    <TouchableOpacity
      className="mx-4 mb-4 bg-white rounded-lg overflow-hidden shadow-sm active:opacity-90"
      onPress={() => handleGymSelect(item)}
    >
      <View className="relative h-36">
        <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
        {item.source === "google" && (
          <View className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60">
            <Text className="text-xs font-bold text-white">Google</Text>
          </View>
        )}
        {item.distance && (
          <View className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-blue-600">
            <Text className="text-xs font-bold text-white">
              {item.distance}
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
            {"★".repeat(Math.round(item.rating || 0))}
          </Text>
          <Text className="text-sm text-gray-800">
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            placeholder="Search for gyms..."
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
              location: userLocation
                ? `${userLocation.latitude},${userLocation.longitude}`
                : undefined,
              radius: "5000",
              strictbounds: true,
              rankby: "distance",
              // Remove the components restriction and use region bias instead
              region: "in", // for India
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            predefinedPlacesAlwaysVisible={false}
            minLength={2} // Only start searching after 2 characters
            enableHighAccuracyLocation={true}
            timeout={5000} // Timeout for location requests
            GooglePlacesSearchQuery={{
              // Additional search parameters
              type: "gym",
              rankby: "distance",
            }}
            suppressDefaultStyles={false}
            onFail={(error) =>
              console.error("PlacesAutoComplete Error:", error)
            }
            styles={{
              container: {
                flex: 1,
              },
              textInputContainer: {
                backgroundColor: "rgb(243 244 246)",
                borderRadius: 8,
              },
              textInput: {
                height: 40,
                color: "rgb(31 41 55)",
                fontSize: 16,
                backgroundColor: "transparent",
              },
              listView: {
                position: "absolute",
                top: 45,
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: 8,
                zIndex: 1000,
                elevation: 3,
              },
              row: {
                backgroundColor: "white",
              },
              separator: {
                height: 1,
                backgroundColor: "rgb(229 231 235)",
              },
            }}
            renderRow={(rowData, index) => {
              // Skip empty results
              if (
                !rowData ||
                (!rowData.structured_formatting && !rowData.description)
              ) {
                return <View />;
              }

              const mainText =
                rowData.structured_formatting?.main_text || rowData.description;
              const secondaryText =
                rowData.structured_formatting?.secondary_text || "";

              // Skip results without a main text
              if (!mainText) {
                return <View />;
              }

              return (
                <View className="flex-row items-center p-3 border-b border-gray-100">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                    <Ionicons
                      name="fitness-outline"
                      size={20}
                      color="#3b82f6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {mainText}
                    </Text>
                    {secondaryText ? (
                      <Text className="text-gray-500 text-sm mt-0.5">
                        {secondaryText}
                      </Text>
                    ) : null}
                  </View>
                  {(rowData as any)?.structured_formatting?.distance && (
                    <Text className="text-sm text-blue-600 ml-2">
                      {(rowData as any).structured_formatting.distance}
                    </Text>
                  )}
                </View>
              );
            }}
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
          keyExtractor={(item: any) => item} //@ts-ignore
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

      {/* Quick Search Categories */}
      <View className="px-4 py-2">
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Quick Search
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {[
            { name: "Fitness Center", icon: "fitness" },
            { name: "CrossFit", icon: "barbell" },
            { name: "Yoga Studio", icon: "leaf" },
            { name: "24/7 Gym", icon: "time" },
          ].map((category) => (
            <TouchableOpacity
              key={category.name}
              className="mr-2 px-4 py-2 bg-gray-100 rounded-full flex-row items-center active:bg-gray-200"
              onPress={() => {
                const searchQuery = `${category.name} near ${userCity || "me"}`;
                searchGyms({
                  name: searchQuery,
                  formatted_address: "",
                  geometry: userLocation
                    ? {
                        location: {
                          lat: userLocation.latitude,
                          lng: userLocation.longitude,
                        },
                      }
                    : undefined,
                } as GooglePlaceDetail);
              }}
            >
              <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                <Ionicons
                  name={category.icon as any}
                  size={14}
                  color="#3b82f6"
                />
              </View>
              <Text className="text-sm text-gray-700 font-medium">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Error message */}
      {errorMsg && (
        <View className="mx-4 mb-2 p-2 bg-red-50 rounded">
          <Text className="text-sm text-red-600">{errorMsg}</Text>
        </View>
      )}

      {/* Results */}
      {loading && searchResults.length === 0 && citySuggestions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-base text-gray-500">
            Searching for gyms...
          </Text>
        </View>
      ) : sectionedData.length > 0 ? (
        // Using SectionList to display both search results and city suggestions
        <SectionList
          sections={sectionedData}
          keyExtractor={(item: GymResult) => item.id}
          renderItem={({ item }: { item: GymResult }) => renderGymCard(item)}
          renderSectionHeader={({ section }: { section: SectionData }) => (
            <View className="px-4 pt-4 pb-2 bg-gray-100">
              <Text className="text-lg font-bold text-gray-800">
                {section.title}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          {loadingSuggestions ? (
            <React.Fragment>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="mt-2 text-base text-gray-500">
                Loading suggestions...
              </Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Ionicons name="fitness-outline" size={64} color="#d1d5db" />
              <Text className="mt-4 text-base text-gray-500 text-center">
                Search for gyms by name, location, or tap "Nearby" to find gyms
                near you
              </Text>
              {userLocation && (
                <TouchableOpacity
                  className="mt-6 px-6 py-2 bg-blue-600 rounded-full"
                  onPress={searchNearbyGyms}
                >
                  <Text className="text-white font-semibold">
                    Find Nearby Gyms
                  </Text>
                </TouchableOpacity>
              )}
            </React.Fragment>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchResults;
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
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
}
