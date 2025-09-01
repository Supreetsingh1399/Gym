/**
 * Navigation type definitions for the app
 */

// Define the root stack navigator param list
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  
  // Main screens
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  
  // Feature screens
  SearchGyms: {
    query?: string;
    filters?: any;
  };
  GymDetails: {
    gymId: string;
  };
  BookSession: {
    gymId?: string;
    trainerId?: string;
  };
}; 