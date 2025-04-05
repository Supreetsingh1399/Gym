declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// For NativeWind/TailwindCSS
declare module 'nativewind/types' {
  import type { ViewProps } from 'react-native';
  export interface NativeWindProps extends ViewProps {
    className?: string;
  }
}

// Add className to React Native components
declare module 'react-native' {
  import type { NativeWindProps } from 'nativewind/types';
  
  export interface ViewProps extends NativeWindProps {}
  export interface TextProps extends NativeWindProps {}
  export interface ImageProps extends NativeWindProps {}
  export interface TextInputProps extends NativeWindProps {}
  export interface TouchableOpacityProps extends NativeWindProps {}
  export interface ScrollViewProps extends NativeWindProps {}
  export interface FlatListProps<T> extends NativeWindProps {}
}

// Firebase auth global type augmentations
declare module 'firebase/auth' {
  interface User {
    userType?: 'user' | 'trainer' | 'gym_owner';
  }
}

// Ensure debug globals don't cause TS errors
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

interface Console {
  tron: any;
} 