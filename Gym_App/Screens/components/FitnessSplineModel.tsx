// Install required packages:
// npm install @splinetool/react-spline @splinetool/runtime

import React from "react";
//@ts-ignore
import Spline from "@splinetool/react-spline";
import { View, StyleSheet, Platform } from "react-native";

// This component will render a 3D fitness-themed model using Spline
//@ts-ignore
export const FitnessSplineModel = ({
  style,
  scene = "https://prod.spline.design/example-fitness-scene",
}) => {
  // For web platform, we can use Spline directly
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style]}>
        <Spline scene={scene} />
      </View>
    );
  }

  // For native platforms, we need to use a WebView approach or render a fallback
  // Here we'll implement a fallback view
  return (
    <View style={[styles.container, style]}>
      {/* This would be replaced with your 3D model implementation for native platforms */}
      <View style={styles.fallbackView}>
        {/* You can place a static image here as fallback */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: "100%",
    backgroundColor: "transparent",
  },
  fallbackView: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
