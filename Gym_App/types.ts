// Create this file at: d:\vs-code repo\Gym\Gym_App\types.ts
export interface GymData {
  id: string;
  gymName: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  rating?: number;
  imageUrl: string;
  distance?: string;
  facilities?: {
    gymType?: string;
    equipmentList?: string;
    operatingHours?: {
      weekdays?: string;
      weekends?: string;
    };
    trainers?: { name: string; specialization: string }[];
  };
  pricing?: {
    planName?: string;
    price?: number;
    duration?: string;
  };
  status?: string;
  isRegistered?: boolean;
  trainerId?: string;
  trainerName?: string;
  source?: string;
}

export interface NavigationProps {
  navigation: any; // Replace with proper navigation type
}
export interface WorkoutData {
  id: string;
  title: string;
  duration: string;
  level: string;
  imageUrl: string;
  trainer?: string;
  description?: string;
  equipment?: string[];
  categories?: string[];
  popularity?: number;
  calories?: number;
  steps?: {
    order: number;
    name: string;
    description: string;
    duration?: string;
    imageUrl?: string;
  }[];
}
export interface GooglePlaceDetail {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  formatted_address: string;
  place_id: string;
  rating?: number; // Optional since not all places have ratings
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  // Add other properties as needed
}
export type RootStackParamList = {
  LoginScreen: undefined;
  User_SignUp: undefined;
  Trainer_SignUp: undefined;
  Forgot_Password: undefined;
  UserTabs: undefined;
  RGN_Gyms: undefined;
  TrainerHome: undefined;
  Gym_rgn: undefined;
  SearchResults: {
    query?: string;
    filters?: any;
  };
  ExternalGymDetails: {
    placeId: string;
  };
  GymDetails: {
    gymId: string;
  };
};
