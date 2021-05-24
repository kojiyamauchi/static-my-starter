/*
   Setting webpack for gulp.
*/

import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import ForkTsChecker from 'fork-ts-checker-webpack-plugin'
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import WebpackNotifierPlugin from 'webpack-notifier'

// Setting Multiple Entry Points for Static Website.
const baseDir = './resource/base/'
const entries = {}
const splitChunksIgnore = []
const entryPointIgnore = []
glob.sync('*.js', { cwd: baseDir }).map((info) => (entries[info.replace('.js', '')] = baseDir + info))
entryPointIgnore.map((info) => delete entries[info])

// Setting Start.
module.exports = {
  // Instructs webpack to Target a Specific Environment, Will Still Keep IE11 Watched.
  // See -> https://webpack.js.org/configuration/target
  target: ['web', 'es5'],
  // JS Core File Entry Point.
  entry: entries,

  // JS Core File Output Point.
  output: {
    // 'path' Key is Not Used. ( Setting of Output Dir is Managed by gulp.babel.js )
    filename: '[name].min.js'
  },

  // Bundle for Polyfill & Common Import Modules.
  optimization: {
    splitChunks: {
      cacheGroups: {
        polyfill: {
          test: /node_modules\/core-js\//,
          name: 'common.polyfill.bundle',
          enforce: true,
          chunks(chunk) {
            return !splitChunksIgnore.includes(chunk.name)
          }
        },
        modules: {
          test: /node_modules\/(?!(core-js)\/).*/,
          name: 'common.modules.bundle',
          enforce: true,
          chunks(chunk) {
            return !splitChunksIgnore.includes(chunk.name)
          }
        }
      }
    }
  },

  // Core Setting.
  module: {
    rules: [
      // ECMA.
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'thread-loader', 'babel-loader?cacheDirectory']
      },
      // TypeScript.
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'thread-loader', 'babel-loader?cacheDirectory', { loader: 'ts-loader', options: { happyPackMode: true } }]
      },
      // Import Json File.
      {
        type: 'javascript/auto',
        test: /\.json$/,
        exclude: /node_modules/,
        use: 'json-loader'
      },
      // JS Source Map.
      {
        test: /\.js$/,
        enforce: 'pre',
        use: 'source-map-loader'
      }
    ]
  },

  // Setting for Extensions & Path Resolve.
  resolve: {
    // Setting for Cut the File Extension When Import JS Module.
    extensions: ['.js', '.ts', '.json'],

    // Setting for Project Root Dir, When Import JS Modules.
    alias: {
      '@': path.resolve(__dirname, '../resource/base/')
    }
  },

  // Setting for Plugins.
  plugins: [
    // use 'happyPackMode' on ts-loader option. (transpileOnly is true)
    // for that, use this plugin.(for type check)
    new ForkTsChecker({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true
        }
      }
    }),
    // Notify Desktop When a TypeScript Error.
    new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript' }),
    // ESLint on webpack.
    new ESLintPlugin({ files: [path.resolve(__dirname, '../resource/**/*.{ts,tsx,js,jsx}')], failOnWarning: true }),
    // Notify Desktop When a ESLint or Webpack Build Error.
    new WebpackNotifierPlugin({ title: 'ESLint or Webpack Build' })
  ],

  // Setting for Warning on Terminal.
  performance: {
    /* An entrypoint represents all assets that would be utilized during initial load time for a specific entry.
    This option controls when webpack should emit performance hints based on the maximum entrypoint size.
    The default value is 250000 (bytes). */
    maxEntrypointSize: 400000,

    /* An asset is any emitted file from webpack.
    This option controls when webpack emits a performance hint based on individual asset size.
    The default value is 250000 (bytes). */
    maxAssetSize: 400000
  }
}
