/**
 * Collection of helper utility functions for the app
 */

import React from "react";

/**
 * Returns a greeting based on the current time of day
 */
export const getGreetingByTime = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/**
 * Returns a random item from an array
 */
export const getRandomItem = <T extends unknown>(items: T[]): T => {
  if (items.length === 0) {
    throw new Error("Cannot get random item from an empty array");
  }
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Format distance for display
 * @param meters Distance in meters
 * @param useImperial Whether to use imperial (miles) or metric (km)
 */
export const formatDistance = (meters: number, useImperial = true): string => {
  if (useImperial) {
    const miles = meters * 0.000621371;
    return miles < 0.1
      ? `${Math.round(miles * 5280)} ft`
      : `${miles.toFixed(1)} mi`;
  } else {
    const kilometers = meters / 1000;
    return kilometers < 0.1
      ? `${Math.round(meters)} m`
      : `${kilometers.toFixed(1)} km`;
  }
};

/**
 * Format rating to display with one decimal place
 */
export const formatRating = (rating?: number): string => {
  if (rating === undefined) return "4.5";
  return rating.toFixed(1);
};

/**
 * Truncate text with ellipsis if it exceeds the maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format address for display
 */
export const formatAddress = (
  address: string,
  city: string,
  state: string,
): string => {
  const parts = [address, city, state].filter(Boolean);
  return parts.join(", ");
};

/**
 * Calculate calories based on workout duration and intensity
 * This is just an example function - real calorie calculations would be more complex
 */
export const calculateCalories = (
  durationMinutes: number,
  intensityLevel: string,
): number => {
  const baseCalsPerMinute = {
    Beginner: 4,
    Intermediate: 7,
    Advanced: 10,
  };

  const calsPerMinute =
    baseCalsPerMinute[intensityLevel as keyof typeof baseCalsPerMinute] || 5;
  return Math.round(durationMinutes * calsPerMinute);
};
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Creates a debounced version of a function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};
