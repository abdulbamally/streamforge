module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@app':               './src/app',
            '@features':          './src/features',
            '@core':              './src/core',
            '@shared':            './src/shared',
            '@assets':            './assets',
            '@shared/components': './src/shared/components',
            '@shared/theme':      './src/shared/theme',
            '@shared/constants':  './src/shared/constants',
            '@core/store':        './src/core/store',
            '@core/hooks':        './src/core/hooks',
            '@core/api':          './src/core/api',
            '@app/navigation':    './src/app/navigation',
            '@app/providers':     './src/app/providers',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  }
}
