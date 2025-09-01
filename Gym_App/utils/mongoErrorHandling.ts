/**
 * MongoDB Error Handling Utility
 * 
 * Provides type-safe error handling for MongoDB operations
 */

// MongoDB Error Types
export type MongoDBAuthErrorType = 
  | 'invalid-email'
  | 'wrong-password'
  | 'user-not-found'
  | 'email-already-in-use'
  | 'weak-password'
  | 'operation-not-allowed'
  | 'too-many-requests'
  | 'network-request-failed'
  | 'user-disabled'
  | 'requires-recent-login';

export type MongoDBDataErrorType =
  | 'permission-denied'
  | 'document-not-found'
  | 'invalid-data'
  | 'already-exists'
  | 'server-error'
  | 'network-error';

export type MongoDBStorageErrorType =
  | 'storage-permission-denied'
  | 'file-not-found'
  | 'unauthorized'
  | 'canceled'
  | 'storage-limit-exceeded';

// MongoDB Error interface
export interface MongoDBError extends Error {
  code: string;
  type: 'auth' | 'data' | 'storage';
  details?: any;
}

/**
 * Create a MongoDB error
 * @param message Error message
 * @param code Error code
 * @param type Error type
 * @param details Additional error details
 * @returns MongoDB error object
 */
export const createMongoDBError = (
  message: string, 
  code: MongoDBAuthErrorType | MongoDBDataErrorType | MongoDBStorageErrorType,
  type: 'auth' | 'data' | 'storage',
  details?: any
): MongoDBError => {
  const error = new Error(message) as MongoDBError;
  error.code = code;
  error.type = type;
  error.details = details;
  return error;
};

/**
 * Check if an error is a MongoDB error
 * @param error Error to check
 * @returns Whether the error is a MongoDB error
 */
export const isMongoDBError = (error: unknown): error is MongoDBError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'type' in error &&
    'message' in error
  );
};

/**
 * Get a user-friendly error message for MongoDB Auth errors
 * @param error Original error
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!isMongoDBError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (error.type !== 'auth') {
    return getErrorMessageByType(error);
  }

  switch (error.code as MongoDBAuthErrorType) {
    case 'invalid-email':
      return 'The email address is not valid. Please check and try again.';
    case 'wrong-password':
      return 'Incorrect password. Please try again.';
    case 'user-not-found':
      return 'No account found with this email. Please check or sign up.';
    case 'email-already-in-use':
      return 'This email is already in use. Please log in or use another email.';
    case 'weak-password':
      return 'Password is too weak. Use at least 6 characters with letters and numbers.';
    case 'operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    case 'too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'requires-recent-login':
      return 'Please log in again before retrying this operation.';
    default:
      return 'Authentication failed. Please try again later.';
  }
};

/**
 * Get a user-friendly error message for MongoDB Data errors
 * @param error Original error
 * @returns User-friendly error message
 */
export const getDataErrorMessage = (error: unknown): string => {
  if (!isMongoDBError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (error.type !== 'data') {
    return getErrorMessageByType(error);
  }

  switch (error.code as MongoDBDataErrorType) {
    case 'permission-denied':
      return 'You do not have permission to access this data.';
    case 'document-not-found':
      return 'The requested data was not found.';
    case 'invalid-data':
      return 'The data provided is invalid. Please check and try again.';
    case 'already-exists':
      return 'This data already exists and cannot be duplicated.';
    case 'server-error':
      return 'Server error occurred. Please try again later.';
    case 'network-error':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Database operation failed. Please try again later.';
  }
};

/**
 * Get a user-friendly error message for any MongoDB error
 * @param error Original error
 * @returns User-friendly error message
 */
export const getErrorMessageByType = (error: unknown): string => {
  if (!isMongoDBError(error)) {
    return error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.';
  }

  switch (error.type) {
    case 'auth':
      return getAuthErrorMessage(error);
    case 'data':
      return getDataErrorMessage(error);
    case 'storage':
      return 'Storage operation failed. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Get user-friendly error message for any error
 * @param error Any error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (isMongoDBError(error)) {
    return getErrorMessageByType(error);
  }

  if (error instanceof Error) {
    // Handle common error messages
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }
    
    if (message.includes('permission') || message.includes('access')) {
      return 'You do not have permission to perform this action.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}; 