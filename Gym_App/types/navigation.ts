/**
 * Navigation type definitions for the app
 * This file should be placed in Gym_App/types/navigation.ts
 */

// Define the root stack navigator param list
export type RootStackParamList = {
  // Auth screens
  LoginScreen: undefined;
  User_SignUp: undefined;
  Forgot_Password: undefined;
  Gym_rgn: undefined;

  // Main screens
  UserTabs: undefined;
  TrainerHome: undefined;
  RGN_Gyms: undefined;

  // Feature screens
  SearchResults: {
    query?: string;
    filters?: any;
  };
  ExternalGymDetails: {
    placeId: string;
    gymId?: string;
  };
  GymDetails: {
    gymId: string;
  };
};
