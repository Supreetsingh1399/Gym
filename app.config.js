module.exports = {
  name: "Gym",
  slug: "Gym",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/Gym_Project.png",
  userInterfaceStyle: "light",
  entryPoint: "./index.js", // Explicitly set entry point
  splash: {
    image: "./assets/Gym_Project.png",
    resizeMode: "cover",
    backgroundColor: "#000000",
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
      foregroundImage: "./assets/Gym_Project.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/Gym_Project.png",
  },
  extra: {
    eas: {
      projectId: "your-project-id",
    },
  },
};
