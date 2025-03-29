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