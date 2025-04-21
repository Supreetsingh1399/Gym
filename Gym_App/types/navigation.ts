/**
 * Navigation type definitions for the app
 * This file should be placed in Gym_App/types/navigation.ts
 */

// Add GymTabParamList type
export type GymTabParamList = {
  GymHome: undefined;
  GymMembers: undefined;
  GymChat: undefined;
  GymProfile: undefined;
};

// Update RootStackParamList to include gym screens
export type RootStackParamList = {
  // Authentication screens
  LoginScreen: undefined;
  User_SignUp: undefined;
  Forgot_Password: undefined;
  Gym_rgn: undefined;
  
  // Main navigation containers
  UserTabs: undefined;
  GymDashboard: undefined;
  
  // User screens
  RGN_Gyms: undefined;
  TrainerHome: undefined;
  SearchResults: undefined;
  ExternalGymDetails: {
    placeId?: string;
    gymData?: any;
    sourceType?: string;
  };
  WorkoutDetails: {
    workout: any;
  };
  ExerciseDetail: {
    exercise: any;
  };
  ProfileUpdate: undefined;
  NearbyGyms: undefined;
  RegisteredGyms: undefined;
  PopularGyms: undefined;
};

// Ensure TabBarIconProps is exported
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}
export type UserTabParamList = {
  UserHome: undefined;
  UserProfile: undefined;
  UserChats: undefined;
  UserNews: undefined;
  UserSettings: undefined;
  UserNotifications: undefined;
  UserWorkoutDetails: {
    workoutId: string;
  };
  UserExternalGymDetails: {
    gymId: string;
    gymName?: string;
  };
  UserSearchResults: {
    query: string;  
    filters?: Record<string, any>;
  };
  UserGymNews: undefined; 
  UserGymHome: undefined;
  UserTrainerHome: undefined;
  UserTrainerProfile: undefined;
  UserTrainerSettings: undefined;
  UserTrainerNotifications: undefined;
  UserTrainerWorkoutDetails: {
    workoutId: string;
  };
  UserTrainerExternalGymDetails: {
    gymId: string;
    gymName?: string;
  };
  UserTrainerSearchResults: {
    query: string;  
    filters?: Record<string, any>;
  };
  UserTrainerGymNews: undefined;
};
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}