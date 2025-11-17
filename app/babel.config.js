module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Plugin ini harus selalu menjadi yang terakhir
      "react-native-reanimated/plugin",
    ],
  };
};
