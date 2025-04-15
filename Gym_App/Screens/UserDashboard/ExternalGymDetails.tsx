//@ts-nocheck
import React, { useState, useEffect, useCallback, JSX } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Share,
  ShareContent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import { API_URL, GOOGLE_PLACES_API_KEY } from "@env";
import axios from "axios";
//@ts-ignore
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { GYM_IMAGES } from "./constants/assetUrls";
import { getRandomItem } from "./utils/helpers";
import GymMapView from '../components/GymMapView';
import { RootStackParamList } from "../../types";

// Define types for Google Places API response
interface PlacePhoto {
  height: number;
  width: number;
  photo_reference: string;
  html_attributions: string[];
}

interface PlaceReview {
  author_name: string;
  author_url: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceOpeningHours {
  open_now?: boolean;
  periods?: Array<{
    close: { day: number; time: string };
    open: { day: number; time: string };
  }>;
  weekday_text?: string[];
}

interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
  viewport?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: PlaceOpeningHours;
  photos?: PlacePhoto[];
  geometry?: PlaceGeometry;
  reviews?: PlaceReview[];
  types?: string[];
  isRegistered?: boolean; // Added property
  facilities?: any; // Added facilities property
  trainers?: any[]; // Added trainers property
}

type ExternalGymDetailsProps = NativeStackScreenProps<
  RootStackParamList,
  "ExternalGymDetails"
>;

const ExternalGymDetails: React.FC<ExternalGymDetailsProps> = ({
  navigation,
  route,
}) => {
  const { placeId, sourceType, gymData } = route.params;

  // State with proper type annotations
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [showSplineView, setShowSplineView] = useState<boolean>(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [mainimageUrl, setMainImageUrl] = useState<string | null>(null);
 

  // Fetch place details from Google Places API with types
  useEffect(() => {
    const fetchPlaceDetails = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
       // HANDLE REGISTERED GYMS FROM MONGODB
if (sourceType === "registered" && gymData) {
  console.log("Showing registered gym details from MongoDB");
  try {
    // First try to fetch the specific gym by ID
    const response = await axios.get(
      `${API_URL}/Register/Gyms/${gymData.id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
    
    console.log("MongoDB gym response:", response.data);
    
    // Check if we got valid data back
    if (response.data && response.data.data) {
      const gymDetails = response.data.data;
      
      // Create a placeDetails object using response data
      setPlaceDetails({
        place_id: gymDetails._id || gymData.id,
        name: gymDetails.gymName || gymData.gymName,
        formatted_address: gymDetails.address || gymData.location?.address,
        formatted_phone_number: gymDetails.contactNumber || "Not available",
        rating: gymDetails.rating || 4.0,
        geometry: gymDetails.geometry || {
          location: {
            lat: 0,
            lng: 0
          }
        },
        opening_hours: {
          weekday_text: ["Contact gym for hours"]
        },
        types: [gymDetails.gymType || "gym"],
        photos: [],
        website: "",
        reviews: [],
        // Add MongoDB-specific fields
        isRegistered: true,
        facilities: gymDetails.facilities || {},
        trainers: gymDetails.trainers || [],
        membershipType: gymDetails.membershipType,
        source: "registered"
      });
      
      // Set image directly from response
      setMainImageUrl(gymDetails.media?.imageUrl || getRandomItem(GYM_IMAGES));
    } else {
      // Fallback to gymData if API response doesn't contain the gym
      setPlaceDetails({
        place_id: gymData.id,
        name: gymData.gymName,
        formatted_address: gymData.location?.address,
        formatted_phone_number: gymData.contactNumber || "Not available",
        rating: gymData.rating || 4.0,
        geometry: gymData.geometry || {
          location: { lat: 0, lng: 0 }
        },
        opening_hours: {
          weekday_text: ["Contact gym for hours"]
        },
        types: [gymData.facilities?.gymType || "gym"],
        photos: [],
        website: "",
        reviews: [],
        isRegistered: true,
        facilities: gymData.facilities,
        trainers: gymData.trainers || [],
        membershipType: gymData.membershipType,
        source: "registered"
      });
      
      // Set image directly from gymData
      setMainImageUrl(gymData.imageUrl || getRandomItem(GYM_IMAGES));
    }
    
    setLoading(false);
    return;
  } catch (error) {
    console.error("Error fetching specific gym details:", error);
    // Continue with gymData as fallback
    // Original code continues...
  }
}
        
        // ONLY call Google Places API for Google sources
        if (sourceType !== "registered") {
          if (!placeId) {
            setError("No place ID provided");
            setLoading(false);
            return;
          }
          
          // Existing Google Places API fetch code
          const response = await axios.get<{
            status: string;
            result: PlaceDetails;
            error_message?: string;
          }>(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,photos,geometry,price_level,reviews,types&key=${GOOGLE_PLACES_API_KEY}`,
          );

          if (response.data.status === "OK" && response.data.result) {
            setPlaceDetails(response.data.result);
            
            // Set mainImageUrl for Google places
            if ((response.data.result.photos ?? []).length > 0) {
              setMainImageUrl(getPhotoUrl(response.data.result.photos?.[0]?.photo_reference ?? ""));
            } else {
              setMainImageUrl(getRandomItem(GYM_IMAGES));
            }
          } else {
            setError(
              response.data.error_message ||
                "Could not load gym details. Please try again later."
            );
          }
        }
      } catch (err) {
        console.error("Error fetching place details:", err);
        setError("An error occurred while loading gym details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId, sourceType, gymData]); // Add all dependencies

  // Handle actions with typed parameters and return values
  const handleCall = useCallback((): void => {
    if (placeDetails?.international_phone_number) {
      Linking.openURL(`tel:${placeDetails.international_phone_number}`);
    } else if (placeDetails?.formatted_phone_number) {
      Linking.openURL(`tel:${placeDetails.formatted_phone_number}`);
    }
  }, [placeDetails]);

  const handleWebsite = useCallback((): void => {
    if (placeDetails?.website) {
      Linking.openURL(placeDetails.website);
    }
  }, [placeDetails]);

  const handleDirections = useCallback((): void => {
    if (placeDetails?.geometry?.location) {
      const { lat, lng } = placeDetails.geometry.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${placeId}`;
      Linking.openURL(url);
    }
  }, [placeDetails, placeId]);

  const handleShare = useCallback(async (): Promise<void> => {
    if (placeDetails) {
      try {
        const shareUrl =
          placeDetails.website ||
          `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;

        const content: ShareContent = {
          message: `Check out ${placeDetails.name} at ${placeDetails.formatted_address || ""}. ${shareUrl}`,
          url: shareUrl,
        };

        await Share.share(content);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  }, [placeDetails, placeId]);

  // Toggle 3D visualization
  const handleToggleSplineView = (): void => {
    setShowSplineView(!showSplineView);
  };

  // Toggle expanded photo view
  const handlePhotoPress = (photoRef: string): void => {
    setActivePhoto(photoRef === activePhoto ? null : photoRef);
  };

  // Get photo URL from photo reference with type
  const getPhotoUrl = useCallback((photoReference: string): string => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }, []);

  // Render star rating with type
  const renderStarRating = (rating: number): JSX.Element => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View className="flex-row items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={18} color="#FFD700" />
        ))}
        {halfStar && <Ionicons name="star-half" size={18} color="#FFD700" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Ionicons
            key={`empty-${i}`}
            name="star-outline"
            size={18}
            color="#FFD700"
          />
        ))}
        <Text className="ml-1 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </Text>
        {placeDetails?.user_ratings_total && (
          <Text className="ml-1 text-sm text-gray-500">
            ({placeDetails.user_ratings_total})
          </Text>
        )}
      </View>
    );
  };

  // Render opening hours with return type
  const renderOpeningHours = (): JSX.Element | null => {
    if (!placeDetails?.opening_hours?.weekday_text) {
      return null;
    }

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600} 
        delay={300}
        className="p-5 border-b border-gray-200"
      >
        <Text className="text-lg font-semibold text-gray-800 mb-3">Hours</Text>
        <View>
          {placeDetails.opening_hours.weekday_text.map((day, index) => {
            const dayParts = day.split(": ");
            const dayName = dayParts[0];
            const hours = dayParts.slice(1).join(": "); // Handle cases where hours might contain colons
            return (
              <View key={index} className="flex-row justify-between mb-1.5">
                <Text className="text-sm font-medium text-gray-700 w-1/3">
                  {dayName}
                </Text>
                <Text className="text-sm text-gray-800 w-2/3">{hours}</Text>
              </View>
            );
          })}
        </View>
        {placeDetails.opening_hours.open_now !== undefined && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            className={`mt-2 self-start px-3 py-1.5 rounded-full ${
              placeDetails.opening_hours.open_now
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                placeDetails.opening_hours.open_now
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {placeDetails.opening_hours.open_now ? "Open Now" : "Closed Now"}
            </Text>
          </Animatable.View>
        )}
      </Animatable.View>
    );
  };

  // Render photos section
  const renderPhotos = (): JSX.Element | null => {
    if (!placeDetails?.photos || placeDetails.photos.length <= 1) {
      return null;
    }

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600} 
        delay={300}
        className="p-5 border-b border-gray-200"
      >
        <Text className="text-lg font-semibold text-gray-800 mb-3">Photos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {placeDetails.photos.map((photo, index) => (
            <Animatable.View 
              key={index}
              animation="fadeInRight"
              delay={100 * index}
            >
              <TouchableOpacity
                onPress={() => handlePhotoPress(photo.photo_reference)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: getPhotoUrl(photo.photo_reference) }}
                  className="w-40 h-28 mr-3 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </ScrollView>
      </Animatable.View>
    );
  };

  // Render reviews with return type
  const renderReviews = (): JSX.Element | null => {
    if (!placeDetails?.reviews || placeDetails.reviews.length === 0) {
      return null;
    }

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={600} 
        delay={400}
        className="p-5 border-b border-gray-200"
      >
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Reviews
        </Text>
        {placeDetails.reviews.slice(0, 3).map((review, index) => (
          <Animatable.View 
            key={index} 
            animation="fadeInUp" 
            delay={index * 150}
            className="mb-4 pb-4 border-b border-gray-100"
          >
            <View className="mb-2">
              <Text className="text-sm font-semibold text-gray-800">
                {review.author_name}
              </Text>
              <View className="flex-row my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? "star" : "star-outline"}
                    size={14}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text className="text-xs text-gray-500">
                {review.relative_time_description}
              </Text>
            </View>
            <Text
              className="text-sm text-gray-700 leading-5"
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {review.text}
            </Text>
          </Animatable.View>
        ))}
      </Animatable.View>
    );
  };

  // If showing map view, render that instead
  if (showSplineView && placeDetails) {
    const gymForMap = {
      id: placeId,
      gymName: placeDetails.name,
      imageUrl:
        placeDetails.photos && placeDetails.photos.length > 0
          ? getPhotoUrl(placeDetails.photos[0].photo_reference)
          : getRandomItem(GYM_IMAGES),
      source: "google" as "google",
      rating: placeDetails.rating || 4.0,
      address: placeDetails.formatted_address || "",
      geometry: placeDetails.geometry,
    };

    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="light-content" />
        <View className="flex-row items-center justify-between p-3 bg-blue-600">
          <Pressable className="p-2" onPress={handleToggleSplineView}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-lg font-bold text-white">
            {placeDetails.name} - Map View
          </Text>
          <View className="w-10" />
        </View>
        <GymMapView gym={gymForMap} onNavigate={handleDirections} />
      </SafeAreaView>
    );
  }

  // Expanded photo view
  if (activePhoto && placeDetails) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center p-4">
          <TouchableOpacity 
            onPress={() => setActivePhoto(null)}
            className="bg-black/50 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleShare}
            className="bg-black/50 rounded-full p-2"
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={300}
          className="flex-1 justify-center items-center"
        >
          <Image
            source={{ uri: getPhotoUrl(activePhoto) }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </Animatable.View>
      </SafeAreaView>
    );
  }

  // Main render
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" />
        <Animatable.View animation="rotate" iterationCount="infinite" easing="linear" duration={1500}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </Animatable.View>
        <Animatable.Text animation="pulse" iterationCount="infinite" className="mt-4 text-base text-gray-500">
          Loading gym details...
        </Animatable.Text>
      </SafeAreaView>
    );
  }

  if (error || !placeDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-5">
        <StatusBar barStyle="dark-content" />
        <Animatable.View animation="bounceIn">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        </Animatable.View>
        <Animatable.Text animation="fadeIn" delay={300} className="mt-3 text-base text-gray-600 text-center">
          {error || "Failed to load gym details"}
        </Animatable.Text>
        <Animatable.View animation="fadeIn" delay={600}>
          <TouchableOpacity
            className="mt-6 px-6 py-3 bg-blue-600 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white text-base font-semibold">Go Back</Text>
          </TouchableOpacity>
        </Animatable.View>
      </SafeAreaView>
    );
  }

  const mainImageUrl =
    placeDetails.photos && placeDetails.photos.length > 0
      ? getPhotoUrl(placeDetails.photos[0].photo_reference)
      : getRandomItem(GYM_IMAGES);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header Image */}
      <View className="relative h-64">
        <Animatable.View animation="fadeIn" duration={800}>
          <Image
            source={{ uri: mainImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black bg-opacity-30" />
        </Animatable.View>

        {/* Back Button */}
        <Animatable.View animation="fadeIn" delay={200} className="absolute top-10 left-4">
          <Pressable
            className="w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </Animatable.View>

        {/* Share Button */}
        <Animatable.View animation="fadeIn" delay={200} className="absolute top-10 right-4">
          <Pressable
            className="w-10 h-10 rounded-full bg-black bg-opacity-50 items-center justify-center"
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </Pressable>
        </Animatable.View>

        {/* Map View Button */}
        <Animatable.View animation="fadeInUp" delay={400} className="absolute bottom-4 right-4">
          <Pressable
            className="px-3 py-2 rounded-lg bg-blue-600 flex-row items-center"
            onPress={handleToggleSplineView}
          >
            <Ionicons name="map-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Map View</Text>
          </Pressable>
        </Animatable.View>
      </View>

      <ScrollView
        className="flex-1 -mt-5 bg-white rounded-t-3xl"
        showsVerticalScrollIndicator={false}
      >
        {/* Gym Name and Rating */}
        <Animatable.View animation="fadeInUp" className="p-5">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {placeDetails.name}
          </Text>
          <View className="flex-row items-center mb-3">
            {placeDetails.rating !== undefined &&
              renderStarRating(placeDetails.rating)}

            {/* Price Level */}
            {placeDetails.price_level !== undefined && (
              <Text className="ml-4 text-sm">
                <Text className="text-blue-600 font-bold">
                  {"$".repeat(placeDetails.price_level)}
                </Text>
                <Text className="text-gray-300">
                  {"$".repeat(4 - placeDetails.price_level)}
                </Text>
              </Text>
            )}
          </View>

          {/* Gym Type Tags */}
          {placeDetails.types && placeDetails.types.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {placeDetails.types
                .filter(
                  (type) =>
                    !["establishment", "point_of_interest", "health"].includes(
                      type,
                    ),
                )
                .slice(0, 3)
                .map((type, index) => (
                  <Animatable.View
                    key={index}
                    animation="fadeIn"
                    delay={200 + index * 100}
                    className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-xs text-gray-600 font-medium">
                      {type.replace(/_/g, " ").toUpperCase()}
                    </Text>
                  </Animatable.View>
                ))}
            </View>
          )}

          {/* Address */}
          {placeDetails.formatted_address && (
            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={18} color="#9ca3af" />
              <Text className="ml-2 flex-1 text-sm text-gray-600 leading-5">
                {placeDetails.formatted_address}
              </Text>
            </View>
          )}
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View 
          animation="fadeIn" 
          delay={200}
          className="flex-row justify-between px-5 pb-5 border-b border-gray-200"
        >
          <TouchableOpacity className="items-center" onPress={handleDirections}>
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="navigate-outline" size={24} color="#3b82f6" />
            </View>
            <Text className="text-xs text-gray-600">Directions</Text>
          </TouchableOpacity>

          {(placeDetails.formatted_phone_number ||
            placeDetails.international_phone_number) && (
            <TouchableOpacity className="items-center" onPress={handleCall}>
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
                <Ionicons name="call-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-xs text-gray-600">Call</Text>
            </TouchableOpacity>
          )}

          {placeDetails.website && (
            <TouchableOpacity className="items-center" onPress={handleWebsite}>
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
                <Ionicons name="globe-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-xs text-gray-600">Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="items-center" onPress={handleShare}>
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-1">
              <Ionicons name="share-social-outline" size={24} color="#3b82f6" />
            </View>
            <Text className="text-xs text-gray-600">Share</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Opening Hours */}
        {renderOpeningHours()}

        {/* Map Section */}
        {placeDetails.geometry?.location && (//@ts-ignore
          <Animatable.View 
            animation="fadeIn" 
            duration={600} 
            delay={200}
            className="p-5 border-b border-gray-200"
          >
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Location
            </Text>
            
            <View className="w-full h-48 rounded-lg overflow-hidden">
              <GymMapView 
                gym={{
                  id: placeId,
                  gymName: placeDetails.name,
                  imageUrl: mainImageUrl,
                  source: "google",
                  geometry: placeDetails.geometry,
                  address: placeDetails.formatted_address || ""
                }}
              />
            </View>
            
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center bg-blue-600 py-3 rounded-lg"
              onPress={handleDirections}
            >
              <Text className="text-white font-semibold">Get Directions</Text>
              <Ionicons
                name="navigate"
                size={16}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Photos Section */}
        {renderPhotos()}

        {/* Reviews Section */}
        {renderReviews()}

        {/* Footer */}
         <Animatable.View 
          animation="fadeIn" 
          delay={800}
          className="items-center pb-6 pt-6"
        >
          <Text className="text-xs text-gray-400">
            Data provided by Google Places
          </Text>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExternalGymDetails;