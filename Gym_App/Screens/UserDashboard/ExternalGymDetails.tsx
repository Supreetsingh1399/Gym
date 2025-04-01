import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Share
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { GOOGLE_PLACES_API_KEY } from '@env';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

import { THEME } from './constants/theme';
import { GYM_IMAGES } from './constants/assetUrls';
import { getRandomItem } from './utils/helpers';

// Type definitions
type RootStackParamList = {
  ExternalGymDetails: { placeId: string };
  SearchResults: undefined;
  UserHome: undefined;
};

type ExternalGymDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ExternalGymDetails'
>;

type ExternalGymDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'ExternalGymDetails'
>;

type ExternalGymDetailsProps = {
  navigation: ExternalGymDetailsScreenNavigationProp;
  route: ExternalGymDetailsScreenRouteProp;
};

// Type for Google Place details
interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  price_level?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
  }>;
  types?: string[];
}

const ExternalGymDetails: React.FC<ExternalGymDetailsProps> = ({ navigation, route }) => {
  const { placeId } = route.params;
  
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  
  // Fetch place details from Google Places API
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using axios to fetch place details
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,photos,geometry,price_level,reviews,types&key=${GOOGLE_PLACES_API_KEY}`
        );
        
        if (response.data.status === 'OK' && response.data.result) {
          setPlaceDetails(response.data.result);
        } else {
          setError('Could not load gym details. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching place details:', err);
        setError('An error occurred while loading gym details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaceDetails();
  }, [placeId]);
  
  // Handle actions
  const handleCall = useCallback(() => {
    if (placeDetails?.international_phone_number) {
      Linking.openURL(`tel:${placeDetails.international_phone_number}`);
    } else if (placeDetails?.formatted_phone_number) {
      Linking.openURL(`tel:${placeDetails.formatted_phone_number}`);
    }
  }, [placeDetails]);
  
  const handleWebsite = useCallback(() => {
    if (placeDetails?.website) {
      Linking.openURL(placeDetails.website);
    }
  }, [placeDetails]);
  
  const handleDirections = useCallback(() => {
    if (placeDetails?.geometry?.location) {
      const { lat, lng } = placeDetails.geometry.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${placeId}`;
      Linking.openURL(url);
    }
  }, [placeDetails, placeId]);
  
  const handleShare = useCallback(async () => {
    if (placeDetails) {
      try {
        const shareUrl = placeDetails.website || 
          `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
        
        await Share.share({
          message: `Check out ${placeDetails.name} at ${placeDetails.formatted_address}. ${shareUrl}`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  }, [placeDetails, placeId]);
  
  // Get photo URL from photo reference
  const getPhotoUrl = useCallback((photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  }, []);
  
  // Render star rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={18} color="#FFD700" />
        ))}
        {halfStar && <Ionicons name="star-half" size={18} color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        {placeDetails?.user_ratings_total && (
          <Text style={styles.reviewCount}>
            ({placeDetails.user_ratings_total})
          </Text>
        )}
      </View>
    );
  };
  
  // Render price level
  const renderPriceLevel = (priceLevel?: number) => {
    if (priceLevel === undefined) return null;
    
    const dollars = [...Array(priceLevel)].map(() => '$').join('');
    const grayDollars = [...Array(4 - priceLevel)].map(() => '$').join('');
    
    return (
      <Text style={styles.priceLevel}>
        <Text style={styles.priceLevelActive}>{dollars}</Text>
        <Text style={styles.priceLevelInactive}>{grayDollars}</Text>
      </Text>
    );
  };
  
  // Render opening hours
  const renderOpeningHours = () => {
    if (!placeDetails?.opening_hours?.weekday_text) {
      return null;
    }
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hours</Text>
        <View style={styles.hoursContainer}>
          {placeDetails.opening_hours.weekday_text.map((day, index) => {
            const [dayName, hours] = day.split(': ');
            return (
              <View key={index} style={styles.hourRow}>
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.hours}>{hours}</Text>
              </View>
            );
          })}
        </View>
        {placeDetails.opening_hours.open_now !== undefined && (
          <View style={[
            styles.openStatus, 
            placeDetails.opening_hours.open_now ? styles.openNow : styles.closedNow
          ]}>
            <Text style={styles.openStatusText}>
              {placeDetails.opening_hours.open_now ? 'Open Now' : 'Closed Now'}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  // Render reviews
  const renderReviews = () => {
    if (!placeDetails?.reviews || placeDetails.reviews.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {placeDetails.reviews.slice(0, 3).map((review, index) => (
          <View key={index} style={styles.reviewContainer}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.author_name}</Text>
              <View style={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons 
                    key={i} 
                    name={i < review.rating ? "star" : "star-outline"} 
                    size={14} 
                    color="#FFD700" 
                  />
                ))}
              </View>
              <Text style={styles.reviewTime}>{review.relative_time_description}</Text>
            </View>
            <Text 
              style={styles.reviewText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {review.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  // Main render
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading gym details...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !placeDetails) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <Ionicons name="alert-circle-outline" size={64} color={THEME.colors.error} />
        <Text style={styles.errorText}>{error || 'Failed to load gym details'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const mainImageUrl = placeDetails.photos && placeDetails.photos.length > 0
    ? getPhotoUrl(placeDetails.photos[0].photo_reference)
    : getRandomItem(GYM_IMAGES);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image 
          source={{ uri: mainImageUrl }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        
        {/* Back Button */}
        <Pressable
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        
        {/* Share Button */}
        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </Pressable>
      </View>
      
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Gym Name and Rating */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{placeDetails.name}</Text>
          <View style={styles.ratingRow}>
            {placeDetails.rating !== undefined && renderStarRating(placeDetails.rating)}
            {renderPriceLevel(placeDetails.price_level)}
          </View>
          
          {/* Gym Type Tags */}
          {placeDetails.types && (
            <View style={styles.typesContainer}>
              {placeDetails.types
                .filter(type => !['establishment', 'point_of_interest', 'health'].includes(type))
                .slice(0, 3)
                .map((type, index) => (
                  <View key={index} style={styles.typeTag}>
                    <Text style={styles.typeText}>
                      {type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                ))
              }
            </View>
          )}
          
          {/* Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={18} color={THEME.colors.text.secondary} />
            <Text style={styles.address}>{placeDetails.formatted_address}</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDirections}
          >
            <Ionicons name="navigate-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          
          {(placeDetails.formatted_phone_number || placeDetails.international_phone_number) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={24} color={THEME.colors.primary} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {placeDetails.website && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleWebsite}
            >
              <Ionicons name="globe-outline" size={24} color={THEME.colors.primary} />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={24} color={THEME.colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        {/* Opening Hours */}
        {renderOpeningHours()}
        
        {/* Map Section */}
        {placeDetails.geometry?.location && (
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: placeDetails.geometry.location.lat,
                longitude: placeDetails.geometry.location.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              provider="google"
            >
              <Marker
                coordinate={{
                  latitude: placeDetails.geometry.location.lat,
                  longitude: placeDetails.geometry.location.lng,
                }}
                title={placeDetails.name}
              />
            </MapView>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleDirections}
            >
              <Text style={styles.directionsButtonText}>Get Directions</Text>
              <Ionicons name="navigate" size={16} color="white" style={styles.directionsIcon} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Photos Section */}
        {placeDetails.photos && placeDetails.photos.length > 1 && (
          <View style={styles.photosContainer}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScrollContainer}
            >
              {placeDetails.photos.slice(1).map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: getPhotoUrl(photo.photo_reference) }}
                  style={styles.photoItem}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Reviews Section */}
        {renderReviews()}
        
        {/* Register/Check-in Prompt */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerTitle}>Interested in this gym?</Text>
          <Text style={styles.registerDescription}>
            Add this gym to your personal collection to track your visits and connect with trainers.
          </Text>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Add to My Gyms</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer with attribution */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Data provided by Google Places</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButtonHeader: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    backgroundColor: 'white',
  },
  titleContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  priceLevel: {
    marginLeft: 16,
    fontSize: 14,
  },
  priceLevelActive: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
  },
  priceLevelInactive: {
    color: '#ccc',
  },
  typesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  typeTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  hoursContainer: {
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayName: {
    fontSize: 14,
    color: '#4b5563',
    width: '30%',
    fontWeight: '500',
  },
  hours: {
    fontSize: 14,
    color: '#111',
    width: '70%',
  },
  openStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  openNow: {
    backgroundColor: '#dcfce7',
  },
  closedNow: {
    backgroundColor: '#fee2e2',
  },
  openStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  directionsIcon: {
    marginLeft: 8,
  },
  photosContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  photosScrollContainer: {
    paddingRight: 20,
  },
  photoItem: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewHeader: {
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  reviewRating: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  registerContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    margin: 20,
  },
  registerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  registerDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default ExternalGymDetails;