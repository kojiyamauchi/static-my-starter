/*
   Setting webpack for Production.
*/

import webpack from 'webpack'
import { merge } from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'
// import LicenseInfoWebpackPlugin from 'license-info-webpack-plugin'
import webpackBase from './webpack.base.babel'

// Base Setting by webpack.gulp.base.babel.js.
export default merge(webpackBase, {
  mode: 'production',
  // Setting for Plugins.
  plugins: [
    /*
    When Minify of Production's JS File, Keep License Comment Out.
    When Use This Plugins with webpack5, Warning on Terminal.
    So Temporary Disabled.　
    new LicenseInfoWebpackPlugin({
      glob: '{LICENSE,license,License}*'
    }),
    +/
    /* Even when it is already sufficiently compressed,
    the code can be analyzed in detail and the parts
    that are likely to be commonly compressed are compressed more positively */
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  // Advanced Setting for Plugins.
  optimization: {
    // 'optimization.minimize' is true by default in production mode.
    minimizer: [
      // For Terser webpack Plugin.
      new TerserPlugin({
        terserOptions: {
          compress: {
            // Delete console.log(), When Minify of JS File.
            drop_console: true
          },
          output: {
            // Keep Advanced License Comment Out.
            comments: /^\**!|@preserve|@license|@cc_on/
          }
        }
      })
    ]
  }
})
