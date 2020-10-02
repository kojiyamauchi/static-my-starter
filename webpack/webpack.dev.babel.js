/*
   Setting webpack for Development.
*/

import webpack from 'webpack'
import { merge } from 'webpack-merge'
import webpackBase from './webpack.base.babel'

// Base Setting by webpack.gulp.base.babel.js
export default merge(webpackBase, {
  // Setting webpack Mode.
  mode: 'development',
  cache: true,
  plugins: [],
  devtool: 'inline-source-map'
})
