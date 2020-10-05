/*
   Setting webpack for gulp.
*/

import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import ForkTsChecker from 'fork-ts-checker-webpack-plugin'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'
import WebpackBuildNotifierPlugin from 'webpack-build-notifier'

// Setting Multiple Entry Points for Static Website.
const baseDir = './resource/base/'
const entries = {}
const splitChunksIgnore = []
const entryPointIgnore = []
glob.sync('*.js', { cwd: baseDir }).map((info) => (entries[info.replace('.js', '')] = baseDir + info))
entryPointIgnore.map((info) => delete entries[info])

// Setting Start.
module.exports = {
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
      // ES Lint.
      {
        enforce: 'pre',
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      // ECMA.
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: 'cache-loader' }, { loader: 'thread-loader' }, { loader: 'babel-loader?cacheDirectory' }]
      },
      // TypeScript.
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          { loader: 'cache-loader' },
          { loader: 'thread-loader' },
          { loader: 'babel-loader?cacheDirectory' },
          { loader: 'ts-loader', options: { happyPackMode: true } }
        ]
      },
      // Import Json File.
      {
        type: 'javascript/auto',
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      },
      // JS Source Map.
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader'
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
          syntactic: true,
        }
      }
    }),
    // For Faster Build.
    new HardSourceWebpackPlugin(),
    // Notify Desktop When a Compile Error.
    new WebpackBuildNotifierPlugin({ suppressSuccess: 'initial' })
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
