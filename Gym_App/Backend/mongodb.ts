/**
 * MongoDB Service Layer - AsyncStorage Implementation
 * 
 * This file provides an AsyncStorage-based implementation for storage
 * that simulates MongoDB functionality. It can be replaced with a real
 * MongoDB integration when needed.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLLECTIONS } from './mongodb.config';

// Track if we're using mock implementation (always true in this version)
export const isMockMongoDB = { value: true };

// Types for user authentication
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  userType: 'user' | 'gym' | 'trainer';
  phone?: string;
}

// Auth service interface
export interface AuthService {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
}

// Database service interface
export interface DbService {
  getDocument: <T>(collection: string, id: string) => Promise<T | null>;
  getDocuments: <T>(collection: string, query?: any) => Promise<T[]>;
  setDocument: <T>(collection: string, id: string, data: T) => Promise<void>;
  updateDocument: <T>(collection: string, id: string, data: Partial<T>) => Promise<void>;
  deleteDocument: (collection: string, id: string) => Promise<void>;
}

// Storage service interface
export interface StorageService {
  uploadFile: (path: string, file: Blob) => Promise<string>;
  getDownloadURL: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
}

/**
 * Initialize the MongoDB service (in this case, just logging)
 */
export const initializeMongoDB = async (): Promise<boolean> => {
  console.log('[MongoDB] Initializing AsyncStorage-based MongoDB implementation');
  return true;
};

// AsyncStorage-based database implementation
class LocalStorageDb implements DbService {
  private async getCollectionData(collection: string): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(`collection_${collection}`);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error(`[MongoDB] Error reading collection ${collection}:`, e);
      return {};
    }
  }

  private async setCollectionData(collection: string, data: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(`collection_${collection}`, JSON.stringify(data));
    } catch (e) {
      console.error(`[MongoDB] Error writing collection ${collection}:`, e);
    }
  }

  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    const collectionData = await this.getCollectionData(collection);
    return collectionData[id] || null;
  }

  async getDocuments<T>(collection: string, query?: any): Promise<T[]> {
    const collectionData = await this.getCollectionData(collection);
    
    // Convert objects to array
    let results = Object.values(collectionData) as T[];
    
    // Basic filtering if query is provided
    if (query) {
      results = results.filter(item => {
        // Simple implementation - check if all query properties match the item
        return Object.entries(query).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }
    
    return results;
  }

  async setDocument<T>(collection: string, id: string, data: T): Promise<void> {
    const collectionData = await this.getCollectionData(collection);
    collectionData[id] = data;
    await this.setCollectionData(collection, collectionData);
  }

  async updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
    const collectionData = await this.getCollectionData(collection);
    if (collectionData[id]) {
      collectionData[id] = { ...collectionData[id], ...data };
      await this.setCollectionData(collection, collectionData);
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    const collectionData = await this.getCollectionData(collection);
    delete collectionData[id];
    await this.setCollectionData(collection, collectionData);
  }
}

// Authentication service (localStorage-based)
class LocalStorageAuth implements AuthService {
  private _currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private db: DbService;

  constructor(db: DbService) {
    this.db = db;
    // Try to load user from storage
    this.loadCurrentUser();
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        this._currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (e) {
      console.error('[MongoDB] Error loading current user:', e);
    }
  }

  private async saveCurrentUser(user: User | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem('current_user', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('current_user');
      }
      this._currentUser = user;
      this.notifyListeners();
    } catch (e) {
      console.error('[MongoDB] Error saving current user:', e);
    }
  }

  private notifyListeners(): void {
    for (const listener of this.authStateListeners) {
      listener(this._currentUser);
    }
  }

  get currentUser(): User | null {
    return this._currentUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      // Get users collection
      const users = await this.db.getDocuments<User & { password: string }>(COLLECTIONS.USERS);
      
      // Find matching user
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Don't include password in the user object
      const { password: _, ...userData } = user;
      
      // Save current user
      await this.saveCurrentUser(userData as User);
      
      return userData as User;
    } catch (e) {
      console.error('[MongoDB] Sign in error:', e);
      throw new Error('Authentication failed');
    }
  }

  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      // Check if user already exists
      const existingUsers = await this.db.getDocuments<User>(COLLECTIONS.USERS, { email });
      
      if (existingUsers.length > 0) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const uid = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const newUser: User & { password: string } = {
        uid,
        email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        userType: userData.userType || 'user',
        phone: userData.phone,
        password // This would be hashed in a real implementation
      };
      
      // Save to "database"
      await this.db.setDocument(COLLECTIONS.USERS, uid, newUser);
      
      // Don't include password in the returned user object
      const { password: _, ...userDataWithoutPassword } = newUser;
      
      // Set as current user
      await this.saveCurrentUser(userDataWithoutPassword);
      
      return userDataWithoutPassword;
    } catch (e) {
      console.error('[MongoDB] Sign up error:', e);
      throw new Error('Registration failed');
    }
  }

  async signOut(): Promise<void> {
    // Clear local user data
    await this.saveCurrentUser(null);
  }

  async resetPassword(email: string): Promise<void> {
    // Mock implementation - just log it
    console.log(`[MongoDB] Password reset requested for: ${email}`);
    
    // Check if user exists
    const users = await this.db.getDocuments<User>(COLLECTIONS.USERS, { email });
    if (users.length === 0) {
      throw new Error('No user found with this email');
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Call immediately with current state
    callback(this._currentUser);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    };
  }
}

// File storage service
class LocalStorageFiles implements StorageService {
  // Map of file paths to base64 strings
  private async getFileData(): Promise<Record<string, string>> {
    try {
      const data = await AsyncStorage.getItem('storage_files');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('[MongoDB] Error reading file storage:', e);
      return {};
    }
  }

  private async setFileData(data: Record<string, string>): Promise<void> {
    try {
      await AsyncStorage.setItem('storage_files', JSON.stringify(data));
    } catch (e) {
      console.error('[MongoDB] Error writing file storage:', e);
    }
  }

  async uploadFile(path: string, file: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64data = reader.result as string;
          const files = await this.getFileData();
          files[path] = base64data;
          await this.setFileData(files);
          resolve(path);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  }

  async getDownloadURL(path: string): Promise<string> {
    const files = await this.getFileData();
    if (files[path]) {
      return files[path];
    }
    throw new Error(`File not found: ${path}`);
  }

  async deleteFile(path: string): Promise<void> {
    const files = await this.getFileData();
    delete files[path];
    await this.setFileData(files);
  }
}

// Create and export the services
export const MongoDB = new LocalStorageDb();
export const MongoAuth = new LocalStorageAuth(MongoDB);
export const MongoStorage = new LocalStorageFiles();

// Create some sample data on initialization
(async () => {
  try {
    // Check if we already have sample data
    const users = await MongoDB.getDocuments<User>(COLLECTIONS.USERS);
    if (users.length === 0) {
      // Create sample admin user
      await MongoDB.setDocument(COLLECTIONS.USERS, 'admin123', {
        uid: 'admin123',
        email: 'admin@example.com',
        displayName: 'Admin User',
        photoURL: null,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        userType: 'user',
        password: 'password123'
      });
      
      console.log('[MongoDB] Created sample user data');
    }
  } catch (e) {
    console.error('[MongoDB] Error creating sample data:', e);
  }
})(); 