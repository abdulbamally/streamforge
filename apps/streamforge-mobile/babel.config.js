module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app':      './src/app',
          '@features': './src/features',
          '@core':     './src/core',
          '@shared':   './src/shared',
          '@assets':   './assets',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
}
