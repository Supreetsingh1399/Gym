/// <reference types="nativewind/types" />
/// <reference types="expo-asset" />
/// <reference types="expo-constants" />
/// <reference types="expo-file-system" />
/// <reference types="expo-font" />

// Add reference to your custom toast types
/// <reference path="./Gym_App/types/react-native-toast-message.d.ts" />

// Add module augmentation for your ToastManager
declare module "ToastManager" {
  global {
    namespace ToastManager {
      function success(message: string, options?: any): void;
      function error(message: string, options?: any): void;
      function info(message: string, options?: any): void;
      function show(options: any): void;
      function hide(): void;
    }
  }
}
