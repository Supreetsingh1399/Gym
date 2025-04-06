// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  // Add this resolver configuration
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      // Add any custom module resolution here
    },
    assetExts: [...config.resolver.assetExts],
    sourceExts: [...config.resolver.sourceExts, "cjs"],
  },
  // Make sure this is pointing to your entry file
  watchFolders: [path.resolve(__dirname, "./")],
  transformer: {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
