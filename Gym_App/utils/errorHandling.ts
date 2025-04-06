import { FirebaseError } from "firebase/app";

/**
 * Type definitions for Firebase error codes
 */
export type FirebaseAuthErrorCode =
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-email"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
  | "auth/requires-recent-login"
  | "auth/user-disabled"
  | "auth/operation-not-allowed"
  | "auth/invalid-credential";

export type FirebaseFirestoreErrorCode =
  | "permission-denied"
  | "not-found"
  | "already-exists"
  | "unavailable"
  | "resource-exhausted"
  | "cancelled";

export type FirebaseStorageErrorCode =
  | "storage/object-not-found"
  | "storage/unauthorized"
  | "storage/canceled"
  | "storage/unknown";

/**
 * Type guard to check if an error is a Firebase error
 * @param error Any error object
 * @returns Whether the error is a Firebase error
 */
export const isFirebaseError = (error: unknown): error is FirebaseError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as FirebaseError).code === "string"
  );
};

/**
 * Type guard to check if the error is a specific Firebase Auth error
 * @param error Any error object
 * @param code The specific error code to check for
 * @returns Whether the error matches the specific code
 */
export const isFirebaseAuthError = (
  error: unknown,
  code: FirebaseAuthErrorCode,
): boolean => {
  return isFirebaseError(error) && error.code === code;
};

/**
 * Get a user-friendly error message for Firebase Auth errors
 * @param error Any error object
 * @returns A user-friendly error message
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!isFirebaseError(error)) {
    return "An unexpected error occurred. Please try again.";
  }

  switch (error.code as FirebaseAuthErrorCode) {
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please check your credentials.";

    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password.";

    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/requires-recent-login":
      return "This action requires recent authentication. Please log in again.";

    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    case "auth/operation-not-allowed":
      return "This operation is not allowed.";

    default:
      return `Authentication error: ${error.message}`;
  }
};

/**
 * Get a user-friendly error message for Firebase Firestore errors
 * @param error Any error object
 * @returns A user-friendly error message
 */
export const getFirestoreErrorMessage = (error: unknown): string => {
  if (!isFirebaseError(error)) {
    return "An unexpected database error occurred. Please try again.";
  }

  switch (error.code as FirebaseFirestoreErrorCode) {
    case "permission-denied":
      return "You do not have permission to perform this action.";

    case "not-found":
      return "The requested data could not be found.";

    case "already-exists":
      return "This data already exists.";

    case "unavailable":
      return "The database service is currently unavailable. Please try again later.";

    case "resource-exhausted":
      return "You have exceeded your quota. Please try again later.";

    default:
      return `Database error: ${error.message}`;
  }
};

/**
 * Get a user-friendly error message for any Firebase error
 * @param error Any error object
 * @returns A user-friendly error message
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  if (!isFirebaseError(error)) {
    return "An unexpected error occurred. Please try again.";
  }

  if (error.code.startsWith("auth/")) {
    return getAuthErrorMessage(error);
  }

  if (error.code.startsWith("storage/")) {
    return `Storage error: ${error.message}`;
  }

  return getFirestoreErrorMessage(error);
};
