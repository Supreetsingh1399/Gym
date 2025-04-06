module.exports = {
  name: "Gym",
  slug: "Gym",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/favicon.png",
  userInterfaceStyle: "light",
  entryPoint: "./index.js", // Explicitly set entry point
  splash: {
    image: "./assets/Gym_Project.jpg",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "your-project-id",
    },
  },
};
