import { NavigationProp, RouteProp } from '@react-navigation/native';

// Define the root stack parameter list
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  UserHome: undefined;
  GymHome: undefined;
  TrainerHome: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Chats: undefined;
  ExternalGymDetails: { 
    gymId: string;
    gymName?: string;
  };
  SearchResults: { 
    query: string;
    filters?: Record<string, any>;
  };
  GymNews: undefined;
  WorkoutDetails: { 
    workoutId: string;
  };
};

// Navigation prop types
export type AppNavigationProp<T extends keyof RootStackParamList> = 
  NavigationProp<RootStackParamList, T>;

// Route prop types
export type AppRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

// Props with navigation
export interface NavigationProps<T extends keyof RootStackParamList = 'Home'> {
  navigation: AppNavigationProp<T>;
  route?: AppRouteProp<T>;
}

// Use this for props in functional components
// Example: const MyScreen = ({ navigation, route }: ScreenProps<'ScreenName'>) => {...}
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: AppNavigationProp<T>;
  route: AppRouteProp<T>;
  UserTabParamList: RootStackParamList;


}; 