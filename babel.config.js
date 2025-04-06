module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          // blacklist and whitelist are deprecated
          allowlist: null,
          denylist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      ["nativewind/babel"],
      ["react-native-reanimated/plugin"],
    ],
  };
};
