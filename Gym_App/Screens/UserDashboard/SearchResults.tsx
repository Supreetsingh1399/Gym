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
  Pressable,
  StyleSheet
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { FireBase_DB, FireBase_Auth } from "Gym_App/Backend/firebase";
import { GOOGLE_PLACES_API_KEY } from '@env';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import axios from 'axios';
import { API_URL } from '@env';

// Import components and utilities
import { GymCard } from './components/GymCard';
import { EmptyState } from './components/EmptyState';
import { FilterChip } from './components/FilterChip';
import { THEME } from './constants/theme';
import { getRandomItem } from './utils/helpers';
import { GYM_IMAGES } from './constants/assetUrls';

// Types
import { GymData } from 'Gym_App/types';

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

type SearchResultsProps = {
  navigation: SearchResultsScreenNavigationProp;
  route: SearchResultsScreenRouteProp;
};

// Additional types for the search functionality
interface SearchSuggestion {
  id: string;
  text: string;
  subtitle?: string;
  type?: 'gym' | 'trainer' | 'type';
}

interface FilterTag {
  id: string;
  label: string;
  selected: boolean;
}

interface ExtendedGymData extends GymData {
  source: 'app' | 'google' | 'registered';
  trainers?: TrainerData[];
  isRegistered?: boolean;
  distance?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ navigation, route }) => {
  // Get initial search query from route params if available
  const initialQuery = route.params?.query || '';
  
  // State for search and filters
  const [searchText, setSearchText] = useState<string>(initialQuery);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<ExtendedGymData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [appGyms, setAppGyms] = useState<ExtendedGymData[]>([]);
  const [registeredGyms, setRegisteredGyms] = useState<ExtendedGymData[]>([]);
  const [filterTags, setFilterTags] = useState<FilterTag[]>([
    { id: 'all', label: 'All', selected: true },
    { id: 'nearby', label: 'Nearby', selected: false },
    { id: 'registered', label: 'My Gyms', selected: false },
    { id: 'weights', label: 'Weights', selected: false },
    { id: 'cardio', label: 'Cardio', selected: false },
    { id: 'pool', label: 'Swimming', selected: false },
    { id: 'classes', label: 'Classes', selected: false },
    { id: 'highRated', label: '4.5+', selected: false },
  ]);
  
  // Create refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch all gyms from the app database
  useEffect(() => {
    const fetchAppGyms = async () => {
      try {
        const gymsRef = collection(FireBase_DB, 'gyms');
        const gymsQuery = query(gymsRef, limit(50));
        const querySnapshot = await getDocs(gymsQuery);
        
        if (querySnapshot.empty) {
          setAppGyms([]);
          return;
        }
        
        const gyms: ExtendedGymData[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gymName: data.gymName || 'Unnamed Gym',
            location: data.location || { address: 'No address', city: '', state: '' },
            rating: data.rating || 4.5,
            imageUrl: data.imageUrl || getRandomItem(GYM_IMAGES),
            facilities: data.facilities || {},
            source: 'app'
          };
        });
        
        setAppGyms(gyms);
      } catch (error) {
        console.error('Error fetching app gyms:', error);
        setAppGyms([]);
      }
    };
    
    fetchAppGyms();
    fetchRegisteredGyms();
  }, []);
  
  // Fetch registered gyms using axios
  const fetchRegisteredGyms = async () => {
    try {
      const currentUser = FireBase_Auth.currentUser;
      if (!currentUser) {
        setRegisteredGyms([]);
        return;
      }
      
      // Use axios to fetch user's registered gyms with trainer details
      const response = await axios.get(
       `${API_URL}/Register/gyms/${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        }
      );
      
      if (!response.data || !response.data.gyms || response.data.gyms.length === 0) {
        setRegisteredGyms([]);
        return;
      }
      
      // Convert the API response to our ExtendedGymData format
      const registeredGymsData: ExtendedGymData[] = response.data.gyms.map((gym: any) => ({
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
        source: 'registered',
        isRegistered: true,
        trainers: gym.trainers || [],
        membershipType: gym.membershipType,
        distance: gym.distance || '0.0 mi'
      }));
      
      setRegisteredGyms(registeredGymsData);
    } catch (error) {
      console.error('Error fetching registered gyms in search results:', error);
      setRegisteredGyms([]);
    }
  };
  
  // Perform the search based on query and filters
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      // Get selected filter tags
      const selectedFilters = filterTags.filter(tag => tag.selected).map(tag => tag.id);
      const isAllSelected = selectedFilters.includes('all');
      const isNearbySelected = selectedFilters.includes('nearby') || isAllSelected;
      const isRegisteredSelected = selectedFilters.includes('registered') || isAllSelected;
      
      // Prepare results array
      let results: ExtendedGymData[] = [];
      
      // Add registered gyms if selected
      if (isAllSelected || isRegisteredSelected) {
        const filteredRegisteredGyms = registeredGyms.filter(gym => {
          // Apply text search
          const matchesQuery = 
            gym.gymName.toLowerCase().includes(query.toLowerCase()) ||
            gym.location.address.toLowerCase().includes(query.toLowerCase()) ||
            (gym.location.city && gym.location.city.toLowerCase().includes(query.toLowerCase())) ||
            (gym.facilities?.gymType && gym.facilities.gymType.toLowerCase().includes(query.toLowerCase()));
          
          // Apply facility filters
          let matchesFacilities = true;
          if (selectedFilters.includes('weights') && !isAllSelected) {
            matchesFacilities = matchesFacilities && ('hasWeights' in (gym.facilities || {}) ? gym.facilities?.hasWeights : false);
          }
          if (selectedFilters.includes('cardio') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasCardio || false);
          }
          if (selectedFilters.includes('pool') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasPool || false);
          }
          if (selectedFilters.includes('classes') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasClasses || false);
          }
          if (selectedFilters.includes('highRated') && !isAllSelected) {
            matchesFacilities = matchesFacilities && gym.rating >= 4.5;
          }
          
          return matchesQuery && matchesFacilities;
        });
        
        results = [...filteredRegisteredGyms];
      }
      
      // Add other app gyms if needed
      if (isAllSelected || isNearbySelected) {
        const filteredAppGyms = appGyms.filter(gym => {
          // Skip if already in results (from registered gyms)
          if (results.some(result => result.id === gym.id)) {
            return false;
          }
          
          // Apply text search
          const matchesQuery = 
            gym.gymName.toLowerCase().includes(query.toLowerCase()) ||
            gym.location.address.toLowerCase().includes(query.toLowerCase()) ||
            (gym.location.city && gym.location.city.toLowerCase().includes(query.toLowerCase())) ||
            (gym.facilities?.gymType && gym.facilities.gymType.toLowerCase().includes(query.toLowerCase()));
            
          // Apply facility filters
          let matchesFacilities = true;
          if (selectedFilters.includes('weights') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasWeights || false);
          }
          if (selectedFilters.includes('cardio') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasCardio || false);
          }
          if (selectedFilters.includes('pool') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasPool || false);
          }
          if (selectedFilters.includes('classes') && !isAllSelected) {
            matchesFacilities = matchesFacilities && (gym.facilities?.hasClasses || false);
          }
          if (selectedFilters.includes('highRated') && !isAllSelected) {
            matchesFacilities = matchesFacilities && gym.rating >= 4.5;
          }
          
          return matchesQuery && matchesFacilities;
        });
        
        results = [...results, ...filteredAppGyms];
      }
      
      // Add Google Places API results if not filtered to registered only
      if ((isAllSelected || isNearbySelected) && !isRegisteredSelected) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+gym&key=${GOOGLE_PLACES_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            const googleGyms: ExtendedGymData[] = data.results
              .filter((place: any) => 
                place.types.includes('gym') || 
                place.name.toLowerCase().includes('gym')
              )
              .map((place: any) => ({
                id: `google-${place.place_id}`,
                gymName: place.name,
                location: {
                  address: place.formatted_address,
                  city: '', // Would need to parse from formatted_address
                  state: ''
                },
                rating: place.rating,
                imageUrl: place.photos?.[0]?.photo_reference 
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                  : getRandomItem(GYM_IMAGES),
                facilities: {},
                distance: `${(Math.random() * 5).toFixed(1)} mi`, // Placeholder - would use actual distance
                source: 'google'
              }));
              
            // Apply high rating filter if needed
            if (selectedFilters.includes('highRated') && !isAllSelected) {
              const filteredGoogleGyms = googleGyms.filter(gym => (gym.rating ?? 0) >= 4.5);
              
              // Filter out duplicates with existing results
              const uniqueGoogleGyms = filteredGoogleGyms.filter(googleGym => 
                !results.some(existingGym => 
                  existingGym.gymName.toLowerCase() === googleGym.gymName.toLowerCase() &&
                  existingGym.location.address.toLowerCase() === googleGym.location.address.toLowerCase()
                )
              );
              
              results = [...results, ...uniqueGoogleGyms];
            } else if (!selectedFilters.includes('weights') && 
                      !selectedFilters.includes('cardio') && 
                      !selectedFilters.includes('pool') && 
                      !selectedFilters.includes('classes')) {
              // Only add Google results if no facility filters are applied
              // (since we can't filter Google results by facilities)
              
              // Filter out duplicates with existing results
              const uniqueGoogleGyms = googleGyms.filter(googleGym => 
                !results.some(existingGym => 
                  existingGym.gymName.toLowerCase() === googleGym.gymName.toLowerCase() &&
                  existingGym.location.address.toLowerCase() === googleGym.location.address.toLowerCase()
                )
              );
              
              results = [...results, ...uniqueGoogleGyms];
            }
          }
        } catch (error) {
          console.error('Error fetching from Google Places:', error);
        }
      }
      
      // Sort results by relevance and rating
      results.sort((a, b) => {
        // First prioritize exact name matches
        const aNameMatch = a.gymName.toLowerCase() === query.toLowerCase();
        const bNameMatch = b.gymName.toLowerCase() === query.toLowerCase();
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Then prioritize registered gyms
        if (a.source === 'registered' && b.source !== 'registered') return -1;
        if (a.source !== 'registered' && b.source === 'registered') return 1;
        
        // Then by rating
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching gyms:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [appGyms, registeredGyms, filterTags]);
  
  // Generate search suggestions
  const generateSuggestions = useCallback((text: string) => {
    if (!text.trim()) {
      setSearchSuggestions([]);
      return;
    }
    
    // First get suggestions from registered gyms
    const registeredSuggestions: SearchSuggestion[] = registeredGyms
      .filter(gym => 
        gym.gymName.toLowerCase().includes(text.toLowerCase()) ||
        (gym.location.city && gym.location.city.toLowerCase().includes(text.toLowerCase()))
      )
      .map(gym => ({
        id: `registered-${gym.id}`,
        text: gym.gymName,
        subtitle: gym.location.address,
        type: 'gym'
      }));
    
    // Then from app gyms
    const appSuggestions: SearchSuggestion[] = appGyms
      .filter(gym => 
        !registeredGyms.some(reg => reg.id === gym.id) && // Avoid duplicates
        (gym.gymName.toLowerCase().includes(text.toLowerCase()) ||
        (gym.location.city && gym.location.city.toLowerCase().includes(text.toLowerCase())))
      )
      .map(gym => ({
        id: `app-${gym.id}`,
        text: gym.gymName,
        subtitle: gym.location.address,
        type: 'gym'
      }));
    
    // Add trainer name suggestions
    const trainerSuggestions: SearchSuggestion[] = [];
    registeredGyms.forEach(gym => {
      if (gym.trainers && gym.trainers.length > 0) {
        gym.trainers.forEach(trainer => {
          if (trainer.name.toLowerCase().includes(text.toLowerCase())) {
            trainerSuggestions.push({
              id: `trainer-${trainer.id}`,
              text: trainer.name,
              subtitle: `Trainer at ${gym.gymName}`,
              type: 'trainer'
            });
          }
        });
      }
    });
    
    // Add common gym type suggestions
    const gymTypes = [
      "Fitness Center", "CrossFit Gym", "Yoga Studio", "Pilates Studio",
      "Boxing Gym", "MMA Gym", "24 Hour Fitness", "Planet Fitness",
      "LA Fitness", "Gold's Gym", "Anytime Fitness", "Powerlifting Gym"
    ];
    
    const typeSuggestions: SearchSuggestion[] = gymTypes
      .filter(type => type.toLowerCase().includes(text.toLowerCase()))
      .map((type, index) => ({
        id: `type-${index}`,
        text: type,
        subtitle: "Gym type",
        type: 'type'
      }));
    
    // Combine and limit suggestions
    const allSuggestions = [...registeredSuggestions, ...trainerSuggestions, ...appSuggestions, ...typeSuggestions].slice(0, 5);
    setSearchSuggestions(allSuggestions);
  }, [appGyms, registeredGyms]);
  
  // Handle search input changes with debouncing
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    
    // Clear previous timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    
    // Generate suggestions quickly
    suggestionsTimeoutRef.current = setTimeout(() => {
      generateSuggestions(text);
    }, 200);
    
    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };
  
  // Handle filter selection
  const handleFilterSelect = (filterId: string) => {
    setFilterTags(prev => {
      // If "All" is selected, deselect others; if another is selected, deselect "All"
      if (filterId === 'all') {
        return prev.map(tag => ({
          ...tag,
          selected: tag.id === 'all'
        }));
      } else {
        return prev.map(tag => ({
          ...tag,
          selected: tag.id === filterId 
            ? !tag.selected 
            : tag.id === 'all' ? false : tag.selected
        }));
      }
    });
    
    // Re-run search with new filters after state update
    setTimeout(() => {
      performSearch(searchText);
    }, 0);
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchText(suggestion.text);
    setSearchSuggestions([]);
    performSearch(suggestion.text);
  };
  
  // Handle gym selection
  const handleGymPress = (gymId: string, source: 'app' | 'google' | 'registered') => {
    if (source === 'google') {
      // For Google Places results, navigate to details with the place ID
      navigation.navigate('ExternalGymDetails', { placeId: gymId.replace('google-', '') });
    } else {
      // For app or registered gyms, navigate to the regular details page
      navigation.navigate('GymDetails', { gymId });
    }
  };
  
  // Run initial search if query provided
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);
  
  // Render filter chips
  const renderFilterChips = () => (
    <FlatList
      horizontal
      data={filterTags}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      renderItem={({ item }) => (
        <FilterChip
          label={item.label}
          selected={item.selected}
          onPress={() => handleFilterSelect(item.id)}
        />
      )}
    />
  );
  
  // Render search suggestions
  const renderSuggestions = () => (
    searchSuggestions.length > 0 && (
      <View style={styles.suggestionsContainer}>
        {searchSuggestions.map(suggestion => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(suggestion)}
          >
            {suggestion.type === 'gym' ? (
              <Ionicons name="fitness-outline" size={16} color="#6b7280" style={styles.suggestionIcon} />
            ) : suggestion.type === 'trainer' ? (
              <Ionicons name="person-outline" size={16} color="#6b7280" style={styles.suggestionIcon} />
            ) : (
              <Ionicons name="search-outline" size={16} color="#6b7280" style={styles.suggestionIcon} />
            )}
            <View>
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              {suggestion.subtitle && (
                <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  );
  
  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gyms by name, city, or type..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={handleSearchChange}
            autoFocus={true}
          />
          {searchText.length > 0 && (
            <Pressable 
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
                setSearchSuggestions([]);
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>
      
      {/* Search Suggestions */}
      {renderSuggestions()}
      
      {/* Filter Chips */}
      {renderFilterChips()}
      
      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Searching for gyms...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.resultCardContainer}>
              <GymCard 
                gym={item} 
                onPress={() => handleGymPress(item.id, item.source)} 
                fullWidth
              />
              {item.source === 'google' && (
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceText}>Google</Text>
                </View>
              )}
              {item.source === 'registered' && (
                <View style={[styles.sourceTag, styles.registeredTag]}>
                  <Text style={styles.sourceText}>My Gym</Text>
                </View>
              )}
              {item.trainers && item.trainers.length > 0 && (
                <View style={styles.trainerBadge}>
                  <Ionicons name="person" size={12} color="white" />
                  <Text style={styles.trainerText}>{item.trainers.length} Trainer{item.trainers.length > 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
          )}
        />
      ) : searchText.length > 0 ? (
        <EmptyState 
          icon="search" 
          message="No gyms found matching your search. Try different keywords or filters." 
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="fitness-outline" size={64} color="#d1d5db" />
          <Text style={styles.placeholderText}>
            Search for gyms by name, location, or facilities
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  resultsContainer: {
    padding: 16,
  },
  resultCardContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  sourceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredTag: {
    backgroundColor: THEME.colors.primary,
  },
  sourceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trainerBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: THEME.colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default SearchResults;