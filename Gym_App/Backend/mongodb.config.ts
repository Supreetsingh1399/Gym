/**
 * MongoDB Cluster Configuration
 * 
 * This file configures the connection to your MongoDB Atlas cluster.
 * You'll need to set your connection string in your environment variables.
 */

// The MongoDB connection string should be in your environment variables
// Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
export const MONGODB_URI = process.env.MONGODB_URI || '';

// MongoDB collection names
export const COLLECTIONS = {
  USERS: 'users',
  GYMS: 'gyms',
  TRAINERS: 'trainers',
  SESSIONS: 'sessions',
  REVIEWS: 'reviews',
  FILES: 'files'
};

// Connection options
export const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true
};

// Initialize MongoDB status
export let isMongoDBConnected = false;

/**
 * Updates the MongoDB connection status
 * @param connected - Whether MongoDB is connected
 */
export const setMongoDBConnected = (connected: boolean) => {
  isMongoDBConnected = connected;
};

/**
 * Check if MongoDB connection is ready
 * @returns {boolean} Whether MongoDB is connected
 */
export const isMongoDBReady = () => {
  return isMongoDBConnected;
};

// MongoDB Models (to be expanded as needed)
export interface MongoDBUser {
  _id?: string;  // MongoDB document ID
  uid: string;   // User ID (for backward compatibility)
  email: string;
  name: string;
  phone: string;
  type: 'user' | 'gym' | 'trainer';
  createdAt: string;
  emailVerified: boolean;
  photoURL?: string;
  bio?: string;
  preferences?: Record<string, any>;
}

export interface MongoDBGym {
  _id?: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  amenities: string[];
  photos: string[];
  hours: Record<string, { open: string; close: string }>;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Export MongoDB models for use in the app
export const MongoDBModels = {
  User: MongoDBUser,
  Gym: MongoDBGym
}; 