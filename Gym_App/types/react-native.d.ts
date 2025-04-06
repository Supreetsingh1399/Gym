declare module "react-native" {
  import React from "react";

  // Basic Components
  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const Button: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const Pressable: React.ComponentType<any>;
  export const StatusBar: React.ComponentType<any>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const KeyboardAvoidingView: React.ComponentType<any>;
  export const Modal: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const SectionList: React.ComponentType<any>;
  export const Switch: React.ComponentType<any>;
  export const RefreshControl: React.ComponentType<any>;
  export const ImageBackground: React.ComponentType<any>;

  // APIs
  export const Platform: {
    OS: "ios" | "android" | "web";
    Version: number;
    select: <T extends Record<string, any>>(obj: T) => T[keyof T];
  };
  export const Alert: {
    alert: (
      title: string,
      message?: string,
      buttons?: any[],
      options?: any,
    ) => void;
  };
  export const Linking: {
    openURL: (url: string) => Promise<void>;
    canOpenURL: (url: string) => Promise<boolean>;
  };
  export const Share: {
    share: (content: ShareContent, options?: any) => Promise<any>;
  };
  export const Dimensions: {
    get: (dimension: "window" | "screen") => { width: number; height: number };
  };

  // Types
  export type ShareContent = {
    message?: string;
    title?: string;
    url?: string;
  };

  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    flatten: (style: any) => any;
  };
}
